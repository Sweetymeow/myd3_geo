var qrread_data,
    playintro = false,
    nextindex = 0,
	strokeWidth = 3;

var width = 780,
    height = 780,
    radius = Math.min(width, height) / 2,
    //color = d3.scale.category20();
	color = d3.scale.linear()
			.domain([0,1,2,3])
			.range(["#EB6596", "#F7A732", "#75CAE6", "#ADD950"]);
var aniTimers = {start: 32, eachSec: 5},
	aniIndex = 0;

var pathDelay = 600,
	textDelay = 700,
	pathDura = 1000;

// D3: Global SVG Sunbrust
var globalsvg;

var explains = [
    [" The labor force participation rate  is the percentage of working-age persons  in an economy who: Are employed  and Are unemployed but looking for a job.  Typically 'working-age persons'  is defined as people between the ages of 16-64."], ["explaination part II. "],
	["explaination part 3. "],
	["explaination part 4. "],
	["explaination part 5. "],
	["explaination part 6. "],
	["explaination part 7. "],
	["explaination part 8. "],
	["explaination part 9. "],
	["explaination part 10. "],
	["explaination part 11. "],
	["explaination part 12. "],
	["explaination part 13. "],
	["explaination part 14. "],
];
var csvFiles = { cha:{file:"gg_cha.csv",country:"China"},  chi:{file:"gg_che.csv",country:"Chile"},
			col:{file:"gg_col.csv",country:"Colombia"},  fra:{file:"gg_fra.csv",country:"France"},
			ice:{file:"gg_ice.csv",country:"Iceland"},  ind:{file:"gg_ind.csv",country:"India"},
			jap:{file:"gg_jap.csv",country:"Japan"},  new:{file:"gg_new.csv",country:"New Zealand"},
			phi:{file:"gg_phi.csv",country:"Philippines"},  sou:{file:"gg_sa.csv",country:"South Africa"},
			uga:{file:"gg_uga.csv",country:"Uganda"},  uk:{file:"gg_uk.csv",country:"United Kingdom"},
			us:{file:"gg_us.csv",country:"United States"}
			};
console.log(csvFiles);

$('.guideImg').hide();
//////function for QR //////
$(function(){
    /*//////////// Start Button ////////////*/
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
						console.log('Reset! Animation Index:' + aniIndex+ explains[aniIndex]);
						$('span#divId').timer('reset');
						aniIndex++;
					},
					repeat: true
				});
			}
		}); // span#divID Timer
    });

    $('div#reader').html5_qrcode(function(data){
		alert("Get QRInfo");
			// 在reader标签实现读取QR数据
			$('div#read').html(data);
            if(data!= "" && !playintro){
                qrread_data = data; // 全局变量
                dataTitle(); // 触发d3动画
				//$('span#divId').timer(); // 启动计时器
                playintro = true;
				nextindex++;
<<<<<<< HEAD:play/js/index_old2.js
                console.log("Play introduction" + data);
=======
                console.log("## Get QR Country: " + qrread_data.country + "## Year: " + qrread_data.year);
>>>>>>> origin/master:play/js/indexs2.js
            }
			$('span#divId').timer({
				duration: aniTimers.start + 's',
				callback: function() {
					explainTimer();
					$('span#divId').timer('remove');
					$('span#divId').timer({
						duration: aniTimers.eachSec + 's', // 不知道为什么时间加倍
						callback: function(){
							console.log('Reset! Animation Index:' + aniIndex+ explains[aniIndex]);
							$('span#divId').timer('reset');
							aniIndex++;
						},
						repeat: true
					});
				}
			}); // span#divID Timer
		}, function(error){
			$('#read_error').html(error);
		}, function(videoError){ 
			$('#vid_error').html(videoError);
		} 
	);// html5_qrcode 获得QR信息
});

