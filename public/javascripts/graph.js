//roughly the same code as in functionjson.html. was originally for testing that the run-selection worked. 

//loading json file
d3.json('/records/runlist',function(jsonarray){
  var test = d3.entries(jsonarray);
  var testing; //variable to hold desired run
  $.each(jsonarray, function(){
      if (this.run == document.title) { //find out which run was selected from the title of the page (as set when clicked from /records)
        console.log(this);
        testing = this;
      }
  });

  //Two Arrays one for values and other for measures
  var measurename = [];
  var measurevalue = [];
        var check = ["map","gm_map","Rprec","bpref","recip_rank","P_5","P_1000"]
  console.log(testing.results[0].measure)
  for (var i in testing.results)
  {
          if(check.indexOf(testing.results[i].measure)!=-1)
    {
      measurename.push(testing.results[i].measure);
      measurevalue.push(testing.results[i].value);
    }
  }
//console.log(measurename);
//console.log(measurevalue);

//Window Size
var w = 600;
var h = 350;
var barPadding = 5;
var padding = 20;


var yscale = d3.scale.linear()
                     .domain([0, d3.max(measurevalue, function(d) { return d; })])
         .range([h-padding,padding]);

var xscale = d3.scale.ordinal()
    .range([0,w]);


//Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

svg.selectAll(".bar")
   .data(measurevalue)
   .enter()
   .append("rect")
   .attr("class","bar")
   .attr("x",function(d,i){
  return 40+i*(w/measurevalue.length);})
       .attr("y", function(d){
  console.log("test "+h+" "+d+" "+(h-yscale(d)));
  return (yscale(d));})
   .attr("width", w/measurevalue.length - barPadding-30)
   .attr("height", function(d) {return h-yscale(d) -padding;})
   .attr("fill",function(d){return "rgb(0,0,"+Math.round(h-yscale(d))+")";});

svg.selectAll("text")
   .data(measurename)
   .enter()
   .append("text")
        
   .text(function(d) {
        return d;
   }) 
  .attr("text-anchor", "middle")
  .attr("x", function(d, i) {
        return 25+i * (w / measurename.length) +(w / measurename.length - barPadding) / 2;
   })
   .attr("y", function(d) {
        return h-5 ;
   })
   .attr("font-family", "sans-serif")
   .attr("font-size", "12px")
   .attr("fill", "black");

var yAxis = d3.svg.axis()
        .scale(yscale)
        .orient("left")
  .ticks(10)
svg.append("g")
    .attr("class","axis")
    .attr("transform", "translate(30,0)")
    .call(yAxis);

var xAxis = d3.svg.axis()
        .scale(xscale)
        .orient("bottom")
svg.append("g")
    .attr("class","axis")
    .attr("transform", "translate(20,330)")
    .call(xAxis);
});
