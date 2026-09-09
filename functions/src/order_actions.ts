
import {book_db} from './common.js'
import {COST_LIMIT, COST_LIMIT_ADMIN, cost_limit_in, get_lulu_access_token, submit_order,
    validate_order} from './lulu.js'
import {PRODUCTS, is_product_id} from './products.js'
import type {Order, OrderBooks} from './types.js'


// Most copies of a single book an admin can put in one order (a guard against fat-fingering)
const MAX_BOOK_QUANTITY = 10


// What an admin can do to an order from the dashboard
export type OrderAction = 'manual'|'lulu'|'cancel'|'delete'|'restore'


// Warn the admin when a price is past what a customer would have been allowed to spend
// NOTE Admins can go up to COST_LIMIT_ADMIN, but should still know when a price is unusual
function cost_warning(cost:number, currency:string):string{
    const limit = cost_limit_in(currency, COST_LIMIT)
    if (cost <= limit){
        return ''
    }
    return `${cost} ${currency} is above the usual ${Math.round(limit)} ${currency} limit`
}


// Load an order that is still awaiting action (returns a string if it can't be actioned)
// NOTE Access is already checked by the caller, so there's no signature to verify here
async function load_actionable_order(order_id:string):Promise<string|{order:Order}>{

    if (!order_id){
        return "No order was given"
    }

    const order = await book_db.collection('book_orders').doc(order_id).get()
    if (!order.exists){
        return "This order no longer exists"
    }

    const order_data = order.data() as Order
    if (order_data.state.status !== 'new'){
        return `This order has already been actioned (${order_data.state.status})`
    }

    return {order: order_data}
}


// Ask Lulu what it would cost to print and post an order (or a user-facing error string)
export async function get_order_lulu_cost(order_id:string)
        :Promise<{cost:number, currency:string, warning:string}|{error:string}>{

    const result = await load_actionable_order(order_id)
    if (typeof result === 'string'){
        return {error: result}
    }

    const access_token = await get_lulu_access_token()
    if (!access_token){
        return {error: "Couldn't connect to Lulu, please try again"}
    }

    const validation = await validate_order(access_token, result.order, COST_LIMIT_ADMIN)
    if (typeof validation === 'string'){
        return {error: validation}
    }
    return {...validation, warning: cost_warning(validation.cost, validation.currency)}
}


// Carry out an action on a new order, returning the new status or a user-facing error
export async function perform_order_action(order_id:string, action:OrderAction)
        :Promise<{status:string}|{error:string}>{

    if (!order_id){
        return {error: "No order was given"}
    }
    const order_ref = book_db.collection('book_orders').doc(order_id)

    // Deleting drops the record entirely, and is allowed whatever state the order is in
    if (action === 'delete'){
        if (!(await order_ref.get()).exists){
            return {error: "This order no longer exists"}
        }
        await order_ref.delete()
        return {status: 'deleted'}
    }

    // Restoring puts a rejected order back to "new" so it can be actioned again
    if (action === 'restore'){
        const existing = await order_ref.get()
        if (!existing.exists){
            return {error: "This order no longer exists"}
        }
        if ((existing.data() as Order).state.status !== 'cancelled'){
            return {error: "Only a rejected order can be restored"}
        }
        await order_ref.update({
            'state.status': 'new',
            'state.confirmed_at': null,
        })
        return {status: 'new'}
    }

    const result = await load_actionable_order(order_id)
    if (typeof result === 'string'){
        return {error: result}
    }
    const order = result.order

    // Declining an order records it, rather than leaving it as new forever
    if (action === 'cancel'){
        await order_ref.update({
            'state.status': 'cancelled',
            'state.confirmed_at': new Date(),
        })
        return {status: 'cancelled'}
    }

    // The admin has chosen to fulfil this one by hand (e.g. via Amazon)
    if (action === 'manual'){
        await order_ref.update({
            'state.status': 'sent_manually',
            'state.confirmed_at': new Date(),
        })
        return {status: 'sent_manually'}
    }

    // Otherwise send it to Lulu for print on demand
    const access_token = await get_lulu_access_token()
    if (!access_token){
        return {error: "Couldn't connect to Lulu, please try again"}
    }

    // Double check the order is still valid and not too expensive
    const validation = await validate_order(access_token, order, COST_LIMIT_ADMIN)
    if (typeof validation === 'string'){
        return {error: validation}
    }

    const lulu_id = await submit_order(access_token, order_id, order)
    if (typeof lulu_id === 'string'){
        return {error: lulu_id}
    }

    // NOTE cost and shipping dates are not available straight away (at least in sandbox)
    await order_ref.update({
        'state.status': 'sent_lulu',
        'state.confirmed_at': new Date(),
        'state.lulu_id': lulu_id,
    })
    return {status: 'sent_lulu'}
}


// Turn submitted {id: quantity} data into a validated OrderBooks map (or a user-facing error)
function parse_order_books(value:unknown):string|OrderBooks{

    if (typeof value !== 'object' || value === null || Array.isArray(value)){
        return "No books were given"
    }

    // Keep only positive quantities, rejecting unknown books or nonsense numbers
    const books:OrderBooks = {}
    for (const [id, raw_quantity] of Object.entries(value as Record<string, unknown>)){
        if (!is_product_id(id) || !PRODUCTS[id].enabled){
            return "That book is not available"
        }
        const quantity = typeof raw_quantity === 'number' ? raw_quantity : Number(raw_quantity)
        if (!Number.isInteger(quantity) || quantity < 0){
            return "Invalid book quantity"
        }
        if (quantity > MAX_BOOK_QUANTITY){
            return `Limited to ${MAX_BOOK_QUANTITY} copies of each book`
        }
        if (quantity > 0){
            books[id] = {quantity}
        }
    }

    // The order must still contain at least one copy of at least one book
    if (!Object.keys(books).length){
        return "An order must keep at least one book"
    }

    return books
}


// Replace the books on a new order, re-checking the print price with Lulu
export async function set_order_books(order_id:string, books_input:unknown)
        :Promise<{status:string, warning:string}|{error:string}>{

    const books = parse_order_books(books_input)
    if (typeof books === 'string'){
        return {error: books}
    }

    const result = await load_actionable_order(order_id)
    if (typeof result === 'string'){
        return {error: result}
    }

    // Price the new selection before saving anything, so a bad edit changes nothing
    const access_token = await get_lulu_access_token()
    if (!access_token){
        return {error: "Couldn't connect to Lulu, please try again"}
    }
    const validation = await validate_order(access_token, {...result.order, books},
        COST_LIMIT_ADMIN)
    if (typeof validation === 'string'){
        return {error: validation}
    }

    await book_db.collection('book_orders').doc(order_id).update({
        books,
        'state.cost': validation.cost,
        'state.currency': validation.currency,
    })
    return {status: 'new', warning: cost_warning(validation.cost, validation.currency)}
}
