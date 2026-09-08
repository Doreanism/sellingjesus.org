
// A book that can be ordered for free
export interface Product {
    title:string
    // Lulu SKU encoding trim size, colour, paper, binding, and cover finish
    pod_package_id:string
    page_count:number
    // Lulu fetches these by URL at print time, so they must be publicly live
    interior_url:string
    cover_url:string
    // Only enabled books can be ordered
    enabled:boolean
}


export const PRODUCTS = {
    abolish: {
        title: "Abolish the Jesus Trade",
        pod_package_id: '0600X0900.BW.STD.PB.060UC444.MXX',  // 6x9" black/white cream matte paperback
        page_count: 377,
        interior_url: 'https://sellingjesus.org/book/Abolish-the-Jesus-Trade.pdf',
        cover_url:    'https://sellingjesus.org/book/Abolish-cover-lulu.pdf',
        enabled: true,
    },
    bound: {
        title: "God's Word Is Not Bound",
        pod_package_id: '0600X0900.BW.STD.PB.060UC444.MXX',  // Same printing options as abolish
        page_count: 272,
        interior_url: 'https://sellingjesus.org/book_bound/Gods-Word-Is-Not-Bound.pdf',
        cover_url:    'https://sellingjesus.org/book_bound/Gods-Word-Is-Not-Bound-cover-lulu.pdf',
        enabled: true,
    },
} satisfies Record<string, Product>


export type ProductId = keyof typeof PRODUCTS


// Whether the given value is a known product id
export function is_product_id(value:string):value is ProductId{
    return Object.hasOwn(PRODUCTS, value)
}
