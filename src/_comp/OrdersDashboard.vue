
<template lang="pug">

div(class='dashboard')

    //- Signed out (or kicked out): just the Google button and any message
    div(v-if='!signed_in' class='signin')
        h1 Orders
        p(v-if='error' class='error') {{ error }}
        div(ref='signin_button')

    //- Signed in
    div(v-else)

        div(class='topbar')
            h1 {{ view === 'admins' ? "Admins" : "Orders" }}
            div(class='account')
                div(class='viewswitch')
                    button(type='button' :class="{active: view === 'orders'}"
                        @click="switch_view('orders')") Orders
                    button(type='button' :class="{active: view === 'admins'}"
                        @click="switch_view('admins')") Admins
                span {{ admin_email }}
                button(type='button' @click='sign_out') Sign out

        p(v-if='error' class='error') {{ error }}
        p(v-if="view === 'orders' && loading") Loading…

        //- Orders view
        template(v-if="view === 'orders' && !loading")

            //- Headline numbers, grouped by theme, following whatever the filters currently show
            div(class='stats')
                div(class='statgroups')
                    div(v-for='g of stat_groups' :key='g.title' class='statgroup')
                        div(class='statgroup-title') {{ g.title }}
                        div(class='statgroup-tiles')
                            div(v-for='s of g.tiles' :key='s.label' class='stat'
                                :class='{accent: s.accent, danger: s.danger}')
                                div(class='num') {{ s.value }}
                                div(class='label') {{ s.label }}
                div(class='statgroup countries')
                    div(class='statgroup-title')
                        | Top countries
                        span(class='tc-count') {{ country_count }}
                    p(v-if='!top_countries.length' class='empty') No orders yet.
                    ol(v-else class='country-list')
                        li(v-for='c of top_countries' :key='c.name')
                            span(class='cn') {{ c.name }}
                            span(class='cc') {{ c.count }}
            p(v-if='filtering' class='stats-note')
                | Showing {{ filtered_orders.length }} of {{ orders.length }} orders

            //- Filters (all applied client side)
            div(class='filters')
                div(class='bookfilter')
                    button(type='button' :class="{active: filter_book === ''}"
                        @click="filter_book = ''") All
                    button(type='button' :class="{active: filter_book === 'abolish'}"
                        @click="filter_book = 'abolish'") Abolish
                    button(type='button' :class="{active: filter_book === 'bound'}"
                        @click="filter_book = 'bound'") God's Word
                select(v-model='filter_status')
                    option(value='') All statuses
                    option(v-for='s of status_options' :key='s.value' :value='s.value') {{ s.label }}
                select(v-model='filter_country')
                    option(value='') All countries
                    option(v-for='c of country_options' :key='c.code' :value='c.code') {{ c.name }}
                input(type='search' v-model='search' placeholder="Search name or email")
                button(v-if='filtering' type='button' @click='clear_filters') Clear

            p(v-if='!filtered_orders.length' class='empty') No orders match.
            table(v-else class='orders')
                thead
                    tr
                        th Date
                        th Name
                        th Country
                        th Book
                        th Status
                        th Cost
                        th
                tbody
                    template(v-for='o of filtered_orders' :key='o.id')
                        tr(:id='`order-${o.id}`' class='row'
                            :class='{highlight: o.id === highlight_id, open: expanded === o.id}'
                            @click='toggle(o.id)')
                            td(class='date' :title='format_datetime(o.datetime)') {{ format_date(o.datetime) }}
                            td(class='name' :title='o.name')
                                span(v-if='flagged(o)' class='flag' :title='flag_title(o)') ⚠
                                | {{ o.name }}
                            td {{ country_name(o.country) }}
                            td
                                div(v-for='b of o.books' :key='b.id') {{ short_book(b.id) }} &times;{{ b.quantity }}
                            td
                                span(class='badge' :class='o.status') {{ status_label(o.status) }}
                            td {{ o.cost ? `${o.cost} ${o.currency}` : '—' }}
                            td(class='row-actions' @click.stop)
                                template(v-if="o.status === 'new'")
                                    button(type='button' :disabled='busy' @click='primary_send(o)')
                                        | {{ manual_country(o.country) ? "Send manually" : "Send with Lulu" }}
                                    div(class='menu')
                                        button(type='button' class='menu-toggle' :disabled='busy'
                                            aria-label="More actions" @click='toggle_menu(o.id)') ⋯
                                        div(v-if='menu_open === o.id' class='menu-pop')
                                            button(type='button' :disabled='busy' @click='secondary_send(o)')
                                                | {{ manual_country(o.country) ? "Send with Lulu" : "Send manually" }}
                                            button(type='button' :disabled='busy' class='danger'
                                                @click='reject(o)') Reject
                                            button(type='button' :disabled='busy' class='danger'
                                                @click='delete_order(o)') Delete
                        tr(v-if='expanded === o.id' class='detail')
                            td(colspan='7')
                                div(class='detail-grid')
                                    div(v-for='d of detail_rows(o)' :key='d.label')
                                        span(class='dl') {{ d.label }}
                                        span {{ d.value || '—' }}

        //- Admins view: anyone here can add, remove, or retarget notifications for others
        template(v-if="view === 'admins'")

            div(class='addadmin')
                input(type='email' v-model='new_admin_email'
                    placeholder="new.admin@example.com" @keyup.enter='add_admin')
                button(type='button' class='primary'
                    :disabled='busy || !new_admin_email.trim()' @click='add_admin') Add admin

            p(v-if='!admins_loaded' class='empty') Loading…
            table(v-else class='orders adminlist')
                thead
                    tr
                        th Email
                        th Notifications
                        th
                tbody
                    tr(v-for='a of admins' :key='a.email')
                        td
                            span {{ a.email }}
                            span(v-if='a.is_super' class='badge') Super admin
                        td {{ notify_summary(a) }}
                        td(class='row-actions')
                            button(type='button' :disabled='busy' @click='open_notify(a)')
                                | Edit notifications
                            button(v-if='!a.is_super' type='button' :disabled='busy'
                                class='danger' @click='remove_admin(a)') Remove

