---
title: Conversations
description: Learn more about foundational issues around the Jesus-trade through a series of conversations between Tim and his pastor.
image: /_assets/learn/conversations.jpg
sidebar: false
---

<script lang='ts' setup>

import InstantMessages from '../_comp/InstantMessages.vue'

import {topics, intro} from './conversations_processed.json'

</script>


# Conversations about Selling Jesus

<div v-html='intro'></div>

<InstantMessages file_id='conversations' :topics='topics'></InstantMessages>
