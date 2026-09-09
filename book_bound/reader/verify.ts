
import {createHash} from 'crypto'
import {execFileSync} from 'child_process'
import {existsSync, mkdtempSync, readFileSync, rmSync} from 'fs'
import {tmpdir} from 'os'
import {dirname, join} from 'path'
import {fileURLToPath} from 'url'

import {JSDOM} from 'jsdom'

import {read_epub} from './epub.ts'
import type {Epub} from './epub.ts'


const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const EPUB_PATH = join(ROOT, 'src/_public/book_bound/Gods-Word-Is-Not-Bound.epub')
const OUT_DIR = join(ROOT, 'src/_public/word-not-bound/read')
const PAGE_PATH = join(OUT_DIR, 'index.html')
const EXCEPTIONS_PATH = join(HERE, 'exceptions.json')

// Every element that can directly hold the book's text
// NOTE Confirmed against the epub: no text sits outside one of these
const BLOCKS = ['P', 'LI', 'TD', 'TH', 'H1', 'H2', 'H3']

// How much of a block to show when reporting a mismatch
const EXCERPT = 110


// One run of text as the reader meets it, e.g. a paragraph or a table cell
interface Block {
    chapter:string
    // Position within its own chapter, so a mismatch can be pointed at precisely
    index:number
    tag:string
    text:string
}


// A block deliberately not compared, because it differs for a trivial reason
interface Exception {
    chapter:string
    index:number
    reason:string
}


// Reduce text to what actually matters: the words, in order
// NOTE Deliberately forgiving about characters -- the point is to catch reworded or lost prose
function normalize(text:string):string{
    return text
        .normalize('NFC')
        // Quotes, dashes and ellipses have several equivalent forms
        .replace(/[‘’‚‛′]/g, "'")
        .replace(/[“”„‟″]/g, '"')
        .replace(/[‐-―−]/g, '-')
        .replace(/…/g, '...')
        // Invisible characters survive the journey out of a word processor
        .replace(/[­​-‍⁠﻿]/g, '')
        .replace(/[\s ]+/g, ' ')
        .trim()
}


// Collect the book's text as an ordered list of blocks
// NOTE Grouping by each text node's nearest block ancestor keeps nesting from double counting
function extract_blocks(root:Element, chapter_of:(el:Element) => string):Block[]{

    const doc = root.ownerDocument
    const walker = doc.createTreeWalker(root, 4)  // 4 = SHOW_TEXT
    const owners = new Map<Element, string[]>()

    let node = walker.nextNode()
    while (node){
        if (node.textContent?.trim()){

            // Find the block this text belongs to
            let owner = node.parentElement
            while (owner && owner !== root && !BLOCKS.includes(owner.tagName)){
                owner = owner.parentElement
            }
            if (!owner || owner === root){
                throw new Error(`Text outside any block: ${node.textContent.slice(0, 60)}`)
            }

            // Map preserves insertion order, which is document order
            const collected = owners.get(owner)
            if (collected){
                collected.push(node.textContent)
            } else {
                owners.set(owner, [node.textContent])
            }
        }
        node = walker.nextNode()
    }

    // Number the blocks within each chapter
    const counts:Record<string, number> = {}
    const blocks:Block[] = []
    for (const [owner, parts] of owners){
        const chapter = chapter_of(owner)
        counts[chapter] = (counts[chapter] ?? 0) + 1
        blocks.push({
            chapter,
            index: counts[chapter]!,
            tag: owner.tagName.toLowerCase(),
            text: normalize(parts.join('')),
        })
    }
    return blocks
}


// The book's text as it sits in the epub, in reading order
function epub_blocks(epub:Epub):Block[]{
    const blocks:Block[] = []
    for (const chapter of epub.chapters){
        blocks.push(...extract_blocks(chapter.doc.body, () => chapter.slug))
    }
    return blocks
}


// The book's text as it sits in the generated page
function page_blocks(doc:Document):Block[]{
    const book = doc.getElementById('book')
    if (!book){
        throw new Error("The generated page has no #book")
    }
    return extract_blocks(book, el => el.closest('[data-chapter]')?.
        getAttribute('data-chapter') ?? '?')
}


// Count blocks per chapter, so a length mismatch can be localised
function per_chapter(blocks:Block[]):Record<string, number>{
    const counts:Record<string, number> = {}
    for (const block of blocks){
        counts[block.chapter] = (counts[block.chapter] ?? 0) + 1
    }
    return counts
}


// Collect the results of every check, so all problems are reported at once
const problems:string[] = []
const report = (message:string):void => {
    problems.push(message)
}


// The check that matters: no paragraph reworded, dropped, duplicated or reordered
function check_text(epub:Epub, doc:Document, exceptions:Exception[]):void{

    const expected = epub_blocks(epub)
    const actual = page_blocks(doc)

    // A count mismatch means text was gained or lost, so say where before comparing
    if (expected.length !== actual.length){
        report(`Block count differs: epub has ${expected.length}, page has ${actual.length}`)
        const from = per_chapter(expected)
        const to = per_chapter(actual)
        for (const chapter of Object.keys(from)){
            if (from[chapter] !== to[chapter]){
                report(`  ${chapter}: epub has ${from[chapter]}, page has ${to[chapter] ?? 0}`)
            }
        }
        return
    }

    // Compare block for block, skipping any known exception
    const skip = new Set(exceptions.map(item => `${item.chapter}:${item.index}`))
    let mismatches = 0
    for (let i = 0; i < expected.length; i++){
        const from = expected[i]!
        const to = actual[i]!
        if (from.text === to.text || skip.has(`${from.chapter}:${from.index}`)){
            continue
        }
        mismatches++
        if (mismatches <= 5){
            report(`Text differs at ${from.chapter} block ${from.index} (<${from.tag}>):`)
            report(`  epub: ${from.text.slice(0, EXCERPT)}`)
            report(`  page: ${to.text.slice(0, EXCERPT)}`)
        }
    }
    if (mismatches > 5){
        report(`  ...and ${mismatches - 5} further mismatches`)
    }
    if (!mismatches){
        console.log(`  ${expected.length} blocks match, in order`
            + `${skip.size ? ` (${skip.size} known exceptions skipped)` : ''}`)
    }
}


