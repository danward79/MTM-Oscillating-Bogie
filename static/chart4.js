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
					//data[i]["Series"] = parseFloat(data[i]["Series"]);
					//data[i]["Date"]= new Date(data[i]["Date"]);
					data[i]["Exceedence Instance"] = parseInt(data[i]["Exceedence Instance"]);
				}
		}
		convert_2_int();

 //Date format needs to be parsed and and the same time, an aggregate field can be processed


 
		//var parseDate = d3.time.format("%d/%m/%Y").parse;  // LHR this is a function expression
		//	data.forEach(function(d) {		// LHR d only exists whilst forEach is being executed.
		//	d.Date = parseDate(d.Date);
		//});
	
		
var ndx = crossfilter(data);


var all = ndx.groupAll();

// count all the detections
		dc.dataCount(".dc-data-count")
			.dimension(ndx)
			.group(all);			

// Line chart code
			
		//var dateDim = ndx.dimension(function(d) {return d.Detection_Date;}); 	// Note that we are grouping by month to match CMT excel plots
		var timeDim = ndx.dimension(function(d) {return [+d.Series, +d.Time];});
		
		//runDimension = ndx.dimension(function(d) {return [+d.Expt, +d.Run]; });
		
		var minTime = timeDim.bottom(1)[0].Time;
		var maxTime = timeDim.top(1)[0].Time;
		
		
//		lineChart  = dc.lineChart("#line-chart");   // Note that 'var' has been removed in order to be able to reset chart
													// Full explanation in http://stackoverflow.com/questions/21550270/dc-js-unable-to-redraw-charts (see jfiddle)
													
//		rangeChart = dc.barChart('#range-chart');	// Note that 'var' has been removed in order to be able to reset chart
		
		
		var timeDimGroup = timeDim.group();
		
		var SpeedGroup = timeDimGroup.reduceSum(function(d)
			{return d['Speed'];} );
			
		// var tooltipDateFormat = d3.time.format("%a %e %b %Y");
		var tooltipDateFormat = d3.time.format("%b %Y");	
			
			
		var chart = dc.seriesChart("#line-chart");
		
		//rangeChart = dc.barChart('#range-chart');	// Note that 'var' has been removed in order to be able to reset chart	
			
		var symbolScale = d3.scale.ordinal().range(d3.svg.symbolTypes);
		var symbolAccessor = function(d) { return symbolScale(d.key[0]); };
		  var subChart = function(c) {
			return dc.scatterPlot(c)
				.symbol(symbolAccessor)
				.symbolSize(5)
				.highlightedSize(10)
		  };

		var LegendLabels = ["", "Speed", "Ex'dence"];
		
		chart
			.width(750).height(205)
			.chart(subChart)
			.x(d3.scale.linear().domain([minTime, maxTime]))
			//.y(d3.scale.linear().domain([0, 7]))
			.brushOn(false)
			.yAxisLabel("Speed")
			.xAxisLabel("Time")
			.clipPadding(10)
			//.elasticX(true)
			.elasticY(true)
			.dimension(timeDim)
			.group(SpeedGroup)
			//.rangeChart(rangeChart)
			//.mouseZoomable(true)
			//.seriesAccessor(function(d) {return "Series: " + d.key[0];})
			.seriesAccessor(function(d) {
				return LegendLabels[d.key[0]]; }
				)
			.keyAccessor(function(d) {return +d.key[1];})
			.valueAccessor(function(d) {return +d.value;})
			//.legend(dc.legend().x(350).y(100).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
			.legend(dc.legend().x(600).y(188).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
		  chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d);});
		  //chart.margins().left += 40;	 


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
		  
		  
// Ring chart 2 code
			
		dateRingChart   = dc.pieChart("#ring-chartDate");			// Note that 'var' has been removed in order to be able to reset chart
		
		DateDim = ndx.dimension(function(d) {return d['Date'];});
		
		var speed_total = DateDim.group().reduceSum(function(d) {return d['Speed'];});

		//var parseDateLabel = d3.time.format("%m").parse
		
		dateRingChart
			.width(150)
			.height(150)
			.dimension(DateDim)
			.group(speed_total)
			.innerRadius(30)
			.label(function (d){
				//console.log(d.key)
				//return parseDateLabel(d.key);
				return d.key;
			})
			.renderLabel(true)
			.renderTitle(true);
			//.title(function (d){
			//	return int(d.value) ;
			//});
		
			
		function remove_empty_bins(source_group) {
			return {
				all:function () {
					return source_group.all().filter(function(d) {
						return d.value != 0;
					});
				}
			};
		}
		
		$('#ring-chartDate').on('click', function(){
			var minTime2 = timeDim.bottom(1)[0].Time;
			var maxTime2 = timeDim.top(1)[0].Time;
			chart.x(d3.time.scale().domain([minTime2,maxTime2]));
			chart.group(remove_empty_bins(SpeedGroup));
			chart.redraw();

		});
		
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
	
	