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
myApp.factory('DataService', ['$http','angularFire','angularFireCollection', '$rootScope','ForceService','localStorageService',
    function ($http, angularFire, angularFireCollection, $rootScope, ForceService, localStorageService) {
		
		var metrics = [] ;
		
        return {
			metrics:metrics,
			getData:function(metric, userId) {
				console.debug("DataService getData()");
				console.debug(metrics);
				console.debug(userId);
				
				var data = "";
				
				for (var i = 0 ; i < metrics.data.length ; i++) {
					if( metrics.accounts[i] === localStorageService.get("invtr.sf_user_id") ) {
						console.debug("found account data:") ;
						for (var j = 0 ; j < metrics.accounts[i].length ; j++) {
							console.debug(metrics.accounts[i][j]);
							if (metrics.accounts[i][j] === metric) {
								console.debug("found user metric data:") ;
								data = metrics.accounts[i][j][0].data ;
							}
						}
					}
				}
					
				return data ;
			},
			// temporary function to store data until there is an asychronous backend process
			storeData:function() {
				console.debug("DataService storeData");
			
				var sf_token = localStorageService.get("invtr.sf_token") ;
				var sf_base_uri = localStorageService.get("invtr.sf_base_uri") ;
				var sf_user_id = localStorageService.get("invtr.sf_user_id") ;
				console.debug("Sf token from UserService: "+sf_token);
				console.debug("Sf base uri from UserService: "+sf_base_uri);
				console.debug("Sf user id from UserService: "+sf_user_id);
				
				// setup data storage for metrics
		        var url1 = 'https://inviter-dev.firebaseio.com/sites/'+localStorageService.get("invtr.subdomain")+'/metrics/config';
				console.debug(url1);
				metrics = angularFireCollection(new Firebase(url1), function() {
					
					console.debug(metrics);
			        
					for (var i = 0 ; i < metrics.length ; i++) {
					
						console.debug(metrics[i]);
					
						// setup data storage for metrics
				        var url = 'https://inviter-dev.firebaseio.com/sites/'+localStorageService.get("invtr.subdomain")+'/'+localStorageService.get("invtr.sf_user_id")+'/metrics/'+metrics[i].id+'/data';
						console.debug(url);
					  	var dataPointRef = new Firebase(url);
						
						var q = metrics[i].query.replace('%SF_USER_ID%',sf_user_id);
						console.debug(q);
					
						console.debug("Metric: "+metrics[i].title);
					
						var data_callback = function(data, dataRef) {
							console.debug("DataService data callback");
			
							var now = new Date() ;
							
							if (data.records[0] !== null && typeof data.records[0].expr0 !== "undefined") {
							
								var dataPoint = [{ "data":data.records[0].expr0, "create_date":now.toString()}];
								dataRef.child("last").set(data.records[0].expr0);
								dataRef.push(dataPoint);
								
							}
						};
					
						ForceService.get(data_callback, sf_token, sf_base_uri, q, dataPointRef);
					
					}
				
				});
			}
			
	    };
	}

]);

// simple stub that could use a lot of work...
myApp.factory('ForceService',
    function ($http) {
		var ForceBase = 'https://api.invtr.co/force' ;
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
             get:function (callback, token, base, query, dataRef) {
 				console.debug("ForceService get");
				
				var url = ForceBase+ "?url="+ base + "/services/data/v26.0/query/?q="+query+"&token="+token ;
				console.debug("GETTING URL: "+url) ;
				
 		   	    $http.get(encodeURI(url), {withCredentials:false}).success(function (data) {
 		   		   console.debug(data);
 				   callback(data, dataRef);
 		   	   });
 		     },
			 getUserDetails:function (callback, user_uri, token, dataRef) {
			 	
				var url = ForceBase+ '/user?url='+ user_uri + '&token='+token;
				
				console.debug("Get user details: "+url) ;
				
 		   	    $http.get(url, {withCredentials:false}).success(function (data) {
 				   callback(data, dataRef);
 		   	   });
				
				
			 },
             postAuth:function (callback, url, body) {
 				console.debug("ForceService post auth");
				
				var url = ForceBase+ "?url="+ url ;
				console.debug("POSTING URL: "+url) ;
				
 		   	    $http.post(encodeURI(url), body, {withCredentials:false}).success(function (data) {
 		   		   console.debug(data);
 				   callback(data);
 		   	   });
 		     }
		 };
	
    }
);