//- Manual fulfilment: every field to paste into Amazon, then confirm or dismiss
div(v-if="dialog?.kind === 'manual'" class='overlay' @click.self='close_dialog')
    div(class='modal')
        h2 Send manually
        p(class='manual-book') For {{ manual_book_label }}
        div(v-if='warning_groups(dialog.order).length' class='order-warning')
            p(class='ow-title') ⚠ Possible repeat order
            div(v-for='g of warning_groups(dialog.order)' :key='g.label' class='ow-group')
                div(class='ow-head') {{ g.label }}
                div(v-for='m of g.orders' :key='m.id' class='ow-item'
                    :class="{muted: m.status === 'cancelled'}")
                    span(class='badge' :class='m.status') {{ status_label(m.status) }}
                    span(class='ow-date') {{ format_date(m.datetime) }}
                    span {{ country_name(m.country) }}
                    button(type='button' class='ow-jump' @click='jump_to(m.id)') show
        p Copy each field into the Amazon order:
        div(class='copyfields')
            div(v-for='f of dialog.fields' :key='f.label' class='copyfield')
                div(class='cf-label') {{ f.label }}
                div(class='cf-value') {{ f.value || '—' }}
                button(v-if='f.value' type='button' @click='copy(f.value)')
                    | {{ copied === f.value ? "Copied" : "Copy" }}
        p(v-if='dialog.error' class='error') {{ dialog.error }}
        div(class='modal-actions')
            button(type='button' class='primary' :disabled='busy' @click='confirm_manual')
                | {{ busy ? "Saving…" : "Confirm sent" }}
            button(type='button' :disabled='busy' @click='close_dialog') Dismiss

//- Lulu: show the print cost, then a second click to actually submit
div(v-if="dialog?.kind === 'lulu'" class='overlay' @click.self='close_dialog')
    div(class='modal')
        h2 Send with Lulu
        p(v-if='dialog.loading') Checking print cost…
        template(v-else-if='dialog.error')
            p(class='error') {{ dialog.error }}
            div(class='modal-actions')
                button(type='button' @click='close_dialog') Close
        template(v-else)
            p(class='lulu-line')
                | Lulu will charge {{ dialog.cost }} {{ dialog.currency }} to print and post
                |  this order to {{ country_name(dialog.order.country) }}.
            div(v-if='warning_groups(dialog.order).length' class='order-warning')
                p(class='ow-title') ⚠ Possible repeat order
                div(v-for='g of warning_groups(dialog.order)' :key='g.label' class='ow-group')
                    div(class='ow-head') {{ g.label }}
                    div(v-for='m of g.orders' :key='m.id' class='ow-item'
                        :class="{muted: m.status === 'cancelled'}")
                        span(class='badge' :class='m.status') {{ status_label(m.status) }}
                        span(class='ow-date') {{ format_date(m.datetime) }}
                        span {{ country_name(m.country) }}
                        button(type='button' class='ow-jump' @click='jump_to(m.id)') show
            p(class='submitted-note') Check the details the customer submitted before sending:
            div(class='submitted')
                div(v-for='f of submitted_fields(dialog.order)' :key='f.label' class='sub-row')
                    span(class='sub-label') {{ f.label }}
                    span(class='sub-value') {{ f.value || '—' }}
            div(class='modal-actions')
                button(type='button' class='primary' :disabled='busy' @click='confirm_lulu')
                    | {{ busy ? "Sending…" : "Confirm & send" }}
                button(type='button' :disabled='busy' @click='close_dialog') Back

//- Notify preferences: all countries, or a hand-picked list
div(v-if='admin_dialog' class='overlay' @click.self='admin_dialog = null')
    div(class='modal')
        h2 Notifications for {{ admin_dialog.email }}
        p Which orders should email this admin, by destination country.
        label(class='all-toggle')
            input(type='checkbox' v-model='admin_dialog.all')
            |  Notify for all countries
        div(v-if='!admin_dialog.all' class='countrypick')
            label(v-for='c of all_countries' :key='c.code' class='country')
                input(type='checkbox' :checked='admin_dialog.codes.includes(c.code)'
                    @change='toggle_country(c.code)')
                |  {{ c.name }}
        p(v-if='admin_dialog.error' class='error') {{ admin_dialog.error }}
        div(class='modal-actions')
            button(type='button' class='primary' :disabled='busy' @click='save_notify')
                | {{ busy ? "Saving…" : "Save" }}
            button(type='button' :disabled='busy' @click='admin_dialog = null') Cancel

</template>


<script lang="ts" setup>

import {computed, nextTick, onBeforeUnmount, onMounted, ref} from 'vue'

import {api_url, google_client_id} from './api.js'
import regions_data from './regions.json'


// Shape of the Google Identity Services global, limited to what's used here
interface GoogleId {
    accounts:{
        id:{
            initialize(config:{client_id:string, callback:(resp:{credential:string}) => void,
                auto_select?:boolean}):void
            renderButton(parent:HTMLElement, options:Record<string, unknown>):void
            disableAutoSelect():void
        }
    }
}
declare global {
    interface Window {
        google?:GoogleId
    }
}


// An order as returned by GET /admin/orders
type OrderStatus = 'new'|'sent_lulu'|'sent_manually'|'cancelled'
interface OrderSummary {
    id:string
    datetime:string
    ip:string
    name:string
    email:string
    books:{id:string, title:string, quantity:number}[]
    country:string
    city:string
    postcode:string
    street1:string
    street2:string
    phone:string
    region:string
    tax_id:string
    status:OrderStatus
    confirmed_at:string|null
    lulu_id:number|null
    cost:number
    currency:string
}


