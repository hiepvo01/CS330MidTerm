/* jshint esversion: 8 */
/* jshint browser: true */
/* jshint node: true */
'use strict';


// this rebuilds the site menu after loading from local storage or when processing API
class siteListView {
    constructor(model) {
        model.subscribe(this.redrawList.bind(this));
    }

    redrawList(siteList, msg) {
        console.log(msg);
        let menu = document.querySelector("#site_name");
        menu.disabled = false;
        menu.innerHTML = "";
        let selstr = "";
        for (let asite of siteList) {
            let newOption = document.createElement("option");
            let slist = [asite.name_str, asite.cCode, asite.sCode];
            if (asite.selected === 1){    // if a site is selected, this value becomes 1.  
                selstr  = slist;          // This allows re-display of selected item.
            } 
            newOption.setAttribute("value", slist);
            newOption.innerHTML = asite.name_str;
            menu.appendChild(newOption);
        }
        if (selstr != ""){
            menu.value = selstr;
        } else{
            menu.selectedIndex = 0;  // If no item previously selected, display first item.
        }
    }
}
