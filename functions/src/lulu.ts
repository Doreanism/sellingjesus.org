
import {DEV, LULU_AUTH_PROD, LULU_AUTH_SANDBOX, LULU_CONTACT_EMAIL} from './config.js'
import {PRODUCTS} from './products.js'
import type {ProductId} from './products.js'
import type {Order, OrderBooks} from './types.js'


// Use Lulu's sandbox during development so test orders never reach a printer
const SANDBOX = DEV
const LULU_DOMAIN = SANDBOX ? 'https://api.sandbox.lulu.com/' : 'https://api.lulu.com/'

// NOTE Since manually confirming orders anyway, can already delay as long as like so set to 60min
const PRODUCTION_DELAY = 60  // Minimum is 60 minutes to allow cancelling


// Get access token from Lulu (returns null for network errors, which may be worth retrying)
export async function get_lulu_access_token():Promise<string|null>{
    const url = LULU_DOMAIN + 'auth/realms/glasstree/protocol/openid-connect/token'
    const auth_token = SANDBOX ? LULU_AUTH_SANDBOX.value() : LULU_AUTH_PROD.value()
    let resp:Response
    try {
        resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + auth_token,
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
            }),
        })
    } catch (caught){
        console.error(caught)
        return null
    }

    // Extract token from response (throw if fail)
    if (!resp.ok){
        throw new Error(`Failed to get access token (${resp.status} ${resp.statusText})`)
    }
    const data = await resp.json() as {access_token:string}
    return data.access_token
}


// Submit a request to Lulu (returns null for network failure)
export async function lulu_request(token:string, path:string, data:unknown)
        :Promise<Record<string, unknown>|null>{

    // Try send
    const url = LULU_DOMAIN + path
    let resp:Response
    try {
        resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
    } catch {
        return null
    }

    // Throw for issues user can't resolve themselves
    if (!resp.ok && resp.status !== 400){
        throw new Error(`Request to Lulu failed: ${resp.status} ${resp.statusText}`)
    }
    const resp_data = await resp.json() as Record<string, unknown>
    return resp.ok ? resp_data : {error: resp_data}
}


// Turn the books of an order into Lulu line items
// NOTE page_count is required for validation but will cause a 500 error for actual orders
function books_to_line_items(books:OrderBooks, validation:boolean){
    return Object.entries(books).map(([id, options]) => {
        const product = PRODUCTS[id as ProductId]
        return {
            title: product.title,
            quantity: options.quantity,
            external_id: id,
            pod_package_id: product.pod_package_id,
            interior: product.interior_url,
            cover: product.cover_url,
            ...validation ? {page_count: product.page_count} : {},
        }
    })
}


// Generate data for a Lulu request from an order record
function order_to_lulu_request(id:string, order:Order, validation:boolean){
    return {
        external_id: id,
        contact_email: LULU_CONTACT_EMAIL.value(),
        production_delay: PRODUCTION_DELAY,  // Can't cancel once sent to production
        shipping_level: 'MAIL',  // Cheapest option
        line_items: books_to_line_items(order.books, validation),
        shipping_address: {
            name: order.name,
            email: order.email,
            phone_number: order.address.phone,

            street1: order.address.street1,
            street2: order.address.street2,
            city: order.address.city,
            state_code: order.address.state,
            postcode: order.address.postcode,
            country_code: order.address.country,

            recipient_tax_id: order.address.tax_id,
        },
    }
}


// Validate order details and cost, and return a string if a user-resolvable error
export async function validate_order(token:string, order:Order)
        :Promise<string|{cost:number, currency:string}>{

    // Prepare request data (don't need order id for validation)
    const request_data = order_to_lulu_request('', order, true)

    // Check cost (which also validates address)
    const resp_data = await lulu_request(token, 'print-job-cost-calculations/', request_data)
    if (!resp_data){
        return "Could not connect, please try again"
    }

    // See if any issue with provided details
    if ('error' in resp_data){
        return extract_human_error_msg(resp_data['error'] as ErrorResponse)
    }

    // Tell user if order too expensive
    // NOTE Tuned for a single book, which is all the UI ever submits, since each book has its
    //      own page and form. Would need to scale by item count if combined ordering is added.
    const currency = resp_data['currency'] as string  // This should always be account's currency
    let limit = 50  // AUD (high as will manually verify anyway, normally 26 US, 32 AU, 40 PH)
    if (currency === 'USD'){
        limit = limit / 1.5
    }
    const dollars = parseFloat(resp_data['total_cost_incl_tax'] as string)
    if (dollars > limit){
        return `Sorry, it's too expensive to ship to that address (${dollars} ${currency})`
    }

    // Passed validation
    return {cost: dollars, currency}
}


// Submit an order to Lulu for printing (returns the print job id, or a string if error)
export async function submit_order(token:string, id:string, order:Order)
        :Promise<number|string>{

    const request_data = order_to_lulu_request(id, order, false)
    const resp_data = await lulu_request(token, 'print-jobs/', request_data)
    if (!resp_data){
        return "Couldn't connect to Lulu to send order"
    }
    if ('error' in resp_data){
        // Pass on all data since this is for developer viewing
        return JSON.stringify(resp_data, undefined, 4)
    }
    return resp_data['id'] as number
}


// Ask Lulu how long normal mail would take to deliver the given books to a country
export async function estimate_delivery(token:string, book_ids:ProductId[], country:string)
        :Promise<{error?:string, max_delivery_date?:string|null}>{

    // Every book counts towards the weight, so include them all
    const books:OrderBooks = {}
    for (const id of book_ids){
        books[id] = {quantity: 1}
    }

    // Submit request
    const resp_data = await lulu_request(token, 'shipping-options/', {
        line_items: books_to_line_items(books, true),
        shipping_address: {
            country,
        },
    })
    if (!resp_data){
        return {error: "Couldn't connect to Lulu"}
    }
    if ('error' in resp_data){
        // Print to console in case sensitive
        console.error(JSON.stringify(resp_data, undefined, 4))
        return {error: "Internal"}
    }

    // Identify correct shipping method
    const options = resp_data as unknown as {level:string, max_delivery_date:string}[]
    const normal_mail = options.find(option => option.level === 'MAIL')

    // NOTE total days only includes business days, so using dates instead
    return {max_delivery_date: normal_mail?.max_delivery_date ?? null}
}


// Extract human-readable error messages from Lulu error data
function extract_human_error_msg(data:ErrorResponse){
    try {
        return Object.values(data)
            .map(item => item.detail.errors.map(e => e.message))
            .flat()
            .join('\n')
    } catch {
        return JSON.stringify(data)
    }
}


type ErrorResponse = Record<string, {detail: {errors: Array<{message:string}>}}>
// EXAMPLE (noting that first error prop is from this function and not Lulu)
// { "shipping_address": { "detail": { "errors": [ { "code": "INVALID", "path": "postcode", "message": "The format of the Postal Code entered does not match the country you entered. It should look like 1000, 2888, 3585, 3707." } ] } } }
