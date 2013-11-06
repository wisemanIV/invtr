'use strict';

/* Directives */

var directives = angular.module('myApp.directives', []);

// simple fade in animation for a touch of class...
directives.directive('fadeIn', function () {
    return {
        compile:function (elm) {
            $(elm).css('opacity', 0.0);
            return function (scope, elm, attrs) {
                $(elm).animate({ opacity:1.0 }, 1500);
            };
        }
    };
});

// this is the angular way to stop even propagation 
directives.directive('stopEvent', function () {
    return {
        restrict:'A',
        link:function (scope, element, attr) {
            element.bind(attr.stopEvent, function (e) {
                e.stopPropagation();
            });
        }
    }
});

directives.directive('ghDial', function () {

	var width = 160,
	    height = 160,
	    twoPi = 2 * Math.PI,
		progress = 0.00001;
		
  return {
    restrict: 'E',
	transclude: true,
    scope: {
      val: '=',
	  ghFormat: '=',
	  metricTitle: '=',
	  ghTarget: '='
    },
    link: function (scope, element, attrs) {
		
 	   console.debug("data format: "+scope.ghFormat );
	   if (typeof scope.ghFormat === 'undefined') {
	   	scope.ghFormat = '' ;
	   }
	
	   //var formatPercent = d3.format(scope.dataFormat);
	   var total = scope.ghTarget.valueOf() ;
	  
	   
	   var index = document.querySelector("#d3Parent").childNodes.length-1 ;
	   console.debug("INDEX:"+index);
	   var column = [100, 280, 450, 630];
	   var row = [140, 200, 300]

      // set up initial svg object
	  var vis = d3.select("#d3Parent")
	                      .append("g")
	                      .attr("transform", "translate(" + column[index] + "," + row[0] + ")"); 

      scope.$watch('val', function (newVal, oldVal) {
		  
		  console.debug("directive watch fired:"+scope.metricTitle);
		  console.debug(newVal);
		  
		  vis.selectAll('*').remove();

	        // if 'val' is undefined, exit
	        if (!newVal) {
	          return;
	        }
		
			var arc = d3.svg.arc()
			    .startAngle(0)
			    .innerRadius(70)
			    .outerRadius(90)
			;
			
			var meter = vis.append("g")
			    .attr("class", "progress-meter");

			meter.append("path")
			    .attr("class", "background")
			    .attr("d", arc.endAngle(twoPi));

			var foreground = meter.append("path")
			    .attr("class", "foreground");

			var text = meter.append("text")
			    .attr("text-anchor", "middle")
				.style("font-size","24px");

			var text2 = meter.append("text")
			    .attr("y", 40)
			    .attr("text-anchor", "middle")
			    .attr("class", "text2");

				console.debug(scope.metricTitle);
				text2.text(scope.metricTitle);
				
			var percentage = newVal;

			
				//console.debug("animate progress: "+progress+" percentage:"+percentage+" total:"+total);
			    var i = d3.interpolateNumber(progress, percentage/total);
			   
			    d3.select(vis).transition().duration(800).tween("progress", function () {
			        return function (t) {
			            progress = i(t);
			            foreground.attr("d", arc.endAngle(twoPi * progress));
			            text.text(scope.ghFormat+''+percentage);
			        };
			    });
			
			
       
      });
  }
}
});

directives.directive('d3Bars', function() {
	console.debug("LEADER DIRECTIVE1");
	
    // setup variables
    var width, height, max;
	var color = d3.scale.category20();
    width = 700;
      // 20 is for margins and can be changed
    height = 400;
      // 35 = 30(bar height) + 5(margin between bars)
    max = 98;
	
	      return {
	        restrict: 'E',
	        scope: {
	          data: "=",
	          label: "@",
	          onClick: "&"
	        },
	        link: function(scope, iElement, iAttrs) {
				
	          var svg = d3.select("#d3BarParent")
	              .append("svg")
	              .attr("width", "100%");

	          // on window resize, re-render d3 canvas
	          window.onresize = function() {
	            return scope.$apply();
	          };
	          scope.$watch(function(){
	              return angular.element(window)[0].innerWidth;
	            }, function(){
	              return scope.render(scope.data);
	            }
	          );

	          // watch for data changes and re-render
	          scope.$watch('data', function(newVals, oldVals) {
	            return scope.render(newVals);
	          }, true);

	          // define render function
	          scope.render = function(data){
	            // remove all previous items before render
	            svg.selectAll("*").remove();
	         
	              // this can also be found dynamically when the data is not static
	              // max = Math.max.apply(Math, _.map(data, ((val)-> val.count)))

	            // set the height based on the calculations above
	            svg.attr('height', height);

	            //create the rectangles for the bar chart
	            svg.selectAll("rect")
	              .data(data)
	              .enter()
	                .append("rect")
	                .on("click", function(d, i){return scope.onClick({item: d});})
	                .attr("height", 30) // height of each bar
	                .attr("width", 0) // initial width of 0 for transition
	                .attr("x", 10) // half of the 20 side margin specified above
					.attr('fill', function(d) {
					    return color(d.Inviter__PointsTotal__c);
					  })
	                .attr("y", function(d, i){
	                  return i * 35;
	                }) // height + margin between bars
	                .transition()
	                  .duration(1000) // time of duration
	                  .attr("width", function(d){
	                    return d.Inviter__PointsTotal__c/(max/width);
	                  }); // width based on scale

	            svg.selectAll("text")
	              .data(data)
	              .enter()
	                .append("text")
	                .attr("fill", "#fff")
	                .attr("y", function(d, i){return i * 35 + 22;})
	                .attr("x", 15)
	                .text(function(d){return d[scope.label];});

	          };
	        }
	      };

});