// An admin as returned by the /admin/admins endpoints
interface AdminRow {
    email:string
    notify:'all'|string[]
    is_super:boolean
}


// Whichever modal is open, if any
type Dialog =
    {kind:'manual', order:OrderSummary, fields:{label:string, value:string}[], error:string}
    | {kind:'lulu', order:OrderSummary, loading:boolean, cost:number|null, currency:string,
        error:string}


// Country code -> display name, for turning stored codes into readable labels
const country_names = new Map(
    (regions_data as {code:string, name:string}[]).map(c => [c.code, c.name]))

// Every country as {code, name}, sorted by name, for the notify-preference picker
const all_countries = (regions_data as {code:string, name:string}[])
    .map(c => ({code: c.code, name: c.name}))
    .sort((a, b) => a.name.localeCompare(b.name))

// Human labels for each order status
const STATUS_LABELS:Record<OrderStatus, string> = {
    new: "New",
    sent_lulu: "Sent (Lulu)",
    sent_manually: "Sent (manual)",
    cancelled: "Rejected",
}

// Compact book names for the dense table and dialogs, keyed by product id
const SHORT_BOOK_TITLES:Record<string, string> = {
    abolish: "Abolish",
    bound: "God's Word",
}

// Destinations we fulfil by hand through Amazon rather than Lulu
const MANUAL_COUNTRIES = new Set(['US', 'AU', 'PH'])

// localStorage key holding the session token, so a reload or a return days later stays signed in
const SESSION_KEY = 'sj_orders_session'

// Renew the session once it's within this long of expiring
const RENEW_WITHIN_MS = 7 * 24 * 60 * 60 * 1000


const signin_button = ref<HTMLElement>()
const auth_token = ref('')
const admin_email = ref('')
const orders = ref<OrderSummary[]>([])
const loading = ref(false)
const error = ref('')
const busy = ref(false)
const copied = ref('')
const expanded = ref('')
const highlight_id = ref('')
const menu_open = ref('')
const dialog = ref<Dialog|null>(null)

const view = ref<'orders'|'admins'>('orders')
const admins = ref<AdminRow[]>([])
const admins_loaded = ref(false)
const new_admin_email = ref('')
const admin_dialog = ref<{email:string, all:boolean, codes:string[], error:string}|null>(null)

const filter_status = ref<''|OrderStatus>('')
const filter_country = ref('')
const filter_book = ref<''|'abolish'|'bound'>('')
const search = ref('')

const signed_in = computed(() => !!auth_token.value)


// Turn a country code into its name, falling back to the raw code
function country_name(code:string):string{
    return country_names.get(code) ?? code
}

// Label for a status value
function status_label(status:OrderStatus):string{
    return STATUS_LABELS[status]
}

// Compact name for a book, falling back to the raw product id
function short_book(id:string):string{
    return SHORT_BOOK_TITLES[id] ?? id
}

// Status options for the filter dropdown
const status_options = (Object.keys(STATUS_LABELS) as OrderStatus[]).map(value => ({
    value,
    label: STATUS_LABELS[value],
}))

// Distinct countries present in the loaded orders, for the filter dropdown
const country_options = computed(() => {
    const codes = [...new Set(orders.value.map(o => o.country))]
    return codes
        .map(code => ({code, name: country_name(code)}))
        .sort((a, b) => a.name.localeCompare(b.name))
})

// Whether any filter is currently narrowing the list
const filtering = computed(() =>
    !!filter_status.value || !!filter_country.value || !!filter_book.value
    || !!search.value.trim())

// Orders after the active filters
const filtered_orders = computed(() => {
    const query = search.value.trim().toLowerCase()
    return orders.value.filter(o => {
        if (filter_status.value && o.status !== filter_status.value){
            return false
        }
        if (filter_country.value && o.country !== filter_country.value){
            return false
        }
        if (filter_book.value && !o.books.some(b => b.id === filter_book.value)){
            return false
        }
        if (query && !`${o.name} ${o.email}`.toLowerCase().includes(query)){
            return false
        }
        return true
    })
})

// Filtered orders minus rejected ones: rejected only ever feeds its own count
const active_orders = computed(() => filtered_orders.value.filter(o => o.status !== 'cancelled'))

// Headline numbers, grouped by theme, computed from the filtered set
const stat_groups = computed(() => {
    const list = active_orders.value
    const count = (status:OrderStatus) => list.filter(o => o.status === status).length
    const now = Date.now()
    const within = (days:number) =>
        list.filter(o => now - new Date(o.datetime).getTime() < days * 86400000).length

    // Amount spent with Lulu so far, kept separate per currency
    const spend = new Map<string, number>()
    for (const o of list){
        if (o.status === 'sent_lulu' && o.currency){
            spend.set(o.currency, (spend.get(o.currency) ?? 0) + o.cost)
        }
    }
    const spend_text = [...spend.entries()]
        .map(([currency, total]) => `${total.toFixed(2)} ${currency}`).join(' + ') || '—'

    // Rejected count comes from the full filtered set, not the active one
    const rejected = filtered_orders.value.filter(o => o.status === 'cancelled').length

    return [
        {title: "Volume", tiles: [
            {label: "Total", value: String(list.length), accent: false, danger: false},
            {label: "Last 7 days", value: String(within(7)), accent: false, danger: false},
            {label: "Last 30 days", value: String(within(30)), accent: false, danger: false},
        ]},
        {title: "Fulfilment", tiles: [
            {label: "Awaiting action", value: String(count('new')), accent: true, danger: false},
            {label: "Sent (Lulu)", value: String(count('sent_lulu')), accent: false, danger: false},
            {label: "Sent (manual)", value: String(count('sent_manually')), accent: false,
                danger: false},
            {label: "Rejected", value: String(rejected), accent: false, danger: true},
        ]},
        {title: "Spend", tiles: [
            {label: "Lulu spend", value: spend_text, accent: false, danger: false},
        ]},
    ]
})

