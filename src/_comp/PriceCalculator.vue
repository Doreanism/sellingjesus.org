<template lang='pug'>
div.calculator
    div.fields
        span.dollar $
        input(v-model="inputDollarsOrig" type="number" min="0" step=".01"
            @keyup.enter="clicked = true")
    div.result
        div.button-container
            VPButton(v-if='!clicked' @click="clicked = true" text="Calculate"
                :disabled='!validInput')
            VPButton(v-else @click="reset" text="Reset" theme='alt')
        div.analysis(v-if='clicked && validInput')
            div.silverPrice
                div.row
                    div.key Current Price of Silver per Ounce
                    div.val ${{ silverDollars.toFixed(2) }}
                div.row
                    div.key Weight of a 1st-Century Shekel
                    div.val {{ shekelOz.toFixed(2) }}oz
                div.row
                    div.key Price of 30 Shekels<br> #[small (Matt 26:14-15)]
                    div.val ${{ shekel30Dollars.toFixed(2) }}
            div
                div(v-if="inputDollars === 0")
                    div.calculation Wow, a free gospel!
                    div.feedback Great work! You’ve avoided the sin of Judas!
                div(v-else-if="priceRatio.toFixed(2) === '1.00'")
                    div.calculation(v-if="inputDollars.toFixed(2) === shekel30Dollars.toFixed(2)")
                        | You are selling Jesus for
                        span.ratio  exactly
                        |  the same price that Judas did!
                    div.calculation(v-else)
                        | You are selling Jesus for roughly
                        span.ratio  the same price
                        |  that Judas did!
                    div.feedback Great minds think alike!
                div(v-else-if="inputDollars < shekel30Dollars")
                    div.calculation
                        | You are selling Jesus for
                        |
                        span.ratio  {{ (priceRatio * 100).toFixed(2) }}%
                        |  the price that Judas did!
                    div.feedback How generous!
                div(v-else)
                    div.calculation
                        | You are selling Jesus for
                        |
                        span.ratio  {{ priceRatio.toFixed(2) }}x
                        |  the price that Judas did!
                    div.feedback You must really value Jesus!
                div.link
                    a(href="/articles/judas")
                        | Is selling Christian teaching really the same as
                        |   betraying Jesus for money?
</template>

<script lang='ts' setup>

import { ref, computed, onMounted } from 'vue'
import { useUrlSearchParams } from '@vueuse/core'

const searchParams = useUrlSearchParams()

const shekelOz = 0.493835

const inputDollarsOrig = computed({
  get: () => searchParams.cost as string,
  set: (v:string|number) => searchParams.cost = String(v)  // Vue3 forces number modifier so undo
})

const silverDollars = ref(26.921)  // Hard-coded in case API fails in future
const clicked = ref(false)

const inputDollars = computed(() => parseFloat(inputDollarsOrig.value ?? '0'))
const shekel30Dollars = computed(() => 30 * shekelOz * silverDollars.value)
const priceRatio = computed(() => inputDollars.value / shekel30Dollars.value)

// Input is valid if it exists and is a positive number when parsed
const validInput = computed(
    () => inputDollarsOrig.value && !isNaN(inputDollars.value) && inputDollars.value >= 0)

const reset = () => {
    inputDollarsOrig.value = ''
    clicked.value = false
}

onMounted(async () => {
  const resp = await fetch('https://api.gold-api.com/price/XAG')
  const data = await resp.json()
  silverDollars.value = data.price
})
onMounted(() => {
  if (validInput.value) clicked.value = true
})

</script>

<style lang='sass' scoped>

.hide
    display: none

.calculator
    font-family: var(--vp-font-family-base)
    text-align: center
    line-height: 1.2

.fields
    position: relative
    width: 7rem
    margin: 0 auto

.dollar
    position: absolute
    padding: 3px 4px

.button-container
    margin-top: 24px

.silverPrice
    margin: 36px 0
    font-size: 16px

.row
    margin: .25rem 0
    display: flex
    justify-content: center

.key
    text-align: start
    width: 17rem

.val
    text-align: end
    width: 5rem

.calculation
    font-size: 32px
    margin-bottom: .5rem

.ratio
    font-weight: bold
    margin-bottom: .5rem

.feedback
    margin-top: 12px
    font-size: 24px

.link
    margin-top: 5rem

    a
        display: inline-block
        max-width: 440px
        background-color: var(--vp-c-brand-soft)
        padding: 8px 12px
        border-radius: 12px
        &:hover
            text-decoration: none

input
    border: 1px #888 solid
    border-radius: 5px
    padding: 3px
    padding-left: 15px
    text-align: right
    width: 100%
    font-size: 15pt

button
    font-size: 15pt

table
    text-align: center
    margin: 0 auto

td
    text-align: center

</style>
