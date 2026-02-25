
<!-- WARN Remember to keep in sync with SJ/copy.church -->


<template lang='pug'>

button.inactive(v-if='!activated' @click='activated = true')
    svg(viewBox="0 -960 960 960" fill="currentColor")
        path(d="m476-80 182-480h84L924-80h-84l-43-122H603L560-80h-84ZM160-200l-56-56 202-202q-35-35-63.5-80T190-640h84q20 39 40 68t48 58q33-33 68.5-92.5T484-720H40v-80h280v-80h80v80h280v80H564q-21 72-63 148t-83 116l96 98-30 82-122-125-202 201Zm468-72h144l-72-204-72 204Z")
    | Translate (AI) &nbsp;▾
div(v-else :class='`elfsight-app-${widget_id}`' data-elfsight-app-lazy) ...... ⏳ ......

</template>


<script lang='ts' setup>

import {ref} from 'vue'


// ID from Elfsight
const widget_id = '3125d421-b225-4914-a224-d9db8ffa3e73'


// If Elfsight has set a key then translation has been previously activated and should remain so
// But if they returned to original language, key will exist but not "value" prop in JSON
const elf_value = self.localStorage.getItem(`WebsiteTranslator.language.${widget_id}`) || ''
const previously_enabled = elf_value.includes('"value"')
// If someone shared a link that included a lang param, also auto-enable
const lang_param = self.document.location.search.includes('lang=')
const activated = ref(previously_enabled || lang_param)

</script>


<style lang='sass' scoped>

.inactive
    display: flex
    align-items: center
    gap: 6px
    min-width: 108px  // Same as Elfsight to reduce width jump
    background-color: var(--vp-button-alt-bg)
    padding: 4px 8px
    border-radius: 8px
    font-size: 13px
    font-weight: 500

    svg
        width: 16px
        height: 16px

div[data-elfsight-app-lazy]
    // WARN Careful not to adversly affect styling of the widget
    text-align: center  // For loading text

</style>