// Distinct destination countries, shown beside the "Top countries" title
const country_count = computed(() => new Set(active_orders.value.map(o => o.country)).size)

// Up to ten busiest destination countries, for the panel beside the stats
const top_countries = computed(() => {
    const per_country = new Map<string, number>()
    for (const o of active_orders.value){
        per_country.set(o.country, (per_country.get(o.country) ?? 0) + 1)
    }
    return [...per_country.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([code, count]) => ({name: country_name(code), count}))
})


// Other orders that look like the same person (email/phone/name+street) or same network (ip)
interface OrderFlags {
    recipient:OrderSummary[]
    network:OrderSummary[]
}

// Keep only the digits of a phone number, for loose matching
function phone_digits(value:string):string{
    return value.replace(/\D/g, '')
}

// Work out which other loaded orders overlap with this one
function compute_order_flags(o:OrderSummary):OrderFlags{
    const norm = (value:string) => value.trim().toLowerCase()
    const o_phone = phone_digits(o.phone)
    const o_name = norm(o.name)
    const o_street = norm(o.street1)
    const recipient:OrderSummary[] = []
    const network:OrderSummary[] = []
    for (const x of orders.value){
        if (x.id === o.id){
            continue
        }
        const same_email = !!o.email && x.email === o.email
        const same_phone = o_phone.length >= 7 && phone_digits(x.phone) === o_phone
        const same_address = !!o_name && !!o_street
            && norm(x.name) === o_name && norm(x.street1) === o_street
        if (same_email || same_phone || same_address){
            recipient.push(x)
        } else if (!!o.ip && x.ip === o.ip){
            network.push(x)
        }
    }
    const newest_first = (a:OrderSummary, b:OrderSummary) => b.datetime.localeCompare(a.datetime)
    return {recipient: recipient.sort(newest_first), network: network.sort(newest_first)}
}

// Flags for every loaded order, rebuilt only when the list changes
const order_flags_by_id = computed(() => {
    const map = new Map<string, OrderFlags>()
    for (const o of orders.value){
        map.set(o.id, compute_order_flags(o))
    }
    return map
})

// Flags for one order (empty if it stands alone)
function order_flags(o:OrderSummary):OrderFlags{
    return order_flags_by_id.value.get(o.id) ?? {recipient: [], network: []}
}

// Whether an order overlaps with any other
function flagged(o:OrderSummary):boolean{
    const flags = order_flags(o)
    return flags.recipient.length > 0 || flags.network.length > 0
}

// One-line summary of an order's overlaps, for the row marker's hover text
function flag_title(o:OrderSummary):string{
    const flags = order_flags(o)
    const parts:string[] = []
    if (flags.recipient.length){
        parts.push(`${flags.recipient.length} from the same email, phone, or address`)
    }
    if (flags.network.length){
        parts.push(`${flags.network.length} from the same IP address`)
    }
    return `Possible repeat order — ${parts.join('; ')}`
}

// Overlap groups shown in the send dialogs (empty when the order stands alone)
function warning_groups(o:OrderSummary):{label:string, orders:OrderSummary[]}[]{
    const flags = order_flags(o)
    const groups:{label:string, orders:OrderSummary[]}[] = []
    if (flags.recipient.length){
        groups.push({label: "Same email, phone, or address", orders: flags.recipient})
    }
    if (flags.network.length){
        groups.push({label: "Same IP address", orders: flags.network})
    }
    return groups
}

// Close any dialog and bring another order into view in the list
function jump_to(id:string):void{
    close_dialog()
    menu_open.value = ''
    highlight_id.value = id
    expanded.value = id
    if (!filtered_orders.value.some(x => x.id === id)){
        clear_filters()
    }
    nextTick(() => {
        document.getElementById(`order-${id}`)?.scrollIntoView({block: 'center', behavior: 'smooth'})
    })
}


// Fields shown when a row is expanded
function detail_rows(o:OrderSummary):{label:string, value:string}[]{
    return [
        {label: "Email", value: o.email},
        {label: "Phone", value: o.phone},
        {label: "Street", value: [o.street1, o.street2].filter(Boolean).join(', ')},
        {label: "City", value: o.city},
        {label: "State/Province", value: o.region},
        {label: "Postcode", value: o.postcode},
        {label: "Country", value: country_name(o.country)},
        {label: "Tax ID", value: o.tax_id},
        {label: "Ordered", value: format_datetime(o.datetime)},
        {label: "Confirmed", value: o.confirmed_at ? format_datetime(o.confirmed_at) : ''},
        {label: "Lulu job", value: o.lulu_id ? String(o.lulu_id) : ''},
        {label: "IP", value: o.ip},
    ]
}

// Short date for the dense table: day and month, plus the year when it isn't the current one
function format_date(iso:string):string{
    const date = new Date(iso)
    const options:Intl.DateTimeFormatOptions = {month: 'short', day: 'numeric'}
    if (date.getFullYear() !== new Date().getFullYear()){
        options.year = 'numeric'
    }
    return date.toLocaleDateString(undefined, options)
}

// Full date and time, for hover titles and the expanded detail
function format_datetime(iso:string):string{
    return new Date(iso).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
}

// Expand or collapse a row
function toggle(id:string):void{
    expanded.value = expanded.value === id ? '' : id
}

// Whether an order's country is one we fulfil manually through Amazon
function manual_country(code:string):boolean{
    return MANUAL_COUNTRIES.has(code)
}

// Open or close the per-row actions menu
function toggle_menu(id:string):void{
    menu_open.value = menu_open.value === id ? '' : id
}

// The send route we lead with for this order: manual for the manual countries, Lulu otherwise
function primary_send(o:OrderSummary):void{
    menu_open.value = ''
    if (manual_country(o.country)){
        open_manual(o)
    } else {
        open_lulu(o)
    }
}

