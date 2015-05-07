var qrread_data,
    playintro = false,
    nextindex = 0,
	strokeWidth = 3;

var width = window.innerHeight,
    height = window.innerHeight,
    radius = Math.min(width, height) / 2,
	color = d3.scale.linear()
			.domain([0,1,2,3])
			.range(["#EB6596", "#F7A732", "#75CAE6", "#ADD950"]);

var aniTimers = {start: 32, eachSec: 5},
	aniIndex = 0;

var pathDelay = 400,
	textDelay = 500,
	pathDura = 500;

// D3: Global SVG Sunbrust
var globalsvg;

var explains = [["The project is visualize data  to present gender-based gaps  in access to resources and opportunities  in countries rather than the  actual levels of the available resources  and opportunities in those  countries."],
                ["Through the Global Gender Gap  rank and scores in 2006, 2010 and 2014,  the data quantifies the magnitude  of gender-based disparities and  tracks their progress over time."], 
                ["While no single measure  can capture the complete situation,  the Global Gender Gap presented in  this project seeks to measure  one important aspect of gender equality:  the relative gaps between  women and men across four key areas:  health, education, economy and politics."],	
                ["The third distinguishing feature of  the project is that it  ranks countries according to  their proximity to gender equality rather  than to women’s empowerment. "],	
                ["explaination part 4. "]
];

$('.guideImg').hide();
//$('div.control').hide();
$('div#restartBtn').hide();
//////function for QR //////
$(function(){
    $('#jqmeter-horizontal').jQMeter({
        goal:'$10,000',
        raised:'$3000',
        width:'270px',
        height:'20px',
        bgColor:'#dadada',
        barColor:'#f09246',
        animationSpeed:1000,
        displayTotal:false
    }); // Progress bar - jQMeter plug-in
    
    /************** Start Button **************/
    $('#startBtn').on('click', function(){
        //alert("click next button");
        if(!playintro){
            dataTitle();
            playintro = true;
	        nextindex++;
        }
		$('span#divId').timer({
			duration: aniTimers.start + 's',
			callback: function() {
				explainTimer();
				$('span#divId').timer('remove');
				$('span#divId').timer({
					duration: aniTimers.eachSec + 's', // 不知道为什么时间加倍
					callback: function(){
//						console.log('Reset! Animation Index:' + aniIndex+ explains[aniIndex]);
                        nextExpText();
						$('span#divId').timer('reset');
						aniIndex++;
					},
					repeat: true
				});
			}
		}); // span#divID Timer
    });

    $('div#reader').html5_qrcode(function(data){
			// 在reader标签实现读取QR数据
			$('div#read').html(data);
        
            if(data === "reload"){
                window.location.replace(location.href);
            }else if(data === "Moreinfo"){
                dataTitle();
                $('span#divId').timer({   // 启动计时器
                    duration: aniTimers.start + 's',
                    callback: function() {
                        explainTimer();
                        $('span#divId').timer('remove');
                        $('span#divId').timer({
                            duration: aniTimers.eachSec + 's', // 不知道为什么时间加倍
                            callback: function(){
                                // show explains for each section
                                nextExpText();
                                $('span#divId').timer('reset');
                                aniIndex++;
                            },
                            repeat: true
                        });
                    }
                }); // span#divID Timer
            }else if(data === "stop"){
                 $('div#reader').html5_qrcode_stop();
            }else if(data!= ""){
                qrread_data = JSON.parse(data); // 全局变量
                $(window).scrollTop($('div.map').offset().top);
                //scroll to div with container
                $('html, body').animate({
                    scrollTop: $("div.map").offset().top
                }, 1000);
                if(qrread_data){ stackedRadial();  }
                playintro = true;
				nextindex++; 
                console.log("QR Data: " + data);
                console.log("Get QR Country: " + qrread_data.country + "; and year: " + qrread_data.year);
                
                $('span#divId').timer({   // 启动计时器
                    duration: aniTimers.start + 's',
                    callback: function() {
                        console.log("Reload!");
                        window.location.replace(location.href);
                        $('span#divId').timer('remove');
                    }
                }); // span#divID Timer
            }
        
		}, function(error){
			$('#read_error').html(error);
		}, function(videoError){ 
			$('#vid_error').html(videoError);
		} 
	);// html5_qrcode 获得QR信息
});

