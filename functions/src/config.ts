
import {defineString, defineSecret} from 'firebase-functions/params'


// Whether running under the emulator, which also means talking to Lulu's sandbox
export const DEV = !!process.env['FUNCTIONS_EMULATOR']


// Secrets (stored in Secret Manager)
export const TURNSTILE_SECRET = defineSecret('TURNSTILE_SECRET')
export const LULU_AUTH_PROD = defineSecret('LULU_AUTH_PROD')
export const RESEND_API_KEY = defineSecret('RESEND_API_KEY')


// Params (stored in functions/.env, either non-sensitive or only used during development)
export const LULU_AUTH_SANDBOX = defineString('LULU_AUTH_SANDBOX')

// Contact email Lulu prints on each order and uses to reach us about print jobs
export const LULU_CONTACT_EMAIL = defineString('LULU_CONTACT_EMAIL')

// Verified Resend sender address that admin order notifications are sent from
export const NOTIFY_EMAIL_FROM = defineString('NOTIFY_EMAIL_FROM')

// OAuth client id for the dashboard's Google sign-in (public, not a secret)
export const GOOGLE_CLIENT_ID = defineString('GOOGLE_CLIENT_ID')

// The one admin that can always sign in and can never be removed (kept in .env, so out of git)
export const SUPER_ADMIN = defineString('SUPER_ADMIN')


// Every secret the single api function needs access to
export const ALL_SECRETS = [
    TURNSTILE_SECRET,
    LULU_AUTH_PROD,
    RESEND_API_KEY,
]
