
import fs from 'node:fs'
import path from 'node:path'
import {Agent} from 'undici'


// Input
const language = process.argv[2]
const api_key = process.env.OPENAI_KEY
if (language.length !== 2){
    throw new Error("Pass language code as arg")
}


async function call_llm(sys_prompt, content) {
    const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${api_key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-5.2',  // GPT5 has issues but has a massively larger context window / limit
            instructions: sys_prompt,
            input: content,
        }),
        dispatcher: new Agent({
            headersTimeout: 60 * 1000 * 10,  // Wait 10 minutes
        })
    })

    const data = await response.json()
    try {
        return data.output.find(i => i.type === 'message').content[0].text
    } catch {
        throw new Error(JSON.stringify(data))
    }
}


async function translate_md(content) {
    return call_llm(
        `Translate all human text into ${language}, but preserve all Markdown, YAML, and HTML formatting. These are Christian theological writings. Translate quotes and Bible verses. Translate the text contents of any HTML, including within tables. Translate link text but don't change the URLs. Never translate Greek or Hebrew.`,
        content,
    )
}


async function translate_ts(content) {
    return call_llm(
        `Translate all human-readable string values into ${language} in this TypeScript/Vue file. Preserve all code, syntax, variable names, import paths, and formatting exactly. Only translate string literals that contain visible human-readable text. Never translate code identifiers, URLs, file paths, or technical values.`,
        content,
    )
}


async function translate_json(content) {
    return call_llm(
        `Translate all human-readable string values into ${language} in this JSON. Preserve all JSON structure, keys, newlines, and non-text values exactly. These are Christian theological writings.`,
        content,
    )
}


// Fix paths for translated/copied files
function fix_paths(content) {
    content = content.replaceAll('i18n/test/', `i18n/${language}/`)
    content = content.replaceAll('sellingjesus.org/articles/', `sellingjesus.org/i18n/${language}/articles/`)
    content = content.replace(/(?<=\W)\/articles\//g, `/i18n/${language}/articles/`)
    return content
}


// Files in i18n/test to process
// Types: 'md' | 'ts' | 'json' | 'copy' (text, no translation) | 'binary'
const test_files = [
    {path: 'i18n.ts',                              type: 'ts'},
    {path: 'about.md',                             type: 'md'},
    {path: 'index.md',                             type: 'md'},
    {path: 'learn.md',                             type: 'copy'},
    {path: 'articles.data.ts',                     type: 'copy'},
    {path: 'book_contents/BookContents.vue',       type: 'ts'},
    {path: 'book_contents/foreword.md',            type: 'md'},
    {path: 'book_contents/intro.md',               type: 'md'},
    {path: 'book_contents/conclusion.md',          type: 'md'},
    {path: 'book_contents/index.md',               type: 'copy'},
    {path: 'book_contents/book_articles.data.ts',  type: 'copy'},
    {path: 'book_contents/pages.data.ts',          type: 'copy'},
    {path: 'book_contents/pd.png',                 type: 'binary'},
    {path: 'learn/conversations.json',             type: 'json'},
    {path: 'learn/corinthians.json',               type: 'json'},
    {path: 'learn/conversations.md',               type: 'copy'},
    {path: 'learn/corinthians.md',                 type: 'copy'},
    {path: 'learn/profiles.md',                    type: 'md'},
]


for (const file of test_files) {
    const in_file = path.join('i18n', 'test', file.path)
    const out_file = path.join('i18n', language, file.path)

    fs.mkdirSync(path.dirname(out_file), {recursive: true})

    if (fs.existsSync(out_file)){
        console.log(`Already exists: ${out_file}`)
        continue
    }

    if (file.type === 'binary'){
        console.log(`Copying: ${in_file} → ${out_file}`)
        fs.copyFileSync(in_file, out_file)
        continue
    }

    const content = fs.readFileSync(in_file, 'utf8')

    if (file.type === 'copy'){
        console.log(`Copying: ${in_file} → ${out_file}`)
        fs.writeFileSync(out_file, fix_paths(content), 'utf8')
        continue
    }

    console.log(`Translating: ${in_file} → ${out_file}`)

    let translated
    if (file.type === 'md'){
        translated = await translate_md(content)
    } else if (file.type === 'ts'){
        translated = await translate_ts(content)
    } else if (file.type === 'json'){
        translated = await translate_json(content)
    }

    fs.writeFileSync(out_file, fix_paths(translated) + '\n', 'utf8')
}


// Translate articles dir
const lang_dir = path.join('i18n', language)
const dirs = ['articles']

for (const dir of dirs){

    // Ensure outdir exists
    const out_dir = path.join(lang_dir, dir)
    fs.mkdirSync(out_dir, {recursive: true})

    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))){

        // Determine paths
        const in_file = path.join(dir, file)
        const out_file = path.join(out_dir, file)

        // Skip if already exists
        if (fs.existsSync(out_file)){
            console.log(`Already exists: ${out_file}`)
            continue
        }
        console.log(`Translating: ${in_file} → ${out_file}`)

        // Translate file
        const content = fs.readFileSync(in_file, 'utf8')
        const translated = await translate_md(content)
        fs.writeFileSync(out_file, fix_paths(translated) + '\n', 'utf8')
    }
}
