
<template lang='pug'>

BookBase(:strings='strings' :convo_general='convo_general' :convo_corinthians='convo_corinthians')

</template>


<script lang='ts' setup>

import BookBase from './BookBase.vue'
import convo_general from '@/learn/conversations_processed.json'
import convo_corinthians from '@/learn/corinthians_processed.json'

const strings = {
    title_line1: 'Abolish',
    title_line2: 'the Jesus Trade',
    subtitle: 'Abolish the Jesus Trade: Spread the Joy of Freely Giving',
    authors: 'By Andrew Case, Conley Owens, Jon Here, and other contributors',
    publisher_prefix: 'Published by',
    publisher_name: 'Selling Jesus',
    edition: 'First edition (2025)',
    license_text: 'This book is freely given to the glory of God and dedicated to the public domain. It may be copied, translated, adapted, in whole or in part, without needing to ask permission. You can also access this content online at sellingjesus.org.',
    quote1_stanza1: 'Its leaders give judgment for a bribe;\nits priests teach for a price;\nits prophets practice divination for money.',
    quote1_stanza2: 'Yet they lean on Yahweh and say,\n"Is not Yahweh in our midst?\nNo disaster shall come upon us."',
    quote1_ref: 'Micah 3:11',
    quote2_body: "For we are not, like so many, peddlers of God's word, but as men of sincerity, as commissioned by God, in the sight of God we speak in Christ.",
    quote2_ref: '2 Corinthians 2:17',
    toc_title: 'Contents',
    toc_foreword: 'Foreword',
    toc_intro: 'Introduction',
    toc_conclusion: 'Conclusion',
    foreword_title: 'Foreword',
    intro_title: 'Introduction',
    intro_subtitle: 'A Christian Dystopia?',
    section_conversations: 'Conversations',
    convo_general_title: 'Conversations about Selling Jesus',
    convo_general_intro: 'The following two chapters are fictional conversations. The first is between a young man named Tim and his pastor. Their conversational format and style is intended to help to make them more readable. We hope it serves as a simple introduction to some of the foundational topics of this book. Formal articles will follow, examining Scripture at greater depth.',
    convo_corinthians_title: 'Conversations between Paul and the Corinthians',
    profiles_title_text: 'Christians Who Sell Jesus',
    conclusion_title: 'Conclusion',
}

</script>
