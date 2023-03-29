console.log("... in esnp.js ... ")
import localforage from 'https://cdn.skypack.dev/localforage';


const baseURL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
const tool_info={}


export function setToolInfo(tool,email){
    tool_info.email=email;
    tool_info.tool=tool;
}

export const apikey = {
    store: localforage.createInstance({ name: "esnp", storeName: "keyStore" }),
    get: async function () { return await this.store.getItem("key") },
    set: async function (key) { return await this.store.setItem("key", key) }
}

// holds info from dbsnp...
export const rsInfo = {
    store: localforage.createInstance({ name: "esnp", storeName: "rsStore" }),
    cache: function (rsInfo) {
        rsInfo.uids.forEach(id => this.store.setItem(`rs${id}`, rsInfo[id]))
    },
    get: async function (rsid) {
        let info = await Promise.all(rsid.split(",").map(rsid => this.store.getItem(rsid)))
        info = info.reduce((pv, cv) => {
            if (cv?.snp_id) {
                pv[`rs${cv.snp_id}`] = cv;
            }
            return pv;
        }, {})
        return info;
    }
}


async function lookupRSID(rsid) {
    // need to throttle to make sure you only have 10 calls/sec.  
    rsid = rsid.split(",").map(id=>id.trim()).join(",")
    let cached_results = await rsInfo.get(rsid)
    rsid = rsid.split(",").filter(id => !Object.getOwnPropertyNames(cached_results).includes(id)).join(',')
    if (!!rsid) {
        rsid = rsid.replaceAll("rs", "")
        let tool = (tool_info.tool)?(`&tool=${tool_info.tool}`):"";
        let email = (tool_info.email)?`&email=${tool_info.email}`:"";
        let key = await apikey.get()
        key = (key)?`&api_key=${key}`:""
        let url = `${baseURL}esummary.fcgi?db=snp&id=${rsid}&retmode=json${tool}${email}${key}`
        let res = await (await fetch(url)).json()
        tool_info.last_call = Date.now()
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

window.tool_info=tool_info
//rs112750067,rs56289060, rs112155239,rs112766696,rs117577454,rs55998931,rs62636508,rs114315702,rs58108140,rs10218492