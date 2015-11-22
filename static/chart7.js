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


      scatterDimension    = ndx.dimension(function(d) { return [+d.Time, +d.Speed ]; }),
      scatterGroup1        = scatterDimension.group().reduceSum(function(d) { return +d.Series === 1; }),
	  scatterGroup2        = scatterDimension.group().reduceSum(function(d) { return +d.Series === 2; }),
  
	// Code for Dimension that can separate Series for Line Chart
	  timeDimension        = ndx.dimension(function(d) {return +d.Time;});
	  
	  speedSumGroup       = timeDimension.group().reduce(function(p, v) {
								  p[v.Series] = (p[v.Series] || 0) + v.Speed;
								  return p;
							  }, function(p, v) {
								  p[v.Series] = (p[v.Series] || 0) - v.Speed;
								  return p;
							  }, function() {
								  return {};
							  });

      function sel_stack(i) {
              return function(d) {
                  return d.value[i];
              };
          }

			
// Line chart code
			
		
		var minTime = timeDimension.bottom(1)[0].Time;
		var maxTime = timeDimension.top(1)[0].Time;
		


			
		// var tooltipDateFormat = d3.time.format("%a %e %b %Y");
		var tooltipDateFormat = d3.time.format("%b %Y");	
			
			
var chart = dc.compositeChart("#line-chart");
		

		chart
			.width(750)
			.height(205)
			//.elasticX(true)
			.x(d3.scale.linear().domain([minTime, maxTime]))
			.yAxisLabel("Speed")
			//.xAxisLabel("Time")
			.clipPadding(10)
			.brushOn(false)
			.elasticY(true)
			.dimension(scatterDimension)
			.legend(dc.legend().x(70).y(10).itemHeight(13).gap(5))
			.compose([
				dc.scatterPlot(chart)
                .group(scatterGroup1, "Blue Group")
                .colors("blue"),
				dc.scatterPlot(chart)
                .group(scatterGroup2, "Red Group")
                .colors("red"),
			]);		  

		  

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
		

		
	
		
		  
		dc.renderAll();
};
	
	