// The other send route, offered from the menu
function secondary_send(o:OrderSummary):void{
    menu_open.value = ''
    if (manual_country(o.country)){
        open_lulu(o)
    } else {
        open_manual(o)
    }
}

// Reset every filter
function clear_filters():void{
    filter_status.value = ''
    filter_country.value = ''
    filter_book.value = ''
    search.value = ''
}


// Pull the (untrusted, display only) email out of a Google id token
function decode_email(jwt:string):string{
    try {
        const part = (jwt.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(atob(part)) as {email?:string}
        return payload.email ?? ''
    } catch {
        return ''
    }
}

// Read the (display only) claims out of one of our own session tokens
function read_session(token:string):{email:string, exp:number}|null{
    try {
        const part = (token.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(atob(part)) as {email?:string, exp?:number}
        if (!payload.email || typeof payload.exp !== 'number'){
            return null
        }
        return {email: payload.email, exp: payload.exp}
    } catch {
        return null
    }
}

// Read an {error} message from a failed response, if there is one
async function read_error(resp:Response):Promise<string>{
    try {
        const data = await resp.json() as {error?:string}
        return data.error ?? ''
    } catch {
        return ''
    }
}

// Call the admin API with the current sign-in; signs out on a rejected token
async function api_call<T>(path:string, body?:unknown):Promise<T>{
    const resp = await fetch(api_url + path, {
        method: body === undefined ? 'GET' : 'POST',
        headers: {
            'Authorization': `Bearer ${auth_token.value}`,
            ...body === undefined ? {} : {'Content-Type': 'application/json'},
        },
        ...body === undefined ? {} : {body: JSON.stringify(body)},
    })
    if (resp.status === 401 || resp.status === 403){
        const message = await read_error(resp)
        sign_out()
        error.value = message || "Your session has ended, please sign in again"
        throw new Error(error.value)
    }
    if (!resp.ok){
        throw new Error(await read_error(resp) || `Request failed (${resp.status})`)
    }
    return await resp.json() as T
}

// Fetch every order and refresh the list
async function load_orders():Promise<void>{
    loading.value = true
    error.value = ''
    try {
        const data = await api_call<{orders:OrderSummary[]}>('/admin/orders')
        orders.value = data.orders
        await nextTick()
        scroll_to_highlight()
        void renew_session_if_stale()
    } catch (caught){
        // api_call already reports auth failures via sign_out
        if (signed_in.value){
            error.value = (caught as Error).message
        }
    } finally {
        loading.value = false
    }
}

// If arriving via ?id=, bring that order into view (dropping filters that hide it)
function scroll_to_highlight():void{
    if (!highlight_id.value){
        return
    }
    if (!filtered_orders.value.some(o => o.id === highlight_id.value)){
        clear_filters()
    }
    nextTick(() => {
        document.getElementById(`order-${highlight_id.value}`)
            ?.scrollIntoView({block: 'center', behavior: 'smooth'})
        expanded.value = highlight_id.value
    })
}


// Load the Google Identity Services script once
function load_gsi():Promise<void>{
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id){
            return resolve()
        }
        const url = 'https://accounts.google.com/gsi/client'
        const existing = document.querySelector(`script[src="${url}"]`)
        if (existing){
            existing.addEventListener('load', () => resolve())
            return
        }
        const script = document.createElement('script')
        script.src = url
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Couldn't load Google sign-in"))
        document.head.appendChild(script)
    })
}

// Draw (or redraw) the Google button into its placeholder
function render_signin():void{
    if (window.google && signin_button.value){
        window.google.accounts.id.renderButton(signin_button.value,
            {theme: 'outline', size: 'large'})
    }
}

// Google hands us a signed id token; trade it for a session token, then load the dashboard
async function on_credential(resp:{credential:string}):Promise<void>{
    // A stored session may already have signed us in before auto-select fired
    if (read_session(auth_token.value)){
        return
    }
    admin_email.value = decode_email(resp.credential)
    await exchange_session(resp.credential)
    if (signed_in.value){
        await load_orders()
    }
}

// Swap a bearer token (a fresh Google credential, or a still-valid session) for a new
// session token that lasts weeks, and remember it across reloads and browser restarts
async function exchange_session(bearer:string):Promise<void>{
    auth_token.value = bearer
    try {
        const data = await api_call<{token:string, email:string}>('/admin/session', {})
        auth_token.value = data.token
        admin_email.value = data.email
        localStorage.setItem(SESSION_KEY, data.token)
    } catch (caught){
        // api_call already signs out on a rejected token; anything else just leaves the
        // shorter-lived bearer in place, which still works until it lapses
        if (signed_in.value){
            error.value = (caught as Error).message
        }
    }
}

// Quietly extend the session while it's still valid but getting close to expiry
async function renew_session_if_stale():Promise<void>{
    const claims = read_session(auth_token.value)
    if (!claims || claims.exp - Date.now() > RENEW_WITHIN_MS){
        return
    }
    await exchange_session(auth_token.value)
}

// Drop the current session and show the button again
function sign_out():void{
    auth_token.value = ''
    admin_email.value = ''
    orders.value = []
    dialog.value = null
    admins.value = []
    admins_loaded.value = false
    admin_dialog.value = null
    new_admin_email.value = ''
    view.value = 'orders'
    localStorage.removeItem(SESSION_KEY)
    window.google?.accounts.id.disableAutoSelect()
    nextTick(render_signin)
}


// Open the manual fulfilment dialog, pre-listing everything to copy into Amazon
function open_manual(o:OrderSummary):void{
    dialog.value = {
        kind: 'manual',
        order: o,
        error: '',
        fields: [
            {label: "Name", value: o.name},
            {label: "Street address 1", value: o.street1},
            {label: "Street address 2", value: o.street2},
            {label: "City", value: o.city},
            {label: "State/Province", value: o.region},
            {label: "Zip/Postcode", value: o.postcode},
            {label: "Country", value: country_name(o.country)},
            {label: "Phone", value: o.phone},
            {label: "Email", value: o.email},
            {label: "Tax ID", value: o.tax_id},
        ],
    }
}

