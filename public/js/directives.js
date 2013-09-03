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

directives.directive('ghVisualization', function () {

  // constants
  var margin = 20,
    width = 420,
    height = 300,
	radius = Math.min(width, height) / 2,
    color = d3.scale.category20();

  return {
    restrict: 'E',
    scope: {
      val: '='
    },
    link: function (scope, element, attrs) {

      // set up initial svg object
      var vis = d3.select("#d3")
	  			.append("svg")
	  		    .attr("width", width)
	  		    .attr("height", height)
	  		    .append("g")
	  		    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      scope.$watch('val', function (newVal, oldVal) {

        // clear the elements inside of the directive
        vis.selectAll('*').remove();

        // if 'val' is undefined, exit
        if (!newVal) {
          return;
        }
		
		var pie = d3.layout.pie()(newVal);

		var arc = d3.svg.arc()
		    .innerRadius(radius - 100)
		    .outerRadius(radius - 20);
			
		var path = vis.datum(pie).selectAll("path")
		      .data(pie)
		      .enter().append("path")
		      .attr("fill", function(d, i) { return color(i); })
		      .attr("d", arc);
       
      });
    }
  }
});
