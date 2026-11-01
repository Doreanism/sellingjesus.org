---
aside: false
titleTemplate: Books
description: Free books confronting the commercialization of Christianity and the ownership of Scripture.
image: /_assets/social_book.jpg
---


<style lang='sass' scoped>

.books
    display: grid
    grid-template-columns: repeat(2, 1fr)
    gap: 48px
    margin-top: 32px

    // Stack books on narrow screens
    @media (max-width: 600px)
        grid-template-columns: 1fr

    a
        display: flex
        flex-direction: column
        align-items: center
        text-align: center
        text-decoration: none

        img
            width: 100%
            max-width: 320px
            margin-bottom: 20px
            border-radius: 4px
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2)
            transition: transform 0.2s, box-shadow 0.2s

        // Lift the cover on hover to show it's clickable
        &:hover img
            transform: translateY(-2px)
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25)

        // Title styled as a link
        h2
            border-top: none
            margin: 0 0 8px
            padding: 0
            color: var(--vp-c-brand-1)

        &:hover h2
            text-decoration: underline

        p
            margin: 0
            color: var(--vp-c-text-1)
</style>


# Books

Books exploring what Scripture teaches about money and ministry, all free to read.

<div class="books">
<a href="/abolish-the-jesus-trade">
<img src="/book/preview.jpg" alt="Abolish the Jesus Trade cover">
<h2>Abolish the Jesus Trade</h2>
<p>A comprehensive overview of the commercialization of ministry, laying a biblical foundation for freely giving and applying it to everyday practices.</p>
</a>
<a href="/word-not-bound">
<img src="/book_bound/preview.jpg" alt="God's Word Is Not Bound cover">
<h2>God’s Word Is Not Bound</h2>
<p>Essays and a formal debate on whether the Word of God can rightly be owned, restricted, and sold through copyright.</p>
</a>
<a href="https://thedoreanprinciple.org" target="_blank" rel="noopener">
<img src="/media/books/dorean-principle.jpg" alt="The Dorean Principle cover">
<h2>The Dorean Principle</h2>
<p>An in-depth study of Jesus’ and Paul’s teaching on money and ministry, establishing that ministry should be supported, not sold.</p>
</a>
<a href="https://simony.info" target="_blank" rel="noopener">
<img src="/media/books/simony.jpg" alt="The Doctrine of Simony cover">
<h2>The Doctrine of Simony</h2>
<p>A scholarly retrieval of the church’s historic teaching on simony, the sin of buying or selling spiritual things, applied to modern practices.</p>
</a>
</div>
