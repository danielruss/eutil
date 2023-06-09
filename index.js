console.log(" ... loading index.js ...")

import { apikey,getLocation,setToolInfo } from "./esnp.js"
setToolInfo("NCI_DCEG_EUTIL_JSWRAPPER","druss@mail.nih.gov")

function displayResults(results){
    const table = document.getElementById("locations")
    table.innerText=""
    let row=table.insertRow()
    row.insertCell().outerHTML="<th>rsid</th>"
    row.insertCell().outerHTML="<th>location (GRCh38)</th>"
    row.insertCell().outerHTML="<th>location (GRCh37)</th>"
    Object.entries(results).forEach( ([key,value])=>{
        row=table.insertRow()
        let cell = row.insertCell()
        cell.innerText=key
        cell = row.insertCell()
        cell.innerText=value.GRCh38
        cell = row.insertCell()
        cell.innerText=value.GRCh37
    })
}

document.getElementById("keyButton").addEventListener("click",(event)=>{
    let key = document.getElementById("apiKeyInp").value
    if (key.length > 0){
        apikey.set(key)
        document.getElementById("keyFooter").classList.remove("d-none")
        document.getElementById("keyButton").value = "Change key"
    }
})

document.getElementById("clearKeyButton").addEventListener("click",(event)=>{
    document.getElementById("apiKeyInp").value = ""
    document.getElementById("keyFooter").classList.add("d-none")
    document.getElementById("keyButton").value = "Add key"
})

document.getElementById("rsButton").addEventListener("click",async (event)=>{
    event.target.disabled=true;
    let rsInp = document.getElementById("rsInp").value
    if (rsInp.length > 0){
        let location=await getLocation(rsInp)
        displayResults(location)
    }
    setTimeout(()=>event.target.disabled=false,1000)
})

window.addEventListener("load", async (event)=>{
    // check if we have an API key...
    let key = await apikey.get()
    if (key) {
        document.getElementById("pills-rs-tab").click()
        document.getElementById("keyFooter").classList.remove('d-none')
        document.getElementById("keyButton").value = "Change key"
    }
    //document.getElementById("keyDiv").style.display = (!key)?"block":"none"
    //document.getElementById("rsDiv").style.display = (!key)?"none":"block"
})