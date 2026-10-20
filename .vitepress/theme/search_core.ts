// Matching, ranking and snippets for the site search (see SearchPalette.vue)
// NOTE Kept free of the DOM so it can be benchmarked in Node


export interface Doc {
    title:string
    href:string
    section:string
    source:'pages'|'heading'|'book'
    desc?:string
    t:string  // Title words
    m:string  // Metadata words (section, description, keywords)
    x:string  // Body words
    raw:string  // Body as written
    k?:string[]  // Searches this is the best result for
    boost:number  // Added to the score of any match
}

export interface Result {
    d:Doc
    href:string  // With a text fragment, for new tabs
    words?:string  // The words as found in the text, for highlighting on arrival
    at?:number  // Where the words are in the text
}


// TEXT

// Words only: lower case, accents and apostrophes dropped (so "gods" finds "God’s") and British
// spellings made American
// NOTE Runs on all text when search data loads, so fewer passes over it matters on phones
export const words = (s:string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ’‘']/g, '')
    .replace(/\b(hon|lab|neighb|savi|fav|behavi|endeav|col|rig)our/g, '$1or')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/ {2,}/g, ' ').trim()

// Space padded, so that " word" means "starts a word"
export const pad = (s = '') => ` ${words(s)} `

export const terms = (q:string) => q.split(' ').filter(Boolean)

export const esc = (s:string) => s.replace(/[&<>"]/g,
    c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]!)


// DATA

export function pages_docs(all:any[]):Doc[]{
    return all.flatMap(e => {
        const page:Doc = {title: e.t, href: e.u, section: e.s, desc: e.d, source: 'pages', t: pad(e.t),
            m: pad([e.s, e.d, e.k].join(' ')), x: ' ', raw: '',  // Text is added by add_text()
            k: e.k?.split(',').map(words),
            // Articles and main pages are the originals of what podcasts and videos discuss
            boost: ['Podcast', 'Videos'].includes(e.s) ? 6 : 12}
        // Headings are found by their own words only (the page's title would match every one)
        // and are below their page, which is usually what's wanted when both match
        const headings:Doc[] = (e.h ?? []).map(([anchor, heading]:[string, string]) => ({
            title: heading, href: `${e.u}#${anchor}`, section: e.t, source: 'heading', t: pad(heading),
            m: ' ', x: ' ', raw: '', boost: -25,
        }))
        return [page, ...headings]
    })
}

// Add pages' text (downloaded separately as it's most of the data)
// NOTE Preparing it all takes a few hundred ms on phones, so can pause to let typing etc. respond
export async function add_text(docs:Doc[], text:Record<string, string>, pause?:() => Promise<void>){
    let since = performance.now()
    for (const d of docs){
        const raw = d.source === 'pages' ? text[d.href] : undefined
        if (raw){
            d.raw = raw
            d.x = pad(raw)
        }
        if (pause && performance.now() - since > 8){
            await pause()
            since = performance.now()
        }
    }
}

export function book_docs(all:any[]):Doc[]{
    return all.map(e => ({
        title: e.t, href: e.u, section: e.c && e.c !== e.t ? `Book · ${e.c}` : "Book", source: 'book',
        t: pad(e.t), m: ' ', x: pad(e.x), raw: e.x,
        // Sections are below pages, like headings, and reprints of articles below the articles
        boost: e.r ? -30 : -10,
    }))
}


// SCORING

// Score a doc for a query (already passed through words()), or null if it doesn't match
export function score(q:string, d:Doc):number|null{
    let s = 0
    const ws = terms(q)
    for (const [i, w] of ws.entries()){
        // A finished 1-2 letter word must be a whole word outside the title, but the last word
        // (still being typed) may be the start of one
        const prefix = w.length > 2 || i === ws.length - 1
        if (d.t.includes(` ${w} `)) s += 14
        else if (d.t.includes(` ${w}`)) s += 10
        else if (d.m.includes(prefix ? ` ${w}` : ` ${w} `)) s += 5
        else if (d.x.includes(` ${w} `)) s += 3
        else if (prefix && d.x.includes(` ${w}`)) s += 2
        else return null  // Every word must match somewhere
    }
    // The whole phrase, where it's most prominent (pages may or may not repeat their title in the body)
    if (d.t.startsWith(` ${q}`)) s += 60
    else if (d.t.includes(` ${q}`)) s += 40
    else {
        if (q.includes(' ') && d.x.includes(` ${q}`)) s += 25
        if (d.m.includes(` ${q}`)) s += 10
    }
    if (d.k?.includes(q)) s += 100
    return s + d.boost - d.title.length / 60  // Short, focused titles win ties
}

