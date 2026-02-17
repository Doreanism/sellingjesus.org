
<template lang='pug'>

Badge.passage-tag(
    :type='active ? "tip" : "info"'
    :text='text'
    @click='$emit("click")'
)

</template>


<script lang='ts' setup>

import {computed} from 'vue'

import { tags } from './passages'

const {tag, vip} = defineProps<{
    tag: keyof typeof tags
    active?: boolean
    vip?:boolean
}>()

defineEmits<{
    'click': []
}>()

const text = computed(() => {
    return vip ? "VIP" : tags[tag]
})

</script>


<style lang='sass' scoped>

.passage-tag
    cursor: pointer
    user-select: none

    &:hover
        filter: brightness(140%)

</style>
