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
					data[i]["Series"] = parseInt(data[i]["Series"]);
					data[i]["Run"]= parseInt(data[i]["Run"]);
					data[i]["Exceedence Instance"] = parseInt(data[i]["Exceedence Instance"]);
				}
		}
		convert_2_int();

 //Date parsing code has been removed from here

  data.forEach(function(x) {
    x.Speed = +x.Speed;
  });
 
var ndx = crossfilter(data);


var all = ndx.groupAll();

// count all the detections
		dc.dataCount(".dc-data-count")
			.dimension(ndx)
			.group(all);			

console.log('Before Line Chart');

		
		// var tooltipDateFormat = d3.time.format("%a %e %b %Y");
		var tooltipDateFormat = d3.time.format("%b %Y");	


// Code for series Chart
var chart = dc.seriesChart("#line-chart");

		runDimension = ndx.dimension(function(d) {return [+d.Series, +d.Time]; });
		runGroup = runDimension.group().reduceSum(function(d) { return +d.Speed; });
		
		
       timeDimension = ndx.dimension(function(d) { return +d.Time; });   // This dimension is needed otherwise maxTime cannot be properly determined
	
		var minTime = timeDimension.bottom(1)[0].Time;
		var maxTime = timeDimension.top(1)[0].Time;

		  var symbolScale = d3.scale.ordinal().range(d3.svg.symbolTypes);
		  var symbolAccessor = function(d) { return symbolScale(d.key[0]); };
		  var subChart = function(c) {
			return dc.scatterPlot(c)
				.symbol(symbolAccessor)
				.symbolSize(4)
				.highlightedSize(10)
		  };

		  chart
			.width(750)
			.height(205)
			.chart(subChart)
			.x(d3.scale.linear().domain([minTime, maxTime]))
			.brushOn(false)
			.yAxisLabel("Speed")
			.xAxisLabel("Time")
			.clipPadding(10)
			.elasticY(true)
			.dimension(runDimension)
			.group(runGroup)
			.mouseZoomable(true)
			.seriesAccessor(function(d) {return "Series: " + d.key[0];})
			.keyAccessor(function(d) {return +d.key[1];})
			.valueAccessor(function(d) {return +d.value;})
			.legend(dc.legend().x(600).y(0).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
		  //chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+299500);});
		  chart.margins().left += 40;

			
			$('#exper_button').on('click', function(){
				var minTime2 = timeDimension.bottom(1)[0].Time/2;
				var maxTime2 = timeDimension.top(1)[0].Time/2;
				chart.x(d3.scale.linear().domain([minTime2, maxTime2]));
				dc.redrawAll();
			});
		  

console.log('Before Row Chart');
		  
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

console.log('Before Ring Chart');		  
		  
// Ring Run chart code
			
		runRingChart   = dc.pieChart("#ring-RunChart");			// Note that 'var' has been removed in order to be able to reset chart
		
		RunDim = ndx.dimension(function(d) {return d['Run'];});
		
		var RunGroup = RunDim.group();
		
		runRingChart
			.width(150)
			.height(150)
			.dimension(RunDim)
			.group(RunGroup)
			.innerRadius(30)
			.label(function (d){
				return d.key;
			})
			.renderLabel(true)
			.renderTitle(true);
			
// Analysis chart code
	
		AnalysisChart   = dc.rowChart("#AnalisysChart");			// Note that 'var' has been removed in order to be able to reset chart
		
		AnalysisDim = ndx.dimension(function(d) {return d['Analysis Type'];});
		
		var AnalysisGroup = AnalysisDim.group();
		
		AnalysisChart
			.width(280)
			.height(300)
			.margins({top: 20, left: 10, right: 10, bottom: 20})
			.dimension(AnalysisDim)
			.group(AnalysisGroup)
			.ordering(function(d) {return -d.value})		
			.title(function (d) {
				return d.value;
			})
			.elasticX(true)
			.xAxis().ticks(5);
			
// Accelerometer Location chart code
	
		AccLocationChart   = dc.rowChart("#accLocationChart");			// Note that 'var' has been removed in order to be able to reset chart
		
		AccLocationDim = ndx.dimension(function(d) {return d['Accelerometer Location'];});
		
		var AccLocationGroup = AccLocationDim.group();
		
		AccLocationChart
			.width(280)
			.height(300)
			.margins({top: 20, left: 10, right: 10, bottom: 20})
			.dimension(AccLocationDim)
			.group(AccLocationGroup)
			.ordering(function(d) {return -d.value})		
			.title(function (d) {
				return d.value;
			})
			.elasticX(true)
			.xAxis().ticks(5);	

			
// Ring chart 4 code
			
		SpeedBracketChart   = dc.rowChart("#speedBracketChart");			// Note that 'var' has been removed in order to be able to reset chart
		
		SpeedBracketDim = ndx.dimension(function(d) {return d['Speed Bracket'];});
		
		var SpeedBracketGroup = SpeedBracketDim.group();

		SpeedBracketChart
			.width(280)
			.height(300)
			.margins({top: 20, left: 10, right: 10, bottom: 20})
			.dimension(SpeedBracketDim)
			.group(SpeedBracketGroup)
			.ordering(function(d) {return -d.value})		
			.title(function (d) {
				return d.value;
			})
			.elasticX(true)
			.xAxis().ticks(5);	
		
	
		
		  
		dc.renderAll();
};
	
	