// The best matches for a query (already passed through words()), best first, and all matches
// NOTE Typing more only ever narrows the matches, so the next search can be of those alone
export function search(q:string, all:Doc[], limit = 50):{top:Doc[], matched:Doc[]}{
    const scored = all.map((d, i) => ({d, i, s: score(q, d)})).filter(r => r.s !== null)
    const matched = scored.map(r => r.d)
    const top = scored.sort((a, b) => b.s! - a.s! || a.i - b.i).slice(0, limit).map(r => r.d)
    return {top, matched}
}

// Whether a query only narrows the matches of a previous one (by typing on)
export const narrows = (prev:string, q:string) => prev !== '' && q.startsWith(prev)


// SNIPPETS

// A typed word as it may appear in text: any case, apostrophes allowed between letters
const word_re = (w:string) => [...w].map(c => c.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&')).join("['’]?")
// NOTE Latin letters only (rather than \p{L} with the u flag) as that makes these much faster
const LETTER = "a-z0-9\\u00c0-\\u024f"
const START = `(?<![${LETTER}])`
const REST = `[${LETTER}'’]*`
const GAP = `[^${LETTER}]+`

export function mark(text:string, q:string):string{
    const ws = terms(q)
    if (!ws.length){
        return esc(text)
    }
    // The phrase through to the end of its last word, and each word of 3+ letters on its own
    const phrase = ws.length > 1 ? [`${ws.map(word_re).join(GAP)}${REST}`] : []
    const alone = ws.filter(w => w.length > 2 || ws.length === 1).map(word_re)
    const re = new RegExp(`${START}(${[...phrase, ...alone].join('|')})`, 'gi')
    return text.split(re).map((part, i) => i % 2 ? `<mark>${esc(part)}</mark>` : esc(part)).join('')
}

// Where the words appear in the text as written: the whole phrase if present, else the first word
export function find(raw:string, q:string):RegExpExecArray|null{
    const ws = terms(q)
    if (ws.length > 1){
        const phrase = new RegExp(`${START}${ws.map(word_re).join(GAP)}${REST}`, 'i').exec(raw)
        if (phrase){
            return phrase
        }
    }
    for (const w of ws){
        const m = new RegExp(`${START}${word_re(w)}${REST}`, 'i').exec(raw)
        if (m){
            return m
        }
    }
    return null
}

export function snippet(raw:string, at:number, len:number):string{
    const start = at > 40 ? raw.lastIndexOf(' ', at - 40) + 1 : 0
    const end = Math.min(raw.length, at + len + 160)
    return (start > 0 ? '…' : '') + raw.slice(start, end).trim() + (end < raw.length ? '…' : '')
}

export const in_title = (d:Doc, q:string) => terms(q).every(w => d.t.includes(` ${w}`))

// Where a result links to, and the words to highlight there
export function target(d:Doc, q:string):Result{
    if (in_title(d, q) || !d.raw){
        return {d, href: d.href}
    }
    const m = find(d.raw, q)
    if (!m){
        return {d, href: d.href}
    }
    const fragment = encodeURIComponent(m[0]).replace(/-/g, '%2D')
    return {d, href: d.href + (d.href.includes('#') ? ':~:text=' : '#:~:text=') + fragment, words: m[0],
        at: m.index}
}

// The line under a result's title: where the words were found, else its description
export function line(r:Result, q:string):string{
    if (r.words && r.at !== undefined){
        return mark(snippet(r.d.raw, r.at, r.words.length), q)
    }
    return r.d.desc ? mark(r.d.desc, q) : ''
}
