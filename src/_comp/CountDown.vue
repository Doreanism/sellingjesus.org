
<template lang="pug">

a.widget(v-if='!takedown' :href='url' target='_blank')
    div.name {{ name }}
    div.timer(v-if="countdown")
        | {{countdown.value}} {{countdown.unit}}{{countdown.value !== 1 ? 's' : ''}}
    div.live(v-else) WATCH

</template>


<script lang="ts" setup>

import {ref, computed, onMounted, onUnmounted} from 'vue'


// CONFIG
const name = "Doreancon"
const event_time = new Date('2025-10-06T15:00:00-07:00')  // Beginning of event
const takedown_time = new Date('2025-11-06T15:30:00-07:00')  // Hide widget 1 month after event


// Current time
const now = ref(new Date())
function update_time(){
    now.value = new Date()
}


// Time till event
const diff_in_ms = computed(() => event_time.getTime() - now.value.getTime())


// Whether should takedown widget (event finished a while ago)
const takedown = computed(() => {
    const remaining = takedown_time.getTime() - now.value.getTime()
    return remaining < 0
})


// Change URL when event starts
const url = computed(() => {
    return countdown.value ? 'https://doreancon.org/' : 'https://sellingjesus.org/doreancon2025'
})


// Human countdown
const countdown = computed(() => {

    // If negative then event has begun
    if (diff_in_ms.value <= 0)
        return null

    // Work out unit values
    const minutes = Math.floor(diff_in_ms.value / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)

    // Return most appropriate unit
    // Change when 1 or less for greater precision
    if (weeks >= 2)
        return {unit: 'week', value: weeks}
    if (days >= 2)
        return {unit: 'day', value: days}
    if (hours >= 2)
        return {unit: 'hour', value: hours}
    return {unit: 'min', value: minutes}
})


// Update time every 30 seconds
let timer:number|null = null
onMounted(() => {
    update_time()
    timer = self.setInterval(update_time, 1000 * 30)
})
onUnmounted(() => {
    if (timer !== null)
        clearInterval(timer)
})


</script>


<style lang="sass" scoped>

.widget
    display: flex
    flex-direction: column
    align-items: center
    line-height: 1
    gap: 4px
    padding: 0 12px
    font-size: 12px
    @media (max-width: 1000px)
        zoom: 0.8

    &:hover
        filter: drop-shadow(0 0 2px #999c)

.name
    font-weight: bold
    font-size: 11px

.timer
    color: hsl(100deg, 70%, 40%)

.live
    color: hsl(20deg, 70%, 40%)
    font-weight: bold

</style>