/*///////////////// Stacked Radial 第二部分动画 /////////////////////*/
function stackedRadial(){ 
    $('svg.StackedRadial').css("top",0);
    var textarray = ["Labour", "Wage", "Estimated","Legislators","Professional", "Literacy", "primary edu", ],
        //formatDay = function(d){ return textarray[d] },
        formatDay = function(d){ return titlearray[d] },
        titlearray = ["Labour force  participation",
                      "Wage equality for  similar work (survey)",
                      "Estimated earned  income (PPP US$)",
                      "Legislators senior  officials & managers",
                      "Professional and  technical workers",
                      "Literacy rate","Enrollment in  primary education",
                      "Enrollment in  secondary education",
                      "Enrollment in  tertiary education",
                      "Sex ratio at  birth (female/male)",
                      "Healthy life  expectancy",
                      "Women in parliament",
                      "Women in ministerial  positions",
                      "Years with female  head of state(last 50)"]
        csvFiles = {
                    cha:{file:"gg_cha.csv",country:"China"}, chi:{file:"gg_che.csv",country:"Chile"},
                    col:{file:"gg_col.csv",country:"Colombia"}, fra:{file:"gg_fra.csv",country:"France"},
                    ice:{file:"gg_ice.csv",country:"Iceland"},
                    ind:{file:"gg_ind.csv",country:"India"}, jap:{file:"gg_jap.csv",country:"Japan"},
                    nz:{file:"gg_new.csv",country:"New Zealand"}, phi:{file:"gg_phi.csv",country:"Philippines"},
                    sou:{file:"gg_sa.csv",country:"South Africa"}, uga:{file:"gg_uga.csv",country:"Uganda"},
                    uk:{file:"gg_uk.csv",country:"United Kingdom"}, us:{file:"gg_us.csv",country:"United States"} 
                    };
    var csvFile = findCSV();
    console.log(csvFiles);
    console.log("##### csvFile is: " + csvFile);
    
    var outerRadius = height/2 - 50,
        innerRadius = 120;

    var margin = {top: 20, right: 20, bottom: 30, left: 20};

    var angle = d3.time.scale()
        .range([Math.PI/2, 2 * Math.PI+Math.PI/2]);

    var radius = d3.scale.linear()
        .range([innerRadius, outerRadius]);

    var color = d3.scale.ordinal()
            .domain([0,2])
            .range([ "#F50057", "#FF80AB", "#FF4081"]);

    var stack = d3.layout.stack()
        .offset("zero")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.time; })
        .y(function(d) { return d.value; });

    var nest = d3.nest()
        .key(function(d) { return d.key; });

    var line = d3.svg.line.radial()
        .interpolate("cardinal-closed")
        .angle(function(d) { return angle(d.time); })
        .radius(function(d) { return radius(d.y0 + d.y); });

    var area = d3.svg.area.radial()
        .interpolate("cardinal-closed")
        .angle(function(d) { return angle(d.time); })
        .innerRadius(function(d) { return radius(d.y0); })
        .outerRadius(function(d) { return radius(d.y0 + d.y); });

    var svg = d3.select("div.map").append("svg")
        .attr("class", "StackedRadial")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

    d3.csv("data/"+csvFile, type, function(error, data) {
        console.log(data);

        var layers = stack(nest.entries(data));
        console.log(layers);
        
        // Extend the domain slightly to match the range of [0, 2π].
        angle.domain([0, d3.max(data, function(d) { return d.time + 1; })]);
        radius.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

        var layers = svg.selectAll(".layer")
                      .data(layers)
                      .enter().append("path")
                      .attr("class", "layer")
                      .attr("d", function(d) { return area(0); })
                      .style("fill", function(d, i) { return color(i); });
        
        layers.transition()
            .duration(3000)
            .delay(function(d,i){
                return i*1000;
            })
            .attr("d", function(d) { return area(d.values); });
            

        svg.selectAll(".axis")
            .data(d3.range(angle.domain()[1]))
            .enter().append("g")
            .attr("class", "axis")
            .attr("fill", "white")
            .attr("transform", function(d) { return "rotate(" + angle(d) * 180 / Math.PI + ")"; })
            .call(d3.svg.axis()
                .scale(radius.copy().range([-innerRadius, -outerRadius]))
                .orient("left"))
            .append("text")
            .attr("y", -innerRadius + 6)
            .attr("dy", "-16em")
            .attr("text-anchor", "middle")
            .text(function(d) { return formatDay(d); })
            .call(wrap, 60);
        
        var textCenter = svg.append("g")
			.attr("class", "countryName")
        
        var countryName = textCenter.append("text")
			.attr("text-anchor", "middle")
			.style("font-size", "28px")
			.attr("x", 0 + "px")
			.attr("y", -16 + "px")
			.attr("opacity", 0)
            .text(qrread_data.country)
            .call(restart);
        
        countryName.transition()
                .duration(1000)
                .attr("opacity",1);
        
        var stackedText1 = textCenter.append("text")
			.attr("text-anchor", "middle")
			.attr("font-size", "24px")
			.attr("fill", "#ddd")
			.attr("x", 0 + "px")
			.attr("opacity", 0)
            .attr("y", 20 + "px")
            .text(function(){
                return "3 years stacked streamgraph";
            });
        
        var stackedText2 = textCenter.append("text")
			.attr("text-anchor", "middle")
			.attr("font-size", "24px")
			.attr("fill", "#ddd")
			.attr("x", 0 + "px")
			.attr("opacity", 0)
            .attr("y", 36 + "px")
            .text(function(){
                return "for gender gap scores.";
            });

        stackedText1.transition()
                .duration(1000)
                .delay(500)
                .attr("opacity",1);
        
        stackedText2.transition()
                .duration(1000)
                .delay(500)
                .attr("opacity",1);
        
        layers.on("mouseover", function(data,i){
            console.log(data);
            var m = d3.mouse(this);

            svg.selectAll(".layer").transition()
                          .duration(250)
                          .attr("opacity", function(d, j) { return j != i ? 0.2 : 1;  });

            d3.select('#tooptip')
                .style('left', m[0]+'px')
                .style('top', m[1]+'px')
                .select('#year')
                .text(data.key)
                .classed('hidden', false);
        })
        .on("mouseout", function(){
            d3.select('#tooptip').classed('hidden', true);
            svg.selectAll(".layer").transition()
                          .duration(250)
                          .attr("opacity", 1);
        });
    }); // d3.csv

    function type(d) {
      d.time = +d.time;
      d.value = +d.value;
      return d;
    }
} // 