// Which book(s) the open manual dialog is for, in short form
const manual_book_label = computed(() => {
    if (dialog.value?.kind !== 'manual'){
        return ''
    }
    return dialog.value.order.books
        .map(b => `${short_book(b.id)} ×${b.quantity}`).join(', ')
})

// Everything the customer submitted, for a last look before sending with Lulu
function submitted_fields(o:OrderSummary):{label:string, value:string}[]{
    return [
        {label: "Name", value: o.name},
        {label: "Email", value: o.email},
        {label: "Phone", value: o.phone},
        {label: "Street", value: [o.street1, o.street2].filter(Boolean).join(', ')},
        {label: "City", value: o.city},
        {label: "State/Province", value: o.region},
        {label: "Postcode", value: o.postcode},
        {label: "Country", value: country_name(o.country)},
        {label: "Tax ID", value: o.tax_id},
        {label: "Books", value: o.books.map(b => `${short_book(b.id)} ×${b.quantity}`).join(', ')},
    ]
}

// Copy a value to the clipboard and briefly flag which one was copied
async function copy(text:string):Promise<void>{
    if (!text){
        return
    }
    try {
        await navigator.clipboard.writeText(text)
        copied.value = text
        setTimeout(() => {
            if (copied.value === text){
                copied.value = ''
            }
        }, 1500)
    } catch {
        // Clipboard access can be blocked; nothing useful to do
    }
}

// Record the manual order as sent
async function confirm_manual():Promise<void>{
    if (dialog.value?.kind !== 'manual'){
        return
    }
    await run_action(dialog.value.order.id, 'manual', message => {
        if (dialog.value?.kind === 'manual'){
            dialog.value.error = message
        }
    })
}

// Open the Lulu dialog and ask what the print job would cost
async function open_lulu(o:OrderSummary):Promise<void>{
    dialog.value = {kind: 'lulu', order: o, loading: true, cost: null, currency: '', error: ''}
    try {
        const data = await api_call<{cost?:number, currency?:string, error?:string}>(
            '/admin/orders/lulu-cost', {id: o.id})
        if (dialog.value?.kind !== 'lulu'){
            return
        }
        if (data.error || data.cost === undefined){
            dialog.value.error = data.error || "Couldn't get a price"
        } else {
            dialog.value.cost = data.cost
            dialog.value.currency = data.currency ?? ''
        }
    } catch (caught){
        if (dialog.value?.kind === 'lulu'){
            dialog.value.error = (caught as Error).message
        }
    } finally {
        if (dialog.value?.kind === 'lulu'){
            dialog.value.loading = false
        }
    }
}

// Submit the order to Lulu for printing
async function confirm_lulu():Promise<void>{
    if (dialog.value?.kind !== 'lulu'){
        return
    }
    await run_action(dialog.value.order.id, 'lulu', message => {
        if (dialog.value?.kind === 'lulu'){
            dialog.value.error = message
        }
    })
}

// Reject an order after a confirm prompt
async function reject(o:OrderSummary):Promise<void>{
    menu_open.value = ''
    if (!window.confirm(`Reject the order for ${o.name}?`)){
        return
    }
    await run_action(o.id, 'cancel', message => {
        error.value = message
    })
}

// Permanently remove an order after a strong confirm prompt
async function delete_order(o:OrderSummary):Promise<void>{
    menu_open.value = ''
    if (!window.confirm(`Permanently delete the order for ${o.name}? This can't be undone.`)){
        return
    }
    await run_action(o.id, 'delete', message => {
        error.value = message
    })
}

// Shared runner for the order actions: call the API then reload on success
async function run_action(id:string, action:'manual'|'lulu'|'cancel'|'delete',
        on_error:(message:string) => void):Promise<void>{
    busy.value = true
    try {
        const result = await api_call<{status?:string, error?:string}>(
            '/admin/orders/action', {id, action})
        if (result.error || !result.status){
            on_error(result.error || "That didn't work")
            return
        }
        close_dialog()
        await load_orders()
    } catch (caught){
        on_error((caught as Error).message)
    } finally {
        busy.value = false
    }
}

// Close whichever dialog is open
function close_dialog():void{
    dialog.value = null
    copied.value = ''
}


// Switch between the orders and admins views, loading the admin list the first time it's shown
function switch_view(next:'orders'|'admins'):void{
    view.value = next
    error.value = ''
    if (next === 'admins' && !admins_loaded.value){
        load_admins()
    }
}

// Fetch the admin list
async function load_admins():Promise<void>{
    error.value = ''
    try {
        const data = await api_call<{admins:AdminRow[]}>('/admin/admins')
        admins.value = data.admins
        admins_loaded.value = true
    } catch (caught){
        // api_call already reports auth failures via sign_out
        if (signed_in.value){
            error.value = (caught as Error).message
        }
    }
}

// Shared runner for the admin changes: call the API then swap in the returned list
async function admin_action(body:Record<string, unknown>):Promise<boolean>{
    busy.value = true
    error.value = ''
    try {
        const data = await api_call<{admins?:AdminRow[], error?:string}>(
            '/admin/admins/action', body)
        if (data.error || !data.admins){
            error.value = data.error || "That didn't work"
            return false
        }
        admins.value = data.admins
        return true
    } catch (caught){
        if (signed_in.value){
            error.value = (caught as Error).message
        }
        return false
    } finally {
        busy.value = false
    }
}

// Add whatever email is in the input as a new admin (notified for all countries to start)
async function add_admin():Promise<void>{
    const email = new_admin_email.value.trim()
    if (!email){
        return
    }
    if (await admin_action({action: 'add', email, notify: 'all'})){
        new_admin_email.value = ''
    }
}

