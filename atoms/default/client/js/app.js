import * as d3 from "d3"
import { group } from 'd3-array'
import mustache from 'shared/js/mustache'
import template from "shared/templates/template.html"

function init(data) {	

	var width = document.querySelector("#graphicContainer").getBoundingClientRect().width;
	var container = document.querySelector("#graphicContainer").getBoundingClientRect().width;   

	var winW = window.innerWidth
	var winH = window.innerHeight    
	var con
	var isMobile = false

	if (winW <= 620) {
		isMobile = true
	}
	var height
	var currentDog

	var scaleVal = 1

	scaleVal = 1260

	var radiusVal = 8

	if (winW >= winH) {
		height = width * 0.6;
	}

	else {
		height = width * 1.6
		scaleVal = 0.8
	}
	
	var margin = {top: 0, right: 0, bottom: 0, left:0};
	
	var forceStrength,bubblesExist;

	d3.select("#graphicContainer svg").remove()
	var context = d3.select(".interactive-wrapper")

	var svg = d3.select("#graphicContainer").append("svg")
				.attr("width", width - margin.left - margin.right)
				.attr("height", height - margin.top - margin.bottom)
				.attr("id", "svg")
				.attr("overflow", "hidden");

				
	var tooltip = d3.select("#tooltip")

	var defs = svg.append("defs");

	var hints = true

	function fadeHints() {
			d3.selectAll(".hints").transition().duration(500).style("opacity", 0).style("pointer-events", "none")
			hints = false
	}

	d3.selectAll(".hints").on("click", fadeHints)

	var margin = {top: 0, right: 0, bottom: 0, left:0};
	
	var forceStrength,bubblesExist;

	d3.select('#graphicContainer svg').remove()

	var svg = context.select("#graphicContainer").append("svg")
				.attr("width", width - margin.left - margin.right)
				.attr("height", height - margin.top - margin.bottom)
				.attr("id", "svg")
				.attr("overflow", "hidden")
				.attr("viewBox", [-width / 2, -height / 2, width, height]);

	var defs = svg.append("defs");

	var extent = d3.extent(data.links, d => d.count)
	console.log(extent)
	// var linkLength = d3.scaleLinear()
	// 	.range([linkMax, linkMin])		
	// 	.domain(extent)		

	// console.log(linkLength.domain())	

	data.nodes.forEach(function (d) {
		d.proportions = [{"gender":"M", "pct":d.m_pct},
						{"gender":"F", "pct":d.f_pct}]
	})

	var linkWidth = d3.scaleLinear()
		.range([2,(radiusVal*2) * 0.8])		
		.domain(extent)

	var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
		
	var companySelector = context.select("#companySelector");			
		
	data.nodes.sort(function(a, b) {
		var nameA = a.name.toUpperCase()
		var nameB = b.name.toUpperCase()
		if (nameA < nameB) {
		return -1;
		}
		if (nameA > nameB) {
		return 1;
		}

		return 0;
	});

	companySelector.append("option")
				.attr("value","nil")
				.text("---")	

	data.nodes.forEach(function (d) {

			companySelector.append("option")
				.attr("value",d.id)
				.text(d.name)	
		
	})

	var chartDataSave, atomSave, currentDogSave, currentGroupSave, chargeSave; 				


	var color = d3.scaleOrdinal()
	    .domain(["F","M"])
	    .range(["#d95f02","#1b9e77"])

	function makeChart(chartData, type) {

		// chartDataSave = selectedData
		// atomSave = atom
		// currentDogSave = currentDog
		// currentGroupSave = currentGroup
		// chargeSave = charge

		if (type === 'company') {
			radiusVal = 25
		}

		else {
			radiusVal = 8
		}


		d3.select("#statusMessage").remove()

		console.log("making chart")

		// if (typeof simulation !== 'undefined') {
		// 	simulation.stop();	
		// }
		
		features.selectAll(".links")
			.transition('removelinks')
			.style("opacity",0)
			.remove();

		features.selectAll(".nodes circle")
			.transition('removenodecircles')
			.attr("r",0)
			.remove();

		features.selectAll(".nodes")
			.transition('removenodes')
			.remove();	

		features.selectAll(".nodes text")
			.transition()
			.style("opacity",0)
			.remove();
		
		var totalNodes = data.nodes.length;

		var distance = 50
		var blaf
		if (type === 'company') {
			distance = d3.min([width/2, 150])
		}

		console.log(distance)

		var simulation = d3.forceSimulation(chartData.nodes)
		    .force("link", d3.forceLink(chartData.links).id(d => d.id).distance(distance))
		    .force("charge", d3.forceManyBody())
		    .force("x", d3.forceX())
      		.force("y", d3.forceY())
		    .force("collide", d3.forceCollide().radius(radiusVal + 2).iterations(2))

		// simulation.nodes(selectedData.nodes);
  // 		simulation.force("link").links(selectedData.links);      




		var drag = simulation => {
		  
		  function dragstarted(d) {
		    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		    d.fx = d.x;
		    d.fy = d.y;
		  }
		  
		  function dragged(d) {
		    d.fx = d3.event.x;
		    d.fy = d3.event.y;
		  }
		  
		  function dragended(d) {
		    if (!d3.event.active) simulation.alphaTarget(0);
		    d.fx = null;
		    d.fy = null;
		  }
		  
		  return d3.drag()
		      .on("start", dragstarted)
		      .on("drag", dragged)
		      .on("end", dragended);
		}      

		var links = features.append("g")
			.attr("stroke", "#bababa")
			.attr("stroke-opacity", 0.7)
			.selectAll("line")
			.data(chartData.links)
			.join("line")
			.attr("stroke-width", d => linkWidth(d.count))
			.attr("class", "links")
		  	.on('mouseover.fade', fade2(0.1, 'over'))
		  	.on('mouseout.fade', fade2(1, 'out'))



		  	// .on("mouseout.tooltip", resetTooltip())

		// var linkCircles = features.selectAll(".linkCircle")
		// 	.data(data.links)
		// 	.enter()
		// 	.append("circle")
		// 	.attr("class", "linkCircles")
		// 	.style("opacity", 0)
		// 	.attr("fill", "#FFF")
		// 	.attr("r",12)
		// 	.attr("stroke", "#bababa")

		// var linkText = features.selectAll(".linkText")
		// 	.data(selectedData.links)
		// 	.enter()
		// 	.append("text")
		// 	.attr("class", "linkTexts label")
		// 	.attr("text-anchor", "middle")
		// 	.attr("dy",4)
		// 	.style("font-size","10px")
		// 	.style("opacity", 0)
		// 	.text(function(d) { return Math.round(relatedness(d.outValue) * 10) / 10 })	

		var arc = d3.arc()
		    .innerRadius(0)
		    .outerRadius(radiusVal)

		var pie = d3.pie()
		    .sort(null)
		    .value(d => d.pct)

		var nodes = features.append("g")
			.attr("class", "nodes")
		.selectAll("g")
		    .data(chartData.nodes)
		    .enter().append("g")
		    .attr("id", d => d.id)
		    .style("opacity", 1)

		// data.nodes.forEach(function(d) {

		// })

		nodes.selectAll("path")
			.data(function(d) { 
				return pie(d.proportions)
				})
			.join("path")
			.attr("d", arc)
			.attr("stroke", function(d) {
				if (d.data.gender == 'F' && d.value != 0) {
					return "#FFF"
				}

				else {
					return "none"
				}
			})
			.attr("stroke-width", function(d) {
				if (d.data.gender == 'F' && d.value != 0) {
					return 1
				}

				else {
					return 0
				}
			})
			.attr("fill", d => color(d.data.gender))

		var circles = nodes.append("circle")
			.attr("r", radiusVal)
			.attr("stroke-width", 1)
			.attr("title", d => d.name)
			.attr("stroke", '#fff')
			.attr("fill-opacity","0")
			.on('mouseover.fade', fade(0.1, 'over'))
		  	.on('mouseout.fade', fade(1, 'out'))
			.on("mouseover", function(d){
				var target = chartData.links.filter(item => item.targetName === d.name).length
				var source = chartData.links.filter(item => item.sourceName === d.name).length
				d.connections = target + source
				var text = mustache(template, d)
        		tooltip.html(text)
        		tooltip.transition().duration(200).style("opacity", .9)
			})
			.on("mouseout", function() {
				tooltip.transition().duration(500).style("opacity", 0)
			})
			.call(drag(simulation))

		var labels = nodes.append("text")	
			.text(d=> d.name)
			.attr("class", "label")
			.style("opacity", 0)
			.attr('x', 0)
  			.attr('y', radiusVal + 16)
  			.attr("text-anchor", "middle")

		 simulation.on("tick", () => {
		    links
		        .attr("x1", function(d) {
		        	return d.source.x
		        })
		        .attr("y1", d => d.source.y)
		        .attr("x2", d => d.target.x)
		        .attr("y2", d => d.target.y);

		 	nodes.attr("transform", function(d) {
		 		var r = radiusVal + 0.5
		 		return "translate(" + d.x + "," + d.y + ")";
	  		})


  	
		 	// linkText
		  //       .attr("x", function(d) {
		  //           return ((d.source.x + d.target.x)/2);
		  //       })
		  //       .attr("y", function(d) {
		  //           return ((d.source.y + d.target.y)/2);
		  //       });

		    // linkCircles
		    //     .attr("cx", function(d) {
		    //         return ((d.source.x + d.target.x)/2);
		    //     })
		    //     .attr("cy", function(d) {
		    //         return ((d.source.y + d.target.y)/2);
		    //     });    

		  	// linkText.attr("transform", function(d) {
		 		// // var r = radiusVal + 0.5
		 		// return "translate(" + (d.x = Math.min(width, (d.source.x + d.target.x)/2) + "," + (d.y = Math.min(height, (d.source.y + d.target.y)/2)) + ")";
	  		// })


		  });	

		 // 	function makeTooltip() {

		 // 		return d => {	 		
		 // 		var text = `<h3>${d.source.breed} and ${d.target.breed}</h3><br>
			// 				<p>Share ${d.outValue} bps or ${d.pct}%</p>`

		 //  	// 	tooltip.transition()
			// 		// .duration(200)
			// 	 //   	.style("opacity", .9);

			// 	tooltip.html(text)   	


		 //    	}
		 // }

		 function resetTooltip() {
		 	return blah => {
		 		var text = `<h3>Information</h3><br>
							<p>Click a dog or link to see more</p>`

				tooltip.html(text)							
		 	}

		 }


		  const linkedByIndex = {};
		 	chartData.links.forEach(d => {
		    linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
		  });

		  function isConnected(a, b) {
		    return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
		  }

		  function fade(opacity, action) {

		    return d => {

		    	if (hints) {
		    		fadeHints();
		    	}	
		      nodes.style('stroke-opacity', function (o) {
		        const thisOpacity = isConnected(d, o) ? 1 : opacity;
		        this.setAttribute('fill-opacity', thisOpacity);
		        return thisOpacity;
		      });

		      links.style('stroke-opacity', o => (o.source === d || o.target === d ? 0.7 : opacity));

		      if (action === 'over') {
		      		labels.style('opacity', o => (o.source === d || o.target === d ? 0 : 1));
		      }
		      
		      else {
		      		labels.style('opacity', 0);
		      		// linkText.style('opacity', 0);
		      		// linkCircles.style('opacity', 0);
					// context.selectAll(".colorKeyDiv").style("opacity",1	).transition()	

		      }

		  //    if (currentDog) {
		  //     	context.select(`#${currentDog} .label`).style("opacity",1)
				// }


		    };
		 }

		 function fade2(opacity, action) {

		    return d => {

		    	if (hints) {
		    		fadeHints();
		    	}	
		    	nodes.style('stroke-opacity', function (o) {
			        const thisOpacity = (d.source.id === o.id || d.target.id === o.id ? 1 : opacity)
			        this.setAttribute('fill-opacity', thisOpacity);
			        return thisOpacity;
		      	});

		    	links.style('stroke-opacity', o => (o.source.id === d.source.id && o.target.id === d.target.id ? 1 : opacity));

		    	// linkText.style('opacity', o => (o.source.id === d.source.id && o.target.id === d.target.id ? 1 : 0));
		     //  	linkCircles.style('opacity', o => (o.source.id === d.source.id && o.target.id === d.target.id ? 1 : 0));

		    	if (action === 'over') {
		      		labels.style('opacity', o => (o.source === d || o.target === d ? 0 : 1));
		      		
		      	}
		      
		      else {
		      		labels.style('opacity', 0);
		      		// linkText.style('opacity', 0);
		      		// linkCircles.style('opacity', 0);
		      }

		  //     if (currentDog) {
		  //     	context.select(`#${currentDog} .label`).style("opacity",1)
				// }

		    };
		 }


	} // end make chart
	

	makeChart(JSON.parse(JSON.stringify(data)), 'all')

	function filterData(filterBy) {
		// Clone dogs so we don't modify the orig data with d3 force stuff
		var dataClone = JSON.parse(JSON.stringify(data))

		var filteredData = {}
		filteredData.links = dataClone.links.filter(d => (d.source == filterBy) | (d.target == filterBy))
		// console.log(filteredData.links)
		var setNodes = new Set()
		setNodes.add(filterBy)
		filteredData.links.forEach(d => {
			setNodes.add(d.target)
			setNodes.add(d.source)  
		})
		filteredData.nodes = dataClone.nodes.filter(d => setNodes.has(d.id))

		return filteredData
	}


	companySelector.on("change", function() {

		var newWidth = document.querySelector(`#graphicContainer`).getBoundingClientRect().width
		
		var currentCompany = d3.select(this).property('value')

		d3.select("#resetButton").style("display", "block")

		if (currentCompany != "nil") {
			var newData = filterData(d3.select(this).property('value'));
				// console.log("newData",newData)
			makeChart(newData, 'company')

	
		}
		
		else {
			makeChart(JSON.parse(JSON.stringify(data)), 'all')
			d3.select("#resetButton").style("display", "none")
		}
	
	});


	d3.select("#resetButton").on("click", function() {
		makeChart(JSON.parse(JSON.stringify(data)), 'all')
		companySelector.property("value", "nil")
		d3.select("#resetButton").style("display", "none")
	})

	function makeKey() {
		context.select("#chartKey svg").remove()
		var keyWidth = document.querySelector("#chartKey").getBoundingClientRect().width;
		var keyHeight = 60;

		var offset = 10
		var mid1 = (keyHeight/2) - linkWidth(extent[0])/2 + offset
		var mid2 = (keyHeight/2) - linkWidth(extent[1])/2 + offset

		var key = context.select("#chartKey").append("svg")
				.attr("width", keyWidth)
				.attr("height", keyHeight)
				.attr("id", "keySvg")
				.attr("overflow", "hidden");

		key.append("rect")
			.attr("width", keyWidth * 0.2)
			.attr("height", linkWidth(extent[0]))
			.attr("x",2)
			.attr("y", mid1) 
			.attr("fill", "#bababa")

		key.append("rect")
			.attr("width", keyWidth * 0.2)
			.attr("height", linkWidth(extent[1]))
			.attr("x", keyWidth * 0.5)
			.attr("y",mid2)
			.attr("fill", "#bababa")

		// key.append("circle")
		// 	.attr("r", 12)
		// 	.attr("cx", 2 + (keyWidth * 0.2)/2)
		// 	.attr("cy",(keyHeight/2) + offset)
		// 	.attr("stroke", "#bababa")
		// 	.attr("fill", "#FFF")

		// key.append("circle")
		// 	.attr("r", 12)
		// 	.attr("cx", (keyWidth * 0.5) + (keyWidth * 0.2)/2)
		// 	.attr("cy", (keyHeight/2) + offset)
		// 	.attr("stroke", "#bababa")
		// 	.attr("fill", "#FFF")	

		key.append("text")
			.attr("x",2)
			.attr("y",12)
			.attr("class", "keyText")
			.text("One director")

		key.append("text")
			.attr("x",keyWidth * 0.5)
			.attr("y",12)
			.attr("class", "keyText")
			.text("Five directors")	

		// key.append("text")
		// 	.attr("x",2 + (keyWidth * 0.2)/2)
		// 	.attr("y",(keyHeight/2) + offset)
		// 	.attr("class", "keyText")
		// 	.attr("dy", 4)
		// 	.attr("text-anchor", "middle")
		// 	.text(extent[0])

		// key.append("text")
		// 	.attr("x",(keyWidth * 0.5) + (keyWidth * 0.2)/2)
		// 	.attr("y",(keyHeight/2) + offset)
		// 	.attr("class", "keyText")
		// 	.attr("dy", 4)
		// 	.attr("text-anchor", "middle")
		// 	.text(extent[1])							

	}

	makeKey()

	var to=null
	// var lastWidth = document.querySelector(`.${dogbreed} #graphicContainer`).getBoundingClientRect().width;
	// window.addEventListener('resize', function() {
	// 	var thisWidth = document.querySelector(`.${dogbreed} #graphicContainer`).getBoundingClientRect().width
	// 	if (width != thisWidth) {
	// 		window.clearTimeout(to);
	// 		to = window.setTimeout(function() {
	// 				resizeChart(thisWidth)
	// 			}, 100)
	// 	}
	
	// })

	// function resizeChart(newWidth) {

	// 	// if (newWidth <= 620) {
	// 	// 	isMobile = true
	// 	// }		

	// 	// if (isMobile) {
	// 	// 	radiusVal = 10
	// 	// }

	// 	// else {
	// 	// 	radiusVal = 20
	// 	// }

	// 	console.log("resize")
	// 	linkMax = Math.min(newWidth/2 - (radiusVal *2), 170) 
	// 	linkMin = Math.min(newWidth/4 - (radiusVal *2), 70) 
	// 	svg.attr("width", newWidth - margin.left - margin.right)

	// 	linkLength.range([linkMax, linkMin])

	// 	makeChart(chartDataSave, atomSave, currentDogSave, currentGroupSave, chargeSave, newWidth)
	// }

}



Promise.all([
	d3.json('<%= path %>/companies.json')
])
.then((results) =>  {

	init(results[0])

	// window.addEventListener('resize', function() {

	// 	var thisWidth = document.querySelector("#mapContainer").getBoundingClientRect()
	// 	if (lastWidth != thisWidth) {
			
	// 		window.clearTimeout(to);
	// 		to = window.setTimeout(function() {
	// 			    makeMap(results[0],results[1], results[2])
	// 			}, 100)
	// 	}
			
	// })

});
	