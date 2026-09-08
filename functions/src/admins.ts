
import {book_db} from './common.js'
import {SUPER_ADMIN} from './config.js'


// The people allowed into the orders dashboard, and which countries each wants emailed to them
// NOTE Country preferences only affect email notifications; every admin sees every order

// Either every country, or a list of ISO country codes an admin wants notifications for
type NotifyPref = 'all'|string[]


// A person with dashboard access
export interface Admin {
    email:string
    notify:NotifyPref
}


// An admin plus whether they're the protected super admin, as sent to the dashboard
export interface AdminRow extends Admin {
    is_super:boolean
}


// Admins live alongside the orders, keyed by their lowercased email so there are no duplicates
const admins_col = book_db.collection('admins')


// Trim and lowercase an email so it compares cleanly and works as a document id
function normalise_email(email:string):string{
    return email.trim().toLowerCase()
}


// The configured super admin's email, or '' when none is set
function super_email():string{
    return normalise_email(SUPER_ADMIN.value())
}


// Make sure the super admin always has a record, so the dashboard can never be locked out
async function ensure_super_admin():Promise<void>{
    const email = super_email()
    if (!email){
        return
    }
    const ref = admins_col.doc(email)
    if (!(await ref.get()).exists){
        await ref.set({email, notify: 'all'})
    }
}


// Every admin, with the super admin guaranteed present and flagged
export async function list_admins():Promise<AdminRow[]>{
    await ensure_super_admin()
    const su = super_email()
    const snapshot = await admins_col.get()
    return snapshot.docs
        .map(doc => doc.data() as Admin)
        .map(admin => ({email: admin.email, notify: admin.notify, is_super: admin.email === su}))
        .sort((a, b) => a.email.localeCompare(b.email))
}


// Whether an email address belongs to an admin (compared case-insensitively)
export async function is_admin(email:string):Promise<boolean>{
    const lower = normalise_email(email)
    if (lower && lower === super_email()){
        await ensure_super_admin()
        return true
    }
    return (await admins_col.doc(lower).get()).exists
}


// Admin emails that should be notified about an order going to the given country
export async function admins_to_notify(country:string):Promise<string[]>{
    const admins = await list_admins()
    return admins
        .filter(admin => admin.notify === 'all' || admin.notify.includes(country))
        .map(admin => admin.email)
}


// Add a new admin, returning a user-facing error string if it can't
export async function add_admin(email:string, notify:unknown):Promise<string|null>{
    const lower = normalise_email(email)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower)){
        return "That doesn't look like an email address"
    }
    const ref = admins_col.doc(lower)
    if ((await ref.get()).exists){
        return "That person is already an admin"
    }
    await ref.set({email: lower, notify: clean_notify(notify)})
    return null
}


// Remove an admin, refusing to remove the protected super admin
export async function remove_admin(email:string):Promise<string|null>{
    const lower = normalise_email(email)
    if (!lower){
        return "No admin was given"
    }
    if (lower === super_email()){
        return "The super admin can't be removed"
    }
    await admins_col.doc(lower).delete()
    return null
}


// Change which countries an admin is notified about
export async function set_admin_notify(email:string, notify:unknown):Promise<string|null>{
    const lower = normalise_email(email)
    if (!lower){
        return "No admin was given"
    }
    const ref = admins_col.doc(lower)
    if (!(await ref.get()).exists){
        return "That admin no longer exists"
    }
    await ref.update({notify: clean_notify(notify)})
    return null
}


// Coerce a notify value from the client into 'all' or a tidy list of ISO country codes
function clean_notify(notify:unknown):NotifyPref{
    if (!Array.isArray(notify)){
        return 'all'
    }
    return [...new Set(notify
        .filter((code):code is string => typeof code === 'string')
        .map(code => code.trim().toUpperCase())
        .filter(code => /^[A-Z]{2}$/.test(code)))]
}
