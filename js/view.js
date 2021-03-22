/* jshint esversion: 8 */
/* jshint browser: true */
/* jshint node: true */
'use strict';

class siteListView {
    constructor(model) {
        model.subscribe(this.redrawList.bind(this));
    }

    redrawList(siteList, msg) {
        console.log(msg);
        let menu = document.querySelector("#site_name");
        menu.disabled = false;
        menu.innerHTML = "";
        for (let asite of siteList) {
            let newOption = document.createElement("option");
            let slist = [asite.name_str, asite.cCode, asite.sCode];
            newOption.setAttribute("value", slist);
            newOption.innerHTML = asite.name_str;
            menu.appendChild(newOption);
        }
    }
}
