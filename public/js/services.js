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

myApp.factory('SiteConfigService', ['$http','angularFire', '$rootScope', '$location',
    function ($http, angularFire, $rootScope, $location) {
  		
        return {
             saveConfig:function (site) {
				
 				console.debug("Save site configuration: "+site);
			
				var ref = new Firebase('https://inviter-dev.firebaseio.com/sites/'+site.subdomain);
			  	
				siteRef.set(ref);
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






