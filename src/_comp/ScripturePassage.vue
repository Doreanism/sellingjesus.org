
<template lang='pug'>

div.scripture-passage
    div.reference-header
        h3.reference(@click='open_app') {{ title }}
        div.tags(:class='{ "has-filter": selected_tag }')
            PassageTag(
                v-for='tag in passage_data.tags.filter(t => !["nt", "ot"].includes(t))'
                :key='tag'
                :tag='tag'
                :active='selected_tag === tag'
                :vip='tag === "vip"'
                @click='handleTagClick(tag)'
            )

    div.fetch-bible(v-if='!loading' v-html='bible_html' class='no-headings no-chapters no-notes')
    div.loading(v-else)
        p Loading passage...

    div.notes(v-if='passage_data.notes')
        p {{ passage_data.notes }}

</template>


<script lang='ts' setup>

import {computed, inject} from 'vue'
import type {BibleEnhancer} from '@gracious.tech/fetch-enhancer'

import PassageTag from './PassageTag.vue'
import type { PassageData } from './passages'

const props = defineProps<{
    passage_data:PassageData
    bible_html: string
    loading?: boolean
    selected_tag:string
}>()

const emit = defineEmits<{
    'tag-click': [tag:string]
}>()

function handleTagClick(tag:string) {
    emit('tag-click', tag)
}

const title = computed(() => {
    return props.passage_data.ref.toString()
})

const enhancer = inject<BibleEnhancer>('enhancer')

function open_app(){
    enhancer?.show_app(props.passage_data.ref)
}

</script>


<style lang='sass' scoped>

.scripture-passage
    margin: 24px 0
    padding: 20px
    background-color: var(--vp-c-bg-soft)
    border-radius: 12px

    .reference-header
        display: flex
        flex-direction: column
        gap: 12px
        margin-bottom: 16px

        @media (min-width: 600px)
            flex-direction: row
            justify-content: space-between
            align-items: center

    .reference
        margin: 0
        color: var(--vp-c-text-1)
        cursor: pointer
        &:hover
            color: var(--vp-c-brand)

    .tags
        display: flex
        flex-wrap: wrap
        gap: 6px
        font-family: var(--vp-font-family-base)

        // Hide tags on mobile when a filter is active to save space
        &.has-filter
            @media (max-width: 768px)
                display: none

    .fetch-bible
        font-size: 20px !important
        :deep(p)
            margin: 8px 0

    .loading
        font-style: italic
        color: var(--vp-c-text-2)
        padding: 16px 0

        p
            margin: 0

    .notes
        margin-top: 16px
        padding-top: 16px
        border-top: 1px solid var(--vp-c-divider)

        p
            margin: 0
            font-size: 18px
            color: var(--vp-c-text-2)
            line-height: 1.6

    @media (min-width: 800px)
        padding: 24px

        .reference
            font-size: 22px

        .fetch-bible
            font-size: 17px

</style>
