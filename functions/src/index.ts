
import './options.js'
import 'firebase-functions/logger/compat'

import {onRequest} from 'firebase-functions/v2/https'
import type {HttpsFunction, Request} from 'firebase-functions/v2/https'
import type {Response} from 'express'

import {ALL_SECRETS} from './config.js'
import {allowed_domains} from './common.js'
import {AuthError, require_admin} from './auth.js'
import {add_admin, list_admins, remove_admin, set_admin_notify} from './admins.js'
import {create_session_token} from './session.js'
import {get_order_lulu_cost, perform_order_action} from './order_actions.js'
import type {OrderAction} from './order_actions.js'
import {estimate_order_delivery, list_orders, record_order} from './orders.js'


// Single endpoint for the whole ordering flow, routed by path
export const api:HttpsFunction = onRequest({
    cors: allowed_domains,
    secrets: ALL_SECRETS,
}, async (request, response) => {

    const route = request.path.replace(/\/+$/, '')

    // Anything unexpected still needs a sensible reply
    try {
        await handle_route(request, response, route)
    } catch (caught){
        // A failed admin check is expected, so respond with its status rather than logging
        if (caught instanceof AuthError){
            if (!response.headersSent){
                response.status(caught.status).send({error: caught.message})
            }
            return
        }
        console.error(caught)
        if (!response.headersSent){
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
        const error = await record_order(body, ip)
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

    // Admin dashboard: trade a Google sign-in (or a still-valid session) for a fresh
    // session token, so the dashboard stays signed in for weeks rather than an hour
    if (route === '/admin/session' && request.method === 'POST'){
        const email = await require_admin(request)
        response.status(200).send({email, ...create_session_token(email)})
        return
    }

    // Admin dashboard: list every order
    if (route === '/admin/orders' && request.method === 'GET'){
        await require_admin(request)
        response.status(200).send({orders: await list_orders()})
        return
    }

    // Admin dashboard: what Lulu would charge to fulfil an order
    if (route === '/admin/orders/lulu-cost' && request.method === 'POST'){
        await require_admin(request)
        const body = request.body as Record<string, unknown>
        response.status(200).send(await get_order_lulu_cost(String(body['id'] ?? '')))
        return
    }

    // Admin dashboard: act on an order
    if (route === '/admin/orders/action' && request.method === 'POST'){
        await require_admin(request)
        const body = request.body as Record<string, unknown>
        const action = String(body['action'] ?? '')
        if (action !== 'manual' && action !== 'lulu' && action !== 'cancel'
                && action !== 'delete' && action !== 'restore'){
            response.status(400).send({error: "Unknown action"})
            return
        }
        const result = await perform_order_action(String(body['id'] ?? ''), action as OrderAction)
        response.status(200).send(result)
        return
    }

    // Admin dashboard: list the admins
    if (route === '/admin/admins' && request.method === 'GET'){
        await require_admin(request)
        response.status(200).send({admins: await list_admins()})
        return
    }

    // Admin dashboard: add or remove an admin, or change their notify countries
    if (route === '/admin/admins/action' && request.method === 'POST'){
        await require_admin(request)
        const body = request.body as Record<string, unknown>
        const action = String(body['action'] ?? '')
        const email = String(body['email'] ?? '')

        // Run whichever change was asked for, collecting any user-facing error
        let error:string|null
        if (action === 'add'){
            error = await add_admin(email, body['notify'])
        } else if (action === 'remove'){
            error = await remove_admin(email)
        } else if (action === 'notify'){
            error = await set_admin_notify(email, body['notify'])
        } else {
            response.status(400).send({error: "Unknown action"})
            return
        }

        // Hand back the refreshed list so the dashboard can just replace its state
        if (error){
            response.status(200).send({error})
        } else {
            response.status(200).send({admins: await list_admins()})
        }
        return
    }

    response.status(404).send("Not found")
}
