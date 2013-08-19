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

var app = angular.module('FacebookProvider', []);
myApp.factory('Facebook', function ($rootScope) {
	
    var authorized = false;
	var currentUser = 'bob';

    // initial state says we haven't logged in or out yet...
    // this tells us we are in public browsing
    var initialState = true;
	
    window.fbAsyncInit = function () {
           FB.init({
               appId:'183417908506473',
               status:true,
               cookie:true,
               xfbml:true
           });
       };

       (function (d) {
           var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
           if (d.getElementById(id)) {
               return;
           }
           js = d.createElement('script');
           js.id = id;
           js.async = true;
           js.src = "//connect.facebook.net/en_US/all.js";
           ref.parentNode.insertBefore(js, ref);
       }(document));
 
	   //end
	
    return {
        getLoginStatus:function () {
 		   FB.Event.subscribe('auth.statusChange', function(response) {
        $rootScope.$broadcast("fb_statusChange", {'status': response.status});
    });

            FB.getLoginStatus(function (response) {
                $rootScope.$broadcast("fb_statusChange", {'status':response.status});
            }, true);
        },
        login:function () {
            FB.getLoginStatus(function (response) {
                switch (response.status) {
                    case 'connected':
                        $rootScope.$broadcast('fb_connected', {facebook_id:response.authResponse.userID});
                        authorized = true ;
						break;
                    case 'not_authorized' || 'unknown':
                        // 'not_authorized' || 'unknown': doesn't seem to work
                        FB.login(function (response) {
                            if (response.authResponse) {
                                $rootScope.$broadcast('fb_connected', {
                                    facebook_id:response.authResponse.userID,
                                    userNotAuthorized:true
                                });
                            } else {
                                $rootScope.$broadcast('fb_login_failed');
                            }
                        }, {scope:'read_stream, publish_stream, email'});
                        break;
                    default:
                        FB.login(function (response) {
                            if (response.authResponse) {
                                $rootScope.$broadcast('fb_connected', {facebook_id:response.authResponse.userID});
                                $rootScope.$broadcast('fb_get_login_status');
                            } else {
                                $rootScope.$broadcast('fb_login_failed');
                            }
                        });
                        break;
                }
            }, true);
        },
        logout:function () {
            FB.logout(function (response) {
                if (response) {
                    $rootScope.$broadcast('fb_logout_succeded');
                } else {
                    $rootScope.$broadcast('fb_logout_failed');
                }
            });
        },
	    authorized:function () {
	        return authorized;
	    },
        initialState:function () {
            return initialState;
        },
	    isLoggedIn:function () {
	        return authorized;
	    },
        currentUser:function () {
            return currentUser;
        },
        unsubscribe:function () {
            FB.api("/me/permissions", "DELETE", function (response) {
                $rootScope.$broadcast('fb_get_login_status');
            });
        }
    };
  
});


// simple auth service that can use a lot of work... 
myApp.factory('AuthService',
    function () {
    //    var currentUser = null;
   //     var authorized = false;

        // initial state says we haven't logged in or out yet...
        // this tells us we are in public browsing
     //   var initialState = true;

        return {
     //       initialState:function () {
     //           return initialState;
      //      },
      //      login:function (name, password) {
     //           currentUser = name;
     //           authorized = true;
                //console.log("Logged in as " + name);
      //          initialState = false;
      //      },
      //      logout:function () {
      //          currentUser = null;
      //          authorized = false;
       //     },
       //     isLoggedIn:function () {
        //        return authorized;
        //    },
      //      currentUser:function () {
      //          return currentUser;
      //      }//,
      //      authorized:function () {
      //          return authorized;
      //      }
        };
    }
);

