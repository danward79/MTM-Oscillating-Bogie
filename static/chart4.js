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
					data[i]["Exceedence Instance"] = parseInt(data[i]["Exceedence Instance"]);
				}
		}
		convert_2_int();

 //Date format needs to be parsed and and the same time, an aggregate field can be processed

		var parseDate = d3.time.format("%d/%m/%Y").parse;  // LHR this is a function expression
			data.forEach(function(d) {		// LHR d only exists whilst forEach is being executed.
			d.Date = parseDate(d.Date);
		});
	
		
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
		
		rangeChart = dc.barChart('#range-chart');	// Note that 'var' has been removed in order to be able to reset chart	
			
		var symbolScale = d3.scale.ordinal().range(d3.svg.symbolTypes);
		var symbolAccessor = function(d) { return symbolScale(d.key[0]); };
		  var subChart = function(c) {
			return dc.scatterPlot(c)
				.symbol(symbolAccessor)
				.symbolSize(5)
				.highlightedSize(10)
		  };

		  
		chart
			.width(750).height(205)
			.chart(subChart)
			.x(d3.scale.linear().domain([minTime, maxTime]))
			//.y(d3.scale.linear().domain([0, 7]))
			.brushOn(false)
			.yAxisLabel("Speed")
			.xAxisLabel("Time")
			.clipPadding(10)
			.elasticY(true)
			.dimension(timeDim)
			.group(SpeedGroup)
			.rangeChart(rangeChart)
			//.mouseZoomable(true)
			.seriesAccessor(function(d) {return "Series: " + d.key[0];})
			.keyAccessor(function(d) {return +d.key[1];})
			.valueAccessor(function(d) {return +d.value;})
			.legend(dc.legend().x(350).y(100).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
		  chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d);});
		  chart.margins().left += 40;	 
		 
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
			//.yAxis().tickFormat(function(v) { return ""; });  // This is to blank out the yAxis scale
		  
		  
// Ring chart 2 code
			
		dateRingChart   = dc.pieChart("#ring-chartDate");			// Note that 'var' has been removed in order to be able to reset chart
		
		DateDim = ndx.dimension(function(d) {return d['Date'];});
		
		var speed_total = DateDim.group().reduceSum(function(d) {return d['Speed'];});

		dateRingChart
			.width(150)
			.height(150)
			.dimension(DateDim)
			.group(speed_total)
			.innerRadius(30);
		  
		  
		dc.renderAll();
};
	
	