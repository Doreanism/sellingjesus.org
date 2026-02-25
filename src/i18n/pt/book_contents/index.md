---
layout: false
---

<script lang='ts' setup>

import {defineCustomElement} from 'vue'

import VueBook from './book.vue'


// Use custom element/shadow DOM to exclude site's CSS during development
// When built the site's CSS will simply not be included
const ssr = import.meta.env.SSR
if (!ssr){
    customElements.define('custom-book', defineCustomElement(VueBook))
}

</script>


<VueBook v-if='ssr'></VueBook>
<custom-book v-else></custom-book>
