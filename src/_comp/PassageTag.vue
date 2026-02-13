
<template lang='pug'>

Badge.passage-tag(
    :type='active ? "tip" : "info"'
    :text='tags[tag]'
    @click='$emit("click")'
)

</template>


<script lang='ts' setup>

import { tags } from './passages'

defineProps<{
    tag: keyof typeof tags
    active?: boolean
}>()

defineEmits<{
    'click': []
}>()

</script>


<style lang='sass' scoped>

.passage-tag
    cursor: pointer
    user-select: none

    &:hover
        filter: brightness(140%)

</style>
