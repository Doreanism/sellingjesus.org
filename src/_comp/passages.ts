
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
    "Exo 30:13": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Lev 2:1-3": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Lev 7:33-35": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Lev 10:10": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Lev 24:8-9": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Lev 27:30-33": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Num 18:11": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Num 18:20": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Num 18:21": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Num 18:24": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Num 18:31": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Num 24:13": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Deut 14:24-26": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Deut 14:27": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Deut 14:28-29": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Deut 16:17-20": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Deut 18:1-5": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Deut 23:18": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Sam 2:15-17": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Sam 15:22": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 King 4:8-10": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 King 5:15-16": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 King 5:20": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 King 5:26-27": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Psalm 34:10": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Prov 11:24": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Prov 11:25-26": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Prov 22:9": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Prov 23:23": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Prov 25:14": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Prov 28:21": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Prov 28:27": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Ecc 2:26": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Ecc 11:1": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Isa 5:20": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Isa 55:1": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Jer 7:11": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Ezek 22:26": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Ezek 44:23": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Micah 1:7": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Micah 3:11": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Zech 11:4-5": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Zech 11:12-13": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Zech 14:21": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Mal 3:8-10": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 5:48": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 6:2": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 6:24": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 6:31-33": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 7:15": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 9:37-38": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 10:7-8": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 10:9-10": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 10:11-14": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 15:3-6": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 17:25-27": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 21:12-13": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 27:3": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Matt 27:6-9": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Mark 6:7-11": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Mark 10:22": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Mark 11:15-17": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Luke 6:29-30": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Luke 8:1-3": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Luke 9:1-5": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Luke 10:2-7": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Luke 12:42-44": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Luke 16:13": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Luke 17:10": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Luke 19:45-46": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Luke 20:46-47": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Luke 22:35-36": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "John 2:14-16": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "John 4:23-24": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "John 7:37": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "John 10:11-13": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "John 12:4-6": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Acts 2:44-45": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Acts 4:32-35": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Acts 5:2-3": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Acts 8:18-21": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Acts 16:14-15": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Acts 18:1-5": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Acts 19:25": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Acts 20:33-35": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Rom 12:13": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Rom 15:24": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Rom 15:25-29": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Rom 16:2": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Rom 16:18": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Rom 16:23": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 2:12-13": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 4:1-2": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 4:7": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 4:11-12": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 6:1-7": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 6:12-15": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 8:9": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 9:12": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 9:13-14": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 9:15": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 9:17-18": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 10:23": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 11:1": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 12:7": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 16:1-2": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 16:6": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Cor 16:10-11": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Cor 1:16": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Cor 2:17": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Cor 5:10": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Cor 9:6": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Cor 9:7": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Cor 9:11-12": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Cor 11:7-10": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Cor 12:13-17": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Gal 6:6": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Phil 1:17-18": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Phil 3:19": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Phil 4:10-14": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Phil 4:15-18": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Thes 2:3-5": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Thes 2:9": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Thes 3:6-10": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Tim 3:1-3": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Tim 3:8": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Tim 5:17-18": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Tim 6:3-8": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Tim 6:10": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Tim 2:9": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Tim 3:2": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Tim 3:5": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Tim 3:8": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Titus 1:7": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Titus 1:10-11": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Titus 3:13": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Heb 6:10": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "James 2:1-4": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "James 2:5": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "James 2:8-11": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "James 3:1": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Pet 4:10-11": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "1 Pet 5:2": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Pet 2:2-3": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Pet 2:15": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 Pet 3:16": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "2 John 1:10-11": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "3 John 1:5-8": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "3 John 1:9-10": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Jude 1:11": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Rev 21:6": {
        category: 'other',
        tags: [],
        notes: "",
    },
    "Rev 22:17": {
        category: 'other',
        tags: [],
        notes: "",
    }
}

export const passages:PassageData[] = Object.entries(passages_raw).map(([key, data]) => {
    return {
        ...data,
        key,
        ref: PassageReference.from_string(key)!,
    }
})