// Remove an admin after a confirm prompt (the server still guards the super admin)
async function remove_admin(row:AdminRow):Promise<void>{
    if (!window.confirm(`Remove ${row.email} as an admin?`)){
        return
    }
    await admin_action({action: 'remove', email: row.email})
}

// A short description of which countries an admin is notified about
function notify_summary(row:AdminRow):string{
    if (row.notify === 'all'){
        return "All countries"
    }
    if (!row.notify.length){
        return "No countries"
    }
    return row.notify.map(code => country_name(code)).join(', ')
}

// Open the notify-preference modal for an admin
function open_notify(row:AdminRow):void{
    admin_dialog.value = {
        email: row.email,
        all: row.notify === 'all',
        codes: row.notify === 'all' ? [] : [...row.notify],
        error: '',
    }
}

// Add or remove a country in the open notify modal
function toggle_country(code:string):void{
    if (!admin_dialog.value){
        return
    }
    const codes = admin_dialog.value.codes
    const at = codes.indexOf(code)
    if (at === -1){
        codes.push(code)
    } else {
        codes.splice(at, 1)
    }
}

// Save the notify modal's selection back to the admin
async function save_notify():Promise<void>{
    if (!admin_dialog.value){
        return
    }
    const {email, all, codes} = admin_dialog.value
    admin_dialog.value.error = ''
    if (await admin_action({action: 'notify', email, notify: all ? 'all' : codes})){
        admin_dialog.value = null
    } else if (admin_dialog.value){
        // Surface the failure inside the modal, which covers the main error line
        admin_dialog.value.error = error.value
        error.value = ''
    }
}


// Any click that reaches the document (i.e. outside the actions cell) closes the menu
function close_menu():void{
    menu_open.value = ''
}
onMounted(() => document.addEventListener('click', close_menu))
onBeforeUnmount(() => document.removeEventListener('click', close_menu))


onMounted(async () => {

    // A deep link may ask for one specific order
    highlight_id.value = new URLSearchParams(window.location.search).get('id') ?? ''

    if (!google_client_id){
        error.value = "Dashboard is missing its Google client id (set google_client_id in api.ts)"
        return
    }

    try {
        await load_gsi()
    } catch (caught){
        error.value = (caught as Error).message
        return
    }

    window.google?.accounts.id.initialize({
        client_id: google_client_id,
        callback: on_credential,
        // Re-sign in without a click when the session eventually lapses (unless explicitly signed out)
        auto_select: true,
    })

    // Resume a stored session if there is one, otherwise show the button
    const saved = localStorage.getItem(SESSION_KEY)
    const claims = saved ? read_session(saved) : null
    if (saved && claims && claims.exp > Date.now()){
        auth_token.value = saved
        admin_email.value = claims.email
        await load_orders()
    } else {
        localStorage.removeItem(SESSION_KEY)
        render_signin()
    }
})

</script>


<style lang="sass" scoped>

.dashboard
    font-family: var(--vp-font-family-base)
    max-width: 1280px
    margin: 0 auto
    padding: 24px

.topbar, .signin
    display: flex
    align-items: center
    justify-content: space-between
    flex-wrap: wrap
    gap: 12px

.signin
    flex-direction: column
    align-items: flex-start

.account
    display: flex
    align-items: center
    gap: 12px
    font-size: 14px
    color: var(--vp-c-text-2)

.error
    color: var(--vp-c-danger-1)

button
    font-family: inherit
    font-size: 14px
    padding: 6px 12px
    border-radius: 6px
    border: 1px solid var(--vp-c-divider)
    background: var(--vp-c-bg-soft)
    cursor: pointer

    &:hover:not(:disabled)
        border-color: var(--vp-c-brand-1)

    &:disabled
        opacity: 0.5
        cursor: default

    &.primary
        background: var(--vp-c-brand-1)
        border-color: var(--vp-c-brand-1)
        color: #fff

    &.danger
        color: var(--vp-c-danger-1)

.stats
    display: flex
    flex-wrap: wrap
    align-items: flex-start
    gap: 16px
    margin: 24px 0

// The stat groups take two thirds; the countries box takes the last third,
// dropping below onto its own full-width row when the page gets narrow
.statgroups
    flex: 2 1 0
    min-width: 300px
    display: flex
    flex-wrap: wrap
    align-items: flex-start
    gap: 16px

.statgroup
    border: 1px solid var(--vp-c-divider)
    border-radius: 8px
    padding: 12px

.statgroup-title
    font-size: 12px
    text-transform: uppercase
    letter-spacing: 0.04em
    color: var(--vp-c-text-2)
    margin-bottom: 8px

    .tc-count
        margin-left: 6px
        padding: 1px 6px
        border-radius: 999px
        background: var(--vp-c-bg-soft)
        border: 1px solid var(--vp-c-divider)
        color: var(--vp-c-text-1)
        font-variant-numeric: tabular-nums

.statgroup-tiles
    display: flex
    flex-wrap: wrap
    gap: 8px

.stat
    border: 1px solid var(--vp-c-divider)
    border-radius: 8px
    padding: 8px 14px
    background: var(--vp-c-bg-soft)
    min-width: 92px

    &.accent
        border-color: var(--vp-c-brand-1)
        background: var(--vp-c-brand-soft)

    &.danger
        border-color: var(--vp-c-danger-1)

        .num
            color: var(--vp-c-danger-1)

    .num
        font-size: 20px
        font-weight: 700

    .label
        font-size: 12px
        color: var(--vp-c-text-2)
        margin-top: 4px
        white-space: nowrap

.countries
    flex: 1 1 0
    min-width: 240px

