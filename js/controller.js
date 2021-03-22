/* jshint esversion: 8 */
/* jshint browser: true */
/* jshint node: true */
'use strict';

var mySiteListModel = new siteList();
var mySiteListView = new siteListView(mySiteListModel);


const years = []
for (let year=2015; year < new Date().getFullYear() - 1; year++){
    years.push(year)
}

let menu = document.querySelector("#year_name");
menu.innerHTML = "";
for (let opt of years) {
    let newOption = document.createElement("option");
    newOption.setAttribute("value", opt);
    //console.log(allSites[opt])
    newOption.innerHTML = opt;
    menu.appendChild(newOption);
}



const allStates = {
    "Illinois":17,
    "Iowa":19,
    "Minnesota":27,
    "Nebraska":31,
    "Wisconsin":55
};

// Change title
function changeTitle(title){
    var origin = document.querySelector("#title"); 
    origin.innerHTML = `Air pollution & Census data ${title}`;
}
  

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



// Populate sites and years
// //}

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
    let year = document.querySelector("#year_name").selectedOptions[0].value;
    changeTitle(year);
    let url = `https://aqs.epa.gov/data/api/monitors/byState?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=${year}0608&edate=${year}0608&state=${sc}`
    let sitedata = await fetch(url)
            .then(response => response.json())
            .catch(error => console.log(error));
    let allSites = {};
    console.log("erk");
    mySiteListModel.clearList()
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
            let newSite = new site(siteID, name_str, cCode, sCode);
            mySiteListModel.add(newSite);
        }
    }
    //populateSites(allSites); 

}

async function getData() {
    let state = document.querySelector("#state_name").selectedOptions[0].value;
    let element = document.querySelector("#site_name");
    let cd = "";
    let site_name = "";
    if(element.selectedIndex < 0) {
        cd = ",,";
        console.log("hiss", element.selectedIndex);
    }
    else{
        console.log("rah");
        cd = document.querySelector("#site_name").selectedOptions[0].value;
    }
    let year = document.querySelector("#year_name").selectedOptions[0].value;
    console.log(cd, site_name);
    let cdn = cd.split(",");
    site_name = cd;
    let county = cdn[1];
    let site = cdn[2]
    console.log(state, county, site, year)
    let GPS_list = await getGPS(state, county, site, year);
    // console.log("GPS", GPS_list);
    let air_stats = await get_air(state, county, site, year);
    // console.log("AQ", air_stats);
    let census_stats = await get_census(state, county, year);
    // console.log("Census", census_stats);
    saveData(siteList, state, county, site_name, site, year, GPS_list, air_stats, census_stats);
    draw(census_stats)
    lineChart(air_stats)
    return GPS_list;
}

function saveData(siteList, state, county, sitename, site, year, GPS_list, air_stats, census_stats) {
    mySiteListModel.saveList();
    localStorage.removeItem("local_loclist");
    let loclist = [state, county, sitename, site, year, GPS_list, census_stats];
    localStorage.setItem("local_loclist", JSON.stringify(loclist));
    localStorage.setItem("local_airstats", JSON.stringify(air_stats));
}

function loadData() {
    mySiteListModel.loadList();
    let loclist = localStorage.getItem("local_loclist");
    loclist = loclist ? JSON.parse(loclist) : [];
    let state = -1;
    let year = "";
    let county = "";
    let site = "";
    let sitename = "";
    let GPS_list = [];
    let census_stats = []
    if (loclist.length>0){
        state = loclist[0];
        county = loclist[1];
        sitename = loclist[2];
        site = loclist[3];
        year = loclist[4];
        GPS_list = loclist[5];
        census_stats = loclist[6];
    } 
    
    let air_stats = localStorage.getItem("local_airstats");
    air_stats = air_stats ? JSON.parse(air_stats) : [];
    if (state != -1) {
        return [state, county, sitename, site, year, GPS_list, census_stats, air_stats]
    } else {
        return [];
    }
}


// Get latitude and longitude
async function getGPS(state, county, site, year){
    console.log(state, county, site, year);
    let url = `https://aqs.epa.gov/data/api/annualData/bySite?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=${year}0618&edate=${year}0618&state=${state}&county=${county}&site=${site}`;
    console.log("GPS url", url);
    let data = await fetch(url)
            .then(response => response.json())
            .catch(error => console.log(error));
    console.log(data.Data[0].latitude, data.Data[0].longitude);
    return [data.Data[0].latitude, data.Data[0].longitude];
}

// Get air quality data
// Return average for that site for the year and fraction of days that exceed the limit
async function get_air(state, county, site, year) {
    
    let url = `https://aqs.epa.gov/data/api/dailyData/bySite?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=${year}0101&edate=${year}1231&state=${state}&county=${county}&site=${site}`;
    // console.log("AQ url", url);
    let airdata = await fetch(`${url}`)
        .then(response => response.json())
        .catch(error => console.log(error));
    // let aqmean = aqtotal / aqctr;
    // let olfrac = olctr / aqctr;
    // // console.log("get_air", aqmean, olfrac);
    // return [aqmean, olfrac];
    let airdata2 = {"H":[], "Data":[]}
    for (let j of airdata["Data"]){
        let amean = j['arithmetic_mean'];
        let datel = j['date_local'];
        let newItem = {"date_local":datel,"arithmetic_mean":amean};
        airdata2["Data"].push(newItem);
        // if (j['arithmetic_mean']>35){
        //     olctr += 1;
        // }
        // aqctr += 1;
    }
    //console.log(airdata2);
    return airdata2;
}

// Get race
async function get_census(state, county, year) {
    let url = `https://api.census.gov/data/${year}/acs/acs5?get=NAME,B03001_002E,B02001_003E,B02001_004E,B02001_005E,B03001_003E&for=county:${county}&in=state:${state}&key=654a975e290481a70449f6c9bf6a9c21fe3ea0ff`;
    // console.log("Census url", url);
    let census_data = await fetch(`${url}`)
        .then(response => response.json())
        .catch(error => console.log(error));
    return [census_data[1][1], census_data[1][2], census_data[1][3], census_data[1][4], census_data[1][5]];
    // white, African-American, Native American, Asian, Hispanic
}

function setStateYearSite(state, year, site){
    let sn = document.querySelector("#state_name");
    sn.value = state;
    let yr = document.querySelector("#year_name");
    yr.value = year;
    let st = document.querySelector("#site_name");
    st.value = site;
}

populateSelectOption("#state_name", allStates); 
let plist = loadData();
if (plist.length > 0){
    console.log("it begins");
    let state = plist[0];
    let county = plist[1];
    let sitename = plist[2];
    
    let site = plist[3];
    let year = plist[4];
    let GPS_list = plist[5];
    let census_stats = plist[6];
    let air_stats = plist[7];
    console.log(sitename, state, year, site);
    setStateYearSite(state, year, sitename);
    console.log(air_stats);




    //set selector for state, year to state & year.
    //set selector for site to site
    //display map, graphs
}
