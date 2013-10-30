'use strict';

// simple stub that could use a lot of work...
myApp.factory('RESTService',
    function ($http) {
        return {
            get:function (url, callback) {
                return $http.get(url, {withCredentials:true}).
                    success(function (data, status, headers, config) {
                        callback(data);
                        //console.log(data.json);
                    }).
                    error(function (data, status, headers, config) {
                        console.log("failed to retrieve data");
                    });
            },
            post:function (url, data, callback) {
                return $http.post(url, data, {withCredentials:true}).
                    success(function (data, status, headers, config) {
                        callback(data);
                        //console.log(data.json);
                    }).
                    error(function (data, status, headers, config) {
                        console.log("failed to retrieve data");
                    });
            }
        };
    }
);

myApp.factory('DataService', ['$http','$rootScope','socket', '$location', '$q',
    function ($http, $rootScope, socket, $location, $q) {
		
		var chatMessages = [] ;
		var leaderData = [] ;
		var timeseriesData = {} ;
		var dashboardData = [];
		var metrics = [];
		
		$http.get('/sample_data/chat.json').success(function(input) {
			console.debug("Chat service returned:");
			console.debug(input);
			
			var data = input;

			if (typeof data !== "undefined" && data[0] !== null && data.length>0 && Object.keys(data).length > 0) { 

				 for (var i = 0 ; i < data.length ; i++) {
			     	// add the message to our model locally
			     	chatMessages.push(data[i]);
				 }
	
			}
		 });
		
		$http.get('/sample_data/leader_data.json').success(function(response) {
			console.debug("Leaderboard CTRL returned:");
			console.debug(response);
			
			leaderData = response ;
		 });
		 
 		$http.get('/sample_data/timeseries.json').success(function(input) {
 			console.debug("Timeline service returned:");
			
			console.debug(input);
			
			var data = JSON.parse(input);
			
			console.log(data); 
			
			if (typeof data !== "undefined" && data !== null) { 
				
				var timelineData = [] ;
					
				var currId = RegExp('[^/]*$').exec($rootScope.currentUser.UserId)||[,null][1];
				
				var userTimeline = data[currId] ;
				
				console.log(JSON.stringify(Object.keys(userTimeline)));
						
				for(var j = 0 ; j < Object.keys(userTimeline).length ; j++) {
					var dataRow = {} ;
					
					console.log(Object.keys(userTimeline)[j]) ;
					
					var metrics = userTimeline[Object.keys(userTimeline)[j]] ;
					
					var d = new Date(Object.keys(userTimeline)[j]);
					    var curr_date = d.getDate();
					    var curr_month = d.getMonth() + 1; //Months are zero based
					    var curr_year = d.getFullYear();
					dataRow["dat"] = curr_year+''+curr_month+''+curr_date;
					
					console.log(Object.keys(metrics['metricSnapshots']));
					
					for ( var x = 0 ; x < Object.keys(metrics['metricSnapshots']).length ; x++) {
						var ruleId = Object.keys(metrics['metricSnapshots'])[x] ;
						console.log(ruleId);
						
						var metricObj = metrics['metricSnapshots'][ruleId];
						
						console.log(metricObj);
						
						dataRow[ruleId] = metricObj.count ;
					}
					timelineData.push(dataRow);
					
					
				}
				console.log("Finished timeline");
				
				timeseriesData = timelineData;
			
			}	
		
			
		});
		
 		$http.get('/sample_data/dashboard_data.json').success(function(input) {
 			console.debug("Dashboard data service returned:");
			
			console.debug(input);
			
			var data = input;
			
			if (typeof data !== "undefined" && data !== null) { 
		
				console.debug("dashboard data:");
			
				processMetrics(data['metrics']);
				dashboardData = data['data'] ;
				
			}
		    
		});
		
		 function processMetrics(data) {
			console.debug("process metrics");
			console.debug(data);
			
			var m = new Array() ;
			
			for (var j = 0 ; j < data.length ; j++) {
				console.log('metric loop');
				
				if (data[j].Inviter__DisplayField__c) {
				
					var item = new Object() ;
				
					item.title = data[j].Inviter__DisplayLabel__c ;
				    item.data = "0" ;
					// TODO make this dynamic in the data
					item.type = "dial";
					item.format = data[j].Inviter__DisplayFormat__c ;
					item.target = data[j].Inviter__FieldTarget__c ;
					item.ruleid = data[j].Id ;
					item.fieldtype = 'count';
					m.push(item); 
				}
				if (data[j].Inviter__DisplayPointsField__c) {
				
					var item = new Object() ;
				
					item.title = data[j].Inviter__DisplayPointsFieldLabel__c ;
				    item.data = "0" ;
					// TODO make this dynamic in the data
					item.type = "dial";
					item.format = data[j].Inviter__DisplayPointsFieldFormat__c ;
					item.target = data[j].Inviter__PointsFieldTarget__c ;
					item.ruleid = data[j].Id ;
					item.fieldtype = 'points';
					m.push(item); 
				}
				
				
				
			} 
			metrics = m ;
			
		}
		
		
        return {
			
			getChatMessages:function() {
                var deferred = $q.defer();
                deferred.resolve(chatMessages);

                return deferred.promise;
			},
			getLeaderData:function() {
                var deferred = $q.defer();
                deferred.resolve(leaderData);

                return deferred.promise;
			},
			getTimelineData:function() {
                var deferred = $q.defer();
                deferred.resolve(timeseriesData);

                return deferred.promise;
			},
			getDashboardData:function() {
                var deferred = $q.defer();
                deferred.resolve(dashboardData);

                return deferred.promise;
			},
			getMetrics:function() {
                var deferred = $q.defer();
                deferred.resolve(metrics);

                return deferred.promise;
			}
			
	    };
	}

]);

myApp.factory('SiteConfigService', ['$http', '$rootScope', '$timeout', 'RESTService', '$q',
 function ($http, $rootScope, $timeout, RESTService, $q) {

	var siteConfig = {};
	
    var siteConfigfn = RESTService.get("https://data.invtr.co/incentiveconfig", function(data) {
		console.log("SiteConfigService returns");
		console.log(data);
        siteConfig = data;
    });

    return {

        getConfig:function () {
             var deferred = $q.defer();
             deferred.resolve(siteConfigfn);

              return deferred.promise;    
        }

     };
 }
]);

myApp.factory('UserService', ['$http', '$route', '$rootScope', '$location', '$cookies',
    function ($http, $route, $rootScope, $location, $cookies) {
			
		return {
			
			login:function(mode) {
				console.debug("logging in: "+mode);
		
				window.location = 'https://data.invtr.co/oauth/authorize' ;
			
			},
			logout:function() {
				console.debug("User service logout");
				
		        window.location = 'https://data.invtr.co/logout';
				
			}
		}
	 }
]);


myApp.factory('socket', function ($rootScope) {
/*  var socket = io.connect("");
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };*/
});






