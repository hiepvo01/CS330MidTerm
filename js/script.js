// Initialize and add the map
async function initMap() {

    let result = await getData();
    const uluru = { lat: result[0], lng: result[1] };
    // The map, centered at Uluru
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 6,
      center: uluru,
    });
    // The marker, positioned at Uluru
    const marker = new google.maps.Marker({
      position: uluru,
      map: map,
    });
  }