/* jshint esversion: 8 */
/* jshint browser: true */
/* jshint node: true */
'use strict';

const names = ["Piano", "Door Opening", "Guitar", "Beats", "SYNTH", "Scratches"];
const formats = ["Mp3", "Wav", "Ogg", "AAC"];

var mySoundModel = new SoundList();
var mySoundView = new SoundView(mySoundModel);

function populateSelect(selectElement, options) {
    for (let opt of options) {
        let anOption = document.createElement("option");
        anOption.setAttribute("value", opt);
        anOption.innerHTML = opt;
        selectElement.appendChild(anOption);
    }
}

function addSound() {
    if (!document.querySelector("#newSound").checkValidity()){
        // Warn the user
        let warning = document.createElement("p");
        warning.setAttribute("id", "feedbackMessage");
        warning.setAttribute("class", "alert alert-danger");
        warning.innerText = "Fill out name and due date";
        document.querySelector("#newSound").appendChild(warning);
        return;
    }
    // Add sound
    let name = document.querySelector("#name").selectedOptions[0].value;
    let bpm = document.querySelector("#bpm").value;
    let wave = document.querySelector("#wave").value;
    let format = document.querySelector("#format").selectedOptions[0].value;
    // Add to the model
    let newSound = new Sound(name, bpm, wave, format);
    mySoundModel.add(newSound);
};

function saveList() {
    let sounds = mySoundModel._allSounds;
    localStorage.setItem("allSounds",JSON.stringify(sounds));
};

function removeSound() {

    $("#soundList tbody tr").each(function () {
        if ($(this).find("input:checkbox:checked").length > 0){
            mySoundModel._allSounds.pop($(this).index());
            $(this).remove();
        } 

    });
}

function removeAll() {

    $("#soundList tbody tr").each(function () {
        mySoundModel._allSounds.pop($(this).index());
        $(this).remove();
    });

    localStorage.removeItem("allSounds");
    mySoundModel._allSounds = [];

}

window.onload = function () {
    populateSelect(document.querySelector("#name"), names);
    populateSelect(document.querySelector("#format"), formats);
    mySoundModel.selfPopulate("allSounds");
    console.log(mySoundModel._allSounds)
    mySoundView.redrawTable(mySoundModel._allSounds);
};