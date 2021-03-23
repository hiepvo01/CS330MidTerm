/* jshint esversion: 8 */
/* jshint browser: true */
/* jshint node: true */
'use strict';

class site {
    constructor(site_ID, name_str, cCode, sCode, selected) {
        this._site_ID = site_ID;
        this._name_str= name_str;
        this._cCode= cCode;
        this._sCode = sCode;
        this._selected = selected;
    }

    get site_ID() {
        return this._site_ID;
    }

    get name_str() {
        return this._name_str;
    }

    get cCode() {
        return this._cCode;
    }

    get sCode() {
        return this._sCode;
    }

    set selected(a) {
        this._selected = a;
    }
    get selected() {
        return this._selected;
    }
}

class Subject {
    constructor() {
        this.handlers = [];
    }

    subscribe(func) {
        this.handlers.push(func);
    }

    unsubscribe(func) {
        this.handlers = this.handlers.filter(item => item !== func);
    }

    publish(msg, obj) {
        let scope = obj || window;
        for (let func of this.handlers) {
            func(scope, msg);
        }
    }
}

class siteList extends Subject {
    constructor() {
        super();
        this.allSites = [];
    }

    add(aSite) {
        this.allSites.push(aSite);
        this.publish("New site added", this);
    }


    clearList() {
        localStorage.removeItem("local_slist");
        this.allSites = []
        this.loadList();
        this.publish("The list is empty", this);
    }

    loadList(){   //no, this should be done by view.
        let slist = localStorage.getItem("local_slist");
        slist = slist ? JSON.parse(slist) : [];
        for (let asite of slist){
            let site_ID = asite["_site_ID"];
            let name_str = asite["_name_str"];
            let cCode = asite["_cCode"];
            let sCode = asite["_sCode"];
            let selected = asite["_selected"];
            let newSite = new site(site_ID, name_str, cCode, sCode, selected);    
            mySiteListModel.add(newSite);
        }
    }

    saveList() {
        localStorage.removeItem("local_slist");
        let slist = [];
        for (let i_s of this){
            slist.push(i_s);
        }
        localStorage.setItem("local_slist", JSON.stringify(slist));
        this.publish("The list is saved", this);
    }

    changeSelected(siteID){
        console.log("Hee", siteID);
        for (let asite of this){
            if (asite.site_ID === siteID){
                asite.selected = 1;
            } else{
                asite.selected = 0;
            }
        }
    }

    toString() {
        return `${this.allSites}`;
    }

    get size() {
        return this.allSites.length;
    }

    [Symbol.iterator]() {
        var idx = -1;
        return {
            next: () => ({value: this.allSites[++idx], done: !(idx in this.allSites)})
        };
    }
}