// d3 方法 
function dataTitle(){    
//    svg.attr("class", "sunburstAni")
    var svg = d3.select("div.map").append("svg")
		.attr("class", "sunburstAni")
		.attr("width", width+strokeWidth*2)
        .attr("height", height+strokeWidth*2)
        .append("g")
        .attr("transform", "translate(" + (width/2+strokeWidth) + "," + (height/2+strokeWidth) + ")");
   
    //D3: 参考线
    svg.append("line")
		.attr("class", "refLine")
		.attr("x1", -width).attr("y1", 0).attr("x2", width).attr("y2", 0)
        .attr("stroke-width", strokeWidth)
        .attr("stroke", "#fff")
		.attr("fill","#4D4044");

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
    d3.json("../jsons/Gengaptitle.json", function(error, root) {
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
				console.log(d);
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

<<<<<<< HEAD:play/js/index_old2.js
}// dataTitle();
=======
}// dataTitle(); 第一部分的parition动画

/*///////////////// Stacked Radial 第二部分动画 /////////////////////*/
function stackedRadial(){ 
    
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
                      "Sex ratio at  birth(female/male)",
                      "Healthy life  expectancy",
                      "Women in parliament",
                      "Women in ministerial  positions",
                      "Years with female  head of state(last 50)"];
    
	var outerRadius = height/2 - 70,
		innerRadius = 120;

	var margin = {top: 20, right: 20, bottom: 30, left: 50};

	var angle = d3.time.scale()
		.range([Math.PI/2, Math.PI/2-2 * Math.PI]);

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
		.attr("width", width+strokeWidth*2)
		.attr("height", height+strokeWidth*2)
		.append("g")
		.attr("transform", "translate(" + (width/2+strokeWidth) + "," + (height/2+strokeWidth) + ")");
	
	var csvName = checkCountry(qrread_data?qrread_data.country:"China");

    console.log("###Country CSV: " + csvName + " ###");
	d3.csv("data/"+csvName, function(error, data) {
		var d, num;
		for( d in data){
			num = data[d];
			//console.log(num);
			for(var i in num){
				num[i] = Number(num[i]);
			}
		} // 不知道为什么数据突然都变成字符串了？
		
		var layers = stack(nest.entries(data));
		
		
		// Extend the domain slightly to match the range of [0, 2π].
		angle.domain([0, d3.max(data, function(d) { return d.time + 1; })]);
		radius.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

		var layers = svg.selectAll(".layer")
					  .data(layers)
					  .enter().append("path")
					  .attr("class", "layer")
					  .attr("d", function(d) { return area(d.values); })
					  .style("fill", function(d, i) { return color(i); });

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
			.attr("dy", "-14em")
			.attr("text-anchor", "middle")
			.text(function(d) { return formatDay(d); })
			.call(wrap, 60);



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
>>>>>>> origin/master:play/js/indexs2.js

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
		d3.select(".refLine").remove();
		console.log("### Click 2nd add explains index:" + (nextindex-1));
		middleTextTop.text(explains[0]).call(wrap, 350);
	}else if(nextindex >= 2){
		/*///////////////// Start from 3rd click ///////////////// */
		d3.select("text.explainTop").text("");
		console.log("### Add explains["+ (nextindex-1) +"] to top" + explains[nextindex-1]);
		d3.select("text.explainTop").text(explains[nextindex-1]).call(wrap, 350);
	}
	nextindex++;

});//****  Click next button  ****//

<<<<<<< HEAD:play/js/index_old2.js
=======
/*//////////////// Stacked Radical Button //////////////////*/

d3.select("#stackBtn").on("click",function(){
    // Init middelText from 2nd click
	console.log("!! Click stacked radical button !!");
    d3.select("div.map form").remove();
    d3.select("div.map svg").remove();
    stackedRadial();
	$('svg.StackedRadial').css({
		'top': 0,
		'margin-top': 0
	});

});//****  Click Stacked Radical Button  ****//
>>>>>>> origin/master:play/js/indexs2.js

function explainTimer(){
	console.log("#### Start normal timer ####");
}

function checkCountry(countryName){
	for(var i in csvFiles){
		if(csvFiles[i].country === countryName){
			return csvFiles[i].file;
		}
	}
} // get country name & csv filename from QR Code

// 文字换行函数
function wrap(text, width) { 
	text.each(function(d) {
		console.log(d);
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
							if(width< 50){ return (++lineNumber * lineHeight + "em"); }
							else{ return (++lineNumber * lineHeight - 14 + "em"); }
						})
						.text(word);

				}
			} // While
		}
	});

}// 文字换行

d3.select(self.frameElement).style("height", height + "px");
// dataTitle 函数： 绘制第一部分d3图像

/** Toggle guide image **/
$('#guide').on("click touchstart", function(){
    $('div.guideImg').fadeToggle(1000);
});
$('a#guideBtn').on("click touchstart", function(){
    $("div.guideImg").fadeOut(1000);
});

/** Clear button in fixed-action-btn group **/
$('#clear').on("click touchstart", function(){
    localStorage.clear();
});

