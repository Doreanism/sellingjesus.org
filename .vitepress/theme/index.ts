
import DefaultTheme from 'vitepress/theme'
import VPButton from 'vitepress/dist/client/theme-default/components/VPButton.vue'
import {Theme} from 'vitepress'
import {BibleEnhancer} from '@gracious.tech/fetch-enhancer'

import CustomLayout from './CustomLayout.vue'
import PersonBio from '../../src/_comp/PersonBio.vue'
import ArticlePreview from '../../src/_comp/ArticlePreview.vue'
import FeaturePreview from '../../src/_comp/FeaturePreview.vue'
import PodcastPlayer from '../../src/_comp/PodcastPlayer.vue'
import VideoPlayer from '../../src/_comp/VideoPlayer.vue'
import YouTube from '../../src/_comp/YouTube.vue'

import 'shikwasa/dist/style.css'
import '@gracious.tech/fetch-client/client.css'
import '@gracious.tech/fetch-enhancer/styles.css'
import './custom.sass'

export default {
    ...DefaultTheme,
    Layout: CustomLayout,
    async enhanceApp(ctx){

        // Extend default theme
        DefaultTheme.enhanceApp(ctx)

        // Global components
        ctx.app.component('VPButton', VPButton)
        ctx.app.component('PersonBio', PersonBio)
        ctx.app.component('ArticlePreview', ArticlePreview)
        ctx.app.component('FeaturePreview', FeaturePreview)
        ctx.app.component('PodcastPlayer', PodcastPlayer)
        ctx.app.component('VideoPlayer', VideoPlayer)
        ctx.app.component('YouTube', YouTube)

        if (import.meta.env.SSR){
            // Book needs DOMParser to render in SSR, but avoid including in browser bundle
            const jsdom = await import('jsdom')
            global.DOMParser = new jsdom.JSDOM().window.DOMParser
        } else {

            // Enhancer
            let enhancer:BibleEnhancer|undefined
            ctx.router.onAfterPageLoad = to => {

                // Init enhancer after first page mounted (as can't init until DOM ready anyway)
                if (!enhancer){
                    enhancer = new BibleEnhancer({
                        app_args: {hue: '152'},
                        spaces_to_nbsp: true,
                        before_history_push: () => {
                            // Store scroll position for VitePress to prevent page jump
                            history.replaceState({scrollPosition: window.scrollY}, '')
                        },
                    })
                    // Provide enhancer to all components
                    ctx.app.provide('enhancer', enhancer)
                }

                // Detect references only within the content part of the page
                // NOTE VitePress seems to have a bug where page not mounted yet
                //      on first load during dev,
                //      and nextTick didn't work, so resorting to setTimeout
                const selector = '.VPDoc > .container > .content'
                setTimeout(() => {
                    const doc:HTMLElement|null = document.querySelector(selector)
                    if (doc){
                        enhancer!.discover_bible_references(doc)
                    }
                }, 1)
            }

            // Preserve lang query param when navigating so that sharing URL preserves language choice
            // (Elfsight will auto-add the lang param, but Vitepress will lose it when changing page)
            let prev_lang:string|null = null
            ctx.router.onBeforeRouteChange = to => {
                prev_lang = new URLSearchParams(self.location.search).get('lang')
            }
            ctx.router.onAfterRouteChange = to => {
                const current_lang = new URLSearchParams(self.location.search).get('lang')
                if (prev_lang && !current_lang){
                    const new_url = new URL(self.location.href)
                    new_url.searchParams.set('lang', prev_lang)
                    self.history.replaceState(self.history.state, '', new_url.href)
                }
            }
        }
    },
} as Theme
