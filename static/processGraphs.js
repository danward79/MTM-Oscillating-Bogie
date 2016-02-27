	
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
			
			
// BoxPlot chart code
			
		boxPlotChart   = dc.boxPlot("#boxplot-chart");			// Note that 'var' has been removed in order to be able to reset chart
		
		var locationDimension2 = ndx.dimension(function(d) {return d["Nearest Station"] ;});   // Second dimension on Nearest Station
		//locationDimension2.filter(function (d) {return d !== ""});
		
		speedArrayGroup     = locationDimension.group().reduce(
			function(p,v) {
			  p.push(v.Speed);
			  return p;
			},
			function(p,v) {
			  p.splice(p.indexOf(v.Speed), 1);
			  return p;
			},
			function() {
			  return [];
			}
		);
		
		
		boxPlotChart
			.width(1050)
			.height(300)
			.margins({top: 10, right: 50, bottom: 30, left: 50})
			.dimension(locationDimension2)
			.group(speedArrayGroup)
			.renderVerticalGridLines(true)
			.renderHorizontalGridLines(true)
			.brushOn(true)
			.elasticY(true)
			.elasticX(true);			

			
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
			
		SpeedBracketChart   = dc.rowChart("#speedBracketWidget");			// Note that 'var' has been removed in order to be able to reset chart
		
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
	
	
};


	function reCountExceedences() {
		
		// It needs to be checked that:
		// a) Row is not deselected so it can be counted
		// b) Row does not correspond to GPS data
		// c) Row can have three states: rect, rect.selected or rect.deselected
		// Rows can be reordered by dc.js hence all three of them need to be constantly checked
		
		selector2check1 = document.querySelector('#accLocationChart > svg > g > g.row._0 > rect.deselected');        // if is not deselected, it is either selected or just rect and should be counted (providing that it is not GPS that is)
		if( selector2check1 == null) {
		  NoGPSCheck1 = JSON.stringify(document.querySelector('#accLocationChart > svg > g > g.row._0 > text'));
					if (NoGPSCheck1.includes("GPS")) {
						Exceed_recount1 = 0;
					} else {
						Exceed_recount1 = document.querySelector('#accLocationChart > svg > g > g.row._0 > title');
						Exceed_recount1 = Exceed_recount1.__data__.value;}
		  }
		else {
		  Exceed_recount1 = 0; }
		  
		selector2check2 = document.querySelector('#accLocationChart > svg > g > g.row._1 > rect.deselected');
		if( selector2check2 == null) {
		  NoGPSCheck2 = JSON.stringify(document.querySelector('#accLocationChart > svg > g > g.row._1 > text'));
					if (NoGPSCheck2.includes("GPS")) {
						Exceed_recount2 = 0;
					} else {
						Exceed_recount2 = document.querySelector('#accLocationChart > svg > g > g.row._1 > title');
						Exceed_recount2 = Exceed_recount2.__data__.value;}
		  }
		else {
		  Exceed_recount2 = 0; }
		
		selector2check3 = document.querySelector('#accLocationChart > svg > g > g.row._2 > rect.deselected');
		if( selector2check3 == null) {
		  NoGPSCheck3 = JSON.stringify(document.querySelector('#accLocationChart > svg > g > g.row._2 > text'));
					if (NoGPSCheck3.includes("GPS")) {
						Exceed_recount3 = 0;
					} else {
						Exceed_recount3 = document.querySelector('#accLocationChart > svg > g > g.row._2 > title');
						Exceed_recount3 = Exceed_recount3.__data__.value;}
		  }
		else {
		  Exceed_recount3 = 0; }
		  
		  
		Total_Exc_reCount =  Exceed_recount1 + Exceed_recount2 + Exceed_recount3;
			
		document.getElementById("myExceedencesCounter").innerHTML = Total_Exc_reCount;
		
	}
	
	
	window.encodeFunction = function()
		{
			var chartsInDashboard = ['locationRowChart','runRingChart','AnalysisChart','AccLocationChart','SpeedBracketChart', 'boxPlotChart']; // Line chart not needed as it cannot filter
			//var f = new Function('return window.SpeedBracketChart.filters();' );    								//Working alternatives left for sintax reference
			// var f = new Function('chart2process', "return eval('window.' + chart2process + '.filters();')" );    //Working alternatives left for sintax reference
			var f = new Function('chart2process', 'counter', "return eval(chart2process + '.filters()['+counter+'];')" ); 
			var numFilters = new Function('chart2process', "return eval(chart2process + '.filters().length;')");
			
			var filters = [];

					for (var i = 0; i < chartsInDashboard.length; i++)
					 {
						for (var j = 0; j < numFilters(chartsInDashboard[i]); j++)
						{
							filters.push({ChartID: chartsInDashboard[i], Filter: f(chartsInDashboard[i],j)});
						}
					}
					console.log(filters);
					var ChartsFilterState =  encodeURIComponent(JSON.stringify(filters));
					
					console.log(ChartsFilterState);
		}
		
	
	window.decodeFunction = function()
		 {
		   dc.filterAll();
		   var urlParam="%5B%7B%22ChartID%22%3A%22locationRowChart%22%2C%22Filter%22%3A%22Westona%22%7D%2C%7B%22ChartID%22%3A%22runRingChart%22%2C%22Filter%22%3A3%7D%2C%7B%22ChartID%22%3A%22runRingChart%22%2C%22Filter%22%3A2%7D%2C%7B%22ChartID%22%3A%22SpeedBracketChart%22%2C%22Filter%22%3A%22110-120%22%7D%5D";
		   var filteredObjects = JSON.parse(decodeURIComponent(urlParam));
		   var fInt = new Function('filterlogged', "return eval(filterlogged.ChartID + '.filter(' + filterlogged.Filter +');')" );
		   var fStg = new Function('filterlogged', "return eval(filterlogged.ChartID + '.filter(' + String.fromCharCode(39) + filterlogged.Filter + String.fromCharCode(39) + ');')" );
		   
			for (var i = 0; i< filteredObjects.length; i++) {
				//dc.chartRegistry.list()[filteredObjects[i].ChartID].filter(filteredObjects[i].Filter);
				try {
					fInt(filteredObjects[i]);
				} catch(e) {
					fStg(filteredObjects[i]);
				}
			}
			dc.redrawAll();
		 }
		 
	window.decodeFilter_1 = function()
		 {
		   dc.filterAll();
		   var urlParam="%5B%7B%22ChartID%22%3A%22locationRowChart%22%2C%22Filter%22%3A%22Westona%22%7D%2C%7B%22ChartID%22%3A%22runRingChart%22%2C%22Filter%22%3A1%7D%2C%7B%22ChartID%22%3A%22runRingChart%22%2C%22Filter%22%3A2%7D%2C%7B%22ChartID%22%3A%22SpeedBracketChart%22%2C%22Filter%22%3A%22110%20to%20120%22%7D%2C%7B%22ChartID%22%3A%22boxPlotChart%22%2C%22Filter%22%3A%22Westona%22%7D%5D";
		   var filteredObjects = JSON.parse(decodeURIComponent(urlParam));
		   var fInt = new Function('filterlogged', "return eval(filterlogged.ChartID + '.filter(' + filterlogged.Filter +');')" );
		   var fStg = new Function('filterlogged', "return eval(filterlogged.ChartID + '.filter(' + String.fromCharCode(39) + filterlogged.Filter + String.fromCharCode(39) + ');')" );
		   
			for (var i = 0; i< filteredObjects.length; i++) {
				try {
					fInt(filteredObjects[i]);
				} catch(e) {
					fStg(filteredObjects[i]);
				}
			}
			dc.redrawAll();
		 }
		 
	window.decodeFilter_2 = function()
		 {
		   dc.filterAll();
		   var urlParam="%5B%7B%22ChartID%22%3A%22locationRowChart%22%2C%22Filter%22%3A%22Hoppers%20Crossing%22%7D%2C%7B%22ChartID%22%3A%22locationRowChart%22%2C%22Filter%22%3A%22Westona%22%7D%2C%7B%22ChartID%22%3A%22AccLocationChart%22%2C%22Filter%22%3A%22Bogie%202%22%7D%5D";
		   var filteredObjects = JSON.parse(decodeURIComponent(urlParam));
		   var fInt = new Function('filterlogged', "return eval(filterlogged.ChartID + '.filter(' + filterlogged.Filter +');')" );
		   var fStg = new Function('filterlogged', "return eval(filterlogged.ChartID + '.filter(' + String.fromCharCode(39) + filterlogged.Filter + String.fromCharCode(39) + ');')" );
		   
			for (var i = 0; i< filteredObjects.length; i++) {
				try {
					fInt(filteredObjects[i]);
				} catch(e) {
					fStg(filteredObjects[i]);
				}
			}
			dc.redrawAll();
		 }