directives.directive('ghMeter', function () {
 return {
 };
});

directives.directive('ghTrend', function () {
	
	var margin = {top: 20, right: 80, bottom: 30, left: 50},
	    width = 680 - margin.left - margin.right,
	    height = 240 - margin.top - margin.bottom;
		
  return {
    restrict: 'E',
    scope: {
      data: "=",
	  metrics: "=",
      label: "@",
      onClick: "&"
    },
    link: function (scope, element, attrs) {
   	
			
			var svg = d3.select("#d3TrendParent").append("svg")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
  	          // watch for data changes and re-render
  	          scope.$watch('data', function(newVals, oldVals) {
  	            return scope.render(newVals);
  	          }, true);
	        

	          // define render function
	          scope.render = function(data){
				  
				var parseDate = d3.time.format("%Y%m%d").parse;
			

				var x = d3.time.scale()
				    .range([0, width]);

				var y = d3.scale.linear()
				    .range([height, 0]);

				var color = d3.scale.category10();

				var xAxis = d3.svg.axis()
				    .scale(x)
				    .orient("bottom")
				    .ticks(d3.time.days, 1)
				    .tickFormat(d3.time.format('%a %d'))
				    .tickSize(0)
				    .tickPadding(12);

				var yAxis = d3.svg.axis()
				    .scale(y)
				    .orient("left")
					.tickPadding(8);

				var line = d3.svg.line()
				    .interpolate("basis")
				    .x(function(d) { return x(d.date); })
				    .y(function(d) { return y(d.temperature); });

				  data.forEach(function(d) {
				    d.date = parseDate(d.dat);
				  });
				  
				  console.log(scope.metrics);
				  var yLabels = [] ;
				  for (var j = 0 ; j < scope.metrics.length ; j++) {
				  	yLabels.push(scope.metrics[j].ruleid);
				  }
				    color.domain(yLabels);
				  

				  var cities = color.domain().map(function(name) {
				    return {
				      name: name,
				      values: data.map(function(d) {
				        return {date: d.date, temperature: +d[name]};
				      })
				    };
				  });
				  
				  console.log("cities");
				  console.log(cities);

				  x.domain(d3.extent(data, function(d) { return d.date; }));

				  y.domain([
				    d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
				    d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
				  ]);

				  svg.append("g")
				      .attr("class", "x axis")
				      .attr("transform", "translate(0," + height + ")")
				      .call(xAxis);

				  svg.append("g")
				      .attr("class", "y axis")
				      .call(yAxis)
				    .append("text")
				      .attr("transform", "rotate(-90)")
				      .attr("y", 6)
				      .attr("dy", ".71em")
				      .style("text-anchor", "end")
				      .text("Points");

				  var city = svg.selectAll(".city")
				      .data(cities)
				    .enter().append("g")
				      .attr("class", "city");

				  city.append("path")
				      .attr("class", "line")
				      .attr("d", function(d) { return line(d.values); })
				      .style("stroke", function(d) { return 'steelblue'; })
					  .attr("fill", "none");

				  city.append("text")
				      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
				      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
				      .attr("x", 3)
				      .attr("dy", ".35em")
				      .text(function(d) { return d.name; });
		
				  };
		}
	};
});
 
directives.directive('autoScroll', function($timeout) {
   return function(scope, elements, attrs) {
     scope.$watch("messages.length", function() {
       $timeout(function() {
         elements[0].scrollTop = elements[0].scrollHeight
       });
     });
   }
});

