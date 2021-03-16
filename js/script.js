function getData(url) {
    return fetch(url).then(response => response.text())
    .catch(error => console.log(error)) 
}

async function getCorr(){
    let url = "https://aqs.epa.gov/data/api/annualData/bySite?email=baacer01@luther.edu&key=ecruhare55&param=88101&bdate=20190618&edate=20190618&state=27&county=037&site=0480";
    
    let data = await fetch(url)
            .then(response => response.json())
            .catch(error => console.log(error));
    return [data.Data[0].latitude, data.Data[0].longitude]
}


// Initialize and add the map
function initMap() {
    // The location of Uluru
    let result = getCorr();
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