/*///////////////// Stacked Radial 第二部分动画 /////////////////////*/


//******************* Partition/Arc 第一部分的parition动画 *******************// 
function dataTitle(){    
//    svg.attr("class", "sunburstAni")
    var svg = d3.select("div.map").append("svg")
		.attr("class", "sunburstAni")
		.attr("width", width+strokeWidth*2)
        .attr("height", height+strokeWidth*2)
        .append("g")
        .attr("transform", "translate(" + (width/2+strokeWidth) + "," + (height/2+strokeWidth) + ")");
   
    //D3: 参考线
    var textCenter = svg.append("g")
        .attr("class", "refText")

    var refText = textCenter.append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", "28px")
        .style("fill", "#ddd")
        .attr("x", 0 + "px")
        .attr("y", 20 + "px")
        .attr("opacity", 0)
        .text("(You can pick up the bucket now)");

    refText.transition()
            .duration(1000)
            .attr("opacity",1);

    var partition = d3.layout.partition()
        .sort(d3.descending)
        .size([2 * Math.PI, radius * radius])
        .value(function(d) { return 1; });

    // Start the Angle from the top.
    var arc = d3.svg.arc()
        .startAngle(function(d) { return -(d.x)+Math.PI/2; })
        .endAngle(function(d) { return -(d.x + d.dx)+Math.PI/2; })
        .innerRadius(function(d) { return Math.sqrt(d.y); })
        .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

	// Get json infor of Gender Gap Score
    d3.json("data/GenGapTitle.json", function(error, root) {
		//console.log(root);
		root.children.forEach(function(items,i){
			items.color = i;
			items.children.forEach(function(item){
				item.color = i;
			});
		});
		
        var path = svg.datum(root).selectAll("path")
                .data(partition.nodes)
                .enter();

        var paths = path.append("path")
                .attr("opacity",0)
                .attr("display", function(d) { 
                    return d.depth ? null : "none"; }) // hide inner ring
                .style("stroke", "#fff")
                .style("stroke-width", strokeWidth)
                .style("fill", function(d) {
					var colorId = (d.children ? d : d.parent).name;
					return color(d.color);
                    //return color((d.children ? d : d.parent).name); 
				})
                .style("fill-rule", "evenodd")
                .attr("d",arc)
                .each(stash);
		
		var seci = 0;
        paths.transition()
                .duration(pathDura)
                .delay(function(d,i){ 
						//console.log(d); 
						if(d.depth == 1)  seci++;
						return d.depth>1?((i+10+seci*5)* pathDelay): (d.depth+seci)*pathDelay*2;} )
                .attr("opacity",1)
                .attrTween("d", arcTweenTest);

        var title = path.append("text")
                .attr("class", function(d,i){ 
			return d.depth==0?"maintitle":d.depth==1?"title":"subTitle"+i; })
                .attr("opacity",0)
                .style("font-size", function(d,i){
                    if(d.depth === 1){
                        return "20px";
                    }else if(d.depth === 0){ return "36px"; }
                    else{  return "16px"; }
                })
                .style("font-family", "PT Sans")
                .attr("text-anchor", "middle")
                .text(function(d) { return d.name; })
                .call(wrap, 40); // 
		
		var secj = 0;
        title.transition().duration(pathDura)
			.delay(function(d,i){ 
				if(d.depth == 1)  secj++;
				return d.depth>1 ? ((i+10+secj*5)* textDelay) : (d.depth+secj)*textDelay*2;
			})
            .attr("transform",function(d,i){
                //第一个元素（最中间的），只平移不旋转
                if( i == 0 ){
                    return "translate(" + arc.centroid(d) + ")";
                }
                var r = 0;
                if( -(d.x+d.dx/2)/Math.PI*180 > -1*180 )  // 0 - 180 度以内的
                    r = 180 * (-(d.x + d.dx / 2 - Math.PI / 2) / Math.PI);
                else if(-(d.x+d.dx/2)/Math.PI == - 1/2)
                    r = 0;
                else  // 180 - 360 度以内的d
                    r = - 180 * ((d.x + d.dx / 2 + Math.PI / 2) / Math.PI);

                //既平移也旋转
                //console.log(arc.centroid(d));
                return  "translate(" + arc.centroid(d) + ")" +
                        "rotate(" + r + ")";
            })
            .attr("opacity", 0.9);

     // size/count 按钮，改变状态时候的动画	
      d3.selectAll("input").on("change", function change(){
        var value = this.value === "count"
            ? function() { return 1; }
            : function(d) { return d.size; };

        paths.data(partition.value(value).nodes)
            .transition().duration(1500)
            .attrTween("d", arcTween);
         // console.log(partition.value(value).nodes);

        title.data(partition.value(value).nodes)
            .transition().duration(1500)
                .attr("transform",function(d,i){
				//console.log(d);
                //第一个元素（最中间的），只平移不旋转
                if( i == 0 )
                    return "translate(" + arc.centroid(d) + ")";

                //其他的元素，既平移也旋转
                var r = 0;
                if( -(d.x+d.dx/2)/Math.PI*180 > -1*180 )  // 0 - 180 度以内的
                    r = 180 * (-(d.x + d.dx / 2 - Math.PI / 2) / Math.PI);
                else if(-(d.x+d.dx/2) == - 1/2)
                    r = 0;
                else  // 180 - 360 度以内的d
                    r = - 180 * ((d.x + d.dx / 2 + Math.PI / 2) / Math.PI);
                //既平移也旋转
                //console.log(arc.centroid(d));
                return  "translate(" + arc.centroid(d) + ")" +
                        "rotate(" + r + ")";
                })
                .attr("opacity", 0.9);
      });
    }); // d3.json
	
	// Stash the old values for transition.
	function stash(d){
	  d.x0 = d.x;
	  d.dx0 = d.dx;
	}

	// NO one call this function !!
	// Interpolate the arcs in data space.
	function arcTween(a) {
	  var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
	  return function(t) {
		var b = i(t);
		a.x0 = b.x;
		a.dx0 = b.dx;
	//		console.log(arc(b));
		return arc(b);
	  };
	}

	function arcTweenTest(a) { // 开始时候的动画函数
	  var i = d3.interpolate({x: a.x0, dx: 0}, a);
	  return function(t) {
		var b = i(t);
		a.x0 = b.x;
		a.dx0 = b.dx;
		return arc(b);
	  };
	}

}// dataTitle(); 第一部分的parition动画

