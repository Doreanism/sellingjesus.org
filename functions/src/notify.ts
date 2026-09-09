
import {DEV, NOTIFY_EMAIL_FROM, RESEND_API_KEY} from './config.js'
import {admins_to_notify} from './admins.js'
import {PRODUCTS} from './products.js'
import type {ProductId} from './products.js'
import type {Order} from './types.js'
import region_data from './data/regions.json' with {type: 'json'}


// Where the dashboard lives, for linking an admin straight to the new order
const DASHBOARD_URL = 'https://sellingjesus.org/orders'


// Turn an ISO country code into its readable name (falling back to the code if unknown)
function country_name(code:string):string{
    return region_data.find(c => c.code === code)?.name ?? code
}


// A short notification with just enough to triage, leaving the rest behind the dashboard link
function format_notification(order:Order, order_id:string):string{
    const books = Object.entries(order.books)
        .map(([id, options]) => `${PRODUCTS[id as ProductId].title} x${options.quantity}`)
        .join(', ')
    return [
        `Books: ${books}`,
        `Country: ${country_name(order.address.country)}`,
        `Name: ${order.name}`,
        '',
        `${DASHBOARD_URL}?id=${order_id}`,
    ].join('\n')
}


// Send an email via Resend
// NOTE Plain text, since the body is formatted for reading rather than HTML
async function send_email(to:string, subject:string, message:string):Promise<void>{
    const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + RESEND_API_KEY.value(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: NOTIFY_EMAIL_FROM.value(),
            to: [to],
            subject,
            text: message,
        }),
    })
    if (!resp.ok){
        throw new Error(`Resend failed: ${resp.status} ${resp.statusText}`)
    }
}


// Email the admins who want to hear about orders to this order's country
export async function notify_order(order_id:string, order:Order):Promise<void>{

    const message = format_notification(order, order_id)
    const subject = `Book order (${country_name(order.address.country)}) — ${order.name}`

    // Never email real people while developing
    if (DEV){
        console.log(`[notify_order]\n${subject}\n${message}`)
        return
    }

    // Send to each admin independently, so one failing doesn't prevent the others
    for (const to of await admins_to_notify(order.address.country)){
        try {
            await send_email(to, subject, message)
        } catch (caught){
            // The order is still recorded, so log and carry on
            console.error(caught)
        }
    }
}
