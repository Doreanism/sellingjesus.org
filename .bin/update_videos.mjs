
import {writeFileSync, readFileSync} from 'fs'

import linkify from 'linkify-string'

import settings from '../settings.json' with {type: 'json'}


// Get existing data
const playlist_type = process.argv[2]
const json_path = `src/videos_${playlist_type}.json`
const existing_videos = JSON.parse(readFileSync(json_path, 'utf8'))


// Keep listing videos until all fetched
const api_key = process.env.YOUTUBE_API_KEY
const playlist_id = settings[`youtube_playlist_${playlist_type}`]
const videos = []
let next_token = null
while (true){

    // Fetch playlist items from YouTube Data API v3
    const params = new URLSearchParams({
        part: 'snippet,status',
        playlistId: playlist_id,
        maxResults: '50',
        key: api_key,
    })
    if (next_token) {
        params.set('pageToken', next_token)
    }
    const resp = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?${params}`)
    if (!resp.ok) {
        throw new Error(`YouTube API error: ${resp.status} ${await resp.text()}`)
    }
    const data = await resp.json()

    // Only list public videos
    const items = data.items.filter(item => item.status.privacyStatus === 'public')

    // Add videos to the list
    for (const item of items){
        const video_id = item.snippet.resourceId.videoId

        // See if have existing data
        const existing = existing_videos.find(v => v.id === video_id)

        videos.push({
            id: video_id,
            title: item.snippet.title,
            filename: existing?.filename ?? null,
            number: item.snippet.position + 1,
            type: playlist_type,
            image: `https://img.youtube.com/vi/${video_id}/hq720.jpg`,
            description: item.snippet.description.slice(0, 320),  // Display cuts at around 300
            description_html: linkify(item.snippet.description, {target: '_blank', defaultProtocol: 'https'})
                .replaceAll('\n', '<br>'),
        })
    }

    // Finish if no more items to get
    if (!data.nextPageToken){
        break
    }
    next_token = data.nextPageToken
}


// Save to file
writeFileSync(json_path, JSON.stringify(videos, undefined, 4))