myApp.factory('SiteBuilderService',
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

myApp.factory('UserService', ['$http','angularFire', '$route', '$rootScope', '$location', '$cookies', 'ForceService', 'localStorageService',
    function ($http, angularFire, $route, $rootScope, $location, $cookies, ForceService, localStorageService) {
		
	  	var SF_CLIENT_ID ='3MVG9A2kN3Bn17hsQNq5RSRPi9TkUNS8ySH2iQJW2Z0rA25ePO.sz2dNhuD4.FnzOW_hzGcOuQMHgSpWshqLk';
	  	var SF_AUTHORIZATION_ENDPOINT = "https://login.salesforce.com/services/oauth2/authorize";
		var SF_TOKEN_ENDPOINT = "https://login.salesforce.com/services/oauth2/token";
		
		var authenticated = false ;
		
		return {
			
			isAuthenticated:function() {
				
				authenticated = false ;
				
				var token = localStorageService.get('invtr.sf_token') ;
				
				if (typeof token != 'undefined' && token != null) {
					authenticated = true ;
				}
				return authenticated ;
			},
			login:function(mode) {
				console.debug("logging in: "+mode);
		
				
					console.debug("salesforce login")
					var authUrl = SF_AUTHORIZATION_ENDPOINT + 
					        "?response_type=token" +
					        "&client_id="    + SF_CLIENT_ID +
							"&state=" + localStorageService.get('invtr.subdomain') +
					        "&redirect_uri=" + "https://www.invtr.co/auth.html";
							
					window.location.assign(authUrl);
			
			},
			logout:function() {
				console.debug("User service logout");
				localStorageService.remove('invtr.sf_user_id');
				localStorageService.remove('invtr.sf_base_uri');
				localStorageService.remove('invtr.sf_token');
				authenticated = false ;
		        window.location = 'https://'+localStorageService.get('invtr.subdomain')+'.invtr.co/#/?logout=true';
				
			},
			callback:function(data) {
				console.debug("auth callback");
				console.debug(data);
				/*
				console.debug("auth successful");
		
					var user = {}; 
					// save token in session cookie
					user.sf_token = data.access_token;
					user.sf_refresh_token = data.refresh_token;
	
					user.sf_base_uri = data.instance_url;
					console.debug(user.sf_base_uri);
	
			 	    var sf_user_id =  data.id;
			 	    console.debug(sf_user_id);
			 	    var out = RegExp('[^/]*$').exec(sf_user_id)||[,null][1];
					user.sf_user_id = out[0];
		
					console.debug(user);
		  
		  		  	var ref = new Firebase('https://inviter-dev.firebaseio.com/sites/'+$cookies.subdomain+'/accounts');
		 
		  		  	var acct = ref.child(user.sf_user_id);
		  		  	var ref2 = acct.child('sf_token').set(user.sf_token);
		  		  	ref2 = acct.child('sf_base_uri').set(user.sf_base_uri);
		  		  	ref2 = acct.child('sf_user_id').set(user.sf_user_id);
					ref2 = acct.child('sf_refresh_token').set(user.sf_refresh_token);
	
		    		currentUser = user;
					
					window.location = 'https://'+$cookies.subdomain+'.invtr.co/#/?sf_user_id='+user.sf_user_id;*/
			},
			redirectAuth:function() {
				
				/* This is for the other auth flow
				console.debug("redirecting successful auth");
				
				var sf_code = this.extractToken('code');
				console.debug("code:"+sf_code);
				
				console.debug("intermediate auth step");
				
				var authUrl = SF_TOKEN_ENDPOINT 
				var body = "code=" + sf_code +
						"&grant_type=authorization_code" +
				        "&client_id="    + SF_CLIENT_ID +
						"&client_secret=" + SF_SECRET +
				        "&redirect_uri=" + "https://www.invtr.co/auth.html" ;
						
				
				ForceService.postAuth(this.callback, authUrl, body) ;
				*/
				
				console.debug("auth successful");
					
					// save token in session cookie
					var sf_token = this.extractToken('access_token');
					var sf_refresh_token = this.extractToken('refresh_token');
	
					var sf_base_uri = this.extractToken('instance_url');
					console.debug(sf_base_uri);
	
			 	    var sf_user_uri =  this.extractToken('id');
			 	    console.debug(sf_user_uri);
			 	    var out = RegExp('[^/]*$').exec(sf_user_uri)||[,null][1];
					var sf_user_id = out[0];
					
					var currentUser = new Object();
					currentUser = {"sf_token":sf_token,"sf_base_uri":decodeURI(sf_base_uri),"sf_user_id":sf_user_id,"sf_user_uri":sf_user_uri,"sf_refresh_token":sf_refresh_token}; 
		  
		        /*    console.debug(this.extractToken("state"));
		            var url = 'https://inviter-dev.firebaseio.com/sites/'+this.extractToken("state")+'/accounts';
					console.debug("url:"+url);
		  		  	var ref = new Firebase(url);
		 
		  		  	var acct = ref.child(currentUser.sf_user_id).set(currentUser);*/
				
					console.debug(this.extractToken("state"));
					
					window.location = 'https://'+this.extractToken('state')+'.invtr.co/#/?sf_user_id='+currentUser.sf_user_id 
						+ '&token='+ currentUser.sf_token
						+ '&refresh_token='+ currentUser.sf_refresh_token
						+ '&base_uri=' + currentUser.sf_base_uri
						+ '&user_uri=' + currentUser.sf_user_uri;
					
					
			},
			 extractToken:function (name) {
			  
			  return decodeURI(
			      (RegExp(name + '=' + '(.+?)(&|$)').exec($location.url())||[,null])[1]
			  );
		  	}
		}
	 }
]);






