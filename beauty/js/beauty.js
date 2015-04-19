/** Parse: save user's select country **/
// current only allow one country
// Parse.initialize("APPLICATION_ID", "JAVASCRIPT_KEY");
Parse.initialize("sr4B0s62RshtQG2MwvVUXWYNWCnE6qvzHdjKDNfy", "4OnAG23buEs16uMkFeearCADfkTAnNeqMreS8l60");

var BeautyUser = Parse.Object.extend("BeautyUser");
var beautyUser = new BeautyUser();

// Lots of code from:  http://bl.ocks.org/3757125
//  http://bl.ocks.org/3795040

/** D3.js - Global **/
d3.select(window)
	.on("click", mouseup)
	.on("mousemove", mousemove)
	.on("mouseup", mouseup);

var width = 660,
	height = 600;

var proj = d3.geo.orthographic()
	.scale(280)
	.translate([width / 2, height / 2])
	.clipAngle(90);

d3.select("div.info")
	.attr("style", "height: " + height + "px;");

var path = d3.geo.path()
	.projection(proj).pointRadius(2);

var graticule = d3.geo.graticule(); // 经纬网

var svg = d3.select("div.map").append("svg")
			.attr("width", width)
			.attr("height", height)
			.on("mousedown", mousedown);
			
var tooltip = d3.select(".countryname").append("div")
    .attr("class", "tooltip")
	.text(function(d) { return "?" });

queue().defer(d3.json, "data/world-110m2.json")
	.defer(d3.tsv, "data/world-country-names.tsv")
	.defer(d3.json, "data/places2_sm13.json")
	.await(ready);

function ready(error, world, names, places) {
	worldplace = places;
   // console.log(worldplace);
	var countries = topojson.object(world, world.objects.countries).geometries,
		neighbors = topojson.neighbors(world.objects.countries.geometries),
		i = -1,
		n = countries.length;
	
	countries.forEach(function(d) { 
        var tryit = names.filter(function(n) { return d.id == n.id; })[0];
        
		if (typeof tryit === "undefined"){
          d.name = "Undefined";
          console.log("!!!!This country don't exit!!!!");
        } else {
            d.name = tryit.name;
//            console.log(d);
//			console.log(d.name);
        }
    });

	var ocean_fill = svg.append("defs").append("radialGradient")
		  .attr("id", "ocean_fill")
		  .attr("cx", "75%")
		  .attr("cy", "25%")
			.append("stop")
			.attr("offset", "5%")
			.attr("stop-color", "#C2185B");

	var globe_shading = svg.append("defs").append("radialGradient")
		.attr("id", "globe_shading")
		.attr("cx", "50%")
		.attr("cy", "40%");

	globe_shading.append("stop")
		.attr("offset","50%").attr("stop-color", "#F48FB1")
		.attr("stop-opacity","0")
//	globe_shading.append("stop")
//		.attr("offset","100%").attr("stop-color", "#E91E63")
//		.attr("stop-opacity","0.3")

// 地球仪投影颜色  
  var drop_shadow = svg.append("defs").append("radialGradient")
		.attr("id", "drop_shadow")
		.attr("cx", "50%")
		.attr("cy", "90%");
	  drop_shadow.append("stop")
		.attr("offset","20%").attr("stop-color", "#222")
		.attr("stop-opacity",".5")
	  drop_shadow.append("stop")
		.attr("offset","100%").attr("stop-color", "#000")
		.attr("stop-opacity","0")  

// 椭圆形投影 ellipse shadow
	svg.append("ellipse")
		.attr("cx", width/2).attr("cy", height-80)
		.attr("rx", proj.scale()*.90)
		.attr("ry", proj.scale()*.25)
		.attr("class", "noclicks")
		.style("fill", "url(#drop_shadow)"); // fill="#008d46"

	svg.append("circle")
		.attr("cx", width / 2).attr("cy", height / 2)
		.attr("r", proj.scale())
		.attr("class", "noclicks")
		.style("fill", "url(#ocean_fill)");

	svg.append("g").append("path")
		.datum(topojson.object(world, world.objects.land))
		.attr("class", "land")
		.attr("d", path)
		.attr("stroke", "#880e4f");

	svg.append("path")
		.datum(graticule)
		.attr("class", "graticule noclicks")
		.attr("d", path);

	svg.append("circle")
		.attr("cx", width / 2).attr("cy", height / 2)
		.attr("r", proj.scale())
		.attr("class","noclicks")
		.style("fill", "url(#globe_shading)");

	svg.append("g").attr("class","points")
		.selectAll("text").data(places.features)
		.enter().append("path")
		.attr("class", "point")
		.attr("d", path);

	// Show Name of Capital City 
	svg.append("g").attr("class","labels")
		.selectAll("text")
		.data(places.features)
		.enter().append("text")
		.attr("class", "label")
		.text(function(d) { return d.properties.name })
		.on("click", function(d){
			mouseclick(d.properties.name);
		});

	 /*//// uncomment for hover-able country outlines ////*/
	 svg.append("g").attr("class","countries")
		.selectAll("path")
		.data(countries)
		.enter().append("path")
		.attr("d", path)
	 	.attr("stroke", "#673ab7")
		.on("click", function(d,i) {
			var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
			tooltip.classed("hidden", false).html(d.name);
            mouseclick(d.name);
		  })
		.on("mouseout", function(d,i) {
			tooltip.classed("hidden", true)
		});
//	console.log("Country data: ");
//	console.log(countries);

	position_labels();
}


