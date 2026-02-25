
<template lang='pug'>

div.book

    div.first-page
        //- So space is preserved
        h1 #[span {{strings.title_line1}}] #[br] #[span {{strings.title_line2}}]

    div.second-page(class='break')
        p #[em {{strings.subtitle}}]
        p {{strings.authors}}
        p &nbsp;
        p {{strings.publisher_prefix}} #[em {{strings.publisher_name}}]
        p sellingjesus.org
        p {{strings.edition}}
        //- ISBN for Amazon KDP
        //- p ISBN: ?
        p &nbsp;
        p {{strings.license_text}}
        img(src='/book_contents/pd.png' alt="Public domain")

    div.third-page(class='break')
        p
            template(v-for='(line, i) in lines(strings.quote1_stanza1)')
                br(v-if='i > 0')
                | {{line}}
        p
            template(v-for='(line, i) in lines(strings.quote1_stanza2)')
                br(v-if='i > 0')
                | {{line}}
        p &mdash; {{strings.quote1_ref}}
        p &nbsp;
        p {{strings.quote2_body}}
        p &mdash; {{strings.quote2_ref}}

    div.toc(class='break')
        h3.toc-title {{strings.toc_title}}
        div
            a.toc-chapter(@click='goto("chapter-foreword")' href='#chapter-foreword') {{strings.toc_foreword}}
        div
            a.toc-chapter(@click='goto("chapter-intro")' href='#chapter-intro') {{strings.toc_intro}}
        template(v-for='section of toc')
            h4 {{ section.title }}
            div(v-for='chapter of section.chapters')
                a.toc-chapter(@click='goto(chapter.id)' :href='"#" + chapter.id')
                    | {{ chapter.title }}
        div.toc-conclusion
            a.toc-chapter(@click='goto("chapter-conclusion")' href='#chapter-conclusion') {{strings.toc_conclusion}}

    div.foreword(class='break')
        div.titles
            h2(id="chapter-foreword") {{strings.foreword_title}}
        div(v-html='foreword_html')

    div.intro(class='break')
        div.titles
            h2(id="chapter-intro") {{strings.intro_title}}
            div(class="subtitle") {{strings.intro_subtitle}}
            div(class="author") Andrew Case
        div(v-html='intro_html')

    div(class='section break')
        h1 {{strings.section_conversations}}

    div.convos
        div(class="titles break")
            h2(id="chapter-convo-general") {{strings.convo_general_title}}
            div(class="author") Andrew Case

        p {{strings.convo_general_intro}}
        InstantMessages(file_id='conversations' :topics='convo_general.topics' book)

        div(class="titles break")
            h2(id="chapter-convo-corinthians") {{strings.convo_corinthians_title}}
            div(class="author") Conley Owens

        div(v-html='convo_corinthians.intro')
        InstantMessages(file_id='corinthians' :topics='convo_corinthians.topics' book)

    div(class='articles_html' v-html='articles_html')

    div.conclusion(class='break')
        div.titles
            h2(id="chapter-conclusion") {{strings.conclusion_title}}
            div(class="author") Andrew Case
        div(v-html='conclusion_html')

</template>


<script lang='ts' setup>

import {useShadowRoot} from 'vue'

import InstantMessages from '@/_comp/InstantMessages.vue'
import {markup_references} from './markup'
import {articles_by_category, article_ids} from '@/_comp/articles'

import styles from '../../book/styles_pdf.sass?inline'


// Need different HTML structure for epub
const EPUB = import.meta.env.VITE_BOOK === 'epub'


// Need to manually inject book styles into shadow DOM
defineOptions({
    styles: [styles],
})


interface ConvoData {
    topics: any[]
    intro?: string
}

interface BookStrings {
    title: string
    title_line1: string
    title_line2: string
    subtitle: string
    authors: string
    publisher_prefix: string
    publisher_name: string
    edition: string
    license_text: string
    quote1_stanza1: string
    quote1_stanza2: string
    quote1_ref: string
    quote2_body: string
    quote2_ref: string
    toc_title: string
    toc_foreword: string
    toc_intro: string
    toc_conclusion: string
    foreword_title: string
    intro_title: string
    intro_subtitle: string
    section_conversations: string
    convo_general_title: string
    convo_general_intro: string
    convo_corinthians_title: string
    profiles_title_text: string
    conclusion_title: string
    categories?: Record<string, string>
    online_version_text?: string
}

const props = defineProps<{
    convo_general: ConvoData
    convo_corinthians: ConvoData
    strings: BookStrings
    articles_data: any[]
    pages_data: any[]
}>()

const strings = props.strings
const convo_corinthians = props.convo_corinthians
const articles_data = props.articles_data
const pages_data = props.pages_data

// Delete descriptions of convo sections since only a couple have them and better to be consistent
const convo_general = {...props.convo_general, topics: props.convo_general.topics.map((t:any) => ({...t}))}
for (const convo of convo_general.topics){
    convo.description = ""
}


