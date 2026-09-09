
// Behaviour for the standalone web edition, inlined into the generated page
// NOTE Compiled by build.ts, so this must stay a plain script with no imports

(() => {

    const root = document.documentElement
    const rail = document.getElementById('rail')
    const drawer = document.getElementById('drawer')
    const theme = document.getElementById('theme')
    if (!rail || !drawer || !theme){
        return
    }

    // Dark mode, remembered between visits and otherwise following the system
    const apply_theme = (value:string|null):void => {
        if (value){
            root.setAttribute('data-theme', value)
        } else {
            root.removeAttribute('data-theme')
        }
        const dark = value === 'dark' || (!value
            && window.matchMedia('(prefers-color-scheme: dark)').matches)
        theme.textContent = dark ? "Light mode" : "Dark mode"
    }

    apply_theme(localStorage.getItem('theme'))

    theme.addEventListener('click', () => {
        const dark = root.getAttribute('data-theme') === 'dark'
            || (!root.hasAttribute('data-theme')
                && window.matchMedia('(prefers-color-scheme: dark)').matches)
        const next = dark ? 'light' : 'dark'
        localStorage.setItem('theme', next)
        apply_theme(next)
    })

    // The book's type size, stepped by the sidebar's controls and remembered between visits
    const SIZES = [16, 17, 18, 19, 20, 22, 24, 26]
    const DEFAULT_SIZE = SIZES.indexOf(19)
    const smaller = document.getElementById('smaller')
    const larger = document.getElementById('larger')

    let size = Number(localStorage.getItem('size') ?? DEFAULT_SIZE)
    if (!Number.isInteger(size) || size < 0 || size >= SIZES.length){
        size = DEFAULT_SIZE
    }

    const apply_size = ():void => {
        root.style.setProperty('--size', `${SIZES[size]}px`)
        localStorage.setItem('size', String(size))
        smaller?.toggleAttribute('disabled', size === 0)
        larger?.toggleAttribute('disabled', size === SIZES.length - 1)
    }

    const step_size = (by:number) => () => {
        size = Math.min(Math.max(size + by, 0), SIZES.length - 1)
        apply_size()
    }

    smaller?.addEventListener('click', step_size(-1))
    larger?.addEventListener('click', step_size(1))
    apply_size()

    // The sidebar becomes a drawer once the screen is too narrow to keep it open
    const set_drawer = (open:boolean):void => {
        rail.classList.toggle('open', open)
        drawer.setAttribute('aria-expanded', String(open))
    }

    drawer.addEventListener('click', () => {
        set_drawer(!rail.classList.contains('open'))
    })

    // Track which chapter and section is being read, so the sidebar follows along
    const links = new Map<string, HTMLAnchorElement>()
    for (const a of rail.querySelectorAll('a[href^="#"]')){
        links.set(a.getAttribute('href')!.slice(1), a as HTMLAnchorElement)
        // On narrow screens the drawer should get out of the way once used
        a.addEventListener('click', () => {
            set_drawer(false)
        })
    }

    // Only the headings the contents actually lists are worth tracking
    const targets = [...document.querySelectorAll('#book [id]')]
        .filter(el => links.has(el.id))

    let current:HTMLAnchorElement|null = null

    const update = ():void => {

        // The heading being read is the last one to have passed the top of the screen
        let found:HTMLAnchorElement|null = null
        for (const target of targets){
            if (target.getBoundingClientRect().top > 120){
                break
            }
            found = links.get(target.id) ?? found
        }
        if (found === current){
            return
        }
        current = found

        // Highlight the entry itself, and the chapter it belongs to
        for (const li of rail.querySelectorAll('.here, .current')){
            li.classList.remove('here', 'current')
        }
        if (!found){
            return
        }
        const here = found.closest('li')
        here?.classList.add('here')
        here?.closest('.chapter')?.classList.add('current')

        // Keep the highlighted entry in view within the sidebar itself
        if (here && here.getBoundingClientRect().bottom > rail.clientHeight){
            here.scrollIntoView({block: 'center'})
        }
    }

    // Reading generates a lot of scroll events, so only look once per frame
    let queued = false
    const on_scroll = ():void => {
        if (queued){
            return
        }
        queued = true
        requestAnimationFrame(() => {
            queued = false
            update()
        })
    }

    document.addEventListener('scroll', on_scroll, {passive: true})
    update()

    // Show a footnote beside its reference, so following one doesn't lose your place
    const popover = document.createElement('div')
    popover.id = 'popover'
    document.body.appendChild(popover)

    const hide_popover = ():void => {
        popover.classList.remove('visible')
    }

    const show_popover = (ref:HTMLAnchorElement):void => {
        const note = document.getElementById(ref.getAttribute('href')!.slice(1))
        if (!note){
            return
        }

        // Show a copy so the note itself stays where it belongs
        popover.replaceChildren(note.cloneNode(true))
        popover.classList.add('visible')

        // Sit under the reference, nudged back onto the screen if it would overflow
        const at = ref.getBoundingClientRect()
        const width = popover.offsetWidth
        const left = Math.min(Math.max(12, at.left - width / 2), window.innerWidth - width - 12)
        const below = at.bottom + 8
        const above = at.top - popover.offsetHeight - 8
        const flip = below + popover.offsetHeight > window.innerHeight && above > 0
        popover.style.left = `${left + window.scrollX}px`
        popover.style.top = `${(flip ? above : below) + window.scrollY}px`
    }

    for (const ref of document.querySelectorAll('#book .footnote-ref')){
        ref.addEventListener('mouseenter', () => {
            show_popover(ref as HTMLAnchorElement)
        })
        ref.addEventListener('focus', () => {
            show_popover(ref as HTMLAnchorElement)
        })
        ref.addEventListener('mouseleave', hide_popover)
        ref.addEventListener('blur', hide_popover)
    }

    document.addEventListener('scroll', hide_popover, {passive: true})
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape'){
            hide_popover()
            set_drawer(false)
        }
    })

})()

