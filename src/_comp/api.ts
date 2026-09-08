
// Base URL for the ordering API, which is a single function that routes by path
// NOTE The emulator serves functions under a /<project>/<region>/<name> prefix
export const api_url = import.meta.env.DEV
    ? 'http://127.0.0.1:5001/sellingjesus/us-west1/api'
    : 'https://us-west1-sellingjesus.cloudfunctions.net/api'

// Turnstile widget for sellingjesus.org, paired with the TURNSTILE_SECRET the function holds
// Dev uses Cloudflare's always-passes test key, so local work needs no real credentials
export const turnstile_sitekey = import.meta.env.DEV
    ? '1x00000000000000000000AA'
    : '0x4AAAAAAErj2_LTvyVUUn0B'
