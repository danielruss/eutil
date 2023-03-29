console.log("... in esnp.js ... ")
import localforage from 'https://cdn.skypack.dev/localforage';


const baseURL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"


export const apikey = {
    store: localforage.createInstance({ name: "esnp", storeName: "keyStore" }),
    get: async function () { return await this.store.getItem("key") },
    set: async function (key) { return await this.store.setItem("key", key) }
}

export const rsInfo = {
    store: localforage.createInstance({ name: "esnp", storeName: "rsStore" }),
    cache: function (rsInfo) {
        rsInfo.uids.forEach(id => this.store.setItem(`rs${id}`, rsInfo[id]))
    },
    get: async function (rsid) {
        let info = await Promise.all(rsid.split(",").map(rsid => this.store.getItem(rsid)))
        info = info.reduce((pv, cv) => {
            if (cv) {
                pv[`rs${cv.snp_id}`] = cv;
            }
            return pv;
        }, {})
        return info;
    }
}


async function lookupRSID(rsid) {

    rsid = rsid.split(",").map(id=>id.trim()).join(",")
    let cached_results = await rsInfo.get(rsid)
    rsid = rsid.split(",").filter(id => !Object.getOwnPropertyNames(cached_results).includes(id)).join(',')
    if (!!rsid) {
        rsid = rsid.replaceAll("rs", "")
        let url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=snp&id=${rsid}&retmode=json`
        let res = await (await fetch(url)).json()
        rsInfo.cache(res.result)
        res.result.uids.forEach(rs => cached_results[`rs${rs}`]=res.result[rs])
    }
    return cached_results
}

export async function getLocation(rsid){
    const rsinfo = await lookupRSID(rsid)
    return Object.getOwnPropertyNames(rsinfo).reduce((prev,curr)=>{
        prev[curr]=rsinfo[curr].chrpos
        return prev;
    },{})
}

