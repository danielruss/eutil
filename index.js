console.log(" ... loading index.js ...")

import { apikey,getLocation } from "./esnp.js"

document.getElementById("keyButton").addEventListener("click",(event)=>{
    let key = document.getElementById("apiKeyInp").value
    if (key.length > 0){
        apikey.set(key)
    }
    document.getElementById("keyDiv").style.display = (!key)?"block":"none"
})

document.getElementById("rsButton").addEventListener("click",async (event)=>{
    event.target.disabled=true;
    let rsInp = document.getElementById("rsInp").value
    if (rsInp.length > 0){
        let location=await getLocation(rsInp)
        console.log(location)
    }
    setTimeout(()=>event.target.disabled=false,1000)
})

window.addEventListener("load", async (event)=>{
    // check if we have an API key...
    let key = await apikey.get()
    document.getElementById("keyDiv").style.display = (!key)?"block":"none"
    document.getElementById("rsDiv").style.display = (!key)?"none":"block"
})