/* jshint esversion: 8 */
/* jshint browser: true */
/* jshint node: true */
'use strict';


const allCounties = {
    "Anoka":["003","1002"],
    "Becker":["005","2013"],
    "Carlton":["017","7414"],
    "Cook":["031","7810"],
    "Dakota":["037","480"],
    "Hennepin":["053","0962"],
    "Lyon":["083","4210"],
    "Olmsted":["109","5008"],
    "Ramsey":["123","0868"],
    "Saint Louis":["137","7550"],
    "Scott":["139","0505"], 
    "Stearns":["145","3052"],
};

async function getData() {
    let state = "27";
    let cd = document.querySelector("#county_name").selectedOptions[0].value;
    let cdn = cd.split(",");
    let county = cdn[0];
    let site = cdn[1]
    //let county = document.querySelector("#county");
    //let site = document.querySelector("#site");
    let GPS_list = getGPS(state, county, site);
    console.log("GPS", GPS_list);
    let air_stats = get_air(state, county, site);
    console.log("AQ", air_stats);
    let census_stats = get_census(state, county);
    console.log("Census", census_stats);
}

async function getGPS(state, county, site){
    let url = `https://aqs.epa.gov/data/api/annualData/bySite?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=20190618&edate=20190618&state=${state}&county=${county}&site=${site}`;
    console.log("GPS url", url);
    let data = await fetch(url)
            .then(response => response.json())
            .catch(error => console.log(error));
    //return [data.Data[0].latitude, data.Data[0].longitude]
    console.log(data.Data[0].latitude, data.Data[0].longitude);
    return [data.Data[0].latitude, data.Data[0].longitude];
}

async function get_air(state, county, site) {
    
    let url = `https://aqs.epa.gov/data/api/dailyData/bySite?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=20190101&edate=20191231&state=${state}&county=${county}&site=${site}`;
    console.log("AQ url", url);
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
    console.log("get_air", aqmean, olfrac);
    return [aqmean, olfrac];
}

async function get_census(state, county) {
    let url = `https://api.census.gov/data/2019/acs/acs5?get=NAME,B03001_002E,B02001_003E,B02001_004E,B02001_005E,B03001_003E&for=county:${county}&in=state:${state}&key=654a975e290481a70449f6c9bf6a9c21fe3ea0ff`;
    console.log("Census url", url);
    let census_data = await fetch(`${url}`).then(response => response.json());
    console.log('race');
    console.log(census_data[1][1], census_data[1][2], census_data[1][3], census_data[1][4], census_data[1][5]);
    return [census_data[1][1], census_data[1][2], census_data[1][3], census_data[1][4], census_data[1][5]];
    // white, African-American, Native American, Asian, Hispanic
}

function populateSelectOption(elementId, optionsArray) {
    let menu = document.querySelector(elementId);
    for (let opt in optionsArray) {
        let newOption = document.createElement("option");
        newOption.setAttribute("value", optionsArray[opt]);
        newOption.innerHTML = opt;
        menu.appendChild(newOption);
    }
}

window.onload = function() {
    populateSelectOption("#county_name", allCounties); 
    let cd = document.querySelector("#county_name").selectedOptions[0].value;
    let cdn = cd.split(",");
    console.log(cdn[0], cdn[1]);
}