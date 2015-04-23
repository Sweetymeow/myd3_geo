/** Parse: get user selected country **/
// current only allow one country
Parse.initialize("sr4B0s62RshtQG2MwvVUXWYNWCnE6qvzHdjKDNfy", "4OnAG23buEs16uMkFeearCADfkTAnNeqMreS8l60");

// Parse: Retrieving Objects 根据sessionStroge ID查询国家
var BeautyUser = Parse.Object.extend("BeautyUser");
var beautyQuery = new Parse.Query(BeautyUser);
var beautyUserID = localStorage.getItem("userID");
var userCountry;
console.log("beautyUserID in localStorage: " + beautyUserID);

/** D3: Timer & Speed **/
var t0 = Date.now();
var aniTimer = [10,6,3,3],
    dataYear = [2006, 2010, 2014],
    dataIndex = 0,
    velocity = new Array(),
    svgAniName;

var scrWidth = $(window).width(),
    scrHeight = $(window).height();

/* Set Tooptip hiden */
d3.select("#tooltip").classed("hidden", true);

//d3.timer(function() {
//    var time = Date.now() - t0,
//        sec = Math.round(time/1000);
//    if(sec > aniTimer[0]+1){
//        console.log("Stop Timer " + time + "; Data Index: " + dataIndex);
//        return true;
//    }
//}); // make sure your timer function returns true when done!

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
//    console.log(countryList);
    
	dispatch.load(countryById);
	//dispatch.statechange(countryById.get("China,2006"));
});

// A drop-down menu for selecting a country; uses the "menu" namespace.
dispatch.on("load.menu", function(countryById) {
  var select = d3.select("div.map")
        .append("div")
        .attr("class","container")
        .append("select")
        .attr("class","cySelect")
        .on("change", function() {
            dispatch.statechange(countryById.get(this.value)); 

            console.log(countryById.get(this.value));
        });

  select.selectAll("option")
        .data(countryById.values())
        .enter().append("option")
        .attr("value", function(d) { return d.id; })
        .text(function(d) { return d.id; });

  dispatch.on("statechange.menu", function(country) {
        console.log("Menu| State Chagne: " + country.id);
        select.property("value", country.id);
  });
});

$(function(){
    var curLeftF = new Array();
    
    $('img#ground').css("bottom",0);
    $(window).resize(function() {
        scrWidth = $(window).width();
        scrHeight = $(window).height();
        $('img#ground').css("bottom",0).css("width",scrWidth);
    });
    
    var frontHInter = scrHeight/($('div#frontClouds').length+3);
    var frontWInter = scrWidth/($('div#frontClouds').length+2);
//    console.log("scr height: "+ scrHeight+"; scr width:" + scrWidth+"; front clouds length: " + $('img#frontClouds').length + "; cloud intervel: " + frontHInter);
    $('div#frontClouds').each(function(i){
        var curLeft = Math.floor(100*Math.random());
        $(this).css("top", frontHInter*(i+0.5));
        if(i%2 == 0){ curLeft = scrWidth-curLeft-300;}
        $(this).css("left", curLeft);
        curLeftF.push(curLeft);
    });
    
    console.log(curLeftF);
    
    var $image = $('#frontClouds img'),
        $wrapper = $image.parent(),
        delay =500,
        duration = 2000,
        moveRight = function(){
            $image.delay(delay).animate({
                left: $wrapper.width() - $image.width()
            }, {
                duration: duration,
                complete: moveLeft
            });
        },
        moveLeft = function(){
            $image.delay(delay).animate({
                left: 0
            }, {
                duration: duration,
                complete: moveRight
            });
        };
    moveRight();
   
    $('div#backClouds').each(function(i){
//        console.log("frontClouds height: "+ $(this).height()+"; frontClouds width:" + $(this).width());
        $(this).css("top", frontHInter*(i+0.5)).css("opacity",0.8);
        if(i%2 == 0){
            $(this).css("left", frontWInter*(Math.random()+0.2));
        }else{
            $(this).css("left", scrWidth-frontWInter*Math.random()-100);
        }
    });
});

$(function() {
    dispatch.on("load.next", function(countryById) {
        /** 测试用按钮 **/
        $('#next').on("click",function(d){
            if(dataIndex<dataYear.length-1){
                dataIndex++;
                console.log(userCountry +","+dataYear[dataIndex]);
                dispatch.statechange(countryById.get(userCountry +","+dataYear[dataIndex]));
            }else{
                alert("NEXT: no more data ");
            }
        });// JQ_next button click
                /** jQ Timer 测试: aniTimer = [6,3,3,3] **/
        $('#timer-1').timer({
            duration: aniTimer[0]+'s',
            callback: function() {
                console.log("## Timer-1 out!!: remove!! ##");
                $('#timer-1').timer('remove');
                /* timer 2 */
                $('#timer-2').timer({
                    duration: aniTimer[2]+'s',
                    callback: function() {
                        console.log("##Timer##: " + aniTimer[2] + "s timer up! DataIndex is: "+dataIndex);
                        dataIndex++;
                        console.log("##Timer## country: " + userCountry +","+dataYear[dataIndex]+"; DataIndex is: "+dataIndex);
                        // Show #2 & #3 data ballons
                        dispatch.statechange(countryById.get(userCountry +","+dataYear[dataIndex]));

                        if(dataIndex == dataYear.length-1){
                            console.log("###Timer Remove#### dataindex:"+dataIndex);
                            $('#timer-2').timer('remove');
                        }
                    },
                    repeat: function() {
                        dataIndex<(dataYear.length-1)?true:false
                    }
                }); // #timer-2: This repeat only when dataIndex == 1
            } // 'timer-1' callback
        }); // 'timer-1'
    });// load.next
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
                    // Show data ballon for first in each country
                    dispatch.statechange(countryById.get(userCountry +","+dataYear[dataIndex]));
                    console.log("load | parseCountry启动修改svg图为 "+ userCountry);
                }else{
                    userCountry = "NO";
                } 
            }else{//Parse用户选择国家，或者CSV国家列表：有一个没有发现
                alert("Don't get Country in List:" + userCountry + "or Country List: " + countryList.length);
            }
          },
          error: function(object, error) {
            // The object was not retrieved successfully, error is a Parse.Error with an error code and description.
            alert('Failed to get object from server: ' + error.description);
          }
        }); // beautyQuery.get(beautyUserID)
    }else{
        userCountry = "Iceland";
        console.log("ParseCountry: LocalStorage Eempty! current country: " + userCountry + "or Country List: " + countryList.length);
    }
    /** Parse: beautyQuery.get get user selected country **/
