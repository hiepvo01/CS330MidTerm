// // config references
// var chartConfig = {
//   target : 'chart',
//   data_url : 'external_data.json',
//   width: 900,
//   height: 450,
//   val: 90
// };

// // loader settings
// var opts = {
// lines: 9, // The number of lines to draw
// length: 9, // The length of each line
// width: 5, // The line thickness
// radius: 14, // The radius of the inner circle
// color: '#EE3124', // #rgb or #rrggbb or array of colors
// speed: 1.9, // Rounds per second
// trail: 40, // Afterglow percentage
// className: 'spinner', // The CSS class to assign to the spinner
// };

// var target = document.getElementById(chartConfig.target);

// // callback function wrapped for loader in 'init' function
// function init() {

//   // trigger loader
//   var spinner = new Spinner(opts).spin(target);

//   // slow the json load intentionally, so we can see it every load
//   setTimeout(function() {

//       // load json data and trigger callback
//       d3.json(chartConfig.data_url, function(data) {

//           // stop spin.js loader
//           spinner.stop();

//           // instantiate chart within callback
//           chart(data);

//       });

//   }, 1500);
// } 

// init();

// let allStates = {};

// async function getStates(){
//     let states = await fetch("https://api.census.gov/data/2010/dec/sf1?get=NAME&for=state:*")
//     .then(response => response.json())
//     .catch(error => console.log(error));
//     for(let state of states.slice(1, states.length)){
//         allStates[state[0]] = Number(state[1])
//     }
// }

// getStates();
// console.log(allStates)

// Initialize and add the map
async function initMap(result) {
    const uluru = { lat: result[0], lng: result[1] };
    console.log(uluru)
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