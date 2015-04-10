var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];	//Width and height
var yaxisSpace = 120;
var w = 600 + yaxisSpace,
    h = 500, 
    heightpercent = 20, // Y Axis [0,20%]
    barRise = 40;

//var color = d3.scale.category20();
var color = d3.scale.linear()
        .domain([0,1])
        .range(["#6baed6", "#3182bd"]);

d3.csv("netsale.csv", function(dataset){ 
    percent_data = dataset;

    var netSum = [0,0]; // save total % for each status

    // Sum for total net sales
    var totalnetsales = 0; 
    dataset.forEach(function(d) {
        totalnetsales += Number(d.netsales);
    });

    // split csv based on Shipment Status
    var statusData = d3.nest()
            .key(function(d){return d.status;})
            .entries(percent_data); 

    // Quarter Sum % Net Sales 
    //and month number for each quarter in current database
    var quartSum = new Object();
    statusData.forEach(function(d) {
        quartSum[d.key] = [0,0,0,0];
        quartSum[d.key+"MonthNum"] = [0,0,0,0];
    });

    // Get month num from the original date
    // Calculate value of percent for each net sales data
    percent_data.forEach(function(d) {
        var net_date;

        net_date = d.date.split("/");
        d.date = Number(net_date[0]);

        d.netsales =  Math.round(d.netsales/totalnetsales*100); 

        d.quart = Math.floor((d.date-1)/3)+1;

        if(d.status === "On Time"){
            netSum[0] += Number(d.netsales);
            quartSum[d.status][d.quart-1] += d.netsales;
            quartSum[d.status+"MonthNum"][[d.quart-1]] +=1;

        }else{ 
            netSum[1] += Number(d.netsales);
            quartSum[d.status][d.quart-1] += d.netsales;
            quartSum[d.status+"MonthNum"][[d.quart-1]] +=1;
        }
        d.total = false;
    });

    // Calculate quarter average % Net Sales
    percent_data.forEach(function(d) {
        d.quartAvg = Math.round(quartSum[d.status][d.quart-1]/ quartSum[d.status+"MonthNum"][[d.quart-1]]);

        d.quartMonth = quartSum[d.status+"MonthNum"][[d.quart-1]];
    });
    console.log(quartSum);

    // create array to save two Total net sales object
    var avgNetSales = new Array();

    statusData.forEach(function(d,i){
        avgNetSales[i] = new Object();

        avgNetSales[i].date = d.values[d.values.length-1].date+1;
        avgNetSales[i].status = d.values[d.values.length-1].status;
        avgNetSales[i].total = true;     
        avgNetSales[i].netsales = Math.round(netSum[i]/d.values.length);
        d.values[d.values.length] = avgNetSales[i];
        console.log(d.values);
    });

    //console.log(quartData);

    // Start to create bar chart with d3.js
    var xScale = d3.scale.ordinal()
                .domain(d3.range(dataset.length/2 + 1))
                .rangeRoundBands([0, w - yaxisSpace], 0.1);
    // x Scale without interval
    var xNoInt = d3.scale.ordinal()
                .domain(d3.range(dataset.length/2 + 1))
                .rangeBands([0, w - yaxisSpace]);

    var xAxis = d3.svg.axis()
                .scale(xScale);

    var yScale = d3.scale.linear()
                .domain([0, heightpercent])
                .range([0, h/2-barRise]);
    // opposite y scale of ySacle
    var y = d3.scale.linear()
                .domain([0, heightpercent])
                .range([h/2-barRise, 0]);

    var yAxis = d3.svg.axis()
                .scale(y)
                .orient('right')
                .ticks(5)
                .tickFormat(function(d){ 
                    return d + "%";
                });

    // Create SVG element
    var svg = d3.select("div.map")
                .append("svg")
                .attr("width", w)
                .attr("height", h+barRise);

    // titles of two status 
    var title = svg.selectAll("text")
        .data(statusData)
        .enter()
        .append("g");

    title.append("text")
        .attr("class", "title")
        .attr("transform", function(d,i){
            return "translate(" + (yaxisSpace/2-25) + ","+(h/(i+1)-h/4+barRise/2) +") rotate(-90)";   })
        .text(function(d) {
            return d.key; 
        });

    title.append("text")
        .attr("class", "title_percent")
        .attr("transform", function(d,i){
            return "translate(" + (yaxisSpace/2+5) + ","+(h/(i+1)-h/4+barRise/2) +") rotate(-90)";   })
        .text("% of Net Sales");
    
    var quartLineX = new Array(3);

    //Create bars of two status
    for(var j= 0 ; j < statusData.length; j++){
       // console.log(statusData[j]); 

        svg.selectAll("rect.status"+j)
            .data(statusData[j].values)
            .enter()
            .append("rect")
            .attr("x", function(d, i) {
                console.log(xScale(i));
                return xScale(i)+yaxisSpace;
            })
            .attr("y", function(d) {
                    return h/(j+1) - yScale(d.netsales)+barRise;
            })
            .attr("width", xScale.rangeBand())
            .attr("height", function(d) {
                return yScale(d.netsales)-barRise;
            })
            .attr("fill", function(d){
                return color(j);
            });

        // build dashed lines for quarter average % Net Sales
        var dashrect = svg.selectAll("g.dashed"+j)
            .data(statusData[j].values)
            .enter()
            .append("g")
            .attr("class","dashed"+j);

        dashrect.append("rect")
            .attr("x", function(d, i) {
                var x0 = xNoInt(i)+yaxisSpace;
                if(d.date%3==1?(d.quartMonth*xNoInt.rangeBand()-i):0){
                }
                return i?(x0-3):x0;
            })
            .attr("y", function(d) {
                if(d.total){
                    return h/(j+1)-yScale(d.netsales)+barRise;
                }else{
                return d.quartAvg?(h/(j+1)-yScale(d.quartAvg)+barRise):0;}
            })
            .attr("width", function(d,i){
                if(d.total){
                    return xNoInt.rangeBand()+3;
                }else{
                    return d.date%3==1?(d.quartMonth*xNoInt.rangeBand()-3):0;
                }
            })
            .attr("height", function(d) {
                return d.total?(yScale(d.netsales)-barRise):(yScale(d.quartAvg)-barRise);
            })
            .attr("stroke", "black")
            .attr("stroke-width","2")
            .attr("stroke-dasharray","5,5")
            .attr("fill","none");

        // Percent text inside bars
        svg.selectAll("text.percent"+j)
            .data(statusData[j].values)
            .enter()
            .append("text")
            .attr("class", "percent"+j)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("x", function(d, i) {
                return xScale(i)+yaxisSpace+xScale.rangeBand()/2;
            })
            .attr("y", function(d) {
                return h/(j+1) - yScale(d.netsales)/2 + barRise*2/3;
            })
            .text(function(d) { return d.netsales+"%"; });
        // debug console.log(statusData[j].values);

        // Average percent text outside of bars
        dashrect.append("text")
            .attr("class", "avgpercent"+j)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "black")
            .attr("x", function(d, i) {
                if(d.total){
                    return  xScale(i)+yaxisSpace+xScale.rangeBand()/2;
                }else{
                    return d.date%3==1?(d.quartMonth*xNoInt.rangeBand()/2 + xScale(i)+yaxisSpace):(-50);
                    }
            })
            .attr("y", function(d) {
                var texty = d.total?(h/(j+1) - yScale(d.netsales)):(h/(j+1) - yScale(d.quartAvg));
                return texty+barRise/2;
            })
            .text(function(d) { 
                return "Avg = " + (d.total?d.netsales:d.quartAvg)+"%"; });

        // X Axis
        svg.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate("+ yaxisSpace + "," + h/(j+1) + ")")
            .call(xAxis)
          .selectAll("text")
            .attr("y", barRise/2)
            .attr("x", 0)
            .attr("dy", ".1em")
            .attr("text-anchor", "middle")
            .text(function(d) {
                var _month = statusData[j].values[d].date - 1;
                return d<(statusData[j].values.length-1)?months[_month]:"Total"; 
            });

        // Y Axis
        svg.append("g")
            .attr("class", "yaxis")
            .attr("transform", "translate("+ yaxisSpace + "," + ((h/2)*j+barRise) + ")")
            .call(yAxis)
          .selectAll("text")
            .attr("x", -5 )
            .attr("dy", ".2em")
            .style("text-anchor", "end")
          .selectAll('path')
            .style({ fill: 'none', stroke: "#000"});
    }

 });
