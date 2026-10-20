// Builds the data for the site search (see theme/SearchPalette.vue) from the built pages
// NOTE Reads the rendered HTML rather than the markdown so that everything visitors see is
//      searchable, including content from components, JSON data and dynamic routes

import fs from 'fs'
import path from 'path'

import {JSDOM} from 'jsdom'


// Where the search data is written to within the output dir
export const search_dir = '_search'

// Paths that aren't searchable
// NOTE book_contents is the print edition of the book (its articles are already indexed)
const excluded = /^\/(404|book_contents|orders)(\/|$)/

// Searches that should lead to a page even if it doesn't say them prominently (comma separated)
const keywords:Record<string, string> = {
    '/': "home, start, welcome, introduction",
    '/about': "contact, email, team, staff, who we are",
    '/act': "help, get involved, volunteer, doreancon",
    '/book': "books, ebook, pdf, epub, audiobook, free books, print",
    '/abolish-the-jesus-trade': "audiobook, ebook, pdf, epub, free book",
    '/word-not-bound': "audiobook, ebook, pdf, epub, free book, copyright book",
    '/free': "public domain, cc0, reuse, republish",
    '/graphics': "memes, images, pictures, infographics",
    '/price': "calculator, cost",
    '/videos/documentary': "videos, youtube, watch, documentary",
    '/podcast': "podcast, audio, episodes, listen",
    '/about/beliefs': "beliefs, doctrine, creed, confession",
}


export interface PageEntry {
    u:string  // url
    t:string  // title
    s:string  // section
    d?:string  // description
    k?:string  // keywords
    x:string  // text
    h?:[string, string][]  // headings [anchor, text]
}

export interface BookEntry {
    u:string  // url (with anchor)
    t:string  // section heading
    c:string  // chapter title
    x:string  // text
    r?:1  // a reprint of an article already on the site
}


// Collapse an element's text, ignoring things that aren't content
function text_of(el:Element):string{
    el.querySelectorAll(
        'script, style, svg, template, noscript, form, dialog, nav, button, .header-anchor, .footnote-ref, '
        + '.footnote-backref, .footnote-back'
    ).forEach(e => e.remove())
    // Separate block elements so words in adjacent blocks don't join together
    el.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, td, th, div, br, blockquote')
        .forEach(e => e.after(' '))
    return (el.textContent ?? '').replace(/[\s​⁠]+/g, ' ').trim()
}


// Which group a page belongs to in search results
function section_for(url:string):string{
    if (url.startsWith('/articles/') || url === '/articles' || url.startsWith('/learn')){
        return "Articles"
    }
    if (url.startsWith('/videos')){
        return "Videos"
    }
    if (url.startsWith('/podcast')){
        return "Podcast"
    }
    if (url.startsWith('/about') || url === '/free' || url === '/ianal'){
        return "About"
    }
    if (url === '/book' || url === '/abolish-the-jesus-trade' || url === '/word-not-bound'){
        return "Books"
    }
    return "Pages"
}


// Convert a built file path to the url it is served at (clean urls)
function url_for(file:string):string{
    return ('/' + file.replace(/\\/g, '/'))
        .replace(/(^|\/)index\.html$/, '$1')
        .replace(/\.html$/, '')
        .replace(/(.)\/$/, '$1')
}


function page_entry(html:string, url:string, site_title:string, site_desc:string):PageEntry|null{
    const doc = new JSDOM(html).window.document
    if (doc.querySelector('meta[name="robots"][content*="noindex"]')){
        return null
    }

    // The content area (the home page has no <main>)
    const content = doc.querySelector('main .vp-doc') ?? doc.querySelector('main')
        ?? doc.querySelector('#VPContent')
    if (!content){
        return null
    }

    const title = (doc.querySelector('title')?.textContent ?? '')
        .replace(new RegExp(` \\| ${site_title}$`), '').trim() || site_title
    const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''

    // Headings that can be linked to, other than the page's title
    const headings:[string, string][] = []
    for (const h of content.querySelectorAll('h2[id], h3[id]')){
        const clone = h.cloneNode(true) as Element
        const heading = text_of(clone)
        if (heading && heading !== title){
            headings.push([h.id, heading])
        }
    }

    const entry:PageEntry = {u: url, t: title, s: section_for(url), x: text_of(content)}
    if (desc && desc !== site_desc){
        entry.d = desc
    }
    if (keywords[url]){
        entry.k = keywords[url]
    }
    if (headings.length){
        entry.h = headings
    }
    return entry
}


