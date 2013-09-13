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

	var width = 270,
	    height = 270,
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
	
	   //var formatPercent = d3.format(scope.dataFormat);
	   var total = scope.ghTarget.valueOf() ;
	   
	   var index = document.querySelector("#d3Parent").childNodes.length-1 ;
	   
	   var column = [170, 500];
	   var row = [140, 200, 300]

      // set up initial svg object
	var vis = d3.select("#d3Parent")
		    .append("g")
		    .attr("transform", "translate(" + column[index%2] + "," + row[0] + ")");  

      scope.$watch('val', function (newVal, oldVal) {
		  
		  console.debug("directive watch fired:"+scope.metricTitle);
		  
		  vis.selectAll('*').remove();

	        // if 'val' is undefined, exit
	        if (!newVal) {
	          return;
	        }
		
			var arc = d3.svg.arc()
			    .startAngle(0)
			    .innerRadius(110)
			    .outerRadius(130)
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
				
			var percentage = newVal.expr0.valueOf() ;

			
				console.debug("animate progress: "+progress+" percentage:"+percentage+" total:"+total);
			    var i = d3.interpolateNumber(progress, percentage/total);
			   
			    d3.select(vis).transition().duration(800).tween("progress", function () {
			        return function (t) {
			            progress = i(t);
			            foreground.attr("d", arc.endAngle(twoPi * progress));
						console.debug("progress:"+progress);
			            text.text(scope.ghFormat+''+percentage);
			        };
			    });
			
			
       
      });
  }
}
});

directives.directive('ghMeter', function () {
 return {
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

