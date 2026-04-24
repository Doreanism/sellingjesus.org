
/* This will update podcast.json
    * Updates episodes present in RSS feed
    * Will add new episodes
    * Retains previously fetched episodes no longer in feed
    * Most fields editable via CMS
*/

import {writeFileSync} from 'fs'

import MarkdownIt from 'markdown-it'
import {JSDOM} from 'jsdom'

import existing_items from '../src/podcast.json' with {type: 'json'}


const markdowner = new MarkdownIt({linkify: true, typographer: true, html: true})


// Fetch RSS feed
const rss_resp = await fetch('https://anchor.fm/s/e3894160/podcast/rss')
const rss_text = await rss_resp.text()


// Parse RSS as HTML (avoids XML namespace issues and handles unescaped `&`)
// See https://github.com/jsdom/jsdom/issues/3266
const dom = new JSDOM()
const parser = new dom.window.DOMParser()
const doc = parser.parseFromString(rss_text, 'text/html')


// Extract CDATA markers from text content
const strip_cdata = (text) => {
    if (text.startsWith('<![CDATA[')) {
        return text.slice('<![CDATA['.length, -(']]>'.length)).trim()
    }
    return text.trim()
}


// Strip HTML tags to get plain text
const strip_html = (html) => {
    const el = dom.window.document.createElement('div')
    el.innerHTML = html
    return el.textContent || ''
}


// Parse duration string (HH:MM:SS or MM:SS) to milliseconds
const parse_duration = (str) => {
    const parts = str.split(':').map(Number)
    if (parts.length === 3) {
        return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000
    }
    return (parts[0] * 60 + parts[1]) * 1000
}


// Parse RSS pubDate to YYYY-MM-DD
const parse_date = (str) => {
    return new Date(str).toISOString().slice(0, 10)
}


// Get all episodes from RSS
const items = doc.querySelectorAll('item')

const episodes = [...items].map(item => {

    // Extract basic fields
    const title = strip_cdata(item.querySelector('title').textContent)
    const guid = item.querySelector('guid').textContent
    const audio = item.querySelector('enclosure')?.getAttribute('url')

    // Get HTML description from itunes:summary (entity-encoded in RSS, decoded by HTML parser)
    const summary_el = item.getElementsByTagName('itunes:summary')[0]
    const raw_html = summary_el?.textContent || ''

    // Get duration
    const duration_el = item.getElementsByTagName('itunes:duration')[0]
    const duration = duration_el ? parse_duration(duration_el.textContent) : 0

    // Get date
    const date = parse_date(item.querySelector('pubdate').textContent)

    // Get image
    const image_el = item.getElementsByTagName('itunes:image')[0]
    const image = image_el?.getAttribute('href') || ''

    // Find existing data (match by GUID, or by audio URL for transition from Spotify IDs)
    const existing = existing_items.episodes.find(e => e.id === guid)
        || existing_items.episodes.find(e => e.audio === audio)

    // Work out description HTML
    let desc_html = ''
    if (existing?.description_md) {
        desc_html = markdowner.render(existing.description_md)
    } else {
        // Remove promo links at end (sellingjesus | thedoreanprinciple | copy.church)
        desc_html = raw_html.replace(
            /([\s\S]*)<a href="https:\/\/sellingjesus\.org\/?"[^>]*>[\s\S]*?thedoreanprinciple[\s\S]*$/,
            '$1',
        ).trim()
    }

    // Plain text description (for previews)
    const description = strip_html(raw_html).replace(/\s+/g, ' ').trim()

    return {
        id: guid,
        title: existing?.title?.trim() || title,
        description,
        description_html: desc_html,
        description_md: existing?.description_md ?? '',
        transcript_md: existing?.transcript_md ?? '',
        transcript_html: markdowner.render(existing?.transcript_md ?? ''),
        audio,
        duration,
        date,
        image,
    }
})


// Retain existing episodes not present in the RSS feed (in case it gets truncated)
const rss_ids = new Set(episodes.map(e => e.id))
for (const existing of existing_items.episodes) {
    if (!rss_ids.has(existing.id)) {
        episodes.push(existing)
    }
}


// Sort by date descending (newest first)
episodes.sort((a, b) => b.date.localeCompare(a.date))


// Add numbers
let num = episodes.length
for (const episode of episodes){
    episode.number = num
    num -= 1
}


// Save to file
writeFileSync('src/podcast.json', JSON.stringify({episodes}, undefined, 4))
