/** Parse: get user selected country **/
// current only allow one country
Parse.initialize("sr4B0s62RshtQG2MwvVUXWYNWCnE6qvzHdjKDNfy", "4OnAG23buEs16uMkFeearCADfkTAnNeqMreS8l60");

// Parse: Retrieving Objects 根据sessionStroge ID查询国家
var BeautyUser = Parse.Object.extend("BeautyUser");
var beautyQuery = new Parse.Query(BeautyUser);
var beautyUserID = localStorage.getItem("userID");
var userCountry;
console.log("beautyUserID in localStorage: " + beautyUserID);

var scrWidth = $(window).width(),
    scrHeight = $(window).height();

/** D3: Timer & Speed **/
var t0 = Date.now();
var aniTimer = [6, 12, 18],
    velocity = new Array(),
    svgAniName;
velocity[0] = calSpeed(0.8, aniTimer[0]*1000);
var nextYear = false;

d3.timer(function() {
    var time = Date.now() - t0,
        sec = Math.round(time/1000);
    
    var select = d3.select("select");
    
    if(sec<=aniTimer[0] && sec>0){
        d3.select("svg.svgbar")
            .style("left", scrWidth/3)
            .style("top", scrHeight-velocity[0]*time);
    } 
    
//    if(time<aniTimer[0]*1000){
//        console.log("!!!!timer zone 1!!!!");
//    }else if(time<aniTimer[1]*1000){
//        console.log("!!!!timer zone 2!!!!");
//        
//    }else if(time<aniTimer[2]*1000){
//        console.log("!!!!timer zone 3!!!!");
//    }
    
    var l = aniTimer.length;
    if(sec > aniTimer[l-1]){
        console.log("Stop Timer " + time);
        return true;
    }
}); // make sure your timer function returns true when done!

/** D3.js: obtain data from csv file **/
var countryList = new Array(),
    rankRates = new Array();
var dispatch = d3.dispatch("load", "statechange");

// sub-title for csv
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
			  "Years with female head of state(last 50)"];


d3.csv("data/gg_gdp_s.csv", type, function(error, countries) {
	if (error) 
		throw error;
    
    // Save new object name 
	var countryById = d3.map();
	countries.forEach(function(d) { 
        var idInfo = d.id.split(",");
		countryById.set(d.id, d);
        d.country = idInfo[0];
        d.year = Number(idInfo[1]);
        d.rank_rate = Number(d.rank_rate);
        //console.log(d); // 返回每个数据项目的细节
	});
    
    var cntryNest = d3.nest()
        .key(function(d){ return d.country; })
        //.sortKeys(d3.ascending)
        .sortKeys(null)
        .entries(countries);
    
    cntryNest.forEach(function(d){
        countryList.push(d.key);
    });
    console.log(countryList);
    
	dispatch.load(countryById);
	dispatch.statechange(countryById.get("China,2006"));
});

// A drop-down menu for selecting a country; uses the "menu" namespace.
dispatch.on("load.menu", function(countryById) {
  var select = d3.select("div.map")
        .append("div").attr("class","cySelect")
        .append("select")
        .on("change", function() {
            dispatch.statechange(countryById.get(this.value)); 
        });

  select.selectAll("option")
        .data(countryById.values())
        .enter().append("option")
        .attr("value", function(d) { return d.id; })
        .text(function(d) { return d.id; });

  dispatch.on("statechange.menu", function(country) {
        console.log(country.id);
        select.property("value", country.id);
  });
});

dispatch.on("load.parseCountry", function(countryById) {
    /** Parse: get user selected country **/
    if(beautyUserID){
        beautyQuery.get(beautyUserID, {
          success: function(beautyUser) {
              // The object was retrieved successfully.
              userCountry = beautyUser.get("countryName");
              console.log("Parse: beautyUser ID: " + beautyUser.id + "; Get country name from user: " + userCountry);

            // compare the user selected country with the country in Dataset
            if(userCountry && countryList.length>0){ //Parse返回用户选择国家并获得CSV国家列表
                var compareResult = cntryInList(userCountry);
                if(compareResult){
                    dispatch.statechange(countryById.get(userCountry +",2006"));
                    console.log("load.parseCountry启动修改svg图为 "+ userCountry);
                }else{
                    userCountry = "NO";
                }
                console.log("compare reault is: " + compareResult +" / " + userCountry);  
            }else{//Parse用户选择国家，或者CSV国家列表：有一个没有发现
                console.log("Don't get Country in List:" + userCountry + "or Country List: " + countryList.length);
            }
          },
          error: function(object, error) {
            // The object was not retrieved successfully, error is a Parse.Error with an error code and description.
            alert('Failed to get object from server: ' + error.description);
          }
        }); // beautyQuery.get(beautyUserID)
    }else{
        dispatch.statechange(countryById.get("Japan,2006"));
        console.log("load.parseCountry: 没有获得后台国家，保持默认China,2006");
    }
    /** Parse: beautyQuery.get get user selected country **/

    dispatch.on("statechange.parseCountry", function(country) {
      console.log("statechange.parseCountry 启动 " + country.id);
      console.log(country);
    });
});


