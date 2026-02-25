
import {createContentLoader} from 'vitepress'


// WARN These will be sorted alphabetically regardless of input order
export default createContentLoader(
    [
        'book_contents/conclusion.md',
        'book_contents/foreword.md',
        'book_contents/intro.md',
        'learn/profiles.md',
    ],
    {
        render: true,
    },
)
