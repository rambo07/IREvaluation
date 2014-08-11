var d3 = require('d3');

//TEMP contents to keep non-empty
function createGraph() {
    // create dataset
  var data = [4, 8, 15, 16, 23, 42];

  //scale to fit: maps data space (the domain) to literal display space (the range)
  var x = d3.scale.linear()
      .domain([0, d3.max(data)])
      .range([0, 420]);

  //select chart container using class selector
  d3.select(".chart")
    //equivalent to "var bar = chart.selectAll(div)"- initiates data join
    .selectAll("div")
      //equiv to "var barUpdate = bar.data(data)" - joins data to selection
      .data(data)
      //the enter selection represents new data w no already existing element, i.e. our new bars??
    .enter().append("div")
      //style and label the bars (already bound to data by the join)
      .style("width", function(d) { return x(d) + "px"; })
      .text(function(d) { return d; });
  }
