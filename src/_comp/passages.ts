
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
    // Testament
    ot: "Old Testament",
    nt: "New Testament",
    // Person
    jesus: "Jesus",
    paul: "Paul",
    other_people: "Other people",
    // Topics
    freely_giving: "Freely giving",
    reciprocity: "Reciprocity",
    greed: "Greed",
    support: "Supporting ministry",
    provision: "God's provision & stewardship",
    rights: "Relinquishing rights",
    spiritual: "Spiritual things",
}


export const tag_groups:(keyof typeof tags)[][] = [
    ['vip'],
    ['ot', 'nt', 'jesus', 'paul', 'other_people'],
    ['freely_giving', 'support', 'provision', 'reciprocity', 'greed', 'rights', 'spiritual'],
]


// Cannot add the other filters as tags
export type TagId = Exclude<keyof typeof tags, 'other_people'>


interface PassageRaw {
    tags: TagId[]
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
        tags: ['ot', 'greed'],
        notes: "",
    },
    "Deut 18:1-5": {
        tags: ['ot', 'support'],
        notes: "The Israelites were obligated to make offerings to God, and portions of these were given by God to the Levites to compensate them for their service.",
    },
    "Deut 23:18": {
        tags: ['ot', 'reciprocity'],
        notes: "Ill-gotten gains are not acceptable to be offered to God. Likewise, offering him profits from the sale of spiritual things are unlikely to be pleasing to him.",
    },
    "1 Sam 2:15-17": {
        tags: ['vip', 'ot', 'reciprocity', 'greed'],
        notes: "Temple priests were meant to live off portions of sacrifices after they were offered to God, but Eli’s sons demanded the meat beforehand, turning worship into a kind of payment.",
    },
    "2 King 5:15-16": {
        tags: ['ot', 'freely_giving', 'rights'],
        notes: "Elisha refused to receive a gift in exchange for miraculous healing from Naaman, who did not previously worship Yahweh.",
    },
    "2 King 5:20-27": {
        tags: ['ot', 'reciprocity', 'greed'],
        notes: "Gehazi thought it was foolish of Elisha to not accept a gift for healing Naaman's leprosy. He tried to obtain it instead and was punished with leprosy.",
    },
    "Psalm 34:10": {
        tags: ['ot', 'provision'],
        notes: "",
    },
    "Prov 11:24": {
        tags: ['ot', 'freely_giving', 'greed'],
        notes: "",
    },
    "Prov 11:25-26": {
        tags: ['ot', 'provision'],
        notes: "",
    },
    "Prov 23:23": {
        tags: ['ot', 'freely_giving'],
        notes: "",
    },
    "Prov 25:14": {
        tags: ['ot', 'reciprocity'],
        notes: "",
    },
    "Isa 5:20": {
        tags: ['ot', 'reciprocity'],
        notes: "The sale of spiritual things is often regarded as virtuous.",
    },
    "Isa 55:1": {
        tags: ['ot', 'freely_giving'],
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
        tags: ['vip', 'ot', 'reciprocity'],
        notes: "While corrupt teachers are in view, the priests are not criticized for anything other than simply charging for their teaching.",
    },
    "Matt 6:2": {
        tags: ['nt', 'jesus', 'reciprocity'],
        notes: "We should seek reward from God rather than from others. Requiring payment for ministry is to explicitly demand a reward from others.",
    },
    "Matt 6:24": {
        tags: ['vip', 'nt', 'jesus', 'reciprocity'],
        notes: "Demanding payment in service of God is one of clearest examples of trying to serve both God and money.",
    },
    "Matt 6:31-33": {
        tags: ['nt', 'jesus', 'provision'],
        notes: "",
    },
    "Matt 7:15": {
        tags: ['nt', 'jesus', 'greed'],
        notes: "Describing false prophets as ravenous wolves implies an underlying motivation of greed.",
    },
    "Matt 9:37-38": {
        tags: ['nt', 'jesus', 'provision'],
        notes: "The later reference to workers deserving provision (Matt 10:10) must be read in the context of the Lord being the provider, not the recipients of ministry.",
    },
    "Matt 10:7-8": {
        tags: ['vip', 'nt', 'jesus', 'freely_giving', 'spiritual'],
        notes: "Jesus commanded his disciples to freely give their ministry, which here explicitly includes preaching and miracles.",
    },
    "Matt 10:9-14": {
        tags: ['nt', 'jesus', 'support', 'provision'],
        notes: "The disciples were to expect hospitality from those they served as God's way of providing for his workers (Matt 9:38), and so need not bring their own provisions.",
    },
    "Matt 15:3-6": {
        tags: ['nt', 'jesus', 'rights'],
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
    "Matt 27:6-9": {
        tags: ['nt', 'greed'],
        notes: "",
    },
    "Mark 6:7-11": {
        tags: ['nt', 'jesus', 'support', 'provision'],
        notes: "The disciples were to expect hospitality from those they served as God's way of providing for his workers (Matt 9:38), and so need not bring their own provisions.",
    },
    "Mark 10:21-22": {
        tags: ['nt', 'jesus', 'rights'],
        notes: "People who sell ministry are not being told to sell everything they own, but to merely rely on donations rather than sales. Yet they still often respond this way or worse.",
    },
    "Mark 11:15-17": {
        tags: ['nt', 'jesus', 'reciprocity', 'spiritual'],
        notes: "Jesus notably drives out both buyers and sellers, meaning it was the practice of commerce itself that was his concern, not any exploitative practices that may have been going on.",
    },
    "Luke 6:29-30": {
        tags: ['nt', 'jesus', 'freely_giving', 'rights'],
        notes: "If we are not to demand back what is taken from us, how much more should we not demand back resources that are merely copied and not even taken away.",
    },
    "Luke 8:1-3": {
        tags: ['nt', 'jesus', 'support'],
        notes: "",
    },
    "Luke 9:1-5": {
        tags: ['nt', 'jesus', 'support', 'provision'],
        notes: "The disciples were to expect hospitality from those they served as God's way of providing for his workers (Luke 10:2), and so need not bring their own provisions.",
    },
    "Luke 9:49-50": {
        tags: ['nt', 'jesus', 'rights'],
        notes: "Christian ministries will often stop people from sharing their resources, or even threaten to sue them, in direct contrast to the behavior Jesus encourages here.",
    },
    "Luke 10:2-7": {
        tags: ['nt', 'jesus', 'support', 'reciprocity', 'provision'],
        notes: "The disciples were to expect hospitality from those they served as God's way of providing for his workers, and so need not bring their own provisions. But they were not to take advantage of this; they were to stay at the same house in each village rather than receive provision from everyone they ministered to.",
    },
    "Luke 12:42-44": {
        tags: ['nt', 'jesus', 'provision'],
        notes: "",
    },
    "Luke 17:10": {
        tags: ['nt', 'jesus', 'rights'],
        notes: "Claiming personal ownership of ministry resources suggests we are not servants but our own masters.",
    },
    "Luke 19:45-46": {
        tags: ['nt', 'jesus', 'reciprocity', 'spiritual'],
        notes: "There is a more detailed account of this same event in Mark 11:15-17.",
    },
    "Luke 20:46-47": {
        tags: ['nt', 'jesus', 'rights'],
        notes: "Many authors unashamedly insist on being credited for their work and some even threaten legal action for copying without attribution.",
    },
    "Luke 22:35-36": {
        tags: ['nt', 'jesus', 'support', 'provision'],
        notes: "In contrast with their previous experiences, the disciples were to expect increased opposition to the gospel during the next period of their ministry. And so were to bring their own provisions for when they could not find anyone who would welcome them.",
    },
    "John 2:14-16": {
        tags: ['vip', 'nt', 'jesus', 'reciprocity', 'spiritual'],
        notes: "While many commentators guess what Jesus was offended by from external evidence, the internal evidence is straightforward: \"How dare you turn My Father’s house into a marketplace!\"",
    },
    "John 7:37": {
        tags: ['nt', 'jesus', 'freely_giving'],
        notes: "",
    },
    "John 10:11-13": {
        tags: ['nt', 'jesus', 'reciprocity'],
        notes: "False shepherds may appear committed, but when serving becomes costly rather than advantageous, they withdraw.",
    },
    "John 12:4-6": {
        tags: ['nt', 'greed'],
        notes: "",
    },
    "Acts 2:44-45": {
        tags: ['nt', 'freely_giving'],
        notes: "The 'all rights reserved' attitude is opposite that of the early church.",
    },
    "Acts 4:32-35": {
        tags: ['nt', 'freely_giving', 'support', 'provision'],
        notes: "The 'all rights reserved' attitude is opposite that of the early church.",
    },
    "Acts 5:2-3": {
        tags: ['nt', 'greed'],
        notes: "",
    },
    "Acts 8:18-21": {
        tags: ['vip', 'nt', 'reciprocity', 'spiritual'],
        notes: "Simon regarded the power to give the Holy Spirit as something that can be sold. The purchase or sale of any spiritual thing freely given by God constitutes a sin of like character.",
    },
    "Acts 16:14-15": {
        tags: ['nt', 'paul', 'support'],
        notes: "Paul was willing to accept support when he was sure it wouldn't call his sincerity into question, such as only after they showed signs of Christian maturity.",
    },
    "Acts 18:1-5": {
        tags: ['nt', 'paul', 'support'],
        notes: "Paul worked to support himself when necessary, but resumed full-time ministry when support from others was available.",
    },
    "Acts 19:25-27": {
        tags: ['nt', 'greed'],
        notes: "",
    },
    "Acts 20:33-35": {
        tags: ['nt', 'paul', 'freely_giving', 'reciprocity', 'rights'],
        notes: "Paul did not seek support when there was a chance it might raise questions about his sincerity.",
    },
    "Rom 12:13": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "Rom 15:24": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "Rom 15:25-27": {
        tags: ['nt', 'paul', 'support'],
        notes: "Paul points out the appropriateness of supporting those who have shared spiritual blessings, in this case the Jews to the Gentiles.",
    },
    "Rom 16:2": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "Rom 16:18": {
        tags: ['nt', 'paul', 'greed'],
        notes: "",
    },
    "Rom 16:23": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "1 Cor 2:12-13": {
        tags: ['vip', 'nt', 'paul', 'freely_giving', 'spiritual'],
        notes: "All forms of ministry are spiritual in nature, and are the product of spiritual truths that have been freely given to us.",
    },
    "1 Cor 4:1-2": {
        tags: ['nt', 'paul', 'provision'],
        notes: "",
    },
    "1 Cor 4:7": {
        tags: ['nt', 'paul', 'rights'],
        notes: "Most authors would like to say that the Spirit has guided them in their work, yet then still insist that it is their own and does not need to be freely shared.",
    },
    "1 Cor 4:11-12": {
        tags: ['nt', 'paul', 'provision'],
        notes: "",
    },
    "1 Cor 6:1-7": {
        tags: ['nt', 'paul', 'rights'],
        notes: "Paul says it is better for the gospel when we don’t bring grievances before secular authorities. Yet many wish to keep this option open by holding onto copyright privileges.",
    },
    "1 Cor 6:12-15": {
        tags: ['nt', 'paul', 'rights'],
        notes: "The word for 'permissible' here can also be translated as a 'right,' similar to the 'right' to support in 1 Cor 9.",
    },
    "1 Cor 8:9": {
        tags: ['nt', 'paul', 'rights'],
        notes: "The word translated 'freedom' here is the same word translated as 'right' in reference to support in 1 Cor 9.",
    },
    "1 Cor 9:12": {
        tags: ['vip', 'nt', 'paul', 'rights', 'reciprocity'],
        notes: "Paul explains that the right to support is not neutral, it can hinder the gospel depending on how it is exercised.",
    },
    "1 Cor 9:13-14": {
        tags: ['nt', 'paul', 'support', 'provision'],
        notes: "Paul explains that the way ministry was funded in the priestly system is the same way it should be funded today, by receiving provisions that are offered to God in worship.",
    },
    "1 Cor 9:15": {
        tags: ['nt', 'paul', 'rights'],
        notes: "Paul demonstrates how he gives up his 'rights' as a Christian to set an example for the Corinthians to follow in giving up their 'right' to eat food when it has been sacrificed to an idol.",
    },
    "1 Cor 9:17-18": {
        tags: ['nt', 'paul', 'rights', 'freely_giving', 'provision'],
        notes: "Paul's ministry is not voluntary, rather he has a responsibility to steward what God has entrusted to him. Rather than receive a worldly reward, he preaches free of charge, as otherwise he would be abusing his authority (\"not use up my rights\" is better translated as \"not abuse my authority\").",
    },
    "1 Cor 10:23": {
        tags: ['nt', 'paul', 'rights'],
        notes: "The word for 'permissible' here has a similar meaning to the word for the 'right' to support in 1 Cor 9.",
    },
    "1 Cor 11:1": {
        tags: ['nt', 'paul', 'rights'],
        notes: "While many commentators insist we don't have to give up our rights like Paul does in 1 Cor 9, Paul explicitly calls the Corinthians to follow his example.",
    },
    "1 Cor 12:7": {
        tags: ['nt', 'paul', 'freely_giving', 'spiritual'],
        notes: "Spiritual insights are supposed to be shared, not commercialized.",
    },
    "1 Cor 16:1-2": {
        tags: ['nt', 'paul', 'support'],
        notes: "This was to help poor believers in Jerusalem.",
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
        notes: "The phrase \"for profit\" is not in the Greek, and \"peddle\" simply means \"to sell\", so a translation that is less prone to misinterpretation would be: \"For we are not like so many others, who sell the word of God.\"",
    },
    "2 Cor 5:10": {
        tags: ['nt', 'paul', 'provision'],
        notes: "",
    },
    "2 Cor 9:6": {
        tags: ['nt', 'paul', 'provision'],
        notes: "",
    },
    "2 Cor 9:7": {
        tags: ['nt', 'paul', 'support'],
        notes: "While this refers to supporting poor Christians in Jerusalem, the principles are still relevant to all forms of giving.",
    },
    "2 Cor 9:11-12": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "2 Cor 11:7-9": {
        tags: ['vip', 'nt', 'paul', 'freely_giving', 'rights', 'support'],
        notes: "Paul reveals that he was supported by other churches while preaching 'free of charge' to the Corinthians, to avoid burdening them. This was a wisdom decision based on the circumstances of that church at the time.",
    },
    "2 Cor 12:13-17": {
        tags: ['nt', 'paul', 'freely_giving', 'rights'],
        notes: "Paul would not receive any support from the Corinthians as long as it would in any way burden them.",
    },
    "Gal 6:6": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "Phil 1:17-18": {
        tags: ['nt', 'paul', 'rights'],
        notes: "Many people keep copyright restrictions on their works out of fear someone else may profit from them, but Paul calls us to rejoice when Christ is preached, regardless of the motives.",
    },
    "Phil 3:19": {
        tags: ['nt', 'paul', 'greed'],
        notes: "",
    },
    "Phil 4:10-14": {
        tags: ['nt', 'paul', 'support', 'provision'],
        notes: "Paul commends the Philippians for supporting him, but does so in reference to God's provision.",
    },
    "Phil 4:15-18": {
        tags: ['vip', 'nt', 'paul', 'support'],
        notes: "Paul interprets the support of the Philippians as an act of worship, and notably doesn't thank them directly himself.",
    },
    "1 Thes 2:3-5": {
        tags: ['nt', 'paul', 'greed'],
        notes: "",
    },
    "1 Thes 2:9": {
        tags: ['nt', 'paul', 'rights'],
        notes: "Paul would not receive any kind of support when it would burden those he served, especially when they were not yet mature Christians.",
    },
    "2 Thes 3:6-10": {
        tags: ['nt', 'paul', 'rights'],
        notes: "Paul would not receive any kind of support when it would burden those he served.",
    },
    "1 Tim 3:1-3": {
        tags: ['nt', 'paul', 'greed'],
        notes: "",
    },
    "1 Tim 3:8": {
        tags: ['nt', 'paul', 'greed'],
        notes: "",
    },
    "1 Tim 5:17-18": {
        tags: ['nt', 'paul', 'support'],
        notes: "Honor is clearly financial in application, given the context of financially honoring widows prior to it, and the subsequent quotes (ox, wages).",
    },
    "1 Tim 6:3-8": {
        tags: ['nt', 'paul', 'reciprocity', 'provision'],
        notes: "Paul warns Timothy about false teachers who seek to financially gain from their ministry beyond their actual needs.",
    },
    "1 Tim 6:10": {
        tags: ['nt', 'paul', 'greed'],
        notes: "",
    },
    "2 Tim 2:9": {
        tags: ['nt', 'paul', 'rights'],
        notes: "Christian publishers try to use copyright to chain the Word, but it is illegitimate.",
    },
    "2 Tim 3:2-5": {
        tags: ['nt', 'paul', 'greed'],
        notes: "",
    },
    "Titus 1:7": {
        tags: ['nt', 'paul', 'greed', 'provision'],
        notes: "",
    },
    "Titus 1:10-11": {
        tags: ['nt', 'paul', 'reciprocity', 'greed'],
        notes: "False teachers seek to profit from their work in ways Paul here describes as 'dishonorable.'",
    },
    "Titus 3:13": {
        tags: ['nt', 'paul', 'support'],
        notes: "",
    },
    "Heb 6:10": {
        tags: ['nt', 'provision'],
        notes: "",
    },
    "James 2:1-4": {
        tags: ['nt', 'reciprocity'],
        notes: "The poor are frequently excluded from benefiting from Christian resources and attending Christian events due to paywalls.",
    },
    "James 2:5": {
        tags: ['nt', 'provision'],
        notes: "",
    },
    "James 3:1": {
        tags: ['nt', 'provision'],
        notes: "",
    },
    "1 Pet 4:10-11": {
        tags: ['nt', 'freely_giving', 'spiritual'],
        notes: "Ministry is spiritual in nature, such gifts have been freely given to us by God, and are to be used to serve others.",
    },
    "1 Pet 5:2": {
        tags: ['nt', 'reciprocity', 'greed'],
        notes: "The words translated as \"greed\" here have the same base as those translated as \"dishonorable gain\" in Titus 1:11.",
    },
    "2 Pet 2:2-3": {
        tags: ['nt', 'greed'],
        notes: "",
    },
    "2 Pet 2:15": {
        tags: ['nt', 'reciprocity'],
        notes: "Balaam is condemned as a false prophet, yet he only said what God wanted him to say. His sin was prophesying in exchange for payment.",
    },
    "2 Pet 3:16": {
        tags: ['nt', 'rights'],
        notes: "The apostles had to deal with people manipulating their words. But they dealt with this through speach, rebuking such people. We should do the same rather than threaten legal consequences with copyright.",
    },
    "3 John 1:5-8": {
        tags: ['vip', 'nt', 'support', 'freely_giving'],
        notes: "Gospel workers accept nothing from people yet to believe, and should be supported by those who do believe. Supporting such people makes us co-laborers ('fellow workers') in the ministry.",
    },
    "3 John 1:9-10": {
        tags: ['nt', 'support'],
        notes: "It can be sinful to refuse to support gospel workers who teach faithfully.",
    },
    "Jude 1:11": {
        tags: ['nt', 'reciprocity'],
        notes: "Balaam is condemned as a false prophet, yet he only said what God wanted him to say. His sin was prophesying in exchange for payment.",
    },
    "Rev 21:6": {
        tags: ['nt', 'jesus', 'freely_giving'],
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
