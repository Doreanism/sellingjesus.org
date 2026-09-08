
import {defineString, defineSecret} from 'firebase-functions/params'


// Whether running under the emulator, which also means talking to Lulu's sandbox
export const DEV = !!process.env['FUNCTIONS_EMULATOR']


// Secrets (stored in Secret Manager)
export const TURNSTILE_SECRET = defineSecret('TURNSTILE_SECRET')
export const LULU_AUTH_PROD = defineSecret('LULU_AUTH_PROD')
export const CONFIRM_SECRET = defineSecret('CONFIRM_SECRET')
export const RESEND_API_KEY = defineSecret('RESEND_API_KEY')
export const DISCORD_WEBHOOK_US = defineSecret('DISCORD_WEBHOOK_US')
export const DISCORD_WEBHOOK_AU = defineSecret('DISCORD_WEBHOOK_AU')
export const DISCORD_WEBHOOK_PH = defineSecret('DISCORD_WEBHOOK_PH')
export const DISCORD_WEBHOOK_OTHER = defineSecret('DISCORD_WEBHOOK_OTHER')


// Params (stored in functions/.env, either non-sensitive or only used during development)
export const LULU_AUTH_SANDBOX = defineString('LULU_AUTH_SANDBOX')
export const DISCORD_WEBHOOK_DEV = defineString('DISCORD_WEBHOOK_DEV')
export const ORDERS_EMAIL_TO = defineString('ORDERS_EMAIL_TO')
export const ORDERS_EMAIL_FROM = defineString('ORDERS_EMAIL_FROM')

// Normally left empty, as this function works out its own URL for building confirm links
// Set it only if those links ever come out wrong, e.g. if the hosting URL shape changes
export const API_BASE_URL = defineString('API_BASE_URL', {default: ''})


// Every secret the single api function needs access to
export const ALL_SECRETS = [
    TURNSTILE_SECRET,
    LULU_AUTH_PROD,
    CONFIRM_SECRET,
    RESEND_API_KEY,
    DISCORD_WEBHOOK_US,
    DISCORD_WEBHOOK_AU,
    DISCORD_WEBHOOK_PH,
    DISCORD_WEBHOOK_OTHER,
]
