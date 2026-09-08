
import {
    DEV, DISCORD_WEBHOOK_AU, DISCORD_WEBHOOK_DEV, DISCORD_WEBHOOK_OTHER, DISCORD_WEBHOOK_PH,
    DISCORD_WEBHOOK_US, ORDERS_EMAIL_FROM, ORDERS_EMAIL_TO, RESEND_API_KEY,
} from './config.js'
import {PRODUCTS} from './products.js'
import type {ProductId} from './products.js'
import type {Order} from './types.js'


// A place an order notification can be sent
// NOTE Webhooks are functions so secrets aren't accessed until actually needed
type Channel = {kind:'discord', webhook:() => string} | {kind:'email', to:string}


// Who gets told about an order, based on who fulfils that region
function channels_for(country:string):Channel[]{

    // Never message real channels while developing
    if (DEV){
        return [{kind: 'discord', webhook: () => DISCORD_WEBHOOK_DEV.value()}]
    }

    // US is fulfilled by someone who works from email, but still gets posted to Discord too
    if (country === 'US'){
        return [
            {kind: 'discord', webhook: () => DISCORD_WEBHOOK_US.value()},
            {kind: 'email', to: ORDERS_EMAIL_TO.value()},
        ]
    }
    if (country === 'AU'){
        return [{kind: 'discord', webhook: () => DISCORD_WEBHOOK_AU.value()}]
    }
    if (country === 'PH'){
        return [{kind: 'discord', webhook: () => DISCORD_WEBHOOK_PH.value()}]
    }
    return [{kind: 'discord', webhook: () => DISCORD_WEBHOOK_OTHER.value()}]
}


// Format an order for a human, laid out for easy copy-pasting into Amazon
function format_order(order:Order, confirm_url:string, previous_orders:number):string{
    const books = Object.entries(order.books)
        .map(([id, options]) => `${PRODUCTS[id as ProductId].title} x${options.quantity}`)
        .join(', ')
    return [
        `Books: ${books}`,
        `Country: ${order.address.country}`,
        `Name: ${order.name}`,
        `Phone: ${order.address.phone}`,
        `Address line 1: ${order.address.street1}`,
        `Address line 2: ${order.address.street2}`,
        `Postcode: ${order.address.postcode}`,
        `City/Suburb: ${order.address.city}`,
        `State: ${order.address.state}`,
        '',
        `Email: ${order.email}`,
        `IP: ${order.ip} (${previous_orders} previous orders)`,
        `Tax ID: ${order.address.tax_id}`,
        `Lulu cost: ${order.state.cost} ${order.state.currency}`,
        '',
        `Confirm: ${confirm_url}`,
    ].join('\n')
}


// Post a message to a Discord channel
async function post_discord(webhook:string, message:string):Promise<void>{
    const resp = await fetch(webhook, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({content: message}),
    })
    if (!resp.ok){
        throw new Error(`Discord webhook failed: ${resp.status} ${resp.statusText}`)
    }
}


// Send an email via Resend
// NOTE Plain text, since HTML would ruin the copy-pasting the message body is formatted for
async function send_email(to:string, subject:string, message:string):Promise<void>{
    const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + RESEND_API_KEY.value(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: ORDERS_EMAIL_FROM.value(),
            to: [to],
            subject,
            text: message,
        }),
    })
    if (!resp.ok){
        throw new Error(`Resend failed: ${resp.status} ${resp.statusText}`)
    }
}


// Tell whoever fulfils this order's region about it
export async function notify_order(order:Order, confirm_url:string, previous_orders:number)
        :Promise<void>{

    const message = format_order(order, confirm_url, previous_orders)
    const subject = `Book order (${order.address.country}) — ${order.name}`

    // Send to each channel independently, so one failing doesn't prevent the others
    for (const channel of channels_for(order.address.country)){
        try {
            if (channel.kind === 'discord'){
                await post_discord(channel.webhook(), message)
            } else {
                await send_email(channel.to, subject, message)
            }
        } catch (caught){
            // The order is still recorded, so log and carry on
            console.error(caught)
        }
    }
}
