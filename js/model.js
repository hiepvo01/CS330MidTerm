/* jshint esversion: 8 */
/* jshint browser: true */
/* jshint node: true */
'use strict';

class site {
    constructor(site_ID, name_str, cCode, sCode) {
        this._site_ID = site_ID;
        this._name_str= name_str;
        this._cCode= cCode;
        this._sCode = sCode;
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
        //this.allInvaders = this.allInvaders.filter(anInvader => anInvader.removed & !anInvader.removed)
        
        // This worked!  But it is silly.  Must be a better way.
        this.allSites = []
        // This is the better way!
        this.loadList();
        this.publish("The list is empty", this);
    }

    loadList(){   //no, this should be done by view.
        let slist = localStorage.getItem("local_slist");
        slist = slist ? JSON.parse(slist) : [];
        //console.log("ilist:", ilist.length);  
        let fnames = ["_species", "_location", "_worker", "_date", "_removed"];
        for (let asite of slist){
            //console.log("inv item: ", inv);
            let site_ID = asite["_site_ID"];
            let name_str = asite["_name_str"];
            let cCode = asite["_cCode"];
            let sCode = asite["_sCode"];
            let newSite = new site(site_ID, name_str, cCode, sCode);    
            mySiteListModel.add(newSite);
        }
    }

    saveList() {
        localStorage.removeItem("local_slist");
        let slist = [];
        for (let i_s of this){
            //console.log(this);
            slist.push(i_s);
        }
        localStorage.setItem("local_slist", JSON.stringify(slist));
        this.publish("The list is saved", this);
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