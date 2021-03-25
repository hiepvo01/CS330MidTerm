Chart.defaults.global.defaultFontFamily = 'Roboto';
Chart.defaults.global.defaultFontColor = '#333';
Chart.Legend.prototype.afterFit = function() {
  this.height = this.height + 5;
};

Chart.pluginService.register({
    beforeDraw: function(chart) {
      if (chart.config.options.elements.center) {
        // Get ctx from string
        var ctx = chart.chart.ctx;
  
        // Get options from the center object in options
        var centerConfig = chart.config.options.elements.center;
        var fontStyle = centerConfig.fontStyle || 'Arial';
        var txt = centerConfig.text;
        var color = centerConfig.color || '#000';
        var maxFontSize = centerConfig.maxFontSize || 75;
        var sidePadding = centerConfig.sidePadding || 20;
        var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
        // Start with a base font of 30px
        ctx.font = "35px " + fontStyle;
  
        // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
        var stringWidth = ctx.measureText(txt).width;
        var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;
  
        // Find out how much the font can grow in width.
        var widthRatio = elementWidth / stringWidth;
        var newFontSize = Math.floor(30 * widthRatio);
        var elementHeight = (chart.innerRadius * 2);
  
        // Pick a new font size so it will not be larger than the height of label.
        var fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
        var minFontSize = centerConfig.minFontSize;
        var lineHeight = centerConfig.lineHeight || 25;
        var wrapText = false;
  
        if (minFontSize === undefined) {
          minFontSize = 20;
        }
  
        if (minFontSize && fontSizeToUse < minFontSize) {
          fontSizeToUse = minFontSize;
          wrapText = true;
        }
  
        // Set font settings to draw it correctly.
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
        var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
        ctx.font = fontSizeToUse + "px " + fontStyle;
        ctx.fillStyle = color;
  
        if (!wrapText) {
          ctx.fillText(txt, centerX, centerY);
          return;
        }
  
        var words = txt.split(' ');
        var line = '';
        var lines = [];
  
        // Break words up into multiple lines if necessary
        for (var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = ctx.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > elementWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
  
        // Move the center up depending on line height and number of lines
        centerY -= (lines.length / 2) * lineHeight;
  
        for (var n = 0; n < lines.length; n++) {
          ctx.fillText(lines[n], centerX, centerY);
          centerY += lineHeight;
        }
        //Draw text in center
        ctx.fillText(line, centerX, centerY);
      }
    }
  });

function resetCanvas(){
  $('.container-fluid').remove();
  $('.chart').append('<div class="container-fluid"></div>')
  let i=1;
    $('.container-fluid').append(`
    <div class="row">
        <div class="col-6">
        <canvas id="chart${i}"></canvas>
        <div class="chartTitle"><a href="https://www.census.gov/programs-surveys/acs" target="_blank">County US Census race and ethnicity data</a></div>
        </div>
        <div class="col-6">
        <canvas id="chart${i+1}"></canvas>
        <div class="chartTitle"><a href="https://www.epa.gov/air-trends/particulate-matter-pm25-trends" target="_blank">PM 2.5 pollution data  from US Environmental Protection Agency</a></div>
        </div>
    </div>`)

    $('.imageMap').remove();
    $('body').append(`<div class="imageMap">
    <div class = "row">
      <div class="col-6"><img src="images/pm2.5_scale_graphic-color_2.jpg" alt="PM 2.5 graph"></div>
      <div class="col-6"><div id="map"></div></div>
    </div>
  </div>`)
}

function changeTitle(title){
  var origin = document.querySelector("#title"); 
  origin.innerHTML = `Number of Students per ${title} per Year`;
}

async function lineChart(airdata){

  var expensesByYear = d3.nest()
    .key(function(d) {
        let l =  d.date_local.split("-")[1];
        if (l[0] == "0") {
            return l[1]
        } else {
            return l
        }
    })
    .rollup(function(v) { return d3.mean(v, function(d) { return d.arithmetic_mean; }).toFixed(2); })
    .object(airdata.Data);

    var labels = Object.keys(expensesByYear)
    var data = Object.values(expensesByYear)

    var ctx = chart2.getContext('2d');
    var config = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
              label: 'PM 2.5',
              data: data,
              fill: false,
              borderColor: 'rgba(0, 119, 204, 0.3)',
              backgroundColor: '#000099',
              anchor:'end'
          }]
        },options: {
            scales: {
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Month'
                }
              }],
                yAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'PM 2.5 monthly average (ug/m3)'
                  },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 20
                    }
                }]
            },
        }

    };
    
    var chart = new Chart(ctx, config);
    
    let aqtotal = 0;
    let aqctr = 0;
    let olctr = 0;

    for (let j of airdata["Data"]){
        aqtotal = aqtotal + j['arithmetic_mean'];
        if (j['arithmetic_mean']>35){
            olctr += 1;
        }
        aqctr += 1;
    }

}

