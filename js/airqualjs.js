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

async function get_air() {
    let county = "139"; // would get this from dictionary
    let site = "0505"; // would get this from dictionary
    let url = `https://aqs.epa.gov/data/api/dailyData/bySite?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=20190101&edate=20191231&state=27&county=${county}&site=${site}`;
    let numtriv = await fetch(`${url}`).then(response => response.json());
    let dlen = numtriv["Data"].length;
    //console.log(numtriv["Data"][0])
    let aqtotal = 0;
    let aqctr = 0;
    let olctr = 0;
    let longitude = numtriv["Data"][0]['longitude'];
    let latitude = numtriv["Data"][0]['latitude'];
    console.log(latitude, longitude);
    for (let j of numtriv["Data"]){
        //console.log(j['arithmetic_mean']);
        aqtotal = aqtotal + j['arithmetic_mean'];
        if (j['arithmetic_mean']>35){
            olctr += 1;
        }
        aqctr += 1;
    }
    let aqmean = aqtotal / aqctr;
    let olfrac = olctr / aqctr;
    console.log(aqtotal, aqctr, aqmean, olfrac)
}

async function get_census() {
    let county = "139"; // would get this from dictionary
    let site = "0505"; // would get this from dictionary
    let url = `https://api.census.gov/data/2019/acs/acs5?get=NAME,B03001_002E,B02001_003E,B02001_004E,B02001_005E,B03001_003E&for=county:${county}&in=state:27&key=654a975e290481a70449f6c9bf6a9c21fe3ea0ff`;
    let census_data = await fetch(`${url}`).then(response => response.json());
    console.log(census_data[1][1], census_data[1][2], census_data[1][3], census_data[1][4], census_data[1][5])
    // white, African-American, Native American, Asian, Hispanic
}

get_air()
get_census()