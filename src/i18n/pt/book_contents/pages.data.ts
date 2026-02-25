
import {createContentLoader} from 'vitepress'


// WARN These will be sorted alphabetically regardless of input order
export default createContentLoader(
    [
        'i18n/pt/book_contents/conclusion.md',
        'i18n/pt/book_contents/foreword.md',
        'i18n/pt/book_contents/intro.md',
        'i18n/pt/learn/profiles.md',
    ],
    {
        render: true,
    },
)
