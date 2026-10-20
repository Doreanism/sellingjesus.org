
# Selling Jesus

This is the source code and content for https://sellingjesus.org

If anyone wants to republish our content, you can find it in original formats in here. SVGs for memes and Markdown for articles. The rest of this README is just notes relevant for the Selling Jesus team.

## Setup

```bash
cp .env-example .env
# Manually add keys for services in .env
npm install
.bin/build  # Just to trigger initial detection of podcasts/videos etc.
.bin/serve
```


## Site search

Search (Ctrl/⌘ K) covers the full text of every page and the web edition of God's Word Is Not Bound. Its data is generated from the built pages at the end of each build (`.vitepress/search.ts`), so run `.bin/build` once for search to work under `.bin/serve`. To make a page come up for a search term it doesn't feature prominently, add it to `keywords` in that file.


## Publishing podcast episodes

 1. `.bin/update_podcast` to add the new episode to podcast.json which can then be committed
 2. Add transcript if desired
 3. `.bin/podcast_to_video` to publish to Youtube


## Posting videos to socials

__Facebook__

 * Won't upload large videos (4GB didn't work where as 1GB did, same resolution)
 * But they say they only support up to 720p anyway
 * Use this to reduce size but keep resolution: `ffmpeg -i sj.mp4 -c:a copy sj_reduced.mp4`

__Instagram__

 * Max length 1m30s
 * Ideally 9:16 aspect, or at least 1:1
 * Crop to 9:16 with `ffmpeg -i sj.mp4 -vf crop=1215:2160 -c:a copy sj_insta.mp4`
 * Crop to 1:1 with `ffmpeg -i sj.mp4 -vf crop=2160:2160 -c:a copy sj_insta.mp4`
 * Users scroll through endless videos, so needs to be immediately attention grabbing

__Youtube Shorts__

 * Upload as regular video, but ensure at least 1:1 or vertical aspect
 * Must be less than 1 min

__X__

 * Max resolution is 1080p and audio needs compressing too
 * `ffmpeg -i video.mp4 -s 1080x1920 out.mp4`
