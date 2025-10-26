
export const articles_by_category:Record<string, string[]> = {
    "Freely Giving": [
        'freely-give',
        'freely-give-today',
        'scope',
    ],
    "Supporting Ministry": [
        'defining-ministry',
        'biblical-funding',
        'colabor',
    ],
    "Selling Ministry": [
        'commerce-condemned',
        'sincerity',
        'buying',
        'adaptation',
        'judas',
        'balaam',
        'prostitutes-wages',
    ],
    "Specific Passages": [
        'selling-truth',
        'commercializing-gods-word',
        '1cor9',
        '1cor9-authority',
        'temple-cleansing',
    ],
    "History": [
        'simony',
        'bible-societies',
    ],
    "Application": [
        'should-preachers-be-paid',
        'paying-pastors',
        'covering-costs',
        'biblical-counseling',
        'counseling-fees',
        'ads',
        'conferences',
        'pragmatism',
    ],
    "Copyright & Licensing": [
        'copyright-jesus-command-to-freely-give',
        'copyright-and-the-bible',
        'copyright-protect-scripture',
        'abuse',
        'letting-go',
        'copyright-hijacking',
        'sharealike',
    ],
    "Contemporary Commerce": [
        'bible-publishers',
        'worship-tax',
        'acbc',
        'manuscripts',
        'kjv',
        'blood-money',
    ],
}


export const article_ids = Object.values(articles_by_category).flat()
