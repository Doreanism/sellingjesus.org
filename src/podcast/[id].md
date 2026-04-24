
<script lang='ts' setup>

import {computed} from 'vue'
import {useData} from 'vitepress'

// NOTE Vitepress build treats shikwasa as a CJS module and fails (probably wrong package.json config)
// So symlinking into src dir avoids package.json config and loads properly
import {Player} from './shikwasa.es.js'

import PodcastPlayer from '@/_comp/PodcastPlayer.vue'


const {params} = useData()

</script>


<style lang='sass' scoped>

h1:nth-of-type(1)
    font-size: 20px
    opacity: 0.6

h1:nth-of-type(2)
    font-size: 30px
    margin-bottom: 36px

iframe
    margin-bottom: 2em
    height: 352px  // Needs to be exact as height is non-responsive and has set breakpoints

</style>


# Podcast episode {{ $params.number }}
# {{ $params.title }}


<template v-if='$params.id === "9619af84-423f-4859-a1b9-82a1f45cc79e"'>
    <div style='margin-bottom: 48px'>
        <strong>Looking for the book?</strong>
        <VPButton text="Abolish the Jesus Trade (book)" href="/book" size="medium"></VPButton>
    </div>
</template>

<PodcastPlayer :id='$params.id'></PodcastPlayer>

<p style='margin-bottom: 24px'>
    <VPButton class='small' theme='alt' text="Spotify" href='https://open.spotify.com/show/2dDRm550aeja4a8vdtHEck'></VPButton>
    <VPButton class='small' theme='alt' text="Apple Podcasts" href='https://podcasts.apple.com/us/podcast/selling-jesus/id1694183357'></VPButton>
    <VPButton class='small' theme='alt' text="Youtube" href='https://www.youtube.com/playlist?list=PLPZ4S3z9sIWw3etO-1Uhss_cm9SafUSvN'></VPButton>
    <VPButton class='small' theme='alt' text="RSS" href='https://anchor.fm/s/e3894160/podcast/rss'></VPButton>
</p>

<div v-html='$params.description_html'></div>

<template v-if='$params.transcript_html'>
    <h2>Transcript</h2>
    <div v-html='$params.transcript_html'></div>
</template>
