	
function makeGraphs(error, data) {
	


// Everything is imported as a string by default. Numeric column in read data must be converter to numeric
// Columns with numeric	values must be processed below			
		var convert_2_int = function() {
			var max_length = data.length; 
				for (var i=0; i < max_length; i++) {
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


      scatterDimension    = ndx.dimension(function(d) { return [+d.Time, +d.Speed ]; }),
      scatterGroup1        = scatterDimension.group().reduceSum(function(d) { return +d.Series === 1; }),
	  scatterGroup2        = scatterDimension.group().reduceSum(function(d) { return +d.Series === 2; }),
  
	// Code for Dimension that can separate Series for Line Chart
	  timeDimension        = ndx.dimension(function(d) {return +d.Time;});  // This dimension is needed for minTime and maxTime as scatterDimension is not working
	  

			
// Composite chart code
			
		var minTime = timeDimension.bottom(1)[0].Time;
		var maxTime = timeDimension.top(1)[0].Time;
			
			
var chart = dc.compositeChart("#line-chart");
		

		chart
			.width(750)
			.height(300)
			//.elasticX(true)
			.x(d3.scale.linear().domain([minTime, maxTime]))
			.yAxisLabel("Speed (km/h)")
			.xAxisLabel("Time (s)")
			.clipPadding(10)
			.brushOn(false)
			.elasticY(true)
			.dimension(scatterDimension)
			.legend(dc.legend().x(625).y(5).itemHeight(13).gap(5))
			.compose([
				dc.scatterPlot(chart)
                .group(scatterGroup1, "GPS Data")
                .colors("blue"),
				dc.scatterPlot(chart)
                .group(scatterGroup2, "Exceedences")
                .colors("red"),
			]);		  

		  
// Row chart code

		locationRowChart = dc.rowChart("#row-chart");		// Note that 'var' has been removed in order to be able to reset chart
		var locationDimension = ndx.dimension(function(d) {return d["Nearest Station"];});
		var locationGroup = locationDimension.group().reduceSum(function(d) {return d['Exceedence Instance'] == 1;});
			
	    locationRowChart
			.width(280)
			.height(300)
			.margins({top: 20, left: 10, right: 10, bottom: 25})
			.dimension(locationDimension)
			.group(locationGroup)
			.ordering(function(d) {return -d.value})
			.title(function (d) {
				return d.value;
			})
			.elasticX(true)
			.xAxis().ticks(5);

		
		
	  
		  
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
			.margins({top: 20, left: 10, right: 10, bottom: 25})
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
			.margins({top: 20, left: 10, right: 10, bottom: 25})
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
			.margins({top: 20, left: 10, right: 10, bottom: 25})
			.dimension(SpeedBracketDim)
			.group(SpeedBracketGroup)
			.ordering(function(d) {return -d.value})		
			.title(function (d) {
				return d.value;
			})
			.elasticX(true)
			.xAxis().ticks(5);	
		
		
		  
		dc.renderAll();
		
		function AddXAxis(chartToUpdate, displayText)
			{
				chartToUpdate.svg()
							.append("text")
							.attr("class", "x-axis-label")
							.attr("text-anchor", "middle")
							.attr("font-size", "11px")
							.attr("x", chartToUpdate.width()/2)
							.attr("y", chartToUpdate.height())
							.text(displayText);
			}
		AddXAxis(locationRowChart, "Exceedences");
		AddXAxis(AnalysisChart, "Exceedences");
		AddXAxis(AccLocationChart, "Exceedences");
		AddXAxis(SpeedBracketChart, "Exceedences");
		
		
		Exceedences1 = document.querySelector('#accLocationChart > svg > g > g.row._1 > title');  // Chrome inspect element copy selector
		Exceedences2 = document.querySelector('#accLocationChart > svg > g > g.row._2 > title');
		TotalExceedencesStatic = Exceedences1.__data__.value + Exceedences2.__data__.value;
		document.getElementById("myTotalExceedences").innerHTML = TotalExceedencesStatic;
		document.getElementById("myExceedencesCounter").innerHTML = TotalExceedencesStatic;  // However this will be updated postRedrawing of charts
		
		
		function reCountExceedences () {
				
				Exceed_recount1 = document.querySelector('#accLocationChart > svg > g > g.row._1 > title');
				Exceed_recount2 = document.querySelector('#accLocationChart > svg > g > g.row._2 > title');
				Total_Exc_reCount1 = Exceed_recount1.__data__.value + Exceed_recount2.__data__.value;

				Exceed_recount1 = document.querySelector('#ring-RunChart > svg > g > g.pie-slice._0 > title');
				Exceed_recount2 = document.querySelector('#ring-RunChart > svg > g > g.pie-slice._1 > title');
				Exceed_recount3 = document.querySelector('#ring-RunChart > svg > g > g.pie-slice._2 > title');
				Exceed_recount4 = document.querySelector('#ring-RunChart > svg > g > g.pie-slice._3 > title');
				Total_Exc_reCount2 = Exceed_recount1.__data__.value + Exceed_recount2.__data__.value + Exceed_recount3.__data__.value + Exceed_recount4.__data__.value;
				
				if (document.getElementById("myExceedencesCounter").innerHTML == Total_Exc_reCount1) {
					document.getElementById("myExceedencesCounter").innerHTML = Total_Exc_reCount2;
				} else {
					document.getElementById("myExceedencesCounter").innerHTML = Total_Exc_reCount1;
				};
		};
	
		runRingChart.on("postRedraw", function(){
			reCountExceedences();
		});
		
		
// DropDown list code
		
	d3.select('#myDropDown').on('change', function(){ 
		console.log(this.value);
		
		var strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
		if (this.value==1) {
			window.open("/static/Werribee_Route_4_th_6.html", "Route 4th - 6", strWindowFeatures);
		};
		if (this.value==2) {
			window.open("/static/Werribee_Route_23rd_7.html", "Route 23rd - 7", strWindowFeatures);
		};
		if (this.value==3) {
			window.open("/static/Werribee_Route_29th_5.html", "Route 29th - 5", strWindowFeatures);
		};
		if (this.value==4) {
			window.open("/static/Werribee_Route_29th_7.html", "Route 29th - 7", strWindowFeatures);
		};
	});
	
	window.encodeFunction = function()
		{
			var chartsInDashboard = ['SpeedBracketChart'];
			var f = new Function('return window.SpeedBracketChart.filters();' );    //ID#LHR01
			var f2 = new Function('chart2process', "return eval('window.' + chart2process + '.filters();')" );    //ID#LHR02
			
			var filters = [];

					for (var i = 0; i < dc.chartRegistry.list().length; i++)
					 {
						//alert('inside 1st for');
						var chart = dc.chartRegistry.list()[i];

						for (var j = 0; j < chart.filters().length; j++)
						{
							filters.push({ChartID: chart.chartID(), Filter: chart.filters()[j]}); 
							console.log('inside 2nd for');
						}
					}
					var ChartsFilterState =  encodeURIComponent(JSON.stringify(filters));
					//console.log(dc.chartRegistry.list().length);
					//console.log(ChartsFilterState);
					console.log(SpeedBracketChart.filters());
					console.log(f());                               // Works with ID#LHR01
					console.log(f2(chartsInDashboard[0]));			// Works with ID#LHR02

		}
		
	
	window.decodeFunction = function()
		 {
		   var urlParam="%5B%7B%22ChartID%22%3A4%2C%22Filter%22%3A%22Westona%20Station%22%7D%2C%7B%22ChartID%22%3A5%2C%22Filter%22%3A1%7D%2C%7B%22ChartID%22%3A6%2C%22Filter%22%3A%22Base%20Acceleration%22%7D%2C%7B%22ChartID%22%3A7%2C%22Filter%22%3A%22Bogie%202%22%7D%2C%7B%22ChartID%22%3A8%2C%22Filter%22%3A%22110-120%22%7D%5D";//encoded url here  
		   var filterObjects = JSON.parse(decodeURIComponent(urlParam));

			for (var i = 0; i< filterObjects.length; i++)
			{	alert(filterObjects[i].ChartID-1);
				dc.chartRegistry.list()[filterObjects[i].ChartID-1].filter(filterObjects[i].Filter);
			}

			// dc.renderAll();

			dc.redrawAll();
		 }
};
	
	