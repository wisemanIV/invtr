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
             get:function (callback, token, base, query, item) {
 				console.debug("ForceService get");
				
				var url = ForceBase+ "?url="+ base + "/services/data/v26.0/query/?q="+query+"&token="+token ;
				console.debug("GETTING URL: "+url) ;
				
 		   	    $http.get(encodeURI(url), {withCredentials:false}).success(function (data) {
 		   		   console.debug(data);
				   item.data = data.records[0] ;
				   console.debug(item.data);
 				   callback(data);
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

myApp.factory('SiteConfigService', ['$http','angularFire', '$rootScope', '$location', '$cookies',
    function ($http, angularFire, $rootScope, $location, $cookies) {
  		
        return {
             saveConfig:function (site) {
				
 				console.debug("Save site configuration: "+site);
				console.debug($rootScope.siteConfig);
			
				var ref = new Firebase('https://inviter-dev.firebaseio.com/sites/'+site.subdomain);
				ref.child("auth").set(site.auth);
				ref.child("incentivename").set(site.incentivename);
				ref.child("subdomain").set(site.subdomain);
				var ref2 = ref.child("metrics");
				var metrics = [{"placeholder":"metric"}] ;
				ref2.push(metrics);
				var ref3 = ref.child("accounts");
				var ref4 = ref3.child("bob").set("placeholder");
				
				$cookies.subdomain = site.subdomain ;
 		   	    
 		     }
			 
		 };
	 }
]);

myApp.factory('UserService', ['$http','angularFire', '$rootScope', '$location', '$cookies', 'ForceService',
    function ($http, angularFire, $rootScope, $location, $cookies, ForceService) {
		
	  	var SF_CLIENT_ID ='3MVG9A2kN3Bn17hsQNq5RSRPi9TkUNS8ySH2iQJW2Z0rA25ePO.sz2dNhuD4.FnzOW_hzGcOuQMHgSpWshqLk';
	  	var SF_AUTHORIZATION_ENDPOINT = "https://login.salesforce.com/services/oauth2/authorize";
		var SF_TOKEN_ENDPOINT = "https://login.salesforce.com/services/oauth2/token";
		var SF_SECRET = '7341473135225385204';
  		
		var currentUser = {};
		var auth_state = 0 ;
		
        return {
			login:function(mode) {
				console.debug("logging in: "+mode);
		
				if (mode === "fbconnect") {
					console.debug("facebook login")
			//	    angularFireAuth.login("facebook",{
			 // 		 rememberMe: true,
			 // 	   	 scope: 'user_hometown, user_location'
		//		 	});
				} else {
					console.debug("salesforce login")
					var authUrl = SF_AUTHORIZATION_ENDPOINT + 
					        "?response_type=code" +
					        "&client_id="    + SF_CLIENT_ID +
							"&state=" + $cookies.subdomain +
							"&immediate=false" +
					        "&redirect_uri=" + "https://www.invtr.co/auth.html";

					window.location.assign(authUrl);
				}
			},
			callback:function(data) {
				console.debug("auth callback");
				console.debug(data);
				
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
					
					window.location = 'https://'+$cookies.subdomain+'.invtr.co/#/?sf_user_id='+user.sf_user_id;
			},
			redirectAuth:function() {
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
					
			},
			 setUser:function(user) {
				currentUser = user ;
			 },
             getUser:function () {
				 
				 console.debug("get user");
				
				if (typeof currentUser != "undefined" && Object.keys(currentUser).length > 0 ) {
					console.debug("current user defined");
				 	return currentUser ;
	     		} else {
					console.debug("current user not defined");
					var url  = 'https://inviter-dev.firebaseio.com/sites/'+$cookies.subdomain+'/accounts/'+$cookies.sf_user_id;
					console.debug(url);
					var ref = new Firebase(url);
					
					currentUser = new Object();
					
					ref.on('value', function(snapshot) {
					  if(snapshot.val() === null) {
					    alert('User does not exist.');
					  } else {
					    var sf_token = snapshot.val().sf_token;
					    var sf_base_uri = snapshot.val().sf_base_uri;
					    var sf_user_id = snapshot.val().sf_user_id ;
						
						currentUser.sf_token = sf_token;
						currentUser.sf_base_uri = sf_base_uri;
						currentUser.sf_user_id = sf_user_id;
						
					  }
					});
					
					return currentUser ;
				}
 		   	    
 		     },
			 extractToken:function (name) {
			  console.debug($location.url());
			  return decodeURI(
			      (RegExp(name + '=' + '(.+?)(&|$)').exec($location.url())||[,null])[1]
			  );
		  	}
			 
		 };
	 }
]);






