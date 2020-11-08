var mapSvg;

var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = {
	top: 20,
	right: 60,
	bottom: 60,
	left: 100
};
const width = 800 - lineMargin.left - lineMargin.right;
const height = 470 - lineMargin.top - lineMargin.bottom + 200;

var dogData;
var flightData;

document.addEventListener('DOMContentLoaded', function () {

	mapSvg = d3.select('#map');
	yearSvg = d3.select('#years');
	lineWidth = +mapSvg.style('width').replace('px', '');
	lineHeight = +mapSvg.style('height').replace('px', '');
	lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
	lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;

	Promise.all([d3.csv('data/Dogs-Database.csv'),
			d3.csv('data/Flights-Database.csv')
		])
		.then(function (values) {
			dogData = values[0];
			flightData = values[1];
			drawMap()
		})

});

function drawMap() {
	const startX = 50,
		endX = width - 50;
	var date = "";
	var grad = mapSvg.append("defs").append("linearGradient").attr("id", "grad")
		.attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");
	grad.append("stop").attr("offset", "50%").style("stop-color", "rgba(255, 156, 144, 0.71)");
	grad.append("stop").attr("offset", "50%").style("stop-color", "rgb(155, 230, 160)");


	var tooltip = d3.select("body")
		.append("div")
		.style("position", "absolute")
		.style("padding", "5px")
		.style("background-color", "white")
		.style("visibility", "hidden")
		.style("text-align", "center")
		.style("color", "black")
		.style("border", "solid")
		.style("border-width", "2px")
		.style("border-radius", "5px")

	// create the map projection and geoPath
	let projection = d3.geoMercator()
		.scale(400)
		.center(d3.geoCentroid(flightData))
		.translate([+mapSvg.style('width').replace('px', '') / 2, +mapSvg.style('height').replace('px', '') / 2.3]);
	let path = d3.geoPath()
		.projection(projection);

	years = []
	var yparse = d3.timeParse("%Y");
	flightData.forEach(function (d) {
		years.push(d.Date.substring(0, 4));
	});

	years2 = d3.set(years).values()

	var yearsv = yearSvg.append('g');
	yearsv.selectAll("text")
		.data(years2)
		.enter()
		.append("text")
		.style('width', '100px')
		.style("font-family", "sans-serif")
		.style("fill", "grey")
		.style("font-weight", "500")
		.attr('transform', (d, i) => `translate(${startX},${40 + i*80})`)
		.style("font-size", "18px")
		.text(function (d) {
			return d
		});

	yearsv.append("text")
        .attr("text-anchor", "middle")
        .attr("x", -390 )
        .attr("y", 30)
        .style("font-size", "16px")
		.style("font-family", "sans-serif")
		.style("fill", "grey")
        .style("font-weight","5000")
		.text("Years")
		.attr("transform", "rotate(-90)");

	var counter = 0;
	var j = 0;
	const glyphs = mapSvg.selectAll('g')
		.data(flightData)
		.enter()
		.append('g')
		.attr('transform', function (d, i) {
			if (!(years2[counter] == d.Date.substring(0, 4))) {
				counter++;
				j = 1;
			} else j = j + 1;
			date = d.Date;
			return `translate(${startX+j*100},${40+80*counter})`
		})
	glyphs.append('circle')
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('r', 30)
		.style('fill', d => {
			let val = d.Result;
			let dogcount = d.Dogs;
			if ((val.includes("both") && val.includes("died")) || (val.includes("died") && !dogcount.includes(",")))
				return 'rgba(255, 156, 144, 0.71)';
			else if (val.includes("died"))
				return 'url(#grad)';
			return 'rgb(155, 230, 160)';
		})
		.style('stroke', d => {
			let val = d.Altitude;

			if (val.includes("100"))
				return '#66c2a5';
			else if (val.includes("212"))
				return '#fc8d62';
			else if (val.includes("451"))
				return '#8da0cb';
			else if (val.includes("orbital"))
				return '#e78ac3';
			return 'black';
		})
		.style('stroke-width', '3')
		.on('mouseover', function (d, i) {
			tooltip.style("width", function () {})
			tooltip.style("top", d3.event.pageY + 'px')
				.style("left", d3.event.pageX + 'px')

			tooltip.style("visibility", "visible")
				.html("Rocket Name:" + d.Rocket + '<br>Dog Name:' + d.Dogs + '<br>Date:' + d.Date + '<br>Flight Result:' + d.Result)

			d3.select(this).transition()

				.style('stroke-width', '6');

		})
		.on('mouseout', function (d, i) {
			tooltip.style("visibility", "hidden");
			d3.select(this).transition()
				.style('stroke-width', '3');
		})
	
	glyphs.append('circle')
		.style('text-anchor', 'middle')
		.style('alignment-baseline', 'middle')
		.style('fill', 'rgb(255, 255, 68)')
		.attr('r', 5)
		.attr('cx', function (d, i) {
			if (d.Dogs.split(",").length == 1)
				return 0.5;
			return -4;
		})
		.attr('cy', function (d, i) {
			if (d.Dogs.split(",").length == 1)
				return 0;
			return -5;
		})
		.style("opacity", 0.7);
	glyphs.append('circle')
		.style('text-anchor', 'middle')
		.style('alignment-baseline', 'middle')
		.style('fill', function (d, i) {
			if (d.Dogs.split(",").length == 2)
				return '#1f78b4';
			return 'none';
		})
		.attr('r', 5)
		.attr('cx', 7)
		.attr('cy', 5)
		.style("opacity", 0.7);
		
	const legend = d3.select("#legend")
     
    legend.append("rect")
        .attr("x", 0)
        .attr("width", 20)
        .attr("height", 16)
        .style("fill", "rgba(255, 156, 144, 0.71)");
	legend.append("rect")
        .attr("x", 0)
		.attr("y", 25)
        .attr("width", 20)
        .attr("height", 16)
        .style("fill", "rgb(155, 230, 160)");
    
	legend.append("text")
        .attr("x", 104)
        .attr("y", 13)
        .attr("class","legend")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
		.text("All Died during the mission");
		
	legend.append("text")
        .attr("x", 111)
        .attr("y", 37)
        .attr("class","legend")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
		.text("All Dogs survived the mission");
	
	legend.append("rect")
        .attr("x", 0)
		.attr("y", 50)
        .attr("width", 20)
        .attr("height", 16)
        .style("fill", "url(#grad)");
	
	legend.append("text")
        .attr("x", 142)
        .attr("y", 61)
        .attr("class","legend")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
		.text("Only one dog survived out of the two dogs");
	
	legend.append("circle")
        .attr('cx', 12)
        .attr('cy', 90)
        .style('stroke-width', 3)
		.style('stroke', '#66c2a5')
		.style('fill', 'none')
		.attr('r', 10);
		
	legend.append("circle")
        .attr('cx', 12)
        .attr('cy', 120)
        .style('stroke-width', 3)
		.style('stroke', '#fc8d62')
		.style('fill', 'none')
		.attr('r', 10);
		
	legend.append("circle")
        .attr('cx', 12)
        .attr('cy', 150)
        .style('stroke-width', 3)
		.style('stroke', '#8da0cb')
		.style('fill', 'none')
		.attr('r', 10);
		
	legend.append("circle")
        .attr('cx', 12)
        .attr('cy', 150)
        .style('stroke-width', 3)
		.style('stroke', '#8da0cb')
		.style('fill', 'none')
		.attr('r', 10);

	legend.append("circle")
        .attr('cx', 12)
        .attr('cy', 180)
        .style('stroke-width', 3)
		.style('stroke', '#e78ac3')
		.style('fill', 'none')
		.attr('r', 10);
	
	legend.append("circle")
        .attr('cx', 12)
        .attr('cy', 210)
        .style('stroke-width', 3)
		.style('stroke', 'black')
		.style('fill', 'none')
		.attr('r', 10);
	
	legend.append("text")
        .attr("x", 167)
        .attr("y", 95)
        .attr("class","legend")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
		.text("Circles with this color border indicate 100Km Altitude");
		
	legend.append("text")
        .attr("x", 167)
        .attr("y", 125)
        .attr("class","legend")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
		.text("Circles with this color border indicate 212Km Altitude");
		
	legend.append("text")
        .attr("x", 167)
        .attr("y", 155)
        .attr("class","legend")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
		.text("Circles with this color border indicate 451Km Altitude");
		
	legend.append("text")
        .attr("x", 166)
        .attr("y", 185)
        .attr("class","legend")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
		.text("Circles with this color border indicate Orbital Altitude");	

	legend.append("text")
        .attr("x", 173)
        .attr("y", 215)
        .attr("class","legend")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
		.text("Circles with this color border indicate Unknown Altitude");
		
	legend.append("text")
        .attr("x", 295)
        .attr("y", 245)
        .attr("class","legend")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
		.text("Circles with two cirlces within imply that there were two dogs in the rocket whereas 1 circle signifies 1 Dog in the rocket.");
		
	legend.append("text")
        .attr("x", 456)
        .attr("y", 270)
        .attr("class","legend")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
		.text("Marks for this data set are circles which represent each data point (Rocket) and also circles again within the rocket representations to represent the number of dogs (Quantitative Attribute).");
		
	legend.append("text")
        .attr("x", 302)
        .attr("y", 295)
        .attr("class","legend")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
		.text("Channels for this data set are predominantly colors which represent each different data point as shown in the legend above.");
		
	legend.append("text")
        .attr("x", 310)
        .attr("y", 320)
        .attr("class","legend")
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
		.text("Vertical and Horizontal placement of the circles signifying rockets represent the year and sequence of take off of those rockets.");
}