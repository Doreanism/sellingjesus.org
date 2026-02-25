
import {createContentLoader} from 'vitepress'


export default createContentLoader('i18n/pt/articles/*.md', {
    render: true,
})