// Unpack pages (order defined in imported file)
const page_conclusion = pages_data[0]
const page_foreword = pages_data[1]
const page_intro = pages_data[2]
const page_profiles = pages_data[3]


// Split a string on newlines (for rendering with <br> in template)
function lines(text:string){
    return text.split('\n')
}


// Random id generator
function random_id(length=8){
    // WARN Don't use numbers as not valid as first char for id
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    const bytes = crypto.getRandomValues(new Uint8Array(length))
    let id = ''
    for (const byte of bytes) {
        id += chars[byte % chars.length]
    }
    return id
}


// Util to demote all headings in HTML
// WARN This is not appropriate to run for all HTML such as intro/conclusion
function demote_headings(html:string){
    return html.replace(/<(\/?)h([1-6])\b/g, (_, slash, level) => {
        let newLevel = Math.min(parseInt(level) + 1, 6)
        return `<${slash}h${newLevel}`
    })
}


// Util to transform website HTML for use in book
// WARN Should be run per-article/page, not on whole thing
function bookify_html(html:string, also_rm:string[]=[]){

    // Parse to DOM object
    const dom = new DOMParser().parseFromString(html, 'text/html')

    // Remove unwanted elements
    rm_ui(dom, also_rm)

    // Identify any passage references and wrap in <span> so can style
    // NOTE Caused unwanted linebreaks in some ereaders like Everand, so not enabling for epub
    if (!EPUB){
        markup_references(dom.body)  // Takes body, not whole dom
    }

    // Make ids and footnote links unique and not conflict with other articles
    unique_ids(dom)

    // Make URLs to articles point within own doc
    // WARN Must come after unique_ids(), otherwise would add random ids to links to other articles
    internalize_urls(dom)

    // Inline footnotes so can float to bottom for each PDF page
    if (!EPUB){
        inline_footnotes(dom)
    }

    // Return as string
    return dom.body.innerHTML
}


// Util to remove elements not-for-print
function rm_ui(dom:Document, extra:string[]=[]){
    const to_rm = ['youtube', 'iframe', 'vpbutton', 'badge', 'podcast-player', 'article-preview', ...extra]
    for (const element_type of to_rm){
        for (const element of dom.querySelectorAll(element_type)){
            element.remove()
        }
    }
}


// Articles not in book should not have their links be internalized
// NOTE Only need to list ones that are likely to be linked to within other articles
const not_in_book = ['letting-go', 'counseling-fees']


