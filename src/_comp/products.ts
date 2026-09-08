
// The books that can be ordered
// WARN Keep in sync with functions/src/products.ts, which is the authority on printing details
// NOTE Kept as a separate copy since the site and the functions are built by different toolchains

export interface Product {
    title:string
    enabled:boolean
}


export const PRODUCTS = {
    abolish: {
        title: "Abolish the Jesus Trade",
        enabled: true,
    },
    bound: {
        title: "God's Word Is Not Bound",
        enabled: true,
    },
} satisfies Record<string, Product>


export type ProductId = keyof typeof PRODUCTS
