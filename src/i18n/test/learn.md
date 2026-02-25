---
aside: false
---

<script lang='ts' setup>

import {articles_by_category} from '@/_comp/articles'


</script>


# Ministry should be supported, not sold.
We're a group of pastors and disciples of Jesus, who love him and want everyone to have free access to truth about him. The commercialization of ministry deeply concerns us, practically and theologically. We hope you'll take a moment to carefully consider God's Word on this matter.

## Conversations

<div class='conversations'>
    <FeaturePreview url='/i18n/test/learn/conversations' image='/_assets/learn/conversations.jpg'
        title="Conversations about Selling Jesus" desc="Learn more about foundational issues around the Jesus-trade through a series of conversations between Tim and his pastor."></FeaturePreview>
    <FeaturePreview url='/i18n/test/learn/corinthians' image='/_assets/learn/corinthians.jpg'
        title="Conversations between Paul and the Corinthians" desc="Follow the flow of Paul's teaching on finance to the Corinthians across his letters to them."></FeaturePreview>
</div>


## Christians Who Sell Jesus

<div class='profiles'>
    <a href='/i18n/test/learn/profiles#joe-the-author'>
        <img src='/media/joe-the-author.jpg'>
        Joe the Author
    </a>
    <a href='/i18n/test/learn/profiles#steve-the-biblical-counselor'>
        <img src='/media/steve-the-biblical-counselor.jpg'>
        Steve the Biblical Counselor
    </a>
    <a href='/i18n/test/learn/profiles#james-the-worship-composer'>
        <img src='/media/james-the-worship-composer.jpg'>
        James the Worship Composer
    </a>
    <a href='/i18n/test/learn/profiles#susan-the-bible-study-author'>
        <img src='/media/susan.jpg'>
        Susan the Bible Study Author
    </a>
    <a href='/i18n/test/learn/profiles'>
        <img src='/_assets/learn/profiles.jpg'>
        10 more ...
    </a>
</div>


## Articles

<div class='categories'>
    <div v-for='[category, articles] in Object.entries(articles_by_category)'>
        <h3>{{ category }}</h3>
        <ArticlePreview v-for='(article, i) of articles' :id='article' :short='i !== 0'></ArticlePreview>
    </div>
</div>
