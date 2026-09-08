
import {TURNSTILE_SECRET} from './config.js'
import {book_db, validate_turnstile} from './common.js'
import {estimate_delivery, get_lulu_access_token, validate_order} from './lulu.js'
import {PRODUCTS, is_product_id} from './products.js'
import {notify_order} from './notify.js'
import type {ProductId} from './products.js'
import type {Order, OrderBooks, OrderSummary} from './types.js'
import region_data from './data/regions.json' with {type: 'json'}


// Read a submitted text field, treating anything missing or non-text as empty
// NOTE String(undefined) would give "undefined", which would pass the required field check
function get_string(body:Record<string, unknown>, key:string):string{
    const value = body[key]
    return typeof value === 'string' ? value.trim() : ''
}


// Extract the requested books from submitted data (returns a string if invalid)
function parse_books(value:unknown):string|OrderBooks{

    if (!Array.isArray(value) || !value.length){
        return "No book was selected"
    }

    const books:OrderBooks = {}
    for (const item of value){
        const id = String(item)
        if (!is_product_id(id) || !PRODUCTS[id].enabled){
            return "That book is not available"
        }
        if (books[id]){
            return "The same book was requested twice"
        }
        // Quantity is fixed, as the page directs bulk requests to the contact form
        books[id] = {quantity: 1}
    }
    return books
}


// Record a new order, returning an error message for the user, or null for success
export async function record_order(body:Record<string, unknown>, ip:string)
        :Promise<string|null>{

    // Ensure input types correct
    const name = get_string(body, 'name')
    const email = get_string(body, 'email').toLowerCase()  // Lower for easier unique checking
    const address_country = get_string(body, 'address_country')
    const address_city = get_string(body, 'address_city')
    const address_postcode = get_string(body, 'address_postcode')
    const address_street1 = get_string(body, 'address_street1')
    const address_phone = get_string(body, 'address_phone')
    const address_state = get_string(body, 'address_state')
    const address_street2 = get_string(body, 'address_street2')
    const address_tax_id = get_string(body, 'address_tax_id')

    // Ensure have required fields
    const required = [
        name,
        email,
        address_country,
        address_city,
        address_postcode,
        address_street1,
        address_phone,
    ]
    for (const value of required){
        if (!value){
            return "Required field is empty"  // Browser UI shows which one
        }
    }

    // Validate the books requested
    const books = parse_books(body['products'])
    if (typeof books === 'string'){
        return books
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+$/.test(email)){
        return "Invalid email address"
    }

    // Validate phone (Lulu's regex)
    if (! /^\+?[\d\s\-.\/()]{8,20}$/.test(address_phone)){
        return "Invalid phone number"
    }

    // Validate country
    const country_match = region_data.find(c => c.code === address_country)
    if (!country_match){
        return "Invalid country"
    }
    // If data includes regions then expected to match one of them
    if (country_match.regions.length && !country_match.regions.find(r => r.code === address_state)){
        return "Invalid state/province"
    }

    // Basic spam prevention (drop orders from same ip if exceed limit)
    const num_from_ip = await book_db.collection('book_orders').where('ip', '==', ip).count().get()
    const ip_total = num_from_ip.data().count
    if (ip_total > 6){
        return "You have submitted too many orders"
    }

    // Prepare data to be saved
    const order_data:Order = {

        datetime: new Date(),
        ip,

        name,
        email,

        books,

        address: {
            country: address_country,
            city: address_city,
            postcode: address_postcode,
            street1: address_street1,
            phone: address_phone,

            state: address_state,
            street2: address_street2,
            tax_id: address_tax_id,
        },

        state: {
            status: 'new',
            confirmed_at: null,
            lulu_id: null,
            cost: 0,
            currency: '',
        },
    }

    // Validate with Lulu so requestor can fix anything missing themselves
    const access_token = await get_lulu_access_token()
    if (!access_token){
        return "Couldn't connect, please try again"
    }
    const validation = await validate_order(access_token, order_data)
    if (typeof validation === 'string'){
        return validation
    }
    order_data.state.cost = validation.cost
    order_data.state.currency = validation.currency

    // Check turnstile token last of all checks, as will invalidate it once used
    // If checked earlier and some other problem, then user would have to redo each time
    if (! await validate_turnstile(ip, get_string(body, 'turnstile'), TURNSTILE_SECRET.value())){
        // WARN "human" string is looked for in form UI, so don't remove
        return "Not sure if you're human (please try again or email us)"
    }

    // Add new record to db
    const record = await book_db.collection('book_orders').add(order_data)

    // Tell whoever fulfils this region
    await notify_order(record.id, order_data)

    // Return no error for success
    return null
}


// Every order, newest first, flattened to JSON-safe values for the dashboard
export async function list_orders():Promise<OrderSummary[]>{

    const snapshot = await book_db.collection('book_orders').orderBy('datetime', 'desc').get()

    return snapshot.docs.map(doc => {
        const order = doc.data() as Order

        // Books are stored as an id->options map, but the dashboard wants a titled list
        const books = Object.entries(order.books).map(([id, options]) => ({
            id,
            title: PRODUCTS[id as ProductId].title,
            quantity: options.quantity,
        }))

        return {
            id: doc.id,
            datetime: to_iso(order.datetime),
            ip: order.ip,
            name: order.name,
            email: order.email,
            books,
            country: order.address.country,
            city: order.address.city,
            postcode: order.address.postcode,
            street1: order.address.street1,
            street2: order.address.street2,
            phone: order.address.phone,
            region: order.address.state,
            tax_id: order.address.tax_id,
            status: order.state.status,
            confirmed_at: order.state.confirmed_at ? to_iso(order.state.confirmed_at) : null,
            lulu_id: order.state.lulu_id,
            cost: order.state.cost,
            currency: order.state.currency,
        }
    })
}


// Firestore returns Timestamp objects for date fields, so normalise to an ISO string
function to_iso(value:unknown):string{
    if (value instanceof Date){
        return value.toISOString()
    }
    return (value as {toDate():Date}).toDate().toISOString()
}


// Estimate how long delivery will take for the given books and country
export async function estimate_order_delivery(country:string, products:string)
        :Promise<{error?:string, max_delivery_date?:string|null}>{

    // Every book affects the weight, so all of them are needed
    const book_ids:ProductId[] = []
    for (const id of products.split(',').map(value => value.trim()).filter(value => value)){
        if (!is_product_id(id)){
            return {error: "Unknown book"}
        }
        book_ids.push(id)
    }
    if (!book_ids.length){
        return {error: "No book given"}
    }

    // Estimates barely change day to day, so avoid asking Lulu again if already known
    const cache_key = `${country}:${book_ids.slice().sort().join(',')}`
    const cached = estimate_cache.get(cache_key)
    if (cached && cached.expires > Date.now()){
        return {max_delivery_date: cached.max_delivery_date}
    }

    const access_token = await get_lulu_access_token()
    if (!access_token){
        return {error: "Couldn't get access token"}
    }
    const result = await estimate_delivery(access_token, book_ids, country)

    // Only cache successful results
    if (!result.error){
        estimate_cache.set(cache_key, {
            max_delivery_date: result.max_delivery_date ?? null,
            expires: Date.now() + CACHE_LIFETIME,
        })
    }
    return result
}


// Cache of delivery estimates, kept per instance since it is only an optimisation
const CACHE_LIFETIME = 1000 * 60 * 60 * 24  // A day
const estimate_cache = new Map<string, {max_delivery_date:string|null, expires:number}>()
