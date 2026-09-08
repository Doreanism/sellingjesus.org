
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
        status:OrderStatus
        confirmed_at:Date|null
        lulu_id:null|number
        cost:number
        currency:string
    }
}


// The lifecycle of an order
export type OrderStatus = 'new'|'sent_lulu'|'sent_manually'|'cancelled'


// An order flattened to JSON-safe values for the admin dashboard
export interface OrderSummary {
    id:string
    datetime:string  // ISO
    ip:string
    name:string
    email:string
    books:{id:string, title:string, quantity:number}[]
    country:string
    city:string
    postcode:string
    street1:string
    street2:string
    phone:string
    region:string  // State/province, named to avoid clashing with order status
    tax_id:string
    status:OrderStatus
    confirmed_at:string|null  // ISO
    lulu_id:number|null
    cost:number
    currency:string
}