// One entry per section of the standalone web edition of "God's Word Is Not Bound"
function book_entries(html:string, url:string):BookEntry[]{
    const doc = new JSDOM(html).window.document
    const entries:BookEntry[] = []
    for (const section of doc.querySelectorAll('section[id][class*="level"]')){
        const heading_el = section.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4')
        if (!heading_el || section.classList.contains('unlisted')){
            continue
        }
        const chapter_section = section.classList.contains('level1') ? section
            : section.parentElement?.closest('section.level1')
        const chapter = chapter_section?.querySelector(':scope > h1')?.textContent?.trim() ?? ''
        // Only this section's own text, not its subsections or footnotes
        const clone = section.cloneNode(true) as Element
        clone.querySelectorAll(':scope > section, :scope > h1, :scope > h2, :scope > h3, :scope > h4, aside')
            .forEach(e => e.remove())
        const text = text_of(clone)
        if (!text && section.classList.contains('part-title')){
            continue
        }
        entries.push({
            u: `${url}#${section.id}`,
            t: heading_el.textContent!.replace(/[\s\u200b\u2060]+/g, ' ').trim(),
            c: chapter,
            x: text,
        })
    }
    return entries
}


// Flag book sections that reprint text already on the site, so they don't crowd out the originals
function mark_reprints(book:BookEntry[], pages:PageEntry[]){
    const simplify = (s:string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ')
    const site = pages.map(p => simplify(p.x)).join('\n')
    for (const entry of book){
        const text = simplify(entry.x)
        if (text.length < 300){
            continue
        }
        // Samples from the start, middle and end, as reprints were sometimes lightly edited
        const samples = [0.1, 0.5, 0.8].map(at => {
            const start = text.indexOf(' ', Math.floor(text.length * at)) + 1
            return text.slice(start, start + 80)
        })
        if (samples.filter(sample => site.includes(sample)).length >= 2){
            entry.r = 1
        }
    }
}


// Write the search data into the built site (run after pages are rendered)
export async function build_search(out_dir:string, site_title:string, site_desc:string,
        book_url:string){

    const files = (fs.readdirSync(out_dir, {recursive: true}) as string[])
        .filter(f => f.endsWith('.html'))
        .sort()

    const pages:PageEntry[] = []
    let book:BookEntry[] = []
    for (const file of files){
        const url = url_for(file)
        const html = fs.readFileSync(path.join(out_dir, file), 'utf8')
        if (url === book_url){
            book = book_entries(html, url)
        } else if (!excluded.test(url)){
            const entry = page_entry(html, url, site_title, site_desc)
            if (entry){
                pages.push(entry)
            }
        }
    }

    // Order so that ties are won by main pages, then articles, then the rest
    const rank = (url:string) => url === '/' ? 0 : url.split('/').length
    pages.sort((a, b) => rank(a.u) - rank(b.u))

    fs.mkdirSync(path.join(out_dir, search_dir), {recursive: true})
    // Text separately so that titles etc. can be searched sooner, while it downloads
    fs.writeFileSync(path.join(out_dir, search_dir, 'pages.json'),
        JSON.stringify(pages.map(({x, ...rest}) => rest)))
    fs.writeFileSync(path.join(out_dir, search_dir, 'text.json'),
        JSON.stringify(Object.fromEntries(pages.map(p => [p.u, p.x]))))
    mark_reprints(book, pages)
    fs.writeFileSync(path.join(out_dir, search_dir, 'book.json'), JSON.stringify(book))
    if (!book.length){
        console.warn(`[search] No sections found in ${book_url}, so the book won't be searchable`)
    }
}
