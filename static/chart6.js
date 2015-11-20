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
		
var ndx = crossfilter(data);


var all = ndx.groupAll();

// count all the detections
		dc.dataCount(".dc-data-count")
			.dimension(ndx)
			.group(all);			

console.log('Before Line Chart');
			
// Line chart code
			
		var TimeDim = ndx.dimension(function(d) {return [+d.Series, +d.Time];});
		var TimeDim2 = ndx.dimension(function(d) {return [+d.Speed, +d.Time];});
		
		var minTime = TimeDim.bottom(1)[0].Time;
		var maxTime = TimeDim.top(1)[0].Time;
		
		
//		lineChart  = dc.lineChart("#line-chart");   // Note that 'var' has been removed in order to be able to reset chart
													// Full explanation in http://stackoverflow.com/questions/21550270/dc-js-unable-to-redraw-charts (see jfiddle)
													
//		rangeChart = dc.barChart('#range-chart');	// Note that 'var' has been removed in order to be able to reset chart
		
		
		var TimeDimGroup = TimeDim.group();
		
		var SpeedGroup2 = TimeDimGroup.reduceSum(function(d)
			{return d['Speed'];} );
			
			
		var SpeedGroup3 = TimeDimGroup.reduce(
            function (p, v) {
                ++p.count;
                return v.speed;
            },
            null,
            function () {
                return { count:0, speed: 0};
            }
        );
		
		var SpeedGroup = TimeDim2.group();
			
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
			.dimension(TimeDim2)
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
		  
// Ring chart 2 code
			
		runRingChart   = dc.pieChart("#ring-chartDate");			// Note that 'var' has been removed in order to be able to reset chart
		
		RunDim = ndx.dimension(function(d) {return d['Run'];});
		
		var speed_total = RunDim.group().reduceSum(function(d) {return d['Speed'];});

		//var parseDateLabel = d3.time.format("%m").parse
		
		runRingChart
			.width(150)
			.height(150)
			.dimension(RunDim)
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
		
console.log('After Ring Chart');
		
		function remove_empty_bins(source_group) {
			return {
				all:function () {
					return source_group.all().filter(function(d) {
						return d.value != 0;
					});
				}
			};
		}

console.log('In between functions');
	
		$('#ring-chartDate').on('click', function(){
			var minTime2 = TimeDim.bottom(1)[0].Time;
			var maxTime2 = TimeDim.top(1)[0].Time;
			chart.x(d3.time.scale().domain([minTime2,maxTime2]));
			chart.group(remove_empty_bins(SpeedGroup));
			chart.redraw();

		});
		
	
		
		  
		dc.renderAll();
};
	
	