
<template lang='pug'>

div.scripture-page
    div.page-intro
        h1 Relevant Passages
        p Browse key passages relevant to this topic, using the #[a(href='https://bsb.freely.giving' target='_blank') Berean Standard Bible].

    div.controls
        div.tag-filter(v-for='group of tag_groups')
            PassageTag.tag(
                v-for='tag of group'
                :key='tag'
                :tag='tag'
                :active='selected_tag === tag'
                @click='handleTagClick(tag)'
            )

        div.passage-count
            | Showing {{ ordered_passages.length }} of {{ passages.length }} passages

    div.passages-container
        ScripturePassage(
            v-for='passage in ordered_passages'
            :key='passage.key'
            :passage_data='passage'
            :bible_html='fetched_passages.get(passage.key) ?? ""'
            :loading='!fetched_passages.has(passage.key)'
            :selected_tag='selected_tag'
            @tag-click='handleTagClick'
        )

        div.clear-filter(v-if='selected_tag')
            div.hidden-count {{ passages.length - ordered_passages.length }} passages hidden
            VPButton(@click='clearFilter' text='Show all passages')

</template>


<script lang='ts' setup>

import { ref, computed, onMounted, watch } from 'vue'
import { PassageReference, books_ordered } from '@gracious.tech/fetch-client'

import PassageTag from './_comp/PassageTag.vue'
import ScripturePassage from './_comp/ScripturePassage.vue'

import {passages, get_passage, tags, tag_groups } from './_comp/passages'


// Read initial filter from URL or default to 'vip'
const getInitialTag = (): keyof typeof tags | '' => {
    const params = new URLSearchParams(window.location.search)
    const filter = params.get('filter')
    return (filter as keyof typeof tags) ?? 'vip'
}

const selected_tag = ref<keyof typeof tags | ''>(getInitialTag())
const fetched_passages = ref<Map<string, string>>(new Map())

// Watch: Sync selected tag to URL without adding to browser history
watch(selected_tag, (newTag) => {
    const url = new URL(window.location.href)
    if (newTag) {
        url.searchParams.set('filter', newTag)
    } else {
        url.searchParams.delete('filter')
    }
    history.replaceState({}, '', url.toString())
})

// Computed: Filter passages by selected tag
const filtered_passages = computed(() => {
    if (!selected_tag.value) {
        return passages
    }
    return passages.filter(p =>
        p.tags.includes(selected_tag.value as keyof typeof tags)
    )
})

// Computed: Sort passages by Bible book order
const ordered_passages = computed(() => {
    return [...filtered_passages.value].sort((a, b) => {

        // Handle invalid references (shouldn't happen with our data)
        if (!a.ref || !b.ref) return 0

        // Compare book positions using books_ordered from library
        const a_index = books_ordered.indexOf(a.ref.book)
        const b_index = books_ordered.indexOf(b.ref.book)

        if (a_index !== b_index) {
            return a_index - b_index
        }

        // Same book, compare by chapter and verse
        if (a.ref.start_chapter !== b.ref.start_chapter) {
            return a.ref.start_chapter - b.ref.start_chapter
        }

        return a.ref.start_verse - b.ref.start_verse
    })
})


// Handle tag click from passage component
function handleTagClick(tag: keyof typeof tags) {
    // If clicking the currently selected tag, deselect it
    if (selected_tag.value === tag) {
        selected_tag.value = ''
    } else {
        // Otherwise, select only this tag
        selected_tag.value = tag
    }
}

// Clear all filters
function clearFilter() {
    selected_tag.value = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Lifecycle: Fetch Bible text on mount
onMounted(async () => {

    for (const passage of passages) {
        try {
            const html = await get_passage(passage.ref)
            fetched_passages.value.set(passage.key, html)
        } catch (error) {
            console.error(`Failed to fetch passage ${passage.key}:`, error)
        }
    }
})

</script>


<style lang='sass' scoped>

.page-intro
    text-align: center

.controls
    font-family: var(--vp-font-family-base)
    margin: 32px 0

.passage-count
    text-align: center
    margin: 24px 0
    color: var(--vp-c-text-2)
    font-size: 18px

.tag-filter
    display: flex
    flex-wrap: wrap
    justify-content: center
    gap: 8px
    margin: 12px 0

    .tag
        font-size: 14px
        padding: 4px 12px

.passages-container
    margin-top: 24px

.clear-filter
    display: flex
    flex-direction: column
    align-items: center
    margin-top: 48px
    padding-top: 32px
    border-top: 1px solid var(--vp-c-divider)

    .hidden-count
        margin-bottom: 12px
        color: var(--vp-c-text-2)
        font-size: 18px


</style>
