
import {createHash} from 'crypto'
import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'fs'
import {dirname, join} from 'path'
import {fileURLToPath} from 'url'

import {JSDOM} from 'jsdom'
import * as sass from 'sass'
import ts from 'typescript'

import {read_epub} from './epub.ts'
import type {Epub, SpineDoc} from './epub.ts'


// Paths are resolved relative to this script so the build doesn't depend on the working dir
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const EPUB_PATH = join(ROOT, 'src/_public/book_bound/Gods-Word-Is-Not-Bound.epub')

// Sits under the book's own page, and is a directory with an index so the url has no extension
// NOTE A bare read.html would only resolve without its extension on hosts that rewrite urls
const BASE = '/word-not-bound/read'

// Defaults to the published location, but verification builds to a temp dir to compare against
const OUT_DIR = process.argv[2] ?? join(ROOT, `src/_public${BASE}`)

// Where the existing downloads of this book are served from
const DOWNLOADS = '/book_bound/Gods-Word-Is-Not-Bound'

// Attributes that only make sense for a fixed-size printed page, so are dropped for the web
const DROP_ATTRIBUTES = ['style', 'width', 'height', 'epub:type']


// Namespace a chapter's ids so they stay unique once every chapter shares one page
// NOTE The epub reuses ids like "fn1" and "conclusion" in every chapter, so this is required
function namespace_ids(doc:SpineDoc):void{
    for (const el of doc.doc.querySelectorAll('[id]')){
        el.setAttribute('id', `${doc.slug}-${el.getAttribute('id')}`)
    }
    for (const a of doc.doc.querySelectorAll('a[href^="#"]')){
        a.setAttribute('href', `#${doc.slug}-${a.getAttribute('href')!.slice(1)}`)
    }
}


// Point images at the media dir sitting beside the generated page
// NOTE Absolute so they still resolve whether the url is requested with a trailing slash or not
function relocate_images(doc:SpineDoc):void{
    for (const img of doc.doc.querySelectorAll('img[src]')){
        img.setAttribute('src', `${BASE}/media/${img.getAttribute('src')!.split('/').pop()}`)
        // Everything below the first screen can load lazily
        img.setAttribute('loading', 'lazy')
        img.setAttribute('decoding', 'async')
    }
}


// Record each note's number, which the epub leaves for the reading app to supply
// NOTE Stored as an attribute so the page can render it, rather than added to the text itself
function number_footnotes(doc:SpineDoc):void{
    for (const ref of doc.doc.querySelectorAll('a.footnote-ref[href^="#"]')){
        const note = doc.doc.getElementById(ref.getAttribute('href')!.slice(1))
        note?.setAttribute('data-note', ref.textContent?.trim() ?? '')
    }
}


// Mark images that share their container with a caption, so it can stay close to them
function mark_captions(doc:SpineDoc):void{
    for (const img of doc.doc.querySelectorAll('img')){
        const container = img.parentElement
        if (container?.textContent?.trim()){
            container.setAttribute('data-caption', '')
        }
    }
}


// Remove print-specific attributes that would fight a fluid layout
function strip_attributes(doc:SpineDoc):void{
    for (const el of doc.doc.querySelectorAll('*')){
        for (const attribute of DROP_ATTRIBUTES){
            el.removeAttribute(attribute)
        }
    }
}


// Transform one chapter in place, then hand back its top-level sections
// WARN Every operation here is on attributes or whole nodes -- text nodes are never touched
function transform_chapter(doc:SpineDoc):Element[]{
    namespace_ids(doc)
    relocate_images(doc)
    number_footnotes(doc)
    mark_captions(doc)
    strip_attributes(doc)

    // The epub keeps a chapter's notes in a sibling section, which only makes sense per-file
    const notes = doc.doc.body.querySelector(':scope > .footnotes')
    const chapter = doc.doc.body.querySelector(':scope > section')
    if (notes && chapter && notes !== chapter){
        chapter.appendChild(notes)
    }

    // Tag each top-level section so the page can style and track chapters
    const sections = [...doc.doc.body.children]
    for (const section of sections){
        section.setAttribute('data-chapter', doc.slug)
    }
    return sections
}


// Turn the epub's own table of contents into the sidebar's navigation
function build_toc(epub:Epub, out:Document):Element{
    const toc = epub.nav.querySelector('nav ol')
    if (!toc){
        throw new Error("Couldn't find a table of contents in the epub's nav")
    }

    // Note which chapters are part dividers so they can head a group rather than be an entry
    const parts = new Set(epub.chapters
        .filter(chapter => chapter.doc.querySelector('.part-title'))
        .map(chapter => chapter.slug))

    // Repoint each link at the matching section in the combined page
    for (const a of toc.querySelectorAll('a[href]')){
        const [file, fragment] = a.getAttribute('href')!.split('#')
        const slug = file!.split('/').pop()!.replace(/\.x?html$/, '')
        a.setAttribute('href', `#${slug}-${fragment}`)
        a.closest('li')?.setAttribute('class', parts.has(slug) ? 'part' : 'chapter')
    }

    // The contents lists chapters only -- a chapter's own subheadings make it too busy to scan
    for (const sub of toc.querySelectorAll('ol ol')){
        sub.remove()
    }

    toc.setAttribute('class', 'toc')
    return out.importNode(toc, true) as Element
}


