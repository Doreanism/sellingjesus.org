
<template lang='pug'>

div.scripture-page
    div.page-intro
        h1 Relevant Passages
        p Browse key passages relevant to this topic, using the #[a(href='https://bsb.freely.giving' target='_blank') Berean Standard Bible].

    div.controls

        div.sort-toggle
            button(
                @click='sort_mode = "category"'
                :class='{active: sort_mode === "category"}'
            ) Ordered by topic
            button(
                @click='sort_mode = "bible"'
                :class='{active: sort_mode === "bible"}'
            ) Ordered by book

        div.tag-filter(v-for='group of tag_groups')
            PassageTag.tag(
                v-for='tag of group'
                :key='tag'
                :tag='tag'
                :active='selected_tags.includes(tag)'
                @click='handleTagClick(tag)'
            )

    div.passages-container
        template(v-for='(category_passages, category) in ordered_passages' :key='category')
            h2(v-if='category') {{ categories[category] }}
            ScripturePassage(
                v-for='passage in category_passages'
                :key='passage.key'
                :passage_data='passage'
                :bible_html='fetched_passages.get(passage.key) ?? ""'
                :loading='!fetched_passages.has(passage.key)'
                :selected_tags='selected_tags'
                @tag-click='handleTagClick'
            )

</template>


<script lang='ts' setup>

import { ref, computed, onMounted } from 'vue'
import { PassageReference, books_ordered } from '@gracious.tech/fetch-client'

import PassageTag from './_comp/PassageTag.vue'
import ScripturePassage from './_comp/ScripturePassage.vue'

import {passages, get_passage, tags, categories, tag_groups } from './_comp/passages'


const selected_tags = ref<string[]>([])
const sort_mode = ref<'category' | 'bible'>('category')
const fetched_passages = ref<Map<string, string>>(new Map())


// Computed: Filter passages by selected tags
const filtered_passages = computed(() => {
    if (selected_tags.value.length === 0) {
        return passages
    }
    return passages.filter(p =>
        p.tags.some(tag => selected_tags.value.includes(tag))
    )
})

// Computed: Sort all passages by Bible book order
const passages_bible_order = computed(() => {
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

// Computed: Get passages grouped by category (or single empty category for no grouping)
// All passages always sorted by Bible order, grouping just adds category headings
const ordered_passages = computed(() => {
    if (sort_mode.value === 'category') {
        // Group by category in the order categories are defined
        const grouped: Record<string, (typeof passages[number])[]> = {}

        // Initialize groups in category definition order
        for (const category_key of Object.keys(categories)) {
            grouped[category_key] = []
        }

        // Fill groups with passages in Bible order
        for (const passage of passages_bible_order.value) {
            grouped[passage.category].push(passage)
        }

        return grouped
    } else {
        // No grouping: single group with empty string key
        return { '': passages_bible_order.value }
    }
})


// Handle tag click from passage component
function handleTagClick(tag: string) {
    // If clicking the currently selected tag, deselect it
    if (selected_tags.value.includes(tag)) {
        selected_tags.value = []
    } else {
        // Otherwise, select only this tag
        selected_tags.value = [tag]
    }
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

.sort-toggle
    display: flex
    justify-content: center
    margin-bottom: 36px

    button
        padding: 4px 16px
        border-radius: 8px
        font-size: 16px
        text-align: center
        color: var(--vp-c-text-1)

        &:first-child
            margin-right: 12px

        &:last-child
            margin-left: 12px

        &:hover
            text-decoration: none
            background-color: var(--vp-c-gray-soft)

        &.active
            background-color: var(--vp-c-brand-soft)

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

.category-section
    margin-bottom: 48px

    &:last-child
        margin-bottom: 0



</style>
