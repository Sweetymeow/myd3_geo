
var dispatch = d3.dispatch("load", "statechange");
var pppCirMap = 1;

var groups = ["Labour force participation",
			  "Wage equality for similar work (survey)",
			  "Estimated earned income (PPP US$)",
			  "Legislators senior officials & managers",
			  "Professional and technical workers",
			  "Literacy rate","Enrollment in primary education",
			  "Enrollment in secondary education",
			  "Enrollment in tertiary education",
			  "Sex ratio at birth (female/male)",
			  "Healthy life expectancy",
			  "Women in parliament",
			  "Women in ministerial positions",
			  "Years with female head of state(last 50)"];// sub-title for csv

d3.csv("data/gg_gdp.csv", type, function(error, states) {
	if (error) 
		throw error;
	var stateById = d3.map();
	console.log(stateById);
	states.forEach(function(d) { 
		stateById.set(d.id, d); 
	});
	dispatch.load(stateById);
	dispatch.statechange(stateById.get("China,2014"));
});

// A drop-down menu for selecting a state; uses the "menu" namespace.
dispatch.on("load.menu", function(stateById) {
  var select = d3.select("div.map")
        .append("div").attr("class","cySelect")
        .append("select")
        .on("change", function() {
            dispatch.statechange(stateById.get(this.value)); 
        });

  select.selectAll("option")
        .data(stateById.values())
        .enter().append("option")
        .attr("value", function(d) { return d.id; })
        .text(function(d) { return d.id; });

  dispatch.on("statechange.menu", function(state) {
      //console.log(state);
    select.property("value", state.id);
  });
});

