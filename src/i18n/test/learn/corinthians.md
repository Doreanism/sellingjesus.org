---
image: /_assets/learn/corinthians.jpg
sidebar: false
---

<script lang='ts' setup>

import InstantMessages from '@/_comp/InstantMessages.vue'

import {topics, intro} from './corinthians_processed.json'

</script>


# Conversations between Paul and the Corinthians

<div v-html='intro'></div>

<InstantMessages file_id='corinthians' :topics='topics'></InstantMessages>
