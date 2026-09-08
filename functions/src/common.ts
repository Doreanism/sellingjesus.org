
import {initializeApp} from 'firebase-admin/app'
import {getFirestore} from 'firebase-admin/firestore'


// Init firebase
export const fire_app = initializeApp()


// Orders get their own database so they stay isolated from any other data
export const book_db = getFirestore(fire_app, 'book-orders')


// CORS allowed domains
export const allowed_domains = [
    'https://sellingjesus.org',
]


// Escape text so it is safe to embed in HTML
export function escape_html(value:string):string{
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
}


// Turnstile token validation
export async function validate_turnstile(ip:string, token:string, secret:string):Promise<boolean>{

    // Gather data to submit
    const verify_form = new FormData()
    verify_form.append('secret', secret)
    verify_form.append('remoteip', ip)
    verify_form.append('response', token)

    // Submit data
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        body: verify_form,
        method: 'POST',
    })

    // Return success
    const outcome = await result.json() as {success:boolean, 'error-codes':string[]}
    if (!outcome.success){
        console.error(outcome['error-codes'].join(', '))
    }
    return !!outcome.success
}
