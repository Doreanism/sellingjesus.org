
import type {ProductId} from './products.js'


// Which books were requested and how many of each
export type OrderBooks = Partial<Record<ProductId, {quantity:number}>>


// A request for free copies of one or more books
export interface Order {

    // Auto-set
    datetime:Date
    ip:string

    // Contact
    name:string  // Required by Lulu
    email:string  // Required by Lulu

    // Order
    books:OrderBooks
    address:{
        // Required by Lulu
        country:string
        city:string
        postcode:string
        street1:string
        phone:string
        // Optional
        state:string
        street2:string
        tax_id:string
    }

    // State
    state:{
        status:'new'|'sent_lulu'|'sent_manually'|'cancelled'
        confirmed_at:Date|null
        lulu_id:null|number
        cost:number
        currency:string
    }
}
