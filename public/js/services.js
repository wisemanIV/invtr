'use strict';

// simple stub that could use a lot of work...
myApp.factory('RESTService',
    function ($http) {
        return {
            get:function (url, callback) {
                return $http({method:'GET', url:url}).
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
myApp.factory('ForceService',
    function ($http) {
        return {
            get:function (callback, token) {
				console.debug("ForceService getVersions");
				
				$http.defaults.headers.common.Authorization = 'Bearer ' + token ;
		
                return $http.get('http://api.invtr.co/force?url=https://na1.salesforce.com/services/data/v20.0/sobjects/').
                    success(function (data, status, headers, config) {
						console.log(data);
                        callback(data);
                    }).
                    error(function (data, status, headers, config) {
                        console.log("get: failed to retrieve data");
                    });
            },
            getVersions:function (callback) {
				console.debug("getVersions ForceService");
				
		   	    $http.get('http://api.invtr.co/force?url=http://na1.salesforce.com/services/data/', {withCredentials:false}).success(function (data) {
		   		   console.debug(data);
				   callback(data);
		   	   });
		     }
		 }
	 
	
    }
);



