// Separate conversations into array items and render to HTML

import {writeFileSync, readFileSync} from 'fs'

import MarkdownIt from 'markdown-it'


const file_id = process.argv[2]
if (!file_id){
    throw new Error("Arg should be conversations|corinthians")
}
const data = JSON.parse(readFileSync(`${file_id}.json`, {encoding: 'utf8'}))


const markdowner = new MarkdownIt({linkify: true, typographer: true, html: true})


data.intro = markdowner.render(data.intro)
data.topics = data.topics.map(topic => {

    // Get list of trimmed lines
    const lines = topic.messages.split('\n').map(l => l.trim()).filter(l => l)

    // Detect names
    let name1 = ''
    let name2 = ''
    for (const line of lines){
        const match = /^([\p{L}]+): /u.exec(line)
        if (match){
            if (!name1){
                name1 = match[1]
            } else if (match[1] !== name1){
                name2 = match[1]
                break
            }
        }
    }

    // Merge lines into messages alternating between two people
    const messages = ['']
    let current_name = name1
    let alt_name = name2
    for (const line of lines){
        if (line.startsWith(current_name + ': ')){
            messages[messages.length-1] += '\n\n' + line.slice(current_name.length + 2)
        } else if (line.startsWith(alt_name + ': ')){
            messages.push(line.slice(alt_name.length + 2))
            const tmp_name = alt_name
            alt_name = current_name
            current_name = tmp_name
        } else {
            messages[messages.length-1] += '\n\n' + line
        }
    }

    // Add names to only first two messages
    messages[0] = name1 + ': ' + messages[0].trim()
    messages[1] = name2 + ': ' + messages[1].trim()

    return {
        heading: topic.heading,
        description: markdowner.render(topic.description ?? ''),
        messages: messages.map(m => markdowner.render(m ?? '')),
        podcast: topic.podcast,
    }
})

writeFileSync(`${file_id}_processed.json`, JSON.stringify(data), {encoding: 'utf8'})
