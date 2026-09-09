
import {readFileSync} from 'fs'

import {unzipSync} from 'fflate'
import {JSDOM} from 'jsdom'


// A single document from the epub's spine, already parsed
export interface SpineDoc {
    // Path within the epub, e.g. 'EPUB/text/ch005.xhtml'
    path:string
    // Short id taken from the filename, used to namespace ids in the combined page, e.g. 'ch005'
    slug:string
    doc:Document
}


// Everything the reader build and verification need out of the epub
export interface Epub {
    // Every file in the archive, keyed by its path within the archive
    files:Record<string, Uint8Array>
    // Directory the .opf lives in, which all of its hrefs are relative to
    root:string
    title:string
    subtitle:string
    creators:string[]
    // Spine documents in reading order, excluding the cover and the nav
    chapters:SpineDoc[]
    // The epub's own table of contents, used to build the sidebar
    nav:Document
    // Path of the cover image within the archive
    cover:string
}


// Decode an archive entry as text
function decode(files:Record<string, Uint8Array>, path:string):string{
    const entry = files[path]
    if (!entry){
        throw new Error(`Missing from epub: ${path}`)
    }
    return new TextDecoder().decode(entry)
}


// Parse an archive entry as XML (used for the package document)
function parse_xml(files:Record<string, Uint8Array>, path:string):Document{
    return new JSDOM(decode(files, path), {contentType: 'application/xml'}).window.document
}


// Parse an archive entry as HTML
// NOTE Parsed as HTML rather than XML since the output is HTML5 and jsdom then serializes it so
export function parse_html(files:Record<string, Uint8Array>, path:string):Document{
    return new JSDOM(decode(files, path)).window.document
}


// Resolve an href that is relative to the given directory
function resolve(dir:string, href:string):string{
    // NOTE Base must end in a slash so it is treated as a directory rather than a file
    return new URL(href, dir ? `file:///${dir}/` : 'file:///').pathname.slice(1)
}


// Read an epub, resolving its spine into parsed documents in reading order
export function read_epub(epub_path:string):Epub{

    // Unpack the archive into memory (the whole book is only a few MB)
    const files = unzipSync(readFileSync(epub_path))

    // The container points at the package document, which everything else hangs off
    const container = parse_xml(files, 'META-INF/container.xml')
    const opf_path = container.querySelector('rootfile')?.getAttribute('full-path')
    if (!opf_path){
        throw new Error("Couldn't locate the epub's package document")
    }
    const root = opf_path.split('/').slice(0, -1).join('/')
    const opf = parse_xml(files, opf_path)

    // Extract the metadata used for the page's title and description
    // NOTE These are Dublin Core elements so must be matched by namespace, not by tag name
    const DC = 'http://purl.org/dc/elements/1.1/'
    const dc = (name:string):Element[] => [...opf.getElementsByTagNameNS(DC, name)]
    const text_of = (el:Element|undefined):string => el?.textContent?.trim() ?? ''

    // A title is a subtitle only if a <meta> refining it says so
    const is_subtitle = (el:Element):boolean => {
        const id = el.getAttribute('id')
        if (!id){
            return false
        }
        const refine = opf.querySelector(`meta[refines="#${id}"][property="title-type"]`)
        return text_of(refine ?? el) === 'subtitle'
    }
    const titles = dc('title')

    // Map manifest ids to their paths so the spine can be resolved
    const manifest:Record<string, string> = {}
    for (const item of opf.querySelectorAll('manifest > item')){
        const id = item.getAttribute('id')
        const href = item.getAttribute('href')
        if (id && href){
            manifest[id] = resolve(root, href)
        }
    }

    // Identify the documents that aren't book text, so they can be handled separately
    const nav_path = manifest[opf.querySelector('item[properties~="nav"]')?.getAttribute('id') ?? '']
    const cover_doc = manifest[opf.querySelector('item#cover-xhtml')?.getAttribute('id') ?? '']
    const cover = manifest[
        opf.querySelector('item[properties~="cover-image"]')?.getAttribute('id') ?? '']
    if (!nav_path || !cover){
        throw new Error("Couldn't locate the epub's nav or cover")
    }

    // Walk the spine in reading order, keeping only the documents that hold book text
    const chapters:SpineDoc[] = []
    for (const itemref of opf.querySelectorAll('spine > itemref')){
        const path = manifest[itemref.getAttribute('idref') ?? '']
        if (!path || path === nav_path || path === cover_doc){
            continue
        }
        chapters.push({
            path,
            slug: path.split('/').pop()!.replace(/\.x?html$/, ''),
            doc: parse_html(files, path),
        })
    }

    return {
        files,
        root,
        title: text_of(titles.filter(el => !is_subtitle(el))[0]),
        subtitle: text_of(titles.filter(is_subtitle)[0]),
        creators: dc('creator').map(text_of),
        chapters,
        nav: parse_html(files, nav_path),
        cover,
    }
}

