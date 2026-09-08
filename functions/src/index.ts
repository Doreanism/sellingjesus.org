
import './options.js'
import 'firebase-functions/logger/compat'

import {onRequest} from 'firebase-functions/v2/https'
import type {HttpsFunction, Request} from 'firebase-functions/v2/https'
import type {Response} from 'express'

import {ALL_SECRETS, API_BASE_URL, DEV} from './config.js'
import {allowed_domains} from './common.js'
import {do_confirm, render_message_page, show_confirm_page} from './confirm.js'
import {estimate_order_delivery, record_order} from './orders.js'


// The base URL of this function, for building links back to it
// NOTE The emulator serves functions under a /<project>/<region>/<name> prefix, prod at the root
function api_base_url(request:Request):string{

    // An explicit override wins, for if the URL shape ever stops matching what's derived below
    const configured = API_BASE_URL.value()
    if (configured){
        return configured.replace(/\/+$/, '')
    }

    const host = request.get('host') ?? 'localhost'
    const url_path = (request.originalUrl.split('?')[0] ?? '').replace(/\/+$/, '')
    const route = request.path.replace(/\/+$/, '')
    const prefix = url_path.slice(0, url_path.length - route.length)
    return `${DEV ? 'http' : 'https'}://${host}${prefix}`
}


// Single endpoint for the whole ordering flow, routed by path
export const api:HttpsFunction = onRequest({
    cors: allowed_domains,
    secrets: ALL_SECRETS,
}, async (request, response) => {

    const route = request.path.replace(/\/+$/, '')

    // Anything unexpected still needs a sensible reply, especially for pages a person is viewing
    try {
        await handle_route(request, response, route)
    } catch (caught){
        console.error(caught)
        if (response.headersSent){
            return
        }
        if (route === '/confirm'){
            send_html(response, render_message_page("Error",
                "Something went wrong. Nothing has been changed, so it's safe to try again."))
        } else {
            response.status(500).send({error: "Something went wrong, please try again"})
        }
    }
})


// Work out which handler a request is for and run it
async function handle_route(request:Request, response:Response, route:string):Promise<void>{

    // Submitting a new order
    if (route === '/order' && request.method === 'POST'){
        const ip = request.ip || 'localhost'  // ip not available in emulator
        const body = request.body as Record<string, unknown>
        const error = await record_order(body, ip, api_base_url(request))
        response.status(200).send({error})
        return
    }

    // Estimating delivery time while filling in the form
    if (route === '/estimate' && request.method === 'GET'){
        const result = await estimate_order_delivery(
            String(request.query['country'] ?? ''),
            String(request.query['products'] ?? ''),
        )
        if (result.error){
            response.status(500).send({error: result.error})
        } else {
            response.status(200).send(result)
        }
        return
    }

    // Opening a confirm link
    // SECURITY Must not change anything, since link scanners will fetch it
    if (route === '/confirm' && request.method === 'GET'){
        const html = await show_confirm_page(
            String(request.query['id'] ?? ''),
            String(request.query['sig'] ?? ''),
        )
        send_html(response, html)
        return
    }

    // Actually confirming or cancelling an order
    if (route === '/confirm' && request.method === 'POST'){
        const body = request.body as Record<string, unknown>
        const html = await do_confirm(
            String(body['id'] ?? ''),
            String(body['sig'] ?? ''),
            String(body['action'] ?? ''),
        )
        send_html(response, html)
        return
    }

    response.status(404).send("Not found")
}


// Send an HTML page that should never be cached or indexed
function send_html(response:Response, html:string):void{
    response.set('Content-Type', 'text/html; charset=utf-8')
    response.set('Cache-Control', 'no-store')
    response.set('X-Robots-Tag', 'noindex')
    response.status(200).send(html)
}