//    dispatch.on("statechange.parseCountry", function(country) {
//      console.log("Statechange | Parse Country 启动: " + country.id);
//      console.log(country);
//    });
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
                //.style("fill", color2)
                .style("fill", "white")
                .attr('x', 0)
                .attr('y', 0)
                .each(function() { this._current = {startAngle: 0, endAngle: 0}; });
	
    var equalCircle = cirGroup.append("circle").attr("class","equal");
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
      var svgClassName;
      
      svg.attr("class", function(){
          var name = d.country;
          var names = name.split(' ');
          if(names.length>1){
              svgClassName = names[0];
          }else{
              svgClassName = d.country;
          }
          return svgClassName;
      }); // set country name as g class
      
       //每个国家第一年，设置回初始位置
      if(!dataIndex){
        $('svg.'+svgClassName).css("top", scrHeight+"px")
            .css("left", (scrWidth-width)/2+"px");
      }
	  
	  radius = cyPPP/2;
	  console.log("statechange.pie: 目前国家/ "+ d.country+" /的PPP: " + d.ppp2);
	  
	  pppCircle.attr("cx",0)
	  			.attr("cy",0)
	  			.attr("r", cyPPP)
	  			.style("fill", "#FFC107")
	  			.attr("stroke", "#fff")
	  			.attr("stroke-width", "2");
	 
	  var barXY =[0,0],
          barRxy = (Math.PI*radius/14)/3;
      // Bar data
      bars.data(pie.value(function(g) { return d[g];})(groups))
		 // .attr("width", 0)
        .attr("width", function(d) {
            return radius*d.value+"px"; // char bar height
        })
        .attr("height", Math.PI*radius/14 + "px")
        .attr("rx", barRxy)
        .attr("ry", barRxy)
        .attr("transform", function(d,i){
            barXY[0] = radius*Math.cos(eachradians*(i+0.5))/2;
            barXY[1] = -1*radius*Math.sin(eachradians*(i+0.5))/2;
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
      
      equalCircle.attr("cx",0)
	  			.attr("cy",0)
	  			.attr("r", 1.5*radius)
                .attr("stroke", "#FF4081")
	  			.attr("stroke-width", "2")
	  			.style("fill", "#FFC107");
      
      ageCircle.attr("cx",0)
	  			.attr("cy",0)
	  			.attr("r", maAge)
	  			.style("fill", "#EB588F");
      
	  ageText.attr("text-anchor", "middle")
		  	.attr("id", "age")
		  .text(function(d) { return maAge; });
      
      var ballonHeight = d.rank_rate*(scrHeight-height/2)-60; // 60 is height of ground
       
      if(!dataIndex){
          $('svg.'+svgClassName).delay(aniTimer[0]*1000).animate({
            top: ballonHeight+'px',
            left: (scrWidth-width)/2+'px'
        },aniTimer[dataIndex+1]*1000);
      }else if(dataIndex < dataYear.length){
        $('svg.'+svgClassName).animate({
            top: ballonHeight+'px',
            left: (scrWidth-width)/2+'px'
        },aniTimer[dataIndex+1]*1000);
      }else{
          $('svg.'+svgClassName).animate({
            top: ballonHeight+'px',
            left: (scrWidth-width)/2+'px'
        },aniTimer[2]*1000);
      } // if-dataIndex
      console.log("###Ballon Height### Rank_Rate is: " + d.rank_rate + "; Ballon height is: " + ballonHeight);
    }); // dispatch.on("statechange.pie")
});

//drawBar(scrWidth/3, scrHeight);

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

function CloudFloat(dir){   
//    $("#frontClouds").animate({top:"-10px"},100).animate({top:"0px"},100);  
    $('img#frontClouds').each(function(i){
        var leftpx = $(this).css("left") ;
        var left = leftpx.split('.');
        if(i%2){
            $(this).animate({left: left[0]+dir+"px"},3000).animate({left: (left[0] - dir)+"px"},3000);
        }else{
            $(this).animate({left: (left[0]-dir)+"px"},3000).animate({left: left[0]+ dir+"px"},3000);
        }
    });
    setTimeout(CloudFloat((0.5-Math.random())*200), 2000);
    
//    var floatDir = (0.5-Math.random())*200;
//            CloudFloat(floatDir);
}   