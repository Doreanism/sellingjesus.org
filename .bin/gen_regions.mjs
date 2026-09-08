// Execute to generate the region data used by both the site and the functions

import {mkdirSync, writeFileSync} from 'node:fs'

import iso3166 from 'iso3166-2-db/i18n/dispute/UN/en.json' with {type: 'json'}


const countries = Object.entries(iso3166).map(([code, data]) => {
    let regions = data.regions.map(region => ({name: region.name, code: region.iso}))
    regions.sort((a, b) => a.name.localeCompare(b.name))

    // Some countries have regions but no codes, which isn't useful
    if (regions.some(r => !r.code)){
        regions = []
    }

    return {
        code,
        name: data.name,
        regions,
    }
})
countries.sort((a, b) => a.name.localeCompare(b.name))

// The functions need their own copy, as firebase only uploads the functions directory
const json = JSON.stringify(countries)
writeFileSync('src/_comp/regions.json', json)
mkdirSync('functions/src/data', {recursive: true})
writeFileSync('functions/src/data/regions.json', json)
