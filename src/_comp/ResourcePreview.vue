
<template lang='pug'>

a.preview(:href='url' :target='target' :class='{square, short}')
    div.img(:style='{backgroundImage: `url(${image})`}')
    div.text
        h3
            span.zeroes(v-if='zeroes') {{ zeroes }}
            | {{ num_title }}
        div.desc {{ desc_clipped }}
        div.access(v-if='paywall !== undefined' :class='{paywall: paywall === "true"}')
            | {{ paywall === "true" ? "Not free" : "Free" }}

</template>


<script lang='ts' setup>

import {computed} from 'vue'


const props = defineProps<{url:string, image:string, number?:number, title:string, desc:string,
    square?:boolean, short?:boolean, paywall?:string}>()

const target = computed(() => {
    // NOTE Ensure null if disabled, otherwise target exists and results in page reload
    return props.url.startsWith('http') ? '_blank' : null
})

const zeroes = computed(() => props.number ? '000'.slice(props.number.toString().length) : '')
const num_title = computed(() => props.number ? `${props.number}: ${props.title}` : props.title)

const desc_clipped = computed(() => {
    // Clip desc based on total length of title and desc (title double since takes more space)
    const total = props.title.length*2 + props.desc.length
    if (total > 300){
        return props.desc.slice(0, 300 - props.title.length*2) + '...'
    }
    return props.desc
})

</script>


<style lang='sass' scoped>

.preview
    display: flex
    flex-direction: column
    align-items: center  // Prevents images getting stretched vertically
    margin: 16px 0

    color: var(--vp-c-text-1)
    font-family: var(--vp-font-family-base)
    font-weight: normal  // Vitepress is 500 for <a>

    &.short
        // NOTE Short is always displayed as a "row"
        flex-direction: row
        .img
            width: 48px
            height: 48px
            margin-right: 24px
            margin-bottom: 0
        .text
            h3
                font-size: 14px
            .desc
                display: none

    &:hover
        text-decoration: none
        color: inherit

    .img
        background-position: center
        background-size: cover
        border-radius: 12px
        width: 100%
        aspect-ratio: 1280 / 720
        margin-bottom: 8px

    &.square
        .img
            aspect-ratio: 1 / 1
            max-width: 140px

    .text
        font-size: 16px
        width: 100%
        overflow: hidden

        h3
            font-size: 18px
            margin: 0
            line-height: 1.25

            .zeroes
                display: none  // TODO Currently disabled but left in case change mind
                opacity: 0.1

        .desc
            font-size: 12px
            line-height: 1.5

    .access
        background-color: #9d9
        color: black
        display: inline-block
        padding: 6px 8px
        line-height: 1
        border-radius: 12px
        font-size: 11px
        font-weight: bold

        &.paywall
            background-color: #f99


    @media (min-width: 600px)
        flex-direction: row
        padding: 12px

        &:hover
            background-color: var(--vp-c-brand-soft)
            border-radius: 12px

        .img
            max-width: 250px
            margin-right: 24px
            margin-bottom: 0

        .text
            h3
                font-size: 18px !important  // Override for .short
            .desc
                font-size: 14px


</style>
