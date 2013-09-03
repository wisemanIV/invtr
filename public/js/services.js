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
		var ForceBase = 'http://api.invtr.co/force' ;
        return {
            getObjects:function (callback, token, base) {
				console.debug("ForceService getObjects");
				
				//$http.defaults.headers.common.Authorization = 'Bearer ' + token ;
		
                $http.get(ForceBase+ '?url='+ base + '/services/data/v26.0/sobjects/&token='+token, {withCredentials:false}).
                    success(function (data, status, headers, config) {
						console.log(data);
                        callback(data);
                    }).
                    error(function (data, status, headers, config) {
                        console.log("get: failed to retrieve data");
                    });
            },
            getVersions:function (callback, base) {
				console.debug("ForceService getVersions");
				
		   	    $http.get(ForceBase+ '?url='+ base + '/services/data/&token=', {withCredentials:false}).success(function (data) {
		   		   console.debug(data);
				   callback(data);
		   	   });
		     },
             get:function (callback, token, base, query) {
 				console.debug("ForceService get");
				
				var url = ForceBase+ "?url="+ base + "/services/data/v26.0/query/?q="+query+"&token="+token ;
				console.debug("GETTING URL: "+url) ;
				
 		   	    $http.get(encodeURI(url), {withCredentials:false}).success(function (data) {
 		   		   console.debug(data);
 				   callback(data);
 		   	   });
 		     }
		 };
	 
	
    }
);

myApp.factory('SiteService',
    function ($http) {
		var UrlBase = 'http://api.invtr.co/sitebuilder' ;
        return {
            buildSite:function (callback, subdomain, auth) {
				console.debug("Site builder for subdomain: "+subdomain);
				
		   	    $http.get(UrlBase+'?subdomain='+subdomain+"&auth="+auth, {withCredentials:false}).success(function (data) {
		   		   console.debug(data);
				   callback(data);
		   	   });
		     }
		 };
	 }
);



