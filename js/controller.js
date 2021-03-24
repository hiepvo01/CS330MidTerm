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
    newOption.innerHTML = opt;
    menu.appendChild(newOption);
}

// Change title
function changeTitle(state, year){
    var origin = document.querySelector("#title"); 
    origin.innerHTML = `Air pollution & Census data in ${state} ${year}`;
}
  

let allStates = {};
async function getStates(){
    let states = await fetch("https://api.census.gov/data/2010/dec/sf1?get=NAME&for=state:*")
    .then(response => response.json())
    .catch(error => console.log(error));
    for(let state of states.slice(1, states.length)){
        allStates[state[0]] = state[1]
    }
}
// Populate states
async function populateSelectOption(elementId, optionsArray) {

    await getStates();
    console.log(allStates)
    let menu = document.querySelector(elementId);
    for (let opt in optionsArray) {
        let newOption = document.createElement("option");
        // newOption.setAttribute("value", optionsArray[opt]);
        newOption.setAttribute("value", opt);
        newOption.innerHTML = opt;
        menu.appendChild(newOption);
    }
}


async function getSites(){
    let state = document.getElementsByName("States")[0].value;
    let sc = allStates[state]
    // let sc = document.querySelector("#state_name").selectedOptions[0].value;
    let year = document.querySelector("#year_name").selectedOptions[0].value;
    changeTitle(state, year);
    let url = `https://aqs.epa.gov/data/api/monitors/byState?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=${year}0608&edate=${year}0608&state=${sc}`

    let sitedata = await fetch(url)
            .then(response => response.json())
            .catch(error => console.log(error));

    console.log(sitedata)
    let allSites = {};
    mySiteListModel.clearList();
    clearData();
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
            let newSite = new site(siteID, name_str, cCode, sCode, 0); //selected = 0
            mySiteListModel.add(newSite);   // adding to model - new
        }
    }
    //populateSites(allSites);   // replaced with mySiteListModel

}

async function getData() {
    let sc = document.getElementsByName("States")[0].value;
    let state = allStates[sc]
    // let state = document.querySelector("#state_name").selectedOptions[0].value;
    // console.log(state)
    let element = document.querySelector("#site_name");
    let cd = "";
    let site_name = "";
    if(element.selectedIndex < 0) {
        cd = ",,";
    }
    else{
        cd = document.querySelector("#site_name").selectedOptions[0].value;
    }
    let year = document.querySelector("#year_name").selectedOptions[0].value;
    let cdn = cd.split(",");
    site_name = cd;
    let county = cdn[1];
    let site = cdn[2];
    let site_ID = county.concat("-", site);
    mySiteListModel.changeSelected(site_ID);

    let GPS_list = await getGPS(state, county, site, year);

    let air_stats = await get_air(state, county, site, year);

    let census_stats = await get_census(state, county, year);

    saveData(siteList, state, county, site_name, site, year, GPS_list, air_stats, census_stats);  // saves everything
    draw(census_stats)
    lineChart(air_stats)
    initMap(GPS_list);
}

//Saves all data.  Not sure if air stats correctly reconstituted 
function saveData(siteList, state, county, sitename, site, year, GPS_list, air_stats, census_stats) {
    mySiteListModel.saveList();
    localStorage.removeItem("local_loclist");
    localStorage.removeItem("local_airstats");
    let loclist = [state, county, sitename, site, year, GPS_list, census_stats];
    localStorage.setItem("local_loclist", JSON.stringify(loclist));
    localStorage.setItem("local_airstats", JSON.stringify(air_stats));
}

//clears location, census, and AQdata
function clearData() {
    localStorage.removeItem("local_loclist");
    localStorage.removeItem("local_airstats");
    loadData();
}

// retrieves data after page load
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
    let url = `https://aqs.epa.gov/data/api/annualData/bySite?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=${year}0618&edate=${year}0618&state=${state}&county=${county}&site=${site}`;
    let data = await fetch(url)
            .then(response => response.json())
            .catch(error => console.log(error));
    return [data.Data[0].latitude, data.Data[0].longitude];
}

// Get air quality data
// Return average for that site for the year and fraction of days that exceed the limit
async function get_air(state, county, site, year) {
    
    let url = `https://aqs.epa.gov/data/api/dailyData/bySite?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=${year}0101&edate=${year}1231&state=${state}&county=${county}&site=${site}`;
    let airdata = await fetch(`${url}`)
        .then(response => response.json())
        .catch(error => console.log(error));
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
    return airdata2;
}

// Get race
async function get_census(state, county, year) {
    let url = `https://api.census.gov/data/${year}/acs/acs5?get=NAME,B03001_002E,B02001_003E,B02001_004E,B02001_005E,B03001_003E&for=county:${county}&in=state:${state}&key=654a975e290481a70449f6c9bf6a9c21fe3ea0ff`;
    let census_data = await fetch(`${url}`)
        .then(response => response.json())
        .catch(error => console.log(error));
    return [census_data[1][1], census_data[1][2], census_data[1][3], census_data[1][4], census_data[1][5]];
    // white, African-American, Native American, Asian, Hispanic
}

// reset correct menu items after reloading data from local storage
function setStateYearSite(state, year, site){
    let sn = document.querySelector("#state_name");
    sn.value = state;
    let yr = document.querySelector("#year_name");
    yr.value = year;
    let st = document.querySelector("#site_name");
    st.value = site;
}


populateSelectOption("#state_name", allStates); 
let plist = loadData();  // reloads from local stroage
if (plist.length > 0){
    let state = plist[0];
    let county = plist[1];
    let sitename = plist[2];
    
    let site = plist[3];
    let year = plist[4];
    let GPS_list = plist[5];
    let census_stats = plist[6];
    let air_stats = plist[7];
    setStateYearSite(state, year, sitename);  // sets options on dropdown
    draw(census_stats)
    lineChart(air_stats)
    initMap(GPS_list);
}