// A pie chart to show population by age group; uses the "pie" namespace.
dispatch.on("load.pie", function(stateById) {
//	console.log("State By Id: ");
	console.log(stateById);
	var width = 660,
		height = 500,
		//radius = Math.min(width, height) / 2;
		radius = 70; // Test radius

	var color = d3.scale.ordinal()
			.domain(groups)  // sub-title for csv
			.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
	var color2 = d3.scale.category20();

	var arc = d3.svg.arc()
				.outerRadius(radius*2 - 10)
				.innerRadius(radius*2 - 70);

	var pie = d3.layout.pie()
				.sort(null);

	var svg = d3.select("div.map").append("svg")
				.attr("width", width)
				.attr("height", height)
				.append("g")
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	
	var cirGroup = svg.append("g")
				.attr("class","circles");
	
	var pppCircle = cirGroup.append("circle")
						.attr("class","ppp");

	var bars = svg.selectAll("rect")
                .data(groups)
                .enter().append("rect")
                .style("fill", color2)
                .attr('rx', 6)
                .attr('x', 0)
                .attr('ry', 6)
                .attr('y', 0)
                .each(function() { this._current = {startAngle: 0, endAngle: 0}; });
	
	var ageCircle = cirGroup.append("circle")
						.attr("class","age");
	
	var ageText = cirGroup.append("text")
					.attr("class","ageText")
					.style("fill", "white")
					.style("font-size", "26px")
				.attr("transform", "translate(0, 9)");;

  dispatch.on("statechange.pie", function(d) {
      var eachangle = 360/14,
          eachradians = 2*Math.PI/14;
	  var cyPPP = Number(d.ppp2),
	  	  maAge = Number(d.age);
	  
	  radius = cyPPP/2;
	  console.log("PPP: " + d.ppp2);
	  
	  pppCircle.attr("cx",0)
	  			.attr("cy",0)
	  			.attr("r", cyPPP)
	  			.style("fill", "pink");
	  
	  ageCircle.attr("cx",0)
	  			.attr("cy",0)
	  			.attr("r", maAge)
	  			.style("fill", "red");
	  
	  ageText.attr("text-anchor", "middle")
		  	.attr("id", "age")
		  .text(function(d) { return maAge; });
	 
	  var barXY =[0,0]; // 这个好像不好用啊？
      // Bar data
      bars.data(pie.value(function(g) { return d[g];})(groups))
			.attr("width", 0)
			.attr("height", 2*Math.PI*radius/14 + "px")
			.attr("transform", function(d,i){
		  			barXY[0] = radius*Math.cos(eachradians*(i+0.5));
		  			barXY[1] = -1*radius*Math.sin(eachradians*(i+0.5));
				  return "translate("+ barXY[0] +","+ barXY[1] +"),rotate(" + eachangle*(-i)+ ")";
	  		});
      
	  // Chart bar animation
      bars.transition()
            .attr("width", function(d) {
                  return radius*d.value+"px";
            })
            .delay(function(d, i) {
                return i * 50;
            })
            .duration(1000)
            .ease('elastic');
	  
	  bars.on("click", function(d){
		  var clickpos = getMousePos(onclick);
		  d3.select("#tooltip").style("opacity",1);
		  
		  console.log(clickpos);
		  //Get this bar's x/y values, then augment for the tooltip
		  //console.log(d3.select(this).node().getBBox());
		  
			//Update the tooltip position and value
			var tooltip = d3.select("#tooltip")
				.style("left", clickpos.x +20 + "px")
				.style("top", clickpos.y-50 + "px")						
				.select("#value")
				.text(d.data);
		  
			d3.select("#tooltip").transition()
				.style("opacity",0)
				.delay(5000)
				.duration(1000)
            	.ease('elastic');

			//Show the tooltip
			d3.select("#tooltip").classed("hidden", false);
	  });
  });
});

    
// A bar chart to show total population; uses the "bar" namespace.
dispatch.on("load.bar", function(stateById) {
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
	  width = 120 - margin.left - margin.right,
	  height = 460 - margin.top - margin.bottom;

  var y = d3.scale.linear()
	  .domain([0, d3.max(stateById.values(), function(d) { 
		  return d.total; })])
	  .rangeRound([height, 0])
	  .nice();

  var yAxis = d3.svg.axis()
	  .scale(y)
	  .orient("left")
	  .tickFormat(d3.format(".2s"));

  var svg = d3.select("div.map").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
	  .attr("class", "y axis")
	  .call(yAxis);

  var rect = svg.append("rect")
	  .attr("x", 4)
	  .attr("width", width - 10)
	  .attr("y", height)
	  .attr("height", 0)
	  .style("fill", "#aaa");

  dispatch.on("statechange.bar", function(d) {
	rect.transition()
		.attr("y", y(d.total))
		.attr("height", y(0) - y(d.total));
  });
});

    
// A bar chart to show total population; uses the "bar" namespace.
dispatch.on("load.bar", function(stateById) {
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
	  width = 120 - margin.left - margin.right,
	  height = 500 - margin.top - margin.bottom;

  var y = d3.scale.linear()
	  .domain([0, d3.max(stateById.values(), function(d) { 
		  return d.total; })])
	  .rangeRound([height, 0])
	  .nice();

  var yAxis = d3.svg.axis()
	  .scale(y)
	  .orient("left")
	  .tickFormat(d3.format(".2s"));

  var svg = d3.select("div.map").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
	  .attr("class", "y axis")
	  .call(yAxis);

  var rect = svg.append("rect")
	  .attr("x", 4)
	  .attr("width", width - 10)
	  .attr("y", height)
	  .attr("height", 0)
	  .style("fill", "#aaa");

  dispatch.on("statechange.bar", function(d) {
	rect.transition()
		.attr("y", y(d.total))
		.attr("height", y(0) - y(d.total));
  });
});

// Coerce population counts to numbers and compute total per state.
function type(d) {
  d.total = d3.sum(groups, function(k) { return d[k] = +d[k]; });
  return d;
}
	
function getMousePos(event) {
	var e = event || window.event;
	return {'x':e.clientX,'y':e.clientY}
}

//    Parse.initialize("APPLICATION_ID", "JAVASCRIPT_KEY");
    Parse.initialize("sr4B0s62RshtQG2MwvVUXWYNWCnE6qvzHdjKDNfy", "4OnAG23buEs16uMkFeearCADfkTAnNeqMreS8l60");
    