/*///////////////// Next Button /////////////////////*/

d3.select("#nextBtn").on("click",function(){
	if(nextindex === 1){ // Init middelText from 2nd click
		console.log("click next button: " + nextindex + " times");
		/*Create wrapper for center text*/
		globalsvg = d3.select("svg g");
		var textCenter = globalsvg.append("g")
			.attr("class", "explainWrap");

		/*Starting text middle top*/
		var middleTextTop = textCenter.append("text")
			.attr("class", "explainTop")
			.attr("text-anchor", "middle")
			.attr("x", 0 + "px")
			.attr("y", -18*14/2 + "px")
			.attr("opacity", 1);
		
		d3.select(".maintitle").remove();
		d3.select(".refText").remove();
		console.log("### Click 2nd add explains index:" + (nextindex-1));
		middleTextTop.text(explains[0]).call(wrap, 350);
	}else if(nextindex >= 2 && nextindex<explains.length){
		/*///////////////// Start from 3rd click ///////////////// */
		d3.select("text.explainTop").text("");
		console.log("### Add explains["+ (nextindex-1) +"] to top" + explains[nextindex-1]);
		d3.select("text.explainTop").text(explains[nextindex-1]).call(wrap, 350);
	}else if(nextindex >= explains.length){
        console.log("!! Click stacked radical button !!");
        d3.select("div.map form").remove();
        d3.select("div.map svg").remove();
        stackedRadial();
    }
	nextindex++;

});//****  Click next button  ****//

