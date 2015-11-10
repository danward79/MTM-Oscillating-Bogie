queue()
    .defer(d3.json, "/experall")
    .await(makeGraphs);
	
function makeGraphs(error, data) {

// Everything is imported as a string by default. Numeric column in read data must be converter to numeric
// Columns with numeric	values must be processed below			
		var convert_2_int = function() {
			var max_length = data.length; 
				for (var i=0; i < max_length; i++) {
					//data[i]["Value"] = parseFloat(data[i]["Value"]);
					//data[i]["Frequency(Hz)"] = parseFloat(data[i]["Frequency(Hz)"]);
					data[i]["Time"] = parseFloat(data[i]["Time"]);
					data[i]["Speed"] = parseFloat(data[i]["Speed"]);
					data[i]["Exceedence Instance"] = parseInt(data[i]["Exceedence Instance"]);
				}
		}
		convert_2_int();

 //Date format needs to be parsed and and the same time, an aggregate field can be processed

	//	var parseDate = d3.time.format("%d/%m/%Y").parse;  // LHR this is a function expression
	//		data.forEach(function(d) {		// LHR d only exists whilst forEach is being executed.
	//		d.Exceedence_Date = parseDate(d.Date);
			
	//	});
	
console.log("llegue aqui");
		
var ndx = crossfilter(data);

console.log("after crossfilter");

var all = ndx.groupAll();

// count all the detections
		dc.dataCount(".dc-data-count")
			.dimension(ndx)
			.group(all);			

// Line chart code
			
		//var dateDim = ndx.dimension(function(d) {return d.Detection_Date;}); 	// Note that we are grouping by month to match CMT excel plots
		var timeDim = ndx.dimension(function(d) {return d.Time;}); 
		
		var minTime = timeDim.bottom(1)[0].Time;
		var maxTime = timeDim.top(1)[0].Time;
		
		
		lineChart  = dc.lineChart("#line-chart");   // Note that 'var' has been removed in order to be able to reset chart
													// Full explanation in http://stackoverflow.com/questions/21550270/dc-js-unable-to-redraw-charts (see jfiddle)
													
		rangeChart = dc.barChart('#range-chart');	// Note that 'var' has been removed in order to be able to reset chart
		
		//var Excedeence_Count=timeDim.group().reduceSum(function(d)
		//	{return d['Exceedence Instance'];} );
		
		var timeDimGroup = timeDim.group();
		
		var SpeedGroup = timeDimGroup.reduceSum(function(d)
			{return d['Speed'];} );
			
		// var tooltipDateFormat = d3.time.format("%a %e %b %Y");
		var tooltipDateFormat = d3.time.format("%b %Y");
		
		console.log("before lineChart definition");
		
	
		lineChart                       
			.width(750).height(205)
			.dimension(timeDim)
			//.group(Excedeence_Count)
			.group(SpeedGroup)
			.renderArea(true)
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
			//.x(d3.time.scale().domain([minTime,maxTime]))
			.x(d3.scale.linear().domain([minTime, maxTime]))
			.brushOn(false)
			//.title(function(d){						// tooltips are shown by using the title function. Also, brushOn must be set to false
			//  return tooltipDateFormat(d.data.key) + "\nNumber of Exceedences: " + d.data.value; })  // Note that data, key and value are reserved words for the function and do not correspond to fields in the imported data
			.elasticY(true)
			.on('renderlet', function(lineChart) {
				//lineChart.selectAll('rect').on("click", function(d) {
				//	console.log("click!", d);
				//});
				var left_y = 1, right_y = 7; // use real statistics here!
				var extra_data = [{x: lineChart.x().range()[0], y: lineChart.y()(left_y)}, {x: lineChart.x().range()[1], y: lineChart.y()(right_y)}];
				var line = d3.svg.line()
					.x(function(d) { return d.x; })
					.y(function(d) { return d.y; })
					.interpolate('linear');
				var path = lineChart.select('g.chart-body').selectAll('path.extra').data([extra_data]);
				path.enter().append('path').attr('class', 'extra').attr('stroke', 'red');
				path.attr('d', line);
			})
			.yAxisLabel("Exceedence Count");
			
		//lineChart.chartBodyG().append();
		
		//var line = d3.svg.line()
		  //.x(function(d) {return chart.x()(d.x);})
		  //.y(function(d) {return chart.y()(d.y);});

		  
		//var path = line([{x:0,y:1},{x:100,y:1}]);

		//chart.svg().append("path").attr("d",path)		
	
		//lineChart.svg().append("path").attr("d",path);
		//lineChart.chartBodyG().append("path").attr("d",path);
			
		console.log("before rangeChart definition");
			
		rangeChart
		    .width(750).height(70)
			//.margins({top: 0, right: 0, bottom: 20, left: 0})
			.dimension(timeDim)
			//.group(Excedeence_Count)
			.group(SpeedGroup)
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
			//.centerBar(true)
			//.gap(1)
			//.x(d3.time.scale().domain([minTime,maxTime]))
			.x(d3.scale.linear().domain([minTime, maxTime]))
			.yAxisLabel("")       // This is to blank out the yAxis labels
			.yAxis().tickFormat(function(v) { return ""; });  // This is to blank out the yAxis scale
			
// Row chart code

		locationRowChart = dc.rowChart("#row-chart");		// Note that 'var' has been removed in order to be able to reset chart
		var locationDimension = ndx.dimension(function(d) {return d["Nearest Station"];});
		var locationGroup = locationDimension.group();
		
		locationGroupRow = locationGroup.reduceSum(function(d) {return d['Exceedence Instance'];});

		var filtered_group = filter_top(locationGroupRow);
		function filter_top(locationGroupRow) {
		  return {
			all:function () {
				return locationGroupRow.top(10);
				}
			}
		 }
			
	    locationRowChart
			.width(280)
			.height(300)
			.margins({top: 20, left: 10, right: 10, bottom: 20})
			.dimension(locationDimension)
			.group(filtered_group)
			.ordering(function(d) {return -d.value})
			.title(function (d) {
				return d.value;
			})
			.elasticX(true)
			.xAxis().ticks(5);

// Row chart code 2

		routeRowChart = dc.rowChart("#row-chart2");		// Note that 'var' has been removed in order to be able to reset chart
		var routeDimension = ndx.dimension(function(d) {return d["Route"];});
		var routeGroup = routeDimension.group();
		
		routeGroupRow = routeGroup.reduceSum(function(d) {return d['Exceedence Instance'];});

		var filtered_group2 = filter_top2(routeGroupRow);
		function filter_top2(routeGroupRow) {
		  return {
			all:function () {
				return routeGroupRow.top(10);
				}
			}
		 }
			
	    routeRowChart
			.width(280)
			.height(300)
			.margins({top: 20, left: 10, right: 10, bottom: 20})
			.dimension(routeDimension)
			.group(filtered_group2)
			.ordering(function(d) {return -d.value})
			.title(function (d) {
				return d.value;
			})
			.elasticX(true)
			.xAxis().ticks(5);
			
			
// Ring chart 2 code
			
		dateRingChart2   = dc.pieChart("#ring-chart2");			// Note that 'var' has been removed in order to be able to reset chart
		
		analysisDim = ndx.dimension(function(d) {return d['Analysis Type'];});
		
		var analysis_total = analysisDim.group().reduceSum(function(d) {return d['Exceedence Instance'];});

		dateRingChart2
			.width(150)
			.height(150)
			.dimension(analysisDim)
			.group(analysis_total)
			.innerRadius(30);
			
// Ring chart 3 code
			
		dateRingChart3   = dc.pieChart("#ring-chart3");			// Note that 'var' has been removed in order to be able to reset chart
		
		accelerometerDim = ndx.dimension(function(d) {return d['Accelerometer Location'];});
		
		var accelerometer_total = accelerometerDim.group().reduceSum(function(d) {return d['Exceedence Instance'];});

		dateRingChart3
			.width(150)
			.height(150)
			.dimension(accelerometerDim)
			.group(accelerometer_total)
			.innerRadius(30);
			
// Ring chart 4 code
			
		speedRingChart   = dc.pieChart("#ring-chart4");			// Note that 'var' has been removed in order to be able to reset chart
		
		speedDim = ndx.dimension(function(d) {return d['Speed Bracket'];});
		
		var speed_total = speedDim.group().reduceSum(function(d) {return d['Exceedence Instance'];});

		speedRingChart
			.width(150)
			.height(150)
			.dimension(speedDim)
			.group(speed_total)
			.innerRadius(30);
	
	
		dc.renderAll();
};
	
	