directives.directive('datepicker', function() {
  return {
    link: function(scope, el, attr) {
      $(el).datepicker({
        onSelect: function(dateText) {
          console.log(dateText);
          var expression = attr.ngModel + " = " + "'" + dateText + "'";
          scope.$apply(expression);
          console.log(scope.startDate);
          // how do i set this elements model property ?
        }
      });
    }
  };
});

directives.directive('slimscroll', function() {
    return {
        link: function(scope, el, attr) {
            $(el).slimscroll({
                height: '260px',
                size: '5px',
                alwaysVisible: true,
                railVisible: true
            });
        }
    };
});

directives.directive('timer', ['$compile', function ($compile) {

	    return  {
	      restrict: 'E',
	      replace: false,
	      scope: {
	        interval: '=interval',
	        startTimeAttr: '=startTime',
	        newVal: '=countdown',
			timespan: '=timespan',
	        autoStart: '&autoStart'
	      },
	      controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
			  
			    $scope.$watch('timespan', function (tspan, oldVal) {
					console.log('timespan changed'+tspan);
					$scope.newVal = tspan ;
					$scope.start();
				});
				  
		        //angular 1.2 doesn't support attributes ending in "-start", so we're
		        //supporting both "autostart" and "auto-start" as a solution for
		        //backward and forward compatibility.
		        //$scope.autoStart = $attrs.autoStart || $attrs.autostart;
				$scope.autoStart = false;

		        if ($element.html().trim().length === 0) {
		          $element.append($compile('<span>{{millis}}</span>')($scope));
		        }

		        $scope.startTime = null;
		        $scope.timeoutId = null;
		        $scope.countdown = $scope.newVal && parseInt($scope.newVal, 10) >= 0 ? parseInt($scope.newVal, 10) : undefined;
		        $scope.isRunning = false;

		        $scope.$on('timer-start', function () {
		          $scope.start();
		        });

		        $scope.$on('timer-resume', function () {
		          $scope.resume();
		        });

		        $scope.$on('timer-stop', function () {
		          $scope.stop();
		        });

		        function resetTimeout() {
		          if ($scope.timeoutId) {
		            clearTimeout($scope.timeoutId);
		          }
		        }

		        $scope.start = $element[0].start = function () {
		          $scope.startTime = $scope.startTimeAttr ? new Date($scope.startTimeAttr) : new Date();
		          $scope.countdown = $scope.newVal && parseInt($scope.newVal, 10) > 0 ? parseInt($scope.newVal, 10) : undefined;
		          resetTimeout();
		          tick();
		        };

		        $scope.resume = $element[0].resume = function () {
		          resetTimeout();
		          if ($scope.newVal) {
		            $scope.countdown += 1;
		          }
		          $scope.startTime = new Date() - ($scope.stoppedTime - $scope.startTime);
		          tick();
		        };

		        $scope.stop = $scope.pause = $element[0].stop = $element[0].pause = function () {
		          $scope.stoppedTime = new Date();
		          resetTimeout();
		          $scope.$emit('timer-stopped', {millis: $scope.millis, seconds: $scope.seconds, minutes: $scope.minutes, hours: $scope.hours, days: $scope.days});
		          $scope.timeoutId = null;
		        };

		        $element.bind('$destroy', function () {
		          resetTimeout();
		        });

		        function calculateTimeUnits() {
		          $scope.seconds = Math.floor(($scope.millis / 1000) % 60);
		          $scope.minutes = Math.floor((($scope.millis / (60000)) % 60));
		          $scope.hours = Math.floor((($scope.millis / (3600000)) % 24));
		          $scope.days = Math.floor((($scope.millis / (3600000)) / 24));
		        }

		        //determine initial values of time units
		        if ($scope.newVal) {
		          $scope.millis = $scope.newVal * 1000;
		        } else {
		          $scope.millis = 0;
		        }
		        calculateTimeUnits();

		        var tick = function () {

		          $scope.millis = new Date() - $scope.startTime;
		          var adjustment = $scope.millis % 1000;

		          if ($scope.newVal) {
		            $scope.millis = $scope.countdown * 1000;
		          }

		          calculateTimeUnits();
		          if ($scope.countdown > 0) {
		            $scope.countdown--;
		          }
		          else if ($scope.countdown <= 0) {
		            $scope.stop();
		            return;
		          }

		          //We are not using $timeout for a reason. Please read here - https://github.com/siddii/angular-timer/pull/5
		          $scope.timeoutId = setTimeout(function () {
		            tick();
		            $scope.$digest();
		          }, $scope.interval - adjustment);

		          $scope.$emit('timer-tick', {timeoutId: $scope.timeoutId, millis: $scope.millis});
		        };

		        if ($scope.autoStart === undefined || $scope.autoStart === true) {
		          $scope.start();
		        }
	      }]
	    };
	  }]);

