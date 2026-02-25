---
aside: false
title: ''
---

<script lang='ts' setup>

import {articles_by_category} from '@/_comp/articles'
import {data as i18n_articles} from './articles.data'
import {i18n_strings} from './i18n'
import ResourcePreview from '@/_comp/ResourcePreview.vue'

const article_map = Object.fromEntries(
    i18n_articles.map(a => [a.url.split('/').pop()!, a])
)

</script>


# {{ i18n_strings.learn.title }}
{{ i18n_strings.learn.intro }}

## {{ i18n_strings.learn.conversations }}

<div class='conversations'>
    <FeaturePreview url='/i18n/pt/learn/conversations' image='/_assets/learn/conversations.jpg'
        :title='i18n_strings.learn.convo_general_title' :desc='i18n_strings.learn.convo_general_desc'></FeaturePreview>
    <FeaturePreview url='/i18n/pt/learn/corinthians' image='/_assets/learn/corinthians.jpg'
        :title='i18n_strings.learn.convo_corinthians_title' :desc='i18n_strings.learn.convo_corinthians_desc'></FeaturePreview>
</div>


## {{ i18n_strings.learn.christians_who_sell }}

<div class='profiles'>
    <a href='/i18n/pt/learn/profiles#joe-the-author'>
        <img src='/media/joe-the-author.jpg'>
        {{ i18n_strings.learn.profile_joe }}
    </a>
    <a href='/i18n/pt/learn/profiles#steve-the-biblical-counselor'>
        <img src='/media/steve-the-biblical-counselor.jpg'>
        {{ i18n_strings.learn.profile_steve }}
    </a>
    <a href='/i18n/pt/learn/profiles#james-the-worship-composer'>
        <img src='/media/james-the-worship-composer.jpg'>
        {{ i18n_strings.learn.profile_james }}
    </a>
    <a href='/i18n/pt/learn/profiles#susan-the-bible-study-author'>
        <img src='/media/susan.jpg'>
        {{ i18n_strings.learn.profile_susan }}
    </a>
    <a href='/i18n/pt/learn/profiles'>
        <img src='/_assets/learn/profiles.jpg'>
        {{ i18n_strings.learn.profiles_more }}
    </a>
</div>


## {{ i18n_strings.articles }}

<div class='categories'>
    <div v-for='[category, ids] in Object.entries(articles_by_category)' :key='category'>
        <h3>{{ i18n_strings.categories[category] }}</h3>
        <template v-for='(id, i) in ids' :key='id'>
            <ResourcePreview v-if='article_map[id]'
                :url='article_map[id].url' :image='article_map[id].frontmatter.image'
                :title='article_map[id].frontmatter.title' :desc='article_map[id].frontmatter.description'
                :short='i !== 0'>
            </ResourcePreview>
        </template>
    </div>
</div>