// Assemble the whole page
function build_page(epub:Epub, styles:string, script:string, epub_hash:string):string{

    const authors = epub.creators.join(', ')
    const description = `${epub.title}: ${epub.subtitle}. By ${authors}.`

    // Start from a skeleton so the book content can be inserted as nodes rather than as strings
    const dom = new JSDOM(`<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title></title>
<meta name="description" content="">
<meta name="author" content="">
<link rel="icon" href="/_assets/icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,200..900;1,200..900&#38;display=swap">
<style></style>
</head>
<body>
<a class="skip" href="#book">Skip to the book</a>
<button id="drawer" type="button" aria-expanded="false" aria-controls="rail">
<span></span><span></span><span></span>
</button>
<nav id="rail" aria-label="Contents">
<div class="rail_head">
<a class="site" href="/">Selling Jesus</a>
<a class="title" href="/word-not-bound"></a>
<div class="subtitle"></div>
<div class="authors"></div>
</div>
<button id="theme" type="button" aria-label="Toggle dark mode"></button>
<div class="type_size">
<span>Text size</span>
<button id="smaller" type="button" aria-label="Decrease text size">A&#8722;</button>
<button id="larger" type="button" aria-label="Increase text size">A+</button>
</div>
<div class="downloads">
<div class="downloads_title">Download</div>
<a href="${DOWNLOADS}.pdf">PDF</a>
<a href="${DOWNLOADS}.epub">EPUB</a>
<a href="${DOWNLOADS}.docx">DOCX</a>
</div>
</nav>
<main id="book">
<div class="cover"><img src="${BASE}/media/${epub.cover.split('/').pop()}" alt=""></div>
</main>
<script></script>
</body>
</html>`)
    const out = dom.window.document

    // Fill in the metadata taken from the epub
    out.title = epub.title
    out.querySelector('meta[name="description"]')!.setAttribute('content', description)
    out.querySelector('meta[name="author"]')!.setAttribute('content', authors)
    out.querySelector('.rail_head .title')!.textContent = epub.title
    out.querySelector('.rail_head .subtitle')!.textContent = epub.subtitle
    out.querySelector('.rail_head .authors')!.textContent = authors
    out.querySelector('.cover img')!.setAttribute('alt', `Cover of ${epub.title}`)

    // Record where the page came from, so verification can prove the two are still in step
    out.head.prepend(out.createComment(
        ` Generated by .bin/bound_generate from ${EPUB_PATH.slice(ROOT.length + 1)}`
        + ` (sha256 ${epub_hash}). Do not edit by hand. `))

    // Insert the sidebar's navigation
    out.querySelector('#rail')!.insertBefore(
        build_toc(epub, out), out.querySelector('#rail .downloads'))

    // Insert the book itself, in reading order
    const book = out.querySelector('#book')!
    for (const chapter of epub.chapters){
        for (const section of transform_chapter(chapter)){
            book.appendChild(out.importNode(section, true))
        }
    }

    // Inline the styles and behaviour so the page stands alone
    out.querySelector('head style')!.textContent = `\n${styles}\n`
    out.querySelector('body script')!.textContent = `\n${script}\n`

    return dom.serialize()
}


// Copy the epub's images out beside the page
function write_media(epub:Epub):void{
    const media_dir = join(OUT_DIR, 'media')
    mkdirSync(media_dir, {recursive: true})
    for (const path in epub.files){
        if (path.startsWith(`${epub.root}/media/`)){
            writeFileSync(join(media_dir, path.split('/').pop()!), epub.files[path]!)
        }
    }
}


// Generate the reader
function main():void{

    const epub_bytes = readFileSync(EPUB_PATH)
    const epub_hash = createHash('sha256').update(epub_bytes).digest('hex')
    const epub = read_epub(EPUB_PATH)

    // Compile the page's own styles and behaviour
    const styles = sass.compile(join(HERE, 'reader.sass'), {style: 'expanded'}).css
    const script = ts.transpileModule(readFileSync(join(HERE, 'reader.ts'), 'utf8'), {
        compilerOptions: {target: ts.ScriptTarget.ES2020, removeComments: false},
    }).outputText

    // Start from scratch so removed media can't linger
    rmSync(OUT_DIR, {recursive: true, force: true})
    mkdirSync(OUT_DIR, {recursive: true})
    write_media(epub)
    writeFileSync(join(OUT_DIR, 'index.html'), build_page(epub, styles, script, epub_hash))

    console.log(`Generated ${OUT_DIR.slice(ROOT.length + 1)}/index.html`
        + ` (${epub.chapters.length} spine documents)`)
}


main()

