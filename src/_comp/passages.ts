
import {BibleClient, PassageReference} from '@gracious.tech/fetch-client'


const client = new BibleClient()

export async function get_passage(reference:PassageReference):Promise<string>{
    const collection = await client.fetch_collection()
    const book = await collection.fetch_book('eng_bsb', reference.book)
    return book.get_passage_from_ref(reference, {attribute: false})
}


export const categories = {
    freely_giving: "Freely giving",
    condemnation: "Condemnation of commerce",
    support: "Supporting ministry",
    other: "Other relevant passages",
}

export const tags = {
    // VIP
    vip: "Very Important Passages",
    // Source
    ot: "Old Testament",
    nt: "New Testament",
    jesus: "Jesus",
    paul: "Paul",
    // Theme
    ...categories,
    sincerity: "Sincerity",
    rights: "Rights",
    greed: "Greed",
}


export const tag_groups:(keyof typeof tags)[][] = [
    ['vip'],
    ['ot', 'nt', 'jesus', 'paul'],
    ['freely_giving', 'condemnation', 'support', 'sincerity', 'rights', 'greed'],
]


interface PassageRaw {
    tags: (keyof typeof tags)[]
    category: keyof typeof categories
    notes: string
}

export interface PassageData extends PassageRaw {
    key:string
    ref:PassageReference
}

const passages_raw: Record<string, PassageRaw> = {
    "Matt 10:8": {
        category: 'freely_giving',
        tags: ['freely_giving', 'vip'],
        notes: "Jesus' direct command to the disciples to freely give what they freely received"
    },
    "2 Cor 2:17": {
        category: 'condemnation',
        tags: ['condemnation', 'sincerity'],
        notes: "Paul condemns those who peddle the word of God for profit"
    },
    "1 Cor 9:1-18": {
        category: 'freely_giving',
        tags: ['support', 'rights'],
        notes: "Paul defends his right to support but chooses not to use it to avoid hindering the gospel"
    },
    "Micah 3:11": {
        category: 'condemnation',
        tags: ['condemnation'],
        notes: "Condemnation of leaders who teach for payment while claiming to rely on God"
    },
    "Acts 8:18-20": {
        category: 'condemnation',
        tags: ['condemnation'],
        notes: "Peter rebukes Simon for trying to buy the gift of the Holy Spirit"
    }
}

export const passages:PassageData[] = Object.entries(passages_raw).map(([key, data]) => {
    return {
        ...data,
        key,
        ref: PassageReference.from_string(key)!,
    }
})