.country-list
    margin: 0
    padding: 0
    list-style: none
    columns: 2
    column-gap: 24px
    font-size: 13px

    li
        display: flex
        justify-content: space-between
        gap: 12px
        padding: 3px 0
        break-inside: avoid

    .cn
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap

    .cc
        color: var(--vp-c-text-2)
        font-variant-numeric: tabular-nums

.stats-note
    font-size: 13px
    color: var(--vp-c-text-2)
    margin-top: -12px

.bookfilter
    display: flex
    gap: 4px

    button.active
        border-color: var(--vp-c-brand-1)
        color: var(--vp-c-brand-1)

.filters
    display: flex
    flex-wrap: wrap
    align-items: center
    gap: 12px
    margin: 16px 0

    select, input
        font-family: inherit
        font-size: 14px
        padding: 6px 10px
        border-radius: 6px
        border: 1px solid var(--vp-c-divider)
        background: var(--vp-c-bg-soft)

.empty
    color: var(--vp-c-text-2)

.orders
    width: 100%
    border-collapse: collapse
    font-size: 14px

    th, td
        text-align: left
        padding: 10px 12px
        border-bottom: 1px solid var(--vp-c-divider)
        vertical-align: top

    th
        font-size: 12px
        text-transform: uppercase
        letter-spacing: 0.04em
        color: var(--vp-c-text-2)

    td.date
        white-space: nowrap

    td.name
        max-width: 220px
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap

    td.name .flag
        margin-right: 4px
        cursor: help

    .row
        cursor: pointer

        &:hover
            background: var(--vp-c-bg-soft)

        &.open
            background: var(--vp-c-bg-soft)

        &.highlight
            background: var(--vp-c-brand-soft)

.badge
    display: inline-block
    padding: 2px 8px
    border-radius: 999px
    font-size: 12px
    background: var(--vp-c-bg-soft)
    border: 1px solid var(--vp-c-divider)

    &.new
        border-color: var(--vp-c-brand-1)
        color: var(--vp-c-brand-1)

    &.cancelled
        border-color: var(--vp-c-danger-1)
        color: var(--vp-c-danger-1)

.row-actions
    white-space: nowrap

    > button, > .menu
        margin-left: 6px

.menu
    position: relative
    display: inline-block

.menu-toggle
    padding: 6px 10px
    line-height: 1

.menu-pop
    position: absolute
    right: 0
    top: calc(100% + 4px)
    z-index: 30
    display: flex
    flex-direction: column
    gap: 4px
    padding: 6px
    background: var(--vp-c-bg)
    border: 1px solid var(--vp-c-divider)
    border-radius: 8px
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15)

    button
        margin: 0
        text-align: left

.detail td
    background: var(--vp-c-bg-alt)

.detail-grid
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))
    gap: 8px 24px

    .dl
        color: var(--vp-c-text-2)
        margin-right: 8px

.overlay
    position: fixed
    inset: 0
    background: rgba(0, 0, 0, 0.5)
    display: flex
    align-items: center
    justify-content: center
    padding: 24px
    z-index: 100

.modal
    background: var(--vp-c-bg)
    border-radius: 10px
    padding: 24px
    max-width: 520px
    width: 100%
    max-height: 90vh
    overflow-y: auto

    h2
        margin: 0 0 12px

.manual-book
    font-weight: 600

.order-warning
    border: 1px solid var(--vp-c-danger-1)
    border-radius: 8px
    background: var(--vp-c-danger-soft)
    padding: 10px 12px
    margin: 14px 0
    font-size: 13px

    .ow-title
        margin: 0
        font-weight: 600
        color: var(--vp-c-danger-1)

    .ow-group
        margin-top: 8px

    .ow-head
        font-size: 11px
        text-transform: uppercase
        letter-spacing: 0.04em
        color: var(--vp-c-text-2)
        margin-bottom: 3px

    .ow-item
        display: flex
        align-items: center
        flex-wrap: wrap
        gap: 8px
        padding: 2px 0

        &.muted
            opacity: 0.55

        .ow-date
            color: var(--vp-c-text-2)

    .ow-jump
        margin-left: auto
        padding: 0
        border: none
        background: none
        color: var(--vp-c-brand-1)
        font: inherit
        cursor: pointer

.copyfields
    display: flex
    flex-direction: column
    gap: 8px
    margin: 16px 0

.copyfield
    display: grid
    grid-template-columns: 130px 1fr auto
    align-items: center
    gap: 12px
    font-size: 14px

    .cf-label
        color: var(--vp-c-text-2)

    .cf-value
        word-break: break-word

.lulu-line
    font-size: 15px

.submitted-note
    font-size: 13px
    color: var(--vp-c-text-2)
    margin-top: 14px

.submitted
    display: flex
    flex-direction: column
    gap: 4px
    margin: 8px 0 4px

.sub-row
    display: grid
    grid-template-columns: 130px 1fr
    gap: 12px
    font-size: 14px

    .sub-label
        color: var(--vp-c-text-2)

    .sub-value
        word-break: break-word

.modal-actions
    display: flex
    gap: 12px
    margin-top: 20px

.viewswitch
    display: flex
    gap: 4px
    margin-right: 8px

    button.active
        border-color: var(--vp-c-brand-1)
        color: var(--vp-c-brand-1)

.addadmin
    display: flex
    flex-wrap: wrap
    gap: 12px
    margin: 24px 0 16px

    input
        font-family: inherit
        font-size: 14px
        padding: 6px 10px
        border-radius: 6px
        border: 1px solid var(--vp-c-divider)
        background: var(--vp-c-bg-soft)
        min-width: 260px

.adminlist .badge
    margin-left: 8px

.all-toggle
    display: block
    margin: 12px 0

.countrypick
    max-height: 320px
    overflow-y: auto
    border: 1px solid var(--vp-c-divider)
    border-radius: 6px
    padding: 8px 12px

    .country
        display: block
        font-size: 14px
        padding: 3px 0

</style>
