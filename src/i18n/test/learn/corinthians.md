---
image: /_assets/learn/corinthians.jpg
sidebar: false
---

<script lang='ts' setup>

import InstantMessages from '@/_comp/InstantMessages.vue'
import {i18n_strings} from '../i18n'

import {topics, intro} from './corinthians_processed.json'

</script>


# {{ i18n_strings.learn.convo_corinthians_title }}

<div v-html='intro'></div>

<InstantMessages file_id='corinthians' :topics='topics'></InstantMessages>
