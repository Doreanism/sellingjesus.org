
import {createHmac, timingSafeEqual} from 'node:crypto'

import {SESSION_SECRET} from './config.js'


// How long a dashboard session lasts before a fresh Google sign-in is needed
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000  // 30 days

// Leads every token we issue, so ours are never mistaken for a Google id token
const PREFIX = 'sj1'


// Base64url (no padding) in both directions
function b64url_encode(text:string):string{
    return Buffer.from(text, 'utf8').toString('base64url')
}
function b64url_decode(text:string):string{
    return Buffer.from(text, 'base64url').toString('utf8')
}

// HMAC-SHA256 of the token body, as base64url
function sign(body:string):string{
    return createHmac('sha256', SESSION_SECRET.value()).update(body).digest('base64url')
}


// Mint a session token for an admin email, valid for SESSION_LIFETIME_MS
export function create_session_token(email:string):{token:string, expires:number}{
    const expires = Date.now() + SESSION_LIFETIME_MS
    const body = `${PREFIX}.${b64url_encode(JSON.stringify({email, exp: expires}))}`
    return {token: `${body}.${sign(body)}`, expires}
}


// Whether a bearer string is one of our session tokens (rather than a Google id token)
export function is_session_token(token:string):boolean{
    return token.startsWith(`${PREFIX}.`)
}


// Check a session token's signature and expiry, returning the email or null
export function verify_session_token(token:string):string|null{

    const [prefix, payload_b64, sig] = token.split('.')
    if (prefix !== PREFIX || !payload_b64 || !sig){
        return null
    }
    const body = `${prefix}.${payload_b64}`

    // Constant-time signature check, bailing out first if the lengths differ
    const expected = Buffer.from(sign(body))
    const given = Buffer.from(sig)
    if (expected.length !== given.length || !timingSafeEqual(expected, given)){
        return null
    }

    // Signature is good, so the payload can be trusted
    try {
        const payload = JSON.parse(b64url_decode(payload_b64)) as {email?:string, exp?:number}
        if (!payload.email || typeof payload.exp !== 'number' || payload.exp < Date.now()){
            return null
        }
        return payload.email
    } catch {
        return null
    }
}