/*///////////////// Section 3 Button /////////////////////*/

d3.select("#stackBtn").on("click",function(){
    // Init middelText from 2nd click
	console.log("!! Click stacked radical button !!");
    d3.select("div.map form").remove();
    d3.select("div.map svg").remove();
    stackedRadial();

});//****  Click next button  ****//

/*///////////////// Supported Functions /////////////////////*/
function explainTimer(){
	console.log("#### Start normal timer ####");
}

// cha:{file:"gg_cha.csv",country:"China"}
function findCSV(){
    for(var i in csvFiles){
        if(csvFiles[i].country === qrread_data.country){
           // console.log("### Current country csv is: " + csvFiles[i].file);
            return csvFiles[i].file;
        }
    }
}

function restart(){
    $('div#restartBtn').show();
}

function nextExpText(){
    console.log('Reset! Animation Index:' + aniIndex+ explains[aniIndex]);
    if(nextindex === 1){ // Init middelText from 2nd click
		console.log("click next button: " + nextindex + " times");
		/*Create wrapper for center text*/
		globalsvg = d3.select("svg g");
		var textCenter = globalsvg.append("g")
			.attr("class", "explainWrap");

		/*Starting text middle top*/
		var middleTextTop = textCenter.append("text")
			.attr("class", "explainTop")
			.attr("text-anchor", "middle")
			.attr("x", 0 + "px")
			.attr("y", -18*14/2 + "px")
			.attr("opacity", 1);
		
		d3.select(".maintitle").remove();
		d3.select(".refText").remove();
		console.log("### Click 2nd add explains index:" + (nextindex-1));
		
        middleTextTop
            .text(explains[0]).call(wrap, 350).style("opacity", 0);
        middleTextTop
            .transition()
            .duration(1000)
            .style("opacity", 1);
        
	}else if(nextindex >= 2  && nextindex<explains.length ){
		/*///////////////// Start from 3rd click ///////////////// */
		d3.select("text.explainTop").text("");
		console.log("### Add explains["+ (nextindex-1) +"] to top" + explains[nextindex-1]);
		var explainText = d3.select("text.explainTop")
            .text(explains[nextindex-1])
            .call(wrap, 350)
            .style("opacity", 0);
        explainText
            .transition()
            .duration(1000)
            .style("opacity", 1);
	}else if(nextindex === explains.length){
        console.log("!! Click stacked radical button !!");
        d3.select("div.map form").remove();
        d3.select("div.map svg").remove();
        stackedRadial();
    }else{
        $('span#divId').timer('remove');
        console.log("!! Remove Timer !!");
    }
	nextindex++;
}