// Footnotes must all still be present and still lead somewhere
function check_footnotes(epub:Epub, doc:Document):void{

    const expected = epub.chapters
        .reduce((total, chapter) => total + chapter.doc.querySelectorAll('.footnote-ref').length, 0)
    const refs = [...doc.querySelectorAll('#book .footnote-ref')]
    if (refs.length !== expected){
        report(`Footnote references: epub has ${expected}, page has ${refs.length}`)
    }

    const broken = refs.filter(a => !doc.getElementById(a.getAttribute('href')?.slice(1) ?? ''))
    if (broken.length){
        report(`${broken.length} footnote references don't lead to a note`)
    } else {
        console.log(`  ${refs.length} footnotes all resolve`)
    }
}


// Ids must be unique now every chapter shares one page, and links must land somewhere
function check_links(doc:Document):void{

    const ids = [...doc.querySelectorAll('[id]')].map(el => el.id)
    const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))]
    if (duplicates.length){
        report(`${duplicates.length} duplicate ids, e.g. ${duplicates.slice(0, 3).join(', ')}`)
    }

    const broken = [...doc.querySelectorAll('a[href^="#"]')]
        .filter(a => !doc.getElementById(a.getAttribute('href')!.slice(1)))
    if (broken.length){
        report(`${broken.length} links point at nothing, e.g. `
            + broken.slice(0, 3).map(a => a.getAttribute('href')).join(', '))
    }
    if (!duplicates.length && !broken.length){
        console.log(`  ${ids.length} ids unique, every in-page link resolves`)
    }
}


// Every image must have come out of the epub unaltered
function check_images(epub:Epub, doc:Document):void{

    const sources = new Set([...doc.querySelectorAll('#book img[src]')]
        .map(img => img.getAttribute('src')!))

    for (const src of sources){
        const file = join(OUT_DIR, 'media', src.split('/').pop()!)
        if (!existsSync(file)){
            report(`Missing image: ${src}`)
            continue
        }
        const original = epub.files[`${epub.root}/media/${src.split('/').pop()}`]
        if (!original){
            report(`Image isn't in the epub: ${src}`)
            continue
        }
        const of_file = createHash('sha256').update(readFileSync(file)).digest('hex')
        const of_epub = createHash('sha256').update(original).digest('hex')
        if (of_file !== of_epub){
            report(`Image doesn't match the epub: ${src}`)
        }
    }
    console.log(`  ${sources.size} images match the epub`)
}


// The page must still be the one this epub and this script produce
function check_provenance(doc:Document):void{

    // The build records which epub it read, so a swapped epub can't go unnoticed
    const comment = [...doc.head.childNodes]
        .filter(node => node.nodeType === 8)
        .map(node => node.textContent ?? '')
        .join(' ')
    const recorded = /sha256 ([0-9a-f]{64})/.exec(comment)?.[1]
    const actual = createHash('sha256').update(readFileSync(EPUB_PATH)).digest('hex')
    if (!recorded){
        report("The page doesn't record which epub it was built from")
    } else if (recorded !== actual){
        report('The page was built from a different epub than the one committed')
    }

    // Rebuilding must give back exactly the same page
    const temp = mkdtempSync(join(tmpdir(), 'bound-verify-'))
    try {
        execFileSync('node', [join(HERE, 'build.ts'), temp], {stdio: 'pipe'})
        const built = readFileSync(join(temp, 'index.html'))
        if (!built.equals(readFileSync(PAGE_PATH))){
            report('Rebuilding produces a different page than the one committed')
        } else {
            console.log('  rebuilding reproduces the committed page exactly')
        }
    } finally {
        rmSync(temp, {recursive: true, force: true})
    }
}


// Check the generated page against the epub it came from
function main():void{

    if (!existsSync(PAGE_PATH)){
        console.error(`No generated page at ${PAGE_PATH} -- run .bin/bound_generate first`)
        process.exit(1)
    }

    const epub = read_epub(EPUB_PATH)
    const doc = new JSDOM(readFileSync(PAGE_PATH)).window.document
    const exceptions:Exception[] = existsSync(EXCEPTIONS_PATH)
        ? JSON.parse(readFileSync(EXCEPTIONS_PATH, 'utf8'))
        : []

    console.log("Checking the web edition against the epub...")
    check_text(epub, doc, exceptions)
    check_footnotes(epub, doc)
    check_links(doc)
    check_images(epub, doc)
    check_provenance(doc)

    if (problems.length){
        console.error(`\n${problems.length} problem(s):\n`)
        for (const problem of problems){
            console.error(problem)
        }
        process.exit(1)
    }
    console.log('\nThe web edition matches the epub.')
}


main()

