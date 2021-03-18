function getData(url) {
    return fetch(url).then(response => response.text())
    .catch(error => console.log(error)) 
}

async function getCorr(){
    let state = document.querySelector("#state");
    let county = document.querySelector("#county");
    let site = document.querySelector("#site");

    let url = `https://aqs.epa.gov/data/api/annualData/bySite?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=20190618&edate=20190618&state=${state.value}&county=${county.value}&site=${site.value}`;
    console.log(url)
    let data = await fetch(url)
            .then(response => response.json())
            .catch(error => console.log(error));
    return [data.Data[0].latitude, data.Data[0].longitude]
}


// Initialize and add the map
async function initMap() {
    
    // The location of Uluru
    // let result = await getCorr("27", "037" "0480");
    // "27", '137'
    let result = await getCorr();
    console.log(result)
    const uluru = { lat: result[0], lng: result[1] };
    // The map, centered at Uluru
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 4,
      center: uluru,
    });
    // The marker, positioned at Uluru
    const marker = new google.maps.Marker({
      position: uluru,
      map: map,
    });
  }

window.onload = function (){

}