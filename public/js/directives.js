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

	var width = 370,
	    height = 370,
	    twoPi = 2 * Math.PI,
	    progress = 0,
	    total = 100;
		
  return {
    restrict: 'E',
    scope: {
      val: '=',
	  dataFormat: '=',
	  metricTitle: '='
    },
    link: function (scope, element, attrs) {

      // set up initial svg object
	var vis = d3.select(element[0]).append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .attr('fill', '#2E7AF9')
	    .append("g")
	    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
      

      scope.$watch('val', function (newVal, oldVal) {
		  
		  console.debug(scope.dataFormat);
		   var formatPercent = d3.format(scope.dataFormat);

	        // clear the elements inside of the directive
	        //vis.selectAll('*').remove();

	        // if 'val' is undefined, exit
	        if (!newVal) {
	          return;
	        }
		
			var arc = d3.svg.arc()
			    .startAngle(0)
			    .innerRadius(140)
			    .outerRadius(170)
			;
			
			var meter = vis.append("g")
			    .attr("class", "progress-meter");

			meter.append("path")
			    .attr("class", "background")
			    .attr("d", arc.endAngle(twoPi));

			var foreground = meter.append("path")
			    .attr("class", "foreground");

			var text = meter.append("text")
			    .attr("text-anchor", "middle");

			var text2 = meter.append("text")
			    .attr("y", 40)
			    .attr("text-anchor", "middle")
			    .attr("class", "text2");

				console.debug(scope.metricTitle);
			text2.text(scope.metricTitle);

			var animate = function(percentage) {
			    var i = d3.interpolate(progress, percentage);

			    d3.transition().duration(1200).tween("progress", function () {
			        return function (t) {
			            progress = i(t);
			            foreground.attr("d", arc.endAngle(twoPi * (progress/total)));
			            text.text(formatPercent(progress));
			        };
			    });
			}; 

			setTimeout(function () {
			//  scope.animate($('#inputVal').val());
			console.debug("deep in directive");
			console.debug(newVal.records[0].expr0);
			animate(newVal.records[0].expr0);
			}, 500);
       
      });
  }
}
});

directives.directive('ghMeter', function () {
 return {
 };

});