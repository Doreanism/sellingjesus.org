
<template lang='pug'>

div.audiobook
    div.player(ref='player_div')
    ol.chapters(ref='list')
        li(v-for='(chapter, i) of audiobook.chapters' :key='chapter.file'
                :class='{current: i === current}')
            button(type='button' @click='select(i, true)')
                span.num {{ i + 1 }}
                span.text
                    span.title {{ chapter.title }}
                    span.author(v-if='chapter.author') {{ chapter.author }}
                span.duration {{ format_duration(chapter.duration) }}
    p.actions
        VPButton(:text='full_text' :href='full_url')
        VPButton(theme='alt' text="Podcast feed (RSS)" :href='feed_url' target='_blank')

</template>


<script lang='ts' setup>

import {ref, computed, onMounted, onBeforeUnmount} from 'vue'

// NOTE Symlinked into src dir for the same reason as in PodcastPlayer.vue
import {Player} from './shikwasa.es.js'

import audiobook from '../audiobook.json'
import {audiobook_feed_path} from '../audiobook_feed'


// The subset of Shikwasa's player this component drives
interface ShikwasaPlayer {
    update:(audio:Record<string, unknown>) => void
    play:() => void
    on:(name:string, callback:() => void) => void
    destroy:() => void
}

const player_div = ref<HTMLElement>()
const list = ref<HTMLElement>()
const current = ref(0)

const feed_url = audiobook_feed_path
const full_url = audiobook.base + audiobook.full.file
const full_text = computed(() => {
    return `Download full audiobook (${Math.round(audiobook.full.size / 1e6)} MB)`
})

let player:ShikwasaPlayer|null = null


// Shorthand length of a chapter, e.g. "34 min" or "1 h 3 min"
function format_duration(seconds:number):string{
    const minutes = Math.max(1, Math.round(seconds / 60))
    return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`
}


// What Shikwasa needs to show and play a chapter
function audio_for(i:number):Record<string, unknown>{
    const chapter = audiobook.chapters[i]!
    return {
        src: audiobook.base + chapter.file,
        // Title is hidden by the styles, so the chapter name goes in the more prominent slot
        title: ' ',
        artist: `${i + 1}. ${chapter.title}`,
        cover: audiobook.base + audiobook.cover,
        duration: chapter.duration,
    }
}


// Switch the player to a chapter
function select(i:number, play:boolean):void{
    current.value = i
    player?.update(audio_for(i))
    if (play){
        player?.play()
    }
    scroll_to(i)
}


// Keep a chapter visible in the list, e.g. when playback moves on to one further down
// NOTE Scrolls only the list, as scrollIntoView would also scroll the page out from under the reader
function scroll_to(i:number):void{
    const el = list.value?.children[i] as HTMLElement|undefined
    if (!list.value || !el){
        return
    }
    const top = el.offsetTop
    const bottom = top + el.offsetHeight
    if (top < list.value.scrollTop){
        list.value.scrollTop = top
    } else if (bottom > list.value.scrollTop + list.value.clientHeight){
        list.value.scrollTop = bottom - list.value.clientHeight
    }
}


onMounted(() => {
    // WARN Player will default to taking over <body> if div doesn't exist, so double check
    if (!player_div.value){
        return
    }
    player = new Player({
        container: player_div.value,
        audio: audio_for(0),
        themeColor: '#26d985',  // Works on either dark or light
        speedOptions: [0.75, 1.25, 1.5, 1.75, 2],
        download: true,
        fixed: {
            type: 'static',
        },
    }) as ShikwasaPlayer
    // Carry on into the next chapter, as an audiobook is meant to be listened to straight through
    player.on('ended', () => {
        if (current.value < audiobook.chapters.length - 1){
            select(current.value + 1, true)
        }
    })
})

onBeforeUnmount(() => {
    player?.destroy()
})

</script>


<style lang='sass' scoped>

.player
    margin: 24px 0 12px

.player :deep(.shk-player)
    border-radius: 12px
    @media (max-width: 640px)
        padding: 16px !important  // Override default
    overflow: hidden

    .shk-cover
        border-radius: 12px

    .shk-text
        align-self: center

    .shk-artist
        white-space: inherit

    .shk-title_wrap
        display: none

.chapters
    list-style: none
    padding: 0
    margin: 0 0 24px
    border: 1px solid var(--vp-c-divider)
    border-radius: 12px
    // About five chapters at a time, with part of the next showing so it's clear the list scrolls
    max-height: 330px
    overflow-y: auto
    // Makes the list its chapters' offsetParent, which scroll_to measures against
    position: relative

    li
        margin: 0
        & + li
            border-top: 1px solid var(--vp-c-divider)

    button
        display: flex
        align-items: center
        gap: 12px
        width: 100%
        padding: 10px 16px
        text-align: left
        &:hover
            background-color: var(--vp-c-bg-soft)

    .current button
        background-color: var(--vp-c-bg-soft)
        .num, .title
            color: var(--vp-c-brand-1)

    .num
        min-width: 1.5em
        color: var(--vp-c-text-3)
        font-variant-numeric: tabular-nums

    .text
        flex-grow: 1
        display: flex
        flex-direction: column

    .title
        line-height: 1.4

    .author, .duration
        font-size: 13px
        color: var(--vp-c-text-2)

    .duration
        white-space: nowrap

.actions
    display: flex
    flex-wrap: wrap
    gap: 12px

</style>