// Internalize urls so that they point to chapters within doc when exist
function internalize_urls(dom:Document){
    for (const a of dom.querySelectorAll('a')){
        // Ensure relative links point to website (so all are the same for later matching below)
        if (a.href.startsWith('/')){
            a.href = 'https://sellingjesus.org' + a.href
        }
        // Make article links point internally
        const articles_prefix = 'https://sellingjesus.org/articles/'
        if (a.href.startsWith(articles_prefix)){
            const article_id = a.href.slice(articles_prefix.length).split(/[\.\#\?]/)[0]
            if (not_in_book.includes(article_id)){
                continue
            }
            a.href = '#chapter-' + article_id
        }
    }
}


// Make ids unique
function unique_ids(dom:Document){

    // Generate random id unique to this chunk of HTML
    const rid = random_id(8) + '-'

    // Update every id (footnotes and headings etc)
    for (const el of dom.querySelectorAll('*[id]') as NodeListOf<HTMLElement>){
        el.id = rid + el.id
    }

    // Update every fragment link (footnotes and some section links like in defining-ministry)
    for (const a of dom.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>){
        // WARN .href prepends "about:blank", so use getAttribute
        const href = a.getAttribute('href')
        if (href?.startsWith('#')){
            a.href = '#' + rid + href.split('#')[1]  // Must insert after the #
        }
    }
}


// Util to inline footnotes for an article
function inline_footnotes(dom:Document){

    // Replace all refs with actual footnote contents
    dom.querySelectorAll('.footnote-ref').forEach(sup => {

        // Identify the <li> with the contents
        // WARN .href prepends "about:blank" for some reason
        const id = (sup.firstChild as HTMLAnchorElement).href.split('#')[1]
        const li = dom.querySelector('#' + id)
        if (!li){
            throw new Error("Couldn't get footnote contents")
        }

        // Create new <span> to hold contents with same attributes
        const new_span = dom.createElement('span')
        for (const attr of li.attributes){
            new_span.setAttribute(attr.name, attr.value)
        }

        // Footnotes have 1 or more <p> children so flatten and separate with <br> instead
        new_span.innerHTML = [...li.children].map(p => p.innerHTML).join('<br>')

        // Replace the ref and remove the <li>
        sup.replaceWith(new_span)
        li.remove()
    })

    // Ensure moved all footnotes
    // NOTE May not exist if no footnotes in article
    if (dom.querySelector('.footnotes-list')?.innerHTML.trim()){
        throw new Error("Didn't inline all footnotes")
    }

    // Remove old containers
    dom.querySelector('.footnotes-sep')?.remove()
    dom.querySelector('.footnotes')?.remove()
}


// Prepare intro/conclusion HTML
const foreword_html = bookify_html(page_foreword.html)
const intro_html = bookify_html(page_intro.html)
const conclusion_html = bookify_html(page_conclusion.html)


// Prepare profiles HTML
const profiles_title = `
    <div class="titles">
        <h2 id="chapter-profiles">${strings.profiles_title_text}</h2>
        <div class="author">Andrew Case</div>
    </div>
`
const profiles_html = bookify_html(demote_headings(page_profiles.html), ['img'])
    .replace(/<h2.*?<\/h2>/, profiles_title)


// Convert to object with ids
const articles = Object.fromEntries(articles_data.map(a => [a.url.split('/').pop(), a]))


// DEBUG List articles without a category
const no_cat = Object.keys(articles).filter(id => !article_ids.includes(id))
console.warn(`No category for articles: ${no_cat.join(', ')}`)


// Concat all by category
let articles_html = ''
for (const category in articles_by_category){

    const category_title = strings.categories?.[category] ?? category
    articles_html += `<div class='section break'><h1>${category_title}</h1></div>`

    // Include 'bible-societies' in book but not site yet
    const articles_for_category = [...articles_by_category[category]]
    if (category === "History" && !articles_for_category.includes('bible-societies')){
        articles_for_category.push('bible-societies')
    }

    for (const article_id of articles_for_category){
        const article = articles[article_id]

        // Skip if article not available (e.g. not yet translated)
        if (!article) continue

        // Exclude if not public domain
        if (article.frontmatter.license){
            continue
        }

        // Add titles/etc before concating
        articles_html += '<div class="titles break">'
        const title = article.frontmatter.title_h1 || article.frontmatter.title
        const subtitle = article.frontmatter.title_h2
        articles_html += `<h2 id="chapter-${article_id}">${title}</h2>`
        if (subtitle){
            articles_html += `<div class="subtitle">${subtitle}</div>`
        }
        articles_html += `<div class="author">${article.frontmatter.author}</div>`
        articles_html += '</div>'
        articles_html += bookify_html(demote_headings(article.html)).trim()

        // Since printed book won't have links, insert final footnote with article URL
        if (!EPUB && strings.online_version_text){

            // Detect what tags article ends with so can insert a final footnote
            let end_tags = articles_html.match(/<\/p>$/)?.[0]
                ?? articles_html.match(/<\/p>\s*<\/blockquote>$/)?.[0]
            if (!end_tags){
                console.error(articles_html.slice(-200))
                throw new Error("Couldn't detect tags article ends with")
            }

            // Remove end tags (will add back below)
            articles_html = articles_html.slice(0, end_tags.length * -1)

            // Add url footnote
            articles_html += `<span class='footnote-item online'>${strings.online_version_text}<br>sellingjesus.org/articles/${article_id}</span>`
            articles_html += end_tags
        }
    }

    // Append profiles to end of Application category
    if (category === "Application"){
        articles_html += `<div class='profiles_html break'>${profiles_html}</div>`
    }
}


// Generate outline
interface OutlineChapter {
    id:string
    title:string
}

interface OutlineSection {
    title:string
    chapters:OutlineChapter[]
}

const toc:OutlineSection[] = [
    {title: strings.section_conversations, chapters: [
        {id: "chapter-convo-general", title: strings.convo_general_title},
        {id: "chapter-convo-corinthians", title: strings.convo_corinthians_title},
    ]},
]

function add_to_toc(html:string){

    // Parse given HTML
    const dom = new DOMParser().parseFromString(html, 'text/html')

    // Init state

    let current_section:OutlineSection|null = null

    // Loop through headings
    for (const el of dom.querySelectorAll('h1, h2')){
        const tag = el.tagName.toLowerCase()
        const title = el.textContent!.trim()

        // Handle new section
        if (tag === 'h1') {
            current_section = {
                title,
                chapters: [],
            }
            toc.push(current_section)

        // Handle new chapter
        } else if (tag === 'h2' && current_section) {
            current_section.chapters.push({
                // Use combined title for articles (as two 1 Cor 9 articles have same name otherwise)
                title: articles[el.id.slice('chapter-'.length)]?.frontmatter.title ?? title,
                id: el.id,
            })
        }
    }

    return toc
}


add_to_toc(articles_html)


// Navigate to chapter on click in TOC
const shadow = useShadowRoot()
const goto = (id:string) => {
    shadow?.querySelector('#' + id)?.scrollIntoView()
}


</script>
