'use strict';

// simple stub that could use a lot of work...
myApp.factory('RESTService',
    function ($http) {
        return {
            get:function (url, callback) {
                return $http.get(url, {withCredentials:false}).
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

// simple stub that could use a lot of work...
myApp.factory('DataService', ['$http','$rootScope','localStorageService',
    function ($http, $rootScope, localStorageService) {
		
		
        return {
		
			
	    };
	}

]);

myApp.factory('SiteConfigService', ['$http', '$rootScope', '$timeout', 'RESTService',
    function ($http, $rootScope, $timeout, RESTService) {
		
		var countStart = {} ;
		
		RESTService.get("https://data.invtr.co/incentiveconfig", function(data) {
			console.debug("Config service:"+data.StartDate);
			console.debug(data);
			
			var now = new Date().getTime();
			countStart = data.StartDate - now;
			console.debug(countStart);
			data['countStart'] = countStart ;
			$rootScope.config = data;
		});
		
  		
        return {
			
			getCounter : function () {

			    return countStart; //we need some way to access actual variable value
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
  var socket = io.connect("https://data.invtr.co");
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
  };
});






