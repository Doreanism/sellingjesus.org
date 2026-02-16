
import {BibleClient, PassageReference} from '@gracious.tech/fetch-client'


const client = new BibleClient()

export async function get_passage(reference:PassageReference):Promise<string>{
    const collection = await client.fetch_collection()
    const book = await collection.fetch_book('eng_bsb', reference.book)
    return book.get_passage_from_ref(reference, {attribute: false})
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
    freely_giving: "Freely giving",
    reciprocity: "Reciprocity",
    support: "Supporting ministry",
    rights: "Relinquishing rights",
    spiritual: "Spiritual things",
}


export const tag_groups:(keyof typeof tags)[][] = [
    ['vip'],
    ['ot', 'nt', 'jesus', 'paul'],
    ['freely_giving', 'reciprocity', 'support', 'rights', 'spiritual'],
]


interface PassageRaw {
    tags: (keyof typeof tags)[]
    notes: string
}

export interface PassageData extends PassageRaw {
    key:string
    ref:PassageReference
}

const passages_raw: Record<string, PassageRaw> = {
    "Exo 30:13-16": {
        tags: ['ot', 'support'],
        notes: "This likely later became the two-drachma tax that Jesus and Peter paid in Matt 17:24-27. It was offered to God, yet used to maintain the ministry of the tabernacle/temple.",
    },
    "Lev 10:10": {
        tags: ['ot', 'spiritual'],
        notes: "",
    },
    "Num 18:19-21": {
        tags: ['ot', 'support'],
        notes: "The Israelites were obligated to make offerings to God, and portions of these were given by God to the Levites to compensate them for their service.",
    },
    "Num 18:30-32": {
        tags: ['ot', 'support', 'reciprocity'],
        notes: "The Levites were entitled to receive some of the offerings of the Israelites as compensation for their service, but they were not to abuse this (as Eli's sons did in 1 Samuel 2:15-17).",
    },
    "Num 24:10-13": {
        tags: ['ot', 'reciprocity'],
        notes: "Balaam is condemned as a false prophet in other passages of Scripture, yet he is not recorded as making false pronouncements. His sin was prophesying in exchange for payment.",
    },
    "Deut 16:19": {
        tags: ['ot', 'reciprocity'],
        notes: "",
    },
    "Deut 18:1-5": {
        tags: ['ot', 'support', 'spiritual'],
        notes: "The Israelites were obligated to make offerings to God, and portions of these were given by God to the Levites to compensate them for their service.",
    },
    "Deut 23:18": {
        tags: ['ot', 'reciprocity', 'spiritual'],
        notes: "Ill-gotten gains are not acceptable to be offered to God. Likewise, offering him profits from the sale of spiritual things are unlikely to be pleasing to him.",
    },
    "1 Sam 2:15-17": {
        tags: ['vip', 'ot', 'reciprocity'],
        notes: "Temple priests were meant to live off portions of sacrifices after they were offered to God, but Eli’s sons demanded the meat beforehand, turning worship into a kind of payment.",
    },
    "2 King 5:15-16": {
        tags: ['ot', 'freely_giving', 'rights'],
        notes: "Elisha refused to receive a gift in exchange for miraculous healing from Naaman, who did not previously worship Yahweh.",
    },
    "2 King 5:20-27": {
        tags: ['ot', 'reciprocity'],
        notes: "Gehazi thought it was foolish of Elisha to not accept a gift for healing Naaman's leprosy. He tried to obtain it instead and was punished with leprosy.",
    },
    "Psalm 34:10": {
        tags: ['ot', 'support'],
        notes: "",
    },
    "Prov 11:24": {
        tags: ['ot', 'freely_giving'],
        notes: "",
    },
    "Prov 11:25-26": {
        tags: ['ot', 'freely_giving'],
        notes: "",
    },
    "Prov 23:23": {
        tags: ['ot', 'reciprocity', 'spiritual'],
        notes: "",
    },
    "Prov 25:14": {
        tags: ['ot', 'reciprocity'],
        notes: "",
    },
    "Isa 5:20": {
        tags: ['ot', 'reciprocity', 'spiritual'],
        notes: "The sale of spiritual things is often regarded as virtuous.",
    },
    "Isa 55:1": {
        tags: ['ot', 'freely_giving', 'spiritual'],
        notes: "",
    },
    "Ezek 22:26": {
        tags: ['ot', 'spiritual'],
        notes: "We must distinguish between that which is spiritual and that which isn't, that which cannot be sold and that which can.",
    },
    "Ezek 44:23": {
        tags: ['ot', 'spiritual'],
        notes: "",
    },
    "Micah 3:11": {
        tags: ['vip', 'ot', 'reciprocity', 'spiritual'],
        notes: "While corrupt teachers are in view, the priests are not criticized for anything other than simply charging for their teaching.",
    },
    "Matt 6:2": {
        tags: ['nt', 'jesus', 'freely_giving'],
        notes: "We should seek reward from God rather than from others. Requiring payment for ministry is to explicitly demand a reward from others.",
    },
    "Matt 6:24": {
        tags: ['vip', 'nt', 'jesus', 'spiritual'],
        notes: "Demanding payment in service of God is one of clearest examples of trying to serve both God and money.",
    },
    "Matt 6:31-33": {
        tags: ['nt', 'jesus', 'support'],
        notes: "",
    },
    "Matt 7:15": {
        tags: ['nt', 'jesus', 'reciprocity'],
        notes: "Describing false prophets as ravenous wolves implies an underlying motivation of greed.",
    },
    "Matt 9:37-38": {
        tags: ['nt', 'jesus', 'spiritual'],
        notes: "Later references to workers deserving provision (Matt 10:10) must be read in the context of the Lord being the provider, not the recipients of ministry.",
    },
    "Matt 10:7-8": {
        tags: ['vip', 'nt', 'jesus', 'freely_giving', 'spiritual'],
        notes: "Jesus commanded his disciples to freely give their ministry, which here explicitly includes preaching and miracles.",
    },
    "Matt 10:9-10": {
        tags: ['nt', 'jesus', 'support', 'spiritual'],
        notes: "When preaching to existing followers of Yahweh, the disciples were to expect to be provided for and so should not take their own provisions.",
    },
    "Matt 10:11-14": {
        tags: ['nt', 'jesus', 'support', 'spiritual'],
        notes: "The disciples were to accept the hospitality of those they served as provision from their employer (God, see Matt 9:38).",
    },
    "Matt 15:3-6": {
        tags: ['nt', 'jesus', 'reciprocity'],
        notes: "Some people have supposedly righteous motives for withholding ministry from others (such as with copyright restrictions), but by withholding it they nullify the word of God.",
    },
    "Matt 17:24-27": {
        tags: ['nt', 'jesus', 'rights'],
        notes: "While Jesus shouldn't have had to pay the tax, he was still willing to pay to avoid causing offense.",
    },
    "Matt 21:12-13": {
        tags: ['nt', 'jesus', 'reciprocity', 'spiritual'],
        notes: "Jesus notably drives out both buyers and sellers, meaning it was the practice of commerce itself that was his concern, not any exploitative practices that may have been going on.",
    },
    "Matt 27:3": {
        tags: ['nt', 'reciprocity'],
        notes: "",
    },
    "Matt 27:6-9": {
        tags: ['nt', 'reciprocity', 'spiritual'],
        notes: "",
    },
    "Mark 6:7-11": {
        tags: ['nt', 'jesus', 'support', 'spiritual'],
        notes: "",
    },
    "Mark 10:22": {
        tags: ['nt', 'jesus', 'rights'],
        notes: "",
    },
    "Mark 11:15-17": {
        tags: ['nt', 'jesus', 'reciprocity', 'spiritual'],
        notes: "",
    },
    "Luke 6:29-30": {
        tags: ['nt', 'jesus', 'freely_giving', 'rights'],
        notes: "",
    },
    "Luke 8:1-3": {
        tags: ['nt', 'support', 'freely_giving'],
        notes: "",
    },
    "Luke 9:1-5": {
        tags: ['nt', 'jesus', 'support', 'spiritual'],
        notes: "",
    },
    "Luke 9:49-50": {
        tags: ['nt', 'jesus'],
        notes: "",
    },
    "Luke 10:2-7": {
        tags: ['nt', 'jesus', 'support', 'spiritual'],
        notes: "",
    },
    "Luke 12:42-44": {
        tags: ['nt', 'jesus', 'freely_giving'],
        notes: "",
    },
    "Luke 16:13": {
        tags: ['nt', 'jesus', 'spiritual'],
        notes: "",
    },
    "Luke 17:10": {
        tags: ['nt', 'jesus', 'rights'],
        notes: "",
    },
    "Luke 19:45-46": {
        tags: ['nt', 'jesus', 'reciprocity', 'spiritual'],
        notes: "",
    },
    "Luke 20:46-47": {
        tags: ['nt', 'jesus', 'reciprocity', 'spiritual'],
        notes: "",
    },
    "Luke 22:35-36": {
        tags: ['nt', 'jesus', 'support'],
        notes: "",
    },
    "John 2:14-16": {
        tags: ['vip', 'nt', 'jesus', 'reciprocity', 'spiritual'],
        notes: "",
    },
    "John 4:23-24": {
        tags: ['nt', 'jesus', 'spiritual'],
        notes: "",
    },
    "John 7:37": {
        tags: ['nt', 'jesus', 'freely_giving'],
        notes: "",
    },
    "John 10:11-13": {
        tags: ['nt', 'jesus', 'reciprocity'],
        notes: "",
    },
    "John 12:4-6": {
        tags: ['nt', 'reciprocity'],
        notes: "",
    },
    "Acts 2:44-45": {
        tags: ['nt', 'freely_giving'],
        notes: "",
    },
    "Acts 4:32-35": {
        tags: ['nt', 'freely_giving'],
        notes: "",
    },
    "Acts 5:2-3": {
        tags: ['nt', 'reciprocity'],
        notes: "",
    },
    "Acts 8:18-21": {
        tags: ['vip', 'nt', 'reciprocity', 'spiritual'],
        notes: "",
    },
    "Acts 16:14-15": {
        tags: ['nt', 'support', 'freely_giving'],
        notes: "",
    },
    "Acts 18:1-5": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "Acts 19:25": {
        tags: ['nt', 'reciprocity', 'spiritual'],
        notes: "",
    },
    "Acts 20:33-35": {
        tags: ['nt', 'paul', 'freely_giving', 'support', 'rights'],
        notes: "",
    },
    "Rom 12:13": {
        tags: ['nt', 'paul', 'freely_giving'],
        notes: "",
    },
    "Rom 15:24": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "Rom 15:25-29": {
        tags: ['nt', 'paul', 'freely_giving', 'support'],
        notes: "",
    },
    "Rom 16:2": {
        tags: ['nt', 'paul', 'support', 'freely_giving'],
        notes: "",
    },
    "Rom 16:18": {
        tags: ['nt', 'paul', 'reciprocity', 'spiritual'],
        notes: "",
    },
    "Rom 16:23": {
        tags: ['nt', 'paul', 'support', 'freely_giving'],
        notes: "",
    },
    "1 Cor 2:12-13": {
        tags: ['vip', 'nt', 'paul', 'freely_giving', 'spiritual'],
        notes: "",
    },
    "1 Cor 4:1-2": {
        tags: ['nt', 'paul'],
        notes: "",
    },
    "1 Cor 4:7": {
        tags: ['nt', 'paul', 'freely_giving', 'reciprocity'],
        notes: "",
    },
    "1 Cor 4:11-12": {
        tags: ['nt', 'paul', 'support', 'rights'],
        notes: "",
    },
    "1 Cor 6:1-7": {
        tags: ['nt', 'paul', 'rights'],
        notes: "",
    },
    "1 Cor 6:12-15": {
        tags: ['nt', 'paul', 'rights'],
        notes: "",
    },
    "1 Cor 8:9": {
        tags: ['nt', 'paul', 'rights'],
        notes: "",
    },
    "1 Cor 9:12": {
        tags: ['vip', 'nt', 'paul', 'rights', 'freely_giving'],
        notes: "",
    },
    "1 Cor 9:13-14": {
        tags: ['nt', 'paul', 'support', 'rights'],
        notes: "",
    },
    "1 Cor 9:15": {
        tags: ['nt', 'paul', 'rights', 'freely_giving'],
        notes: "",
    },
    "1 Cor 9:17-18": {
        tags: ['nt', 'paul', 'rights', 'freely_giving'],
        notes: "",
    },
    "1 Cor 10:23": {
        tags: ['nt', 'paul', 'rights'],
        notes: "",
    },
    "1 Cor 11:1": {
        tags: ['nt', 'paul'],
        notes: "",
    },
    "1 Cor 12:7": {
        tags: ['nt', 'paul', 'freely_giving', 'spiritual'],
        notes: "",
    },
    "1 Cor 16:1-2": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "1 Cor 16:6": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "1 Cor 16:10-11": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "2 Cor 1:16": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "2 Cor 2:17": {
        tags: ['vip', 'nt', 'paul', 'reciprocity', 'spiritual'],
        notes: "",
    },
    "2 Cor 5:10": {
        tags: ['nt', 'paul'],
        notes: "",
    },
    "2 Cor 9:6": {
        tags: ['nt', 'paul', 'freely_giving'],
        notes: "",
    },
    "2 Cor 9:7": {
        tags: ['nt', 'paul', 'freely_giving'],
        notes: "",
    },
    "2 Cor 9:11-12": {
        tags: ['nt', 'paul', 'freely_giving'],
        notes: "",
    },
    "2 Cor 11:7-9": {
        tags: ['vip', 'nt', 'paul', 'freely_giving', 'rights'],
        notes: "",
    },
    "2 Cor 12:13-17": {
        tags: ['nt', 'paul', 'freely_giving', 'rights'],
        notes: "",
    },
    "Gal 6:6": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "Phil 1:17-18": {
        tags: ['nt', 'paul'],
        notes: "",
    },
    "Phil 3:19": {
        tags: ['nt', 'paul', 'reciprocity'],
        notes: "",
    },
    "Phil 4:10-14": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "Phil 4:15-18": {
        tags: ['vip', 'nt', 'paul', 'support', 'freely_giving'],
        notes: "",
    },
    "1 Thes 2:3-5": {
        tags: ['nt', 'paul', 'reciprocity'],
        notes: "",
    },
    "1 Thes 2:9": {
        tags: ['nt', 'paul', 'support', 'rights'],
        notes: "",
    },
    "2 Thes 3:6-10": {
        tags: ['nt', 'paul', 'support', 'rights'],
        notes: "",
    },
    "1 Tim 3:1-3": {
        tags: ['nt', 'paul', 'reciprocity'],
        notes: "",
    },
    "1 Tim 3:8": {
        tags: ['nt', 'paul', 'reciprocity'],
        notes: "",
    },
    "1 Tim 5:17-18": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "1 Tim 6:3-8": {
        tags: ['nt', 'paul', 'reciprocity', 'spiritual'],
        notes: "",
    },
    "1 Tim 6:10": {
        tags: ['nt', 'paul', 'reciprocity'],
        notes: "",
    },
    "2 Tim 2:9": {
        tags: ['nt', 'paul'],
        notes: "",
    },
    "2 Tim 3:2": {
        tags: ['nt', 'paul', 'reciprocity'],
        notes: "",
    },
    "2 Tim 3:5": {
        tags: ['nt', 'paul', 'reciprocity', 'spiritual'],
        notes: "",
    },
    "2 Tim 3:8": {
        tags: ['nt', 'paul', 'reciprocity'],
        notes: "",
    },
    "Titus 1:7": {
        tags: ['nt', 'paul', 'reciprocity'],
        notes: "",
    },
    "Titus 1:10-11": {
        tags: ['nt', 'paul', 'reciprocity'],
        notes: "",
    },
    "Titus 3:13": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "Heb 6:10": {
        tags: ['nt', 'freely_giving'],
        notes: "",
    },
    "James 2:1-4": {
        tags: ['nt'],
        notes: "",
    },
    "James 2:5": {
        tags: ['nt'],
        notes: "",
    },
    "James 2:8-11": {
        tags: ['nt'],
        notes: "",
    },
    "James 3:1": {
        tags: ['nt'],
        notes: "",
    },
    "1 Pet 4:10-11": {
        tags: ['nt', 'freely_giving', 'spiritual'],
        notes: "",
    },
    "1 Pet 5:2": {
        tags: ['nt', 'reciprocity', 'support'],
        notes: "",
    },
    "2 Pet 2:2-3": {
        tags: ['nt', 'reciprocity'],
        notes: "",
    },
    "2 Pet 2:15": {
        tags: ['nt', 'reciprocity'],
        notes: "",
    },
    "2 Pet 3:16": {
        tags: ['nt', 'reciprocity'],
        notes: "",
    },
    "2 John 1:10-11": {
        tags: ['nt', 'reciprocity'],
        notes: "",
    },
    "3 John 1:5-8": {
        tags: ['vip', 'nt', 'support', 'freely_giving'],
        notes: "",
    },
    "3 John 1:9-10": {
        tags: ['nt'],
        notes: "",
    },
    "Jude 1:11": {
        tags: ['nt', 'reciprocity'],
        notes: "",
    },
    "Rev 21:6": {
        tags: ['nt', 'freely_giving'],
        notes: "",
    },
    "Rev 22:17": {
        tags: ['nt', 'freely_giving'],
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
