
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
    condemnation: "Reciprocity",
    support: "Supporting ministry",
    rights: "Relinquishing rights",
    spiritual: "Spiritual things",
}


export const tag_groups:(keyof typeof tags)[][] = [
    ['vip'],
    ['ot', 'nt', 'jesus', 'paul'],
    ['freely_giving', 'condemnation', 'support', 'rights', 'spiritual'],
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
    "Exo 30:13": {
        tags: ['ot', 'support'],
        notes: "Set standard for offerings shows support for ministry should be fair, not exploitative.",
    },
    "Lev 2:1-3": {
        tags: ['ot', 'support'],
        notes: "Establishes that those who serve at the altar should be supported by offerings.",
    },
    "Lev 7:33-35": {
        tags: ['ot', 'support'],
        notes: "God ordained portions for priests, demonstrating legitimate support for ministry.",
    },
    "Lev 10:10": {
        tags: ['ot', 'condemnation', 'spiritual'],
        notes: "Ministers must distinguish between sacred ministry and commercial enterprise.",
    },
    "Lev 24:8-9": {
        tags: ['ot', 'support', 'spiritual'],
        notes: "God's provision for ministers comes through community worship, not commerce.",
    },
    "Lev 27:30-33": {
        tags: ['ot', 'support'],
        notes: "What is given to God should not be used for personal profit.",
    },
    "Num 18:11": {
        tags: ['ot', 'support'],
        notes: "God provided for ministers through the people's voluntary worship offerings.",
    },
    "Num 18:20": {
        tags: ['ot', 'support', 'condemnation'],
        notes: "Ministers should find their security in God, not in accumulating wealth.",
    },
    "Num 18:21": {
        tags: ['ot', 'support', 'spiritual'],
        notes: "Ministry work deserves support, but as service not business.",
    },
    "Num 18:24": {
        tags: ['ot', 'support'],
        notes: "God provides for those who serve Him through different means than worldly wealth.",
    },
    "Num 18:31": {
        tags: ['ot', 'support', 'spiritual'],
        notes: "Support for ministry is legitimate compensation, not commercial profit-seeking.",
    },
    "Num 24:13": {
        tags: ['ot', 'rights'],
        notes: "Balaam shows true prophets cannot be bought or influenced by money.",
    },
    "Deut 14:24-26": {
        tags: ['ot', 'support', 'spiritual'],
        notes: "Shows practical flexibility in offerings, not commercialization of worship.",
    },
    "Deut 14:27": {
        tags: ['ot', 'support'],
        notes: "Communities have responsibility to care for those serving in ministry.",
    },
    "Deut 14:28-29": {
        tags: ['ot', 'support'],
        notes: "Ministry support integrated with caring for the vulnerable.",
    },
    "Deut 16:17-20": {
        tags: ['ot', 'condemnation'],
        notes: "Ministers must never let financial gain compromise their integrity.",
    },
    "Deut 18:1-5": {
        tags: ['ot', 'support', 'spiritual'],
        notes: "God provides for ministers through community giving, not commercial enterprise.",
    },
    "Deut 23:18": {
        tags: ['ot', 'condemnation', 'spiritual'],
        notes: "Money earned through sinful or exploitative means cannot honor God.",
    },
    "1 Sam 2:15-17": {
        tags: ['vip', 'ot', 'condemnation'],
        notes: "Eli's sons' greed and abuse in ministry was serious sin against God and people.",
    },
    "1 Sam 15:22": {
        tags: ['ot', 'spiritual'],
        notes: "Religious ritual means nothing without heart obedience to God.",
    },
    "2 King 4:8-10": {
        tags: ['ot', 'support', 'freely_giving'],
        notes: "Generous support for God's servants flows from gratitude, not obligation.",
    },
    "2 King 5:15-16": {
        tags: ['ot', 'freely_giving', 'rights'],
        notes: "Elisha refused payment for healing, showing true prophets freely give God's gifts.",
    },
    "2 King 5:20": {
        tags: ['ot', 'condemnation'],
        notes: "Gehazi's greed contrasts sharply with Elisha's example of freely giving.",
    },
    "2 King 5:26-27": {
        tags: ['ot', 'condemnation', 'spiritual'],
        notes: "Gehazi was cursed with leprosy for commercializing God's work.",
    },
    "Psalm 34:10": {
        tags: ['ot', 'support'],
        notes: "Ministers should trust God's provision rather than pursuing wealth.",
    },
    "Prov 11:24": {
        tags: ['ot', 'freely_giving'],
        notes: "Generosity leads to blessing, not poverty.",
    },
    "Prov 11:25-26": {
        tags: ['ot', 'freely_giving'],
        notes: "Freely giving brings God's blessing and favor.",
    },
    "Prov 22:9": {
        tags: ['ot', 'freely_giving'],
        notes: "Generosity is a blessed character trait that God rewards.",
    },
    "Prov 23:23": {
        tags: ['ot', 'condemnation', 'spiritual'],
        notes: "Spiritual truth should not be commodified for profit.",
    },
    "Prov 25:14": {
        tags: ['ot', 'condemnation'],
        notes: "False promises of generosity or ministry are worthless.",
    },
    "Prov 28:21": {
        tags: ['ot', 'condemnation'],
        notes: "Ministers must not compromise integrity for any financial gain.",
    },
    "Prov 28:27": {
        tags: ['ot', 'freely_giving'],
        notes: "Generosity toward the needy is rewarded by God's provision.",
    },
    "Ecc 2:26": {
        tags: ['ot', 'spiritual'],
        notes: "True fulfillment comes from pleasing God, not accumulating wealth.",
    },
    "Ecc 11:1": {
        tags: ['ot', 'freely_giving'],
        notes: "Generous giving without immediate return brings eventual reward.",
    },
    "Isa 5:20": {
        tags: ['ot', 'condemnation', 'spiritual'],
        notes: "Ministers who justify commercializing ministry will face judgment.",
    },
    "Isa 55:1": {
        tags: ['ot', 'freely_giving', 'spiritual'],
        notes: "God's spiritual blessings are offered freely, not sold.",
    },
    "Jer 7:11": {
        tags: ['ot', 'condemnation', 'spiritual'],
        notes: "God condemns turning His house of prayer into commercial exploitation.",
    },
    "Ezek 22:26": {
        tags: ['ot', 'condemnation', 'spiritual'],
        notes: "Ministers must maintain the sanctity of sacred things.",
    },
    "Ezek 44:23": {
        tags: ['ot', 'condemnation', 'spiritual'],
        notes: "Ministers must uphold distinction between holy and common, not commercialize ministry.",
    },
    "Micah 1:7": {
        tags: ['ot', 'condemnation'],
        notes: "What is gained through corrupt means will be destroyed.",
    },
    "Micah 3:11": {
        tags: ['vip', 'ot', 'condemnation', 'spiritual'],
        notes: "Commercializing ministry while claiming God's blessing brings judgment.",
    },
    "Zech 11:4-5": {
        tags: ['ot', 'condemnation'],
        notes: "God condemns shepherds who exploit His flock for financial gain.",
    },
    "Zech 11:12-13": {
        tags: ['ot'],
        notes: "Foreshadows Judas betraying Jesus for money.",
    },
    "Zech 14:21": {
        tags: ['ot', 'condemnation', 'spiritual'],
        notes: "God's eschatological temple will be free from commercial activity.",
    },
    "Mal 3:8-10": {
        tags: ['ot', 'support'],
        notes: "Bringing tithes ensures provision for ministry and God's house.",
    },
    "Matt 5:48": {
        tags: ['nt', 'jesus', 'condemnation'],
        notes: "God's perfect standard challenges ministers to pursue holiness, not profit.",
    },
    "Matt 6:2": {
        tags: ['nt', 'jesus', 'freely_giving'],
        notes: "Giving should be done in secret without seeking recognition or reward.",
    },
    "Matt 6:24": {
        tags: ['vip', 'nt', 'jesus', 'spiritual'],
        notes: "Cannot serve both God and money - ministry and profit are incompatible masters.",
    },
    "Matt 6:31-33": {
        tags: ['nt', 'jesus', 'support'],
        notes: "Seeking God's kingdom first brings all needed provision.",
    },
    "Matt 7:15": {
        tags: ['nt', 'jesus', 'condemnation'],
        notes: "False prophets come in sheep's clothing, often motivated by greed.",
    },
    "Matt 9:37-38": {
        tags: ['nt', 'jesus', 'spiritual'],
        notes: "The harvest is plentiful but workers are few - ministry is about laborers, not merchants.",
    },
    "Matt 10:7-8": {
        tags: ['vip', 'nt', 'jesus', 'freely_giving', 'spiritual'],
        notes: "Freely you have received, freely give - the core principle of ministry without charge.",
    },
    "Matt 10:9-10": {
        tags: ['nt', 'jesus', 'support', 'spiritual'],
        notes: "Workers deserve their keep, but should rely on hospitality not commerce.",
    },
    "Matt 10:11-14": {
        tags: ['nt', 'jesus', 'support', 'spiritual'],
        notes: "Apostles were to depend on hospitality and move on if not received.",
    },
    "Matt 15:3-6": {
        tags: ['nt', 'jesus', 'condemnation'],
        notes: "Religious traditions that prioritize offerings over caring for parents nullify God's word.",
    },
    "Matt 17:25-27": {
        tags: ['nt', 'jesus', 'rights'],
        notes: "Though exempt from temple tax, Jesus paid it to avoid offense, showing humble service.",
    },
    "Matt 21:12-13": {
        tags: ['nt', 'jesus', 'condemnation', 'spiritual'],
        notes: "Jesus drove out money changers, condemning commercialization of worship.",
    },
    "Matt 27:3": {
        tags: ['nt', 'condemnation'],
        notes: "Judas's remorse for betraying Jesus for money.",
    },
    "Matt 27:6-9": {
        tags: ['nt', 'condemnation', 'spiritual'],
        notes: "Blood money could not be put in temple treasury, showing some funds defile.",
    },
    "Mark 6:7-11": {
        tags: ['nt', 'jesus', 'support', 'spiritual'],
        notes: "Disciples sent out with nothing, relying on hospitality not commerce.",
    },
    "Mark 10:22": {
        tags: ['nt', 'jesus', 'rights'],
        notes: "Rich young ruler went away sad, unable to give up wealth for discipleship.",
    },
    "Mark 11:15-17": {
        tags: ['nt', 'jesus', 'condemnation', 'spiritual'],
        notes: "Jesus overturned tables of money changers in the temple.",
    },
    "Luke 6:29-30": {
        tags: ['nt', 'jesus', 'freely_giving', 'rights'],
        notes: "Give to everyone who asks, not insisting on your rights.",
    },
    "Luke 8:1-3": {
        tags: ['nt', 'support', 'freely_giving'],
        notes: "Women supported Jesus' ministry from their own means voluntarily.",
    },
    "Luke 9:1-5": {
        tags: ['nt', 'jesus', 'support', 'spiritual'],
        notes: "Disciples sent out with no provisions, trusting God's provision through hospitality.",
    },
    "Luke 9:49-50": {
        tags: ['nt', 'jesus'],
        notes: "We are not to stop people from doing ministry for trivial reasons such as them not having permission to use a particular resource.",
    },
    "Luke 10:2-7": {
        tags: ['nt', 'jesus', 'support', 'spiritual'],
        notes: "Workers deserve their wages, but through hospitality not fees.",
    },
    "Luke 12:42-44": {
        tags: ['nt', 'jesus', 'freely_giving'],
        notes: "Faithful manager gives others their portion at proper time, not hoarding.",
    },
    "Luke 16:13": {
        tags: ['nt', 'jesus', 'spiritual'],
        notes: "Cannot serve both God and money.",
    },
    "Luke 17:10": {
        tags: ['nt', 'jesus', 'rights'],
        notes: "After doing everything commanded, we are unworthy servants deserving no special reward.",
    },
    "Luke 19:45-46": {
        tags: ['nt', 'jesus', 'condemnation', 'spiritual'],
        notes: "Jesus drove out merchants from temple, calling it a den of robbers.",
    },
    "Luke 20:46-47": {
        tags: ['nt', 'jesus', 'condemnation', 'spiritual'],
        notes: "Teachers of law who devour widows' houses while making long prayers will be punished.",
    },
    "Luke 22:35-36": {
        tags: ['nt', 'jesus', 'support'],
        notes: "When sent without provisions, disciples lacked nothing through God's provision.",
    },
    "John 2:14-16": {
        tags: ['vip', 'nt', 'jesus', 'condemnation', 'spiritual'],
        notes: "Jesus cleared the temple of merchants, forbidding commerce in his Father's house.",
    },
    "John 4:23-24": {
        tags: ['nt', 'jesus', 'spiritual'],
        notes: "True worship is in spirit and truth, not commercial transactions.",
    },
    "John 7:37": {
        tags: ['nt', 'jesus', 'freely_giving'],
        notes: "Jesus offers living water freely to all who are thirsty.",
    },
    "John 10:11-13": {
        tags: ['nt', 'jesus', 'condemnation'],
        notes: "Hired hands flee when danger comes because they care only for wages, not the sheep.",
    },
    "John 12:4-6": {
        tags: ['nt', 'condemnation'],
        notes: "Judas objected to expensive worship not from care for the poor but because he was a thief.",
    },
    "Acts 2:44-45": {
        tags: ['nt', 'freely_giving'],
        notes: "Early church shared possessions and gave to anyone in need.",
    },
    "Acts 4:32-35": {
        tags: ['nt', 'freely_giving'],
        notes: "Believers shared everything, giving freely to meet each other's needs.",
    },
    "Acts 5:2-3": {
        tags: ['nt', 'condemnation'],
        notes: "Ananias lied about his giving, showing God condemns deception about money in ministry.",
    },
    "Acts 8:18-21": {
        tags: ['vip', 'nt', 'condemnation', 'spiritual'],
        notes: "Simon tried to buy the Holy Spirit's power with money and was sharply rebuked.",
    },
    "Acts 16:14-15": {
        tags: ['nt', 'support', 'freely_giving'],
        notes: "Lydia offered hospitality to Paul and his companions voluntarily.",
    },
    "Acts 18:1-5": {
        tags: ['nt', 'paul', 'support'],
        notes: "Paul worked as tentmaker to support himself during ministry.",
    },
    "Acts 19:25": {
        tags: ['nt', 'condemnation', 'spiritual'],
        notes: "Silversmiths opposed Paul because the gospel threatened their religious business.",
    },
    "Acts 20:33-35": {
        tags: ['nt', 'paul', 'freely_giving', 'support', 'rights'],
        notes: "Paul worked with his own hands and taught it's more blessed to give than receive.",
    },
    "Rom 12:13": {
        tags: ['nt', 'paul', 'freely_giving'],
        notes: "Share with the Lord's people in need and practice hospitality.",
    },
    "Rom 15:24": {
        tags: ['nt', 'paul', 'support'],
        notes: "Paul hoped to be sent on his way by the Roman church's support.",
    },
    "Rom 15:25-29": {
        tags: ['nt', 'paul', 'freely_giving', 'support'],
        notes: "Churches in Macedonia and Achaia freely gave to help poor believers in Jerusalem.",
    },
    "Rom 16:2": {
        tags: ['nt', 'paul', 'support', 'freely_giving'],
        notes: "Phoebe had been a benefactor to many including Paul through her hospitality.",
    },
    "Rom 16:18": {
        tags: ['nt', 'paul', 'condemnation', 'spiritual'],
        notes: "False teachers serve their own appetites, not Christ, deceiving through smooth talk.",
    },
    "Rom 16:23": {
        tags: ['nt', 'paul', 'support', 'freely_giving'],
        notes: "Gaius offered hospitality to Paul and the whole church.",
    },
    "1 Cor 2:12-13": {
        tags: ['vip', 'nt', 'paul', 'freely_giving', 'spiritual'],
        notes: "Spiritual gifts are freely given by God to be freely shared.",
    },
    "1 Cor 4:1-2": {
        tags: ['nt', 'paul'],
        notes: "Ministers are stewards of God's mysteries, required to be faithful.",
    },
    "1 Cor 4:7": {
        tags: ['nt', 'paul', 'freely_giving', 'condemnation'],
        notes: "Everything we have is received as a gift, leaving no room for boasting or profiteering.",
    },
    "1 Cor 4:11-12": {
        tags: ['nt', 'paul', 'support', 'rights'],
        notes: "Paul endured hardship and worked with his own hands during ministry.",
    },
    "1 Cor 6:1-7": {
        tags: ['nt', 'paul', 'rights'],
        notes: "Better to be wronged than to insist on one's rights through lawsuits.",
    },
    "1 Cor 6:12-15": {
        tags: ['nt', 'paul', 'rights'],
        notes: "Not everything permissible is beneficial - freedom must not become mastery.",
    },
    "1 Cor 8:9": {
        tags: ['nt', 'paul', 'rights'],
        notes: "Exercise of rights must not become stumbling block to the weak.",
    },
    "1 Cor 9:12": {
        tags: ['vip', 'nt', 'paul', 'rights', 'freely_giving'],
        notes: "Paul gave up his right to support to avoid hindering the gospel.",
    },
    "1 Cor 9:13-14": {
        tags: ['nt', 'paul', 'support', 'rights'],
        notes: "Those who preach the gospel should receive their living from it, but may waive this right.",
    },
    "1 Cor 9:15": {
        tags: ['nt', 'paul', 'rights', 'freely_giving'],
        notes: "Paul would rather die than be deprived of his reason for boasting in preaching freely.",
    },
    "1 Cor 9:17-18": {
        tags: ['nt', 'paul', 'rights', 'freely_giving'],
        notes: "Paul's reward was preaching the gospel free of charge, not demanding his rights.",
    },
    "1 Cor 10:23": {
        tags: ['nt', 'paul', 'rights'],
        notes: "Permissible things aren't always beneficial or constructive for others.",
    },
    "1 Cor 11:1": {
        tags: ['nt', 'paul'],
        notes: "Follow Paul's example as he follows Christ in sacrificial service.",
    },
    "1 Cor 12:7": {
        tags: ['nt', 'paul', 'freely_giving', 'spiritual'],
        notes: "Spiritual gifts are given for the common good, not personal profit.",
    },
    "1 Cor 16:1-2": {
        tags: ['nt', 'paul', 'support'],
        notes: "Regular, proportional giving for ministry needs on the first day of the week.",
    },
    "1 Cor 16:6": {
        tags: ['nt', 'paul', 'support'],
        notes: "Paul planned to be sent on his way by the church's support.",
    },
    "1 Cor 16:10-11": {
        tags: ['nt', 'paul', 'support'],
        notes: "Timothy was to be sent on his way in peace with support for his ministry.",
    },
    "2 Cor 1:16": {
        tags: ['nt', 'paul', 'support'],
        notes: "Paul expected to be helped on his journey by the church's support.",
    },
    "2 Cor 2:17": {
        tags: ['vip', 'nt', 'paul', 'condemnation', 'spiritual'],
        notes: "Paul did not peddle God's word for profit like many others.",
    },
    "2 Cor 5:10": {
        tags: ['nt', 'paul'],
        notes: "All will give account before Christ's judgment seat for deeds done.",
    },
    "2 Cor 9:6": {
        tags: ['nt', 'paul', 'freely_giving'],
        notes: "Whoever sows sparingly reaps sparingly; generous sowing brings generous reaping.",
    },
    "2 Cor 9:7": {
        tags: ['nt', 'paul', 'freely_giving'],
        notes: "God loves a cheerful giver who gives willingly, not under compulsion.",
    },
    "2 Cor 9:11-12": {
        tags: ['nt', 'paul', 'freely_giving'],
        notes: "Generosity results in thanksgiving to God and meets the needs of others.",
    },
    "2 Cor 11:7-9": {
        tags: ['vip', 'nt', 'paul', 'freely_giving', 'rights'],
        notes: "Paul preached the gospel free of charge, supported by other churches, to serve Corinthians.",
    },
    "2 Cor 12:13-17": {
        tags: ['nt', 'paul', 'freely_giving', 'rights'],
        notes: "Paul refused to burden the Corinthians, seeking them not their possessions.",
    },
    "Gal 6:6": {
        tags: ['nt', 'paul', 'support'],
        notes: "Students should share all good things with their instructors.",
    },
    "Phil 1:17-18": {
        tags: ['nt', 'paul'],
        notes: "Some preach from selfish ambition, but what matters is that Christ is proclaimed.",
    },
    "Phil 3:19": {
        tags: ['nt', 'paul', 'condemnation'],
        notes: "False teachers' god is their stomach and glory is in their shame.",
    },
    "Phil 4:10-14": {
        tags: ['nt', 'paul', 'support'],
        notes: "Paul had learned contentment in all circumstances, not dependent on support.",
    },
    "Phil 4:15-18": {
        tags: ['vip', 'nt', 'paul', 'support', 'freely_giving'],
        notes: "Philippians' gifts to Paul were a fragrant offering pleasing to God.",
    },
    "1 Thes 2:3-5": {
        tags: ['nt', 'paul', 'condemnation'],
        notes: "Paul's ministry was not from error, impurity, or greed with flattery as a mask.",
    },
    "1 Thes 2:9": {
        tags: ['nt', 'paul', 'support', 'rights'],
        notes: "Paul worked night and day to avoid being a burden while preaching.",
    },
    "2 Thes 3:6-10": {
        tags: ['nt', 'paul', 'support', 'rights'],
        notes: "Paul worked for his food as an example, though he had right to support.",
    },
    "1 Tim 3:1-3": {
        tags: ['nt', 'paul', 'condemnation'],
        notes: "Overseers must not be lovers of money or greedy for gain.",
    },
    "1 Tim 3:8": {
        tags: ['nt', 'paul', 'condemnation'],
        notes: "Deacons must not pursue dishonest gain.",
    },
    "1 Tim 5:17-18": {
        tags: ['nt', 'paul', 'support'],
        notes: "Elders who direct well are worthy of double honor, especially those who preach and teach.",
    },
    "1 Tim 6:3-8": {
        tags: ['nt', 'paul', 'condemnation', 'spiritual'],
        notes: "False teachers think godliness is a means to financial gain, but godliness with contentment is great gain.",
    },
    "1 Tim 6:10": {
        tags: ['nt', 'paul', 'condemnation'],
        notes: "Love of money is a root of all kinds of evil.",
    },
    "2 Tim 2:9": {
        tags: ['nt', 'paul'],
        notes: "Paul suffered for the gospel even to the point of chains.",
    },
    "2 Tim 3:2": {
        tags: ['nt', 'paul', 'condemnation'],
        notes: "In last days people will be lovers of money rather than lovers of God.",
    },
    "2 Tim 3:5": {
        tags: ['nt', 'paul', 'condemnation', 'spiritual'],
        notes: "False teachers have form of godliness but deny its power.",
    },
    "2 Tim 3:8": {
        tags: ['nt', 'paul', 'condemnation'],
        notes: "False teachers oppose the truth with depraved minds.",
    },
    "Titus 1:7": {
        tags: ['nt', 'paul', 'condemnation'],
        notes: "Overseers must not be greedy for dishonest gain.",
    },
    "Titus 1:10-11": {
        tags: ['nt', 'paul', 'condemnation'],
        notes: "False teachers ruin whole households by teaching for shameful gain.",
    },
    "Titus 3:13": {
        tags: ['nt', 'paul', 'support'],
        notes: "Help Zenas and Apollos on their journey with provisions.",
    },
    "Heb 6:10": {
        tags: ['nt', 'freely_giving'],
        notes: "God will not forget the work and love shown in serving His people.",
    },
    "James 2:1-4": {
        tags: ['nt'],
        notes: "Showing favoritism to the rich over the poor is sin.",
    },
    "James 2:5": {
        tags: ['nt'],
        notes: "God chose the poor to be rich in faith and inherit the kingdom.",
    },
    "James 2:8-11": {
        tags: ['nt'],
        notes: "Showing favoritism breaks the royal law to love your neighbor.",
    },
    "James 3:1": {
        tags: ['nt'],
        notes: "Teachers will be judged more strictly, so not many should become teachers.",
    },
    "1 Pet 4:10-11": {
        tags: ['nt', 'freely_giving', 'spiritual'],
        notes: "Use your gifts to serve others as faithful stewards of God's grace.",
    },
    "1 Pet 5:2": {
        tags: ['nt', 'condemnation', 'support'],
        notes: "Shepherd God's flock willingly and eagerly, not for dishonest gain.",
    },
    "2 Pet 2:2-3": {
        tags: ['nt', 'condemnation'],
        notes: "False teachers exploit people with fabricated stories in their greed.",
    },
    "2 Pet 2:15": {
        tags: ['nt', 'condemnation'],
        notes: "False teachers follow the way of Balaam, who loved the wages of wickedness.",
    },
    "2 Pet 3:16": {
        tags: ['nt', 'condemnation'],
        notes: "Ignorant and unstable people distort Scripture to their own destruction.",
    },
    "2 John 1:10-11": {
        tags: ['nt', 'condemnation'],
        notes: "Don't support false teachers by welcoming them or helping their work.",
    },
    "3 John 1:5-8": {
        tags: ['vip', 'nt', 'support', 'freely_giving'],
        notes: "Show hospitality to traveling workers who went out without accepting help from pagans.",
    },
    "3 John 1:9-10": {
        tags: ['nt'],
        notes: "Diotrephes loved to be first and refused to welcome traveling workers.",
    },
    "Jude 1:11": {
        tags: ['nt', 'condemnation'],
        notes: "False teachers have rushed for profit into Balaam's error.",
    },
    "Rev 21:6": {
        tags: ['nt', 'freely_giving'],
        notes: "God gives water of life freely to those who are thirsty.",
    },
    "Rev 22:17": {
        tags: ['nt', 'freely_giving'],
        notes: "Whoever is thirsty may take the water of life freely.",
    }
}

export const passages:PassageData[] = Object.entries(passages_raw).map(([key, data]) => {
    return {
        ...data,
        key,
        ref: PassageReference.from_string(key)!,
    }
})