// A pie chart to show GenderGap score, PPP & Age by country and year; uses the "pie" namespace.
dispatch.on("load.pie", function(countryById) {
	var width = 600,
		height = 480,	
		radius = 70; //radius = Math.min(width, height) / 2;

	var color2 = d3.scale.category20();

	var arc = d3.svg.arc()
				.outerRadius(radius*2 - 10)
				.innerRadius(radius*2 - 70);

	var pie = d3.layout.pie()
				.sort(null);

	var svg = d3.select("div.map").append("svg")
				.attr("width", width)
				.attr("height", height);
    
	var svg_g =svg.append("g")
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	
	var cirGroup = svg_g.append("g")
				.attr("class","circles");
	
	var pppCircle = cirGroup.append("circle")
						.attr("class","ppp");

	var bars = svg_g.selectAll("rect")
                .data(groups)
                .enter().append("rect")
                .style("fill", color2)
                .attr('rx', 6).attr('x', 0)
                .attr('ry', 6).attr('y', 0)
                .each(function() { this._current = {startAngle: 0, endAngle: 0}; });
	
	var ageCircle = cirGroup.append("circle").attr("class","age");
	
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
      svg.attr("class", d.country); // set country name as g class
      velocity[0] = calSpeed(d.rank_rate, aniTimer[0]*1000);
      
      $('svg.'+d.country).css("top", (scrHeight-height/2)+"px");
	  
	  radius = cyPPP/2;
	  console.log("statechange.pie: 目前国家/ "+ d.country+" /的PPP: " + d.ppp2);
	  
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
		 // .attr("width", 0)
        .attr("width", function(d) {
            return radius*d.value+"px";
        })
        .attr("height", 2*Math.PI*radius/14 + "px")
        .attr("transform", function(d,i){
            barXY[0] = radius*Math.cos(eachradians*(i+0.5));
            barXY[1] = -1*radius*Math.sin(eachradians*(i+0.5));
            return "translate("+ barXY[0] +","+ barXY[1] +"),rotate(" + eachangle*(-i)+ ")";
        });
	  
	  bars.on("click", function(d){
        var clickpos = getMousePos(onclick);
        d3.select("#tooltip").style("opacity",1);

        console.log(clickpos);

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
	  }); // bars.on("click")
      
      svgAniName = "svg."+d.country;
      
      var heightGap = height/2 - cyPPP;
      
      $('svg.'+d.country).animate({
            top: d.rank_rate*scrHeight - heightGap+'px'
        },(aniTimer[1]-aniTimer[0])*1000);
  }); // dispatch.on("statechange.pie")
});

drawBar(scrWidth/3, scrHeight);

/** Other Function without D3 & Parse **/

// Coerce population counts to numbers and compute total per state.
function type(d) {
  d.total = d3.sum(groups, function(k) { return d[k] = +d[k]; });
  return d;
}
	
function getMousePos(event) {
	var e = event || window.event;
	return {'x':e.clientX,'y':e.clientY}
}

function cntryInList(userCntry){
    var findCountryInList = false;
    countryList.forEach(function(country){
        if(country === userCntry){
            findCountryInList = true;
            console.log("User selected country in List!!!");
        }
    });
    return findCountryInList;
}

function calSpeed(rankRate, time){
    var velocity = scrHeight*rankRate/time;
    console.log("velocity: " + velocity);
    return velocity;
}

function drawBar(left,top){   
    // A bar chart to show total population; uses the "bar" namespace.
    dispatch.on("load.bar", function(countryById) {
      var margin = {top: 20, right: 20, bottom: 30, left: 40},
          width = 120 - margin.left - margin.right,
          height = 460 - margin.top - margin.bottom;

      var y = d3.scale.linear()
          .domain([0, d3.max(countryById.values(), function(d) { 
              return d.total; })])
          .rangeRound([height, 0])
          .nice();

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickFormat(d3.format(".2s"));

      var svg = d3.select("div.map").append("svg")
            .attr("class","svgbar")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("class","bar")
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
    }); // dispatch.on "load.bar"
}// function drawBar