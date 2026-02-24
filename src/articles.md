
<script lang='ts' setup>

import {article_ids} from '@/_comp/articles'
import {data} from './articles.data'


// Just want ids but keep time-based sorting
const sorted_ids = data.map(page => /([^\/]+)$/.exec(page.url)[1]).filter(id => article_ids.includes(id))


</script>


# Articles

Viewing by date (most recent) | [View by category](/learn)

<ArticlePreview v-for='article of sorted_ids' :key='article' :id='article'></ArticlePreview>
