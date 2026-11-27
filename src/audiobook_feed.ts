
// Podcast feed for the audiobook of "God's Word Is Not Bound", so it can be followed in any app
// NOTE Imported by the client too (for the path), so this must not import anything Node-only

import audiobook from './audiobook.json'


// Where the feed is served from, relative to the site root
export const audiobook_feed_path = '/word-not-bound/audiobook.xml'

const SITE = 'https://sellingjesus.org'
const TITLE = "God’s Word Is Not Bound (Audiobook)"
const DESCRIPTION = "The free audiobook of God’s Word Is Not Bound: Copyright & the Stewardship of"
    + " Scripture, which examines whether the Word of God can rightly be owned, restricted, and sold."

// Fixed so the feed doesn't change between builds; each chapter is a minute later than the last
// NOTE Some apps order by date rather than episode number, so this keeps chapters in sequence
const RELEASED = Date.UTC(2026, 10, 27)


// Escape text for inclusion in XML
function esc(text:string):string{
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}


// Generate the feed's XML
export function build_audiobook_feed():string{

    // Credit everyone who reads a chapter, in order of first appearance
    const authors = [...new Set(audiobook.chapters
        .flatMap(chapter => chapter.author?.split(' & ') ?? []))].join(', ')
    const cover = audiobook.base + audiobook.cover

    const items = audiobook.chapters.map((chapter, i) => {
        const url = audiobook.base + chapter.file
        const by = chapter.author ? ` by ${chapter.author}` : ''
        return `
    <item>
        <title>${esc(chapter.title)}</title>
        <itunes:title>${esc(chapter.title)}</itunes:title>
        <itunes:episode>${i + 1}</itunes:episode>
        <itunes:episodeType>full</itunes:episodeType>
        <description>${esc(`Chapter ${i + 1} of God’s Word Is Not Bound${by}.`)}</description>
        ${chapter.author ? `<itunes:author>${esc(chapter.author)}</itunes:author>` : ''}
        <enclosure url="${esc(url)}" length="${chapter.size}" type="audio/mpeg"/>
        <guid isPermaLink="false">${esc(url)}</guid>
        <pubDate>${new Date(RELEASED + i * 60_000).toUTCString()}</pubDate>
        <itunes:duration>${chapter.duration}</itunes:duration>
        <itunes:image href="${esc(cover)}"/>
    </item>`
    })

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
        xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>${esc(TITLE)}</title>
    <link>${SITE}/word-not-bound</link>
    <atom:link href="${SITE}${audiobook_feed_path}" rel="self" type="application/rss+xml"/>
    <description>${esc(DESCRIPTION)}</description>
    <language>en-us</language>
    <itunes:author>${esc(authors)}</itunes:author>
    <itunes:image href="${esc(cover)}"/>
    <image>
        <url>${esc(cover)}</url>
        <title>${esc(TITLE)}</title>
        <link>${SITE}/word-not-bound</link>
    </image>
    <itunes:type>serial</itunes:type>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Religion &amp; Spirituality">
        <itunes:category text="Christianity"/>
    </itunes:category>
${items.join('\n')}
</channel>
</rss>
`
}
