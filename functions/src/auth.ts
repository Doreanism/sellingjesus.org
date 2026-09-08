
import {OAuth2Client} from 'google-auth-library'
import type {LoginTicket} from 'google-auth-library'
import type {Request} from 'firebase-functions/v2/https'

import {GOOGLE_CLIENT_ID} from './config.js'
import {is_admin} from './admins.js'


// Raised when a request isn't from a signed-in admin, carrying the status to respond with
export class AuthError extends Error {
    status:number
    constructor(status:number, message:string){
        super(message)
        this.status = status
    }
}


// Reused across invocations; holds no per-request state
const oauth_client = new OAuth2Client()


// Verify the request carries a Google id token for one of the admins, returning their
// email. Throws an AuthError (401/403) otherwise.
export async function require_admin(request:Request):Promise<string>{

    // Pull the bearer token out of the Authorization header
    const token = (request.get('authorization') ?? '').match(/^Bearer (.+)$/)?.[1]
    if (!token){
        throw new AuthError(401, "Sign in required")
    }

    // Check the token really was issued by Google for our client id
    let email:string|undefined
    let verified:boolean|undefined
    try {
        const ticket:LoginTicket = await oauth_client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID.value(),
        })
        const payload = ticket.getPayload()
        email = payload?.email
        verified = payload?.email_verified
    } catch {
        // An expired or malformed token is a normal thing to see, so don't log it
        throw new AuthError(401, "Sign in has expired, please sign in again")
    }

    // Only a verified email belonging to an admin gets in
    if (!email || !verified || !(await is_admin(email))){
        throw new AuthError(403, "That account is not allowed to view orders")
    }
    return email
}
