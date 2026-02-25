---
image: /_assets/learn/conversations.jpg
sidebar: false
---

<script lang='ts' setup>

import InstantMessages from '@/_comp/InstantMessages.vue'
import {i18n_strings} from '../i18n'

import {topics, intro} from './conversations_processed.json'

</script>


# {{ i18n_strings.learn.convo_general_title }}

<div v-html='intro'></div>

<InstantMessages file_id='conversations' :topics='topics'></InstantMessages>
