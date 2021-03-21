/* jshint esversion: 8 */
/* jshint browser: true */
/* jshint node: true */
'use strict';

const allStates = {
    "Illinois":17,
    "Iowa":19,
    "Minnesota":27,
    "Nebraska":31,
    "Wisconsin":55
};

// Populate states
function populateSelectOption(elementId, optionsArray) {
    let menu = document.querySelector(elementId);
    for (let opt in optionsArray) {
        let newOption = document.createElement("option");
        newOption.setAttribute("value", optionsArray[opt]);
        newOption.innerHTML = opt;
        menu.appendChild(newOption);
    }
}

// Populate sites
// Need to clear past sites
function populateSites(allSites) {
    
    let menu = document.querySelector("#site_name");
    menu.innerHTML = "";
    for (let opt in allSites) {
        let newOption = document.createElement("option");
        newOption.setAttribute("value", allSites[opt]);
        //console.log(allSites[opt])
        newOption.innerHTML = allSites[opt];
        menu.appendChild(newOption);
    }
}

// const allCounties = {
//     "Anoka":["003","1002"],
//     "Becker":["005","2013"],
//     "Carlton":["017","7414"],
//     "Cook":["031","7810"],
//     "Dakota":["037","480"],
//     "Hennepin":["053","0962"],
//     "Lyon":["083","4210"],
//     "Olmsted":["109","5008"],
//     "Ramsey":["123","0868"],
//     "Saint Louis":["137","7550"],
//     "Scott":["139","0505"], 
//     "Stearns":["145","3052"],
// };

async function getSites(){
    let sc = document.querySelector("#state_name").selectedOptions[0].value;
    let url = `https://aqs.epa.gov/data/api/monitors/byState?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=20190608&edate=20190608&state=${sc}`
    let sitedata = await fetch(url)
            .then(response => response.json())
            .catch(error => console.log(error));
    let allSites = {};
    for (let j of sitedata["Data"]){
        let cCode = j['county_code'];
        let sCode = j['site_number'];
        let countyName = j['county_name'];
        let cityName = j['city_name'];
        let name_str = countyName.concat("-", cityName, ".  Monitor: ", sCode);
        let siteID = cCode.concat("-", sCode)
        if (allSites.hasOwnProperty(siteID)) { }
        else { 
            allSites[siteID] = [name_str, cCode, sCode];
        }
    }
    populateSites(allSites); 
}

async function getData() {
    let state = document.querySelector("#state_name").selectedOptions[0].value;
    let cd = document.querySelector("#site_name").selectedOptions[0].value;
    // console.log(cd);
    let cdn = cd.split(",");
    let county = cdn[1];
    let site = cdn[2]
    // console.log(state, county, site)
    let GPS_list = await getGPS(state, county, site);
    // console.log("GPS", GPS_list);
    let air_stats = await get_air(state, county, site);
    // console.log("AQ", air_stats);
    let census_stats = await get_census(state, county);
    // console.log("Census", census_stats);
    draw(census_stats)
    return GPS_list;
}

// Get latitude and longitude
async function getGPS(state, county, site){
    let url = `https://aqs.epa.gov/data/api/annualData/bySite?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=20190618&edate=20190618&state=${state}&county=${county}&site=${site}`;
    // console.log("GPS url", url);
    let data = await fetch(url)
            .then(response => response.json())
            .catch(error => console.log(error));
    // console.log(data.Data[0].latitude, data.Data[0].longitude);
    return [data.Data[0].latitude, data.Data[0].longitude];
}

// Get air quality data
// Return average for that site for the year and fraction of days that exceed the limit
async function get_air(state, county, site) {
    
    let url = `https://aqs.epa.gov/data/api/dailyData/bySite?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=20190101&edate=20191231&state=${state}&county=${county}&site=${site}`;
    // console.log("AQ url", url);
    let airdata = await fetch(`${url}`).then(response => response.json());
    let dlen = airdata["Data"].length;
    
    let aqtotal = 0;
    let aqctr = 0;
    let olctr = 0;
    for (let j of airdata["Data"]){
        aqtotal = aqtotal + j['arithmetic_mean'];
        if (j['arithmetic_mean']>35){
            olctr += 1;
        }
        aqctr += 1;
    }
    let aqmean = aqtotal / aqctr;
    let olfrac = olctr / aqctr;
    // console.log("get_air", aqmean, olfrac);
    return [aqmean, olfrac];
}

// Get race
async function get_census(state, county) {
    let url = `https://api.census.gov/data/2019/acs/acs5?get=NAME,B03001_002E,B02001_003E,B02001_004E,B02001_005E,B03001_003E&for=county:${county}&in=state:${state}&key=654a975e290481a70449f6c9bf6a9c21fe3ea0ff`;
    // console.log("Census url", url);
    let census_data = await fetch(`${url}`).then(response => response.json());
    return [census_data[1][1], census_data[1][2], census_data[1][3], census_data[1][4], census_data[1][5]];
    // white, African-American, Native American, Asian, Hispanic
}


window.onload = function() {
    populateSelectOption("#state_name", allStates); 
}