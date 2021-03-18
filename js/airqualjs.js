/* jshint esversion: 8 */
/* jshint browser: true */
/* jshint node: true */
'use strict';

async function get_air() {
    let url = "https://aqs.epa.gov/data/api/dailyData/bySite?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=20190101&edate=20191231&state=27&county=109&site=5008";
    let numtriv = await fetch(`${url}`).then(response => response.json());
    let dlen = numtriv["Data"].length;
    //console.log(numtriv["Data"][0])
    let aqtotal = 0;
    let aqctr = 0;
    let olctr = 0;
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

get_air()