function position_labels() {
  var centerPos = proj.invert([width/2,height/2]);

  var arc = d3.geo.greatArc();

  svg.selectAll(".label")
	.attr("text-anchor",function(d) {
	  var x = proj(d.geometry.coordinates)[0];
	  return x < width/2-20 ? "end" :
			 x < width/2+20 ? "middle" :
			 "start"
	})
	.attr("transform", function(d) {
	  var loc = proj(d.geometry.coordinates),
		x = loc[0],
		y = loc[1];
	  var offset = x < width/2 ? -5 : 5;
	  return "translate(" + (x+offset) + "," + (y-2) + ")"
	})
	.style("display",function(d) {
	  var d = arc.distance({source: d.geometry.coordinates, target: centerPos});
	  return (d > 1.57) ? 'none' : 'inline';
	})
}

// modified from http://bl.ocks.org/1392560
var m0, o0;

function mouseclick(place){
//	console.log(place);
}

function mousedown() {
  m0 = [d3.event.pageX, d3.event.pageY];
  o0 = proj.rotate();
  d3.event.preventDefault();
}

function mousemove() {
  if (m0) {
	var m1 = [d3.event.pageX, d3.event.pageY]
	  , o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];

	o1[1] = o1[1] > 30  ? 30  :
			o1[1] < -30 ? -30 :
			o1[1];

	proj.rotate(o1);
	refresh();
  }
}

function mouseup() {
  if (m0) {
	mousemove();
	m0 = null;
  }
}

function refresh() {
  svg.selectAll(".land").attr("d", path);
  svg.selectAll(".countries path").attr("d", path);
  svg.selectAll(".graticule").attr("d", path);
  svg.selectAll(".point").attr("d", path);
  position_labels();
}

/** jquery to pass country when click button**/
var $countryname = $('.tooltip').text();
//	$('.tooltip').on("change", function(){
//		$countryname = $(this).text();
//		console.log("$countryname: " + $countryname);
//	}); // save country name to this object 为什么有时候可以，有时候不可以？

$('.map').on("click", function(){
    $countryname = $('.tooltip').text();
    console.log("$countryname: " + $countryname);
}); // save country name to this object


$('#onWall').on("click", function(){
    strogeToParse("wall");
});

$('#onPhone').on("click", function(){
    strogeToParse("phone");
});

$('#clear').on("click", function(){
    localStorage.clear();
    console.log("userIndex: " + localStorage.getItem("userIndex") + "; userID: " + localStorage.getItem("userID") );
});

function strogeToParse(method){
     /* get user index from localStorage */
    var userIndex = localStorage.getItem("userIndex");
    
    if(userIndex){  // Not the first user
        localStorage.setItem("userIndex", ++userIndex);
    }else{    // first user 
        userIndex = 1;
        localStorage.setItem("userIndex", userIndex);    
    }
    console.log("userIndex AF: " + userIndex);
    
    /* Parse: set data */
    beautyUser.set("userIndex", userIndex); 
    if($countryname){
        beautyUser.set("countryName", $countryname);
    }
    beautyUser.set("showMethod", method); 
    
    // Save Data to Parse server
    beautyUser.save(null, {
      success: function(beautyUser) {
        // Execute any logic that should take place after the object is saved.
        beautyUser.save();
        localStorage.setItem("userID", beautyUser.id);
      // Save ID to localStorage, 注意sessionStorage不能跨标签页使用
    
        // Access some stored data
        console.log('Parse objectId: ' + beautyUser.id + "; localStorage ID: " + localStorage.getItem("userID"));
          
        if(method == "wall"){
            alert("select wall");
            window.open('BallonData.html');
        }else{
            window.open('thesis_beauty_phoneQr.html');
        } // open new page if the new beautyUser saved;
      },
      error: function(beautyUser, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and description.
        alert('Failed to create new object, with error code: ' + error.description);
      }
    }); // Parse data save
}