async function testChartPie(census, chartid) {
  
    races = ["White", "African-American", "Native American", "Asian", "Hispanic"]
    terms_data = []
    terms_labels = []
    terms_colors = []

    var keyValues = []
    for (let idx=0; idx<5; idx++) {
      keyValues.push([ races[idx], census[idx] ])
    }
    keyValues.sort(function compare(kv1, kv2) {
      return kv2[0].localeCompare(kv1[0])
    })

    for (val of keyValues) {
      terms_labels.push(val[0]);
      terms_data.push(val[1]);
    }

    var myColor = d3.scaleOrdinal().domain(terms_labels)
    .range(d3.schemeSet2)
    for (val of keyValues) {
      terms_colors.push(myColor(val[0]))
    }
    var chart = new Chart(chartid, {
        type: 'pie',
        options: {
        title: {
            display: false,
            position: 'bottom',
            text: 'Chart.js Doughnut Chart'
        },
        // elements: {
        //     center: {
        //         text: "Test Race",
        //         color: '#FF6384', // Default is #000000
        //         fontStyle: 'Arial', // Default is Arial
        //         sidePadding: 20, // Default is 20 (as a percentage)
        //         minFontSize: 25, // Default is 20 (in px), set to false and text will not wrap.
        //         lineHeight: 25 // Default is 25 (in px), used for when text wraps
        //     }
        // },
          maintainAspectRatio: true,
          responsive: true,
          legend: {
            display: true
          },
          plugins: {
            datalabels: {
                backgroundColor: function(context) {
                    return context.dataset.backgroundColor;
                  },
                  borderColor: 'white',
                  borderRadius: 50,
                  borderWidth: 5,
                  color: 'white',
                  anchor:'end',
            },
        },
        },
        data: {
          labels: terms_labels,
          datasets: [
            {
              data: terms_data,
              backgroundColor: terms_colors
            }
          ],
        }
      })
    }

function testChartBar(students, year, attr, chartid) {
    students = students.filter(function(d){ return d.Academic_Year == year });
    var terms = d3.group(students, d => d[attr]);
    terms_data = []
    terms_labels = []
    terms_colors = []

    var keyValues = []
    for (key of terms.keys()) {
      keyValues.push([ key, terms.get(key).length ])
    }
    keyValues.sort(function compare(kv1, kv2) {
      return kv2[0].localeCompare(kv1[0])
    })

    for (val of keyValues) {
      terms_labels.push(val[0]);
      terms_data.push(val[1]);
    }

    var myColor = d3.scaleOrdinal().domain(terms_labels)
    .range(d3.schemeSet2)
    for (val of keyValues) {
      terms_colors.push(myColor(val[0]))
    }
    var chart = new Chart(chartid, {
        type: 'bar',
        options: {
            maintainAspectRatio: true,
            responsive: true,
            legend: {
            display: false
            },
            plugins: {
            datalabels: {
                formatter: (value, ctx) => {
                    let sum = 0;
                    let dataArr = ctx.chart.data.datasets[0].data;
                    dataArr.map(data => {
                        sum += data;
                    });
                    let percentage = (value*100 / sum).toFixed(2)+"%";
                    return percentage;
                },
                backgroundColor: function(context) {
                    return context.dataset.backgroundColor;
                    },
                    borderColor: 'white',
                    borderRadius: 50,
                    borderWidth: 5,
                    color: 'white',
                    anchor:'end',
            },
        },
          scales: {
            xAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: attr,
                  fontSize: 16
                }
              }
            ]
          }
        },
        data: {
            labels: terms_labels,
            padding: 5,
            datasets: [
            {
                data: terms_data,
                backgroundColor: terms_colors
            }
            ],
        }
        })
    }

function draw(census){
  resetCanvas();
  d3.select('canvas').selectAll('*').remove();
  testChartPie(census, 'chart1');
}