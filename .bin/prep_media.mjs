
import {join, basename, dirname, extname} from 'path'
import {stdin, stdout} from 'process'
import {createInterface} from 'readline/promises'
import {readdirSync, readFileSync, renameSync, rmSync, writeFileSync} from 'fs'

import sharp from 'sharp'


// Match Youtube poster size, but also about right anyway
const MAX_WIDTH = 1280


// Setup readline for prompts
const readline = createInterface(stdin, stdout)


// Record which files got renamed
const renames = []


// Process each file in media dir
const media_dir = 'src/_public/media'
const media_url = '/media'
// WARN withFileTypes arg buggy
for (const subpath of readdirSync(media_dir, {recursive: true})){

    // Get path parts
    const subpath_parent = dirname(subpath)
    const file_url = join(media_url, subpath)
    const file_path = join(media_dir, subpath)
    const file_parent = dirname(file_path)
    const file_name = basename(file_path)
    const file_ext = extname(file_name).slice(1)
    if (!file_ext){
        continue
    }
    const file_base = file_name.slice(0, (file_ext.length + 1)*-1)

    // This var will get updated if path changes
    let new_path = file_path

    // Offer to rename if long
    if (file_base.length > 30){
        const new_base = await readline.question(`${file_base} `)
        if (new_base){
            const new_name = `${new_base}.${file_ext}`
            new_path = join(file_parent, new_name)
            renameSync(file_path, new_path)
        }
    }

    // Convert if an image and too large or wrong format
    if (['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(file_ext.toLowerCase())){
        const img_meta = await sharp(new_path).metadata()
        if (img_meta.width > MAX_WIDTH || img_meta.format !== 'jpeg'){
            // NOTE Have to write completely to buffer before overwriting to avoid race condition
            const newer_path = join(dirname(new_path), basename(new_path).slice(0, file_ext.length*-1) + 'jpg')
            let sharpify = sharp(new_path).toFormat('jpg')
            if (img_meta.width > MAX_WIDTH){
                sharpify = sharpify.resize({width: MAX_WIDTH})
            }
            await sharpify.toBuffer().then(buffer => sharp(buffer).toFile(newer_path))
            if (newer_path !== new_path){
                rmSync(new_path)
                new_path = newer_path
            }
        }
    }

    // See if have renamed and map old url to new if so
    if (new_path !== file_path){
        renames.push([file_url, join(media_url, subpath_parent, basename(new_path))])
    }
}


// Update urls in markdown files
for (let path of readdirSync('src', {recursive: true})){
    path = join('src', path)
    if (path.endsWith('.md') || path.endsWith('.json')){
        const contents = readFileSync(path, {encoding: 'utf8'})
        let new_contents = contents
        for (const [old_url, new_url] of renames){
            new_contents = new_contents.replace(old_url, new_url)
        }
        if (contents !== new_contents){
            writeFileSync(path, new_contents, {encoding: 'utf8'})
        }
    }
}


// Close readline or script will never finish
readline.close()