// 文字换行函数
function wrap(text, width) { 
	text.each(function(d) {
		//econsole.log(d);
		var text = d3.select(this),
			words = text.text().split(/\s+\s/).reverse(),
			word,
			line = [],
			lineNumber = -1,
			midlineNum = 1 ,
			lineHeight = 1, // ems
			y = text.attr("y"),
			dy = parseFloat(text.attr("dy"));
			tspan = text.text(null).append("tspan")
						.attr("x", 0).attr("y", y).attr("dy", "1em");

		if(width > 100){ // center text - for explaination 
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					//tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy","1em").text(word);
					tspan = text.append("tspan")
						.attr("x", 0).attr("y", y)
						.attr("dy",  ++midlineNum * lineHeight + "em").text(word);
						console.log("lineHeight: "+ lineHeight);
				}
			}
		}else{
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					//tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy","1em").text(word);
					tspan = text.append("tspan")
						.attr("x", function(){
							if(d.depth === 0) return 100;
							else return 0;
						}).attr("y", y)
						.attr("dy", function(){
                            if(width<50){
                                return ++lineNumber * lineHeight + "em";
                            }else{
                                return (++lineNumber * lineHeight - 18)+ "em";
                            }
                        })
                        .text(word);

				}
			} // While
		}
	});

}// 文字换行

d3.select(self.frameElement).style("height", height + "px");
// 这个是做什么用的？

/** Toggle guide image **/
$('#guide').on("click touchstart", function(){
    $('div.guideImg').fadeToggle(1000);
    $('div.control').show();
});
$('a#guideBtn').on("click touchstart", function(){
    $("div.guideImg").fadeOut(1000);
        $('div.control').show();
});

/** Clear button in fixed-action-btn group **/
$('#clear').on("click touchstart", function(){
    localStorage.clear();
});
