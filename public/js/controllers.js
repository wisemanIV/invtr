'use strict'

myApp.controller('InboxCtrl', ['$scope', 'angularFire','angularFireAuth',
  function MyCtrl($scope, angularFire, angularFireAuth) {
    var url = 'https://inviter-dev.firebaseio.com/accounts';
    $scope.items = angularFire(url, $scope, 'msgaccounts',  []);
	
    // modal
    $scope.open = function () {
        $scope.shouldBeOpen = true;
    };

    $scope.close = function () {
        $scope.closeMsg = 'I was closed at: ' + new Date();
        $scope.shouldBeOpen = false;
    };
    // end modal
	$scope.getMail = function() {
		console.debug("getmail");
	//	if (!(typeof $scope.$parent.currentUser == "undefined")) {
	//		console.debug($scope.$parent.currentUser.id);
	//		console.debug($scope.msgaccounts);
			
		//	for (var j = 0 ; j < $scope.msgaccounts.length ; j++) {
			
		//		if ($scope.$parent.currentUser.id == $scope.msgaccounts[j].id) return  $scope.msgaccounts[j].messages ;
		//	}
	//	}
		return [{}];	
	};
	
	$scope.items.then(function() {
		console.debug("jit");
		$scope.recentMail = $scope.getMail();
	});
	
    

    $scope.closeMail = function (index) {
        //console.log("closing mail " + index);
        $scope.recentMail.splice(index, 1);
    };
	
  }
]);

myApp.controller('AuthCtrl', ['$scope', '$location', 'angularFire', 'angularFireAuth',
  function ($scope, $location, angularFire, angularFireAuth) {
	var url = 'https://inviter-dev.firebaseio.com/accounts';
	$scope.acct_items = angularFire(url, $scope, 'accounts',  [] );
	
  	$scope.SF_CLIENT_ID ='3MVG9A2kN3Bn17hsQNq5RSRPi9TkUNS8ySH2iQJW2Z0rA25ePO.sz2dNhuD4.FnzOW_hzGcOuQMHgSpWshqLk';
  	$scope.SF_AUTHORIZATION_ENDPOINT = "https://login.salesforce.com/services/oauth2/authorize";
  	
	angularFireAuth.initialize(url, {scope: $scope, name: "user", path: "/login"});
	
	$scope.login = function() {
		console.debug("logging in")
		
		if ($scope.$parent.mode === "fbconnect") {
			console.debug("facebook login")
		    angularFireAuth.login("facebook",{
	  		 rememberMe: true,
	  	   	 scope: 'user_hometown, user_location'
		 	});
		} else {
			console.debug("salesforce login")
			var authUrl = $scope.SF_AUTHORIZATION_ENDPOINT + 
			        "?response_type=token" +
			        "&client_id="    + $scope.SF_CLIENT_ID +
					"&state=" + $scope.$parent.subdomain +
			        "&redirect_uri=" + "https://www.invtr.co/auth.html";

			window.location = authUrl ;
		}
	};
	
	$scope.writeCookie = function(cname, cvalue, cexpire) {
	    document.cookie = cname + '=' + escape(cvalue) +
	    (typeof cexpire == 'date' ? 'expires=' + cexpire.toGMTString() : '') +
	    ';domain=.invtr.co;path=/';  
	 };
	 
	 $scope.getCookie = function(c_name){
	       var i,x,y,ARRcookies=document.cookie.split(";");
	       for (i=0;i<ARRcookies.length;i++)
	       {
	              x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	              y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	              x=x.replace(/^\s+|\s+$/g,"");
	              if (x==c_name)
	        	  {
	        		  return unescape(y);
				  }
			}
	};
	
	$scope.getSubdomain = function () {
		var host = window.location.host;
		var sub = host.split('.')[0];
	};
	
	$scope.redirectAuth = function() {
		console.debug("redirecting successful auth");
		// save token in session cookie
		var sf_token = $scope.extractToken('access_token');
		$scope.writeCookie("sf_token",sf_token,3600);
		
		var sf_base_uri = $scope.extractToken('instance_url');
		$scope.writeCookie("sf_base_uri",sf_base_uri,3600);
		
 	    var sf_user_id =  $scope.extractToken('id');
 	    console.debug(sf_user_id);
 	    sf_user_id = $scope.extractSfUserId(sf_user_id);
		$scope.writeCookie("sf_user_id",sf_user_id,3600);
		
		var sub = $scope.extractToken('state');
		
		window.location = 'https://'+sub+'.invtr.co';
	};
	
	$scope.extractToken = function (name) {
	//	console.debug($location.search().access_token);
	  return decodeURI(
	      (RegExp(name + '=' + '(.+?)(&|$)').exec($location.url())||[,null])[1]
	  );
	};
	
	$scope.extractSfUserId = function (id) {
	  return RegExp('[^/]*$').exec(id)||[,null][1] ;
	};
	
	$scope.logout = function() {
		console.debug("logging out");
		angularFireAuth.logout();
	};
	
	$scope.$on("angularFireAuth:login", function(evt, user) {
	  console.debug("login event", evt);
	  $scope.$parent.doLogin(user);
	  $scope.$emit("AuthCtrl:bbbb",user);
	});
		
	$scope.$on("AuthCtrl:bbbb", function(evt, user) {
	  console.debug("adding account");
	  console.debug($scope.accounts[user.id]);
	  console.debug(evt);
	  
	  var u = $scope.accounts[user.id];
	  if (typeof u == "undefined") {
	  
		  $scope.$apply(function () {
			  evt.currentScope.accounts.push({id:user.id, first_name:user.first_name, last_name:user.last_name, messages:[{ type:'unread', from:'Home Office', msg:'Welcome to the incentive' }]});
		  });
	  
  	  }
	});
	
	$scope.$on("angularFireAuth:logout", function(evt) {
	   console.debug("logout event")
	   $scope.$parent.doLogout();
	});
	$scope.$on("angularFireAuth:error", function(evt, err) {
		console.debug("auth error", err)
	  // There was an error during authentication.
	});
	
	
  }
]);

myApp.controller('ContentCtrl', ['$scope', '$filter', '$location', 'angularFire', '$routeParams',
  function ($scope, $filter, $location, angularFire, $routeParams) {
    var url = 'https://inviter-dev.firebaseio.com/posts';
    $scope.boo = angularFire(url, $scope, 'posts',  [] );
	
	$scope.selectedItem = $routeParams.postid ;
	
	$scope.boo.then(function() {
		$scope.orderedPosts = $scope.orderPosts();
		$scope.post = $scope.orderedPosts[$scope.selectedItem];
	});
	
	$scope.$watch('posts', function() { $scope.orderedPosts = $scope.orderPosts(); });
	
	$scope.addComment = function(post) {
		
		$scope.comment.submitter_id = $scope.$parent.currentUser.id
		$scope.comment.submitter_name = $scope.$parent.currentUser.name
		
		if (typeof post.comments == "undefined") post.comments = new Array();
	    post.comments.push($scope.comment);
		
		$scope.comment = {};
	}
	
	$scope.addPost = function() {
		
		var now = new Date();
		$scope.post.created_at = now
		$scope.post.submitter_id = $scope.$parent.currentUser.id
		$scope.post.submitter_name = $scope.$parent.currentUser.name
		$scope.post.likes_count = 0 ;
		$scope.post.attachment = $filter('youtube_id')($scope.post.attachment);
	    $scope.posts.push($scope.post);
		$scope.post = {};
	}
	
	$scope.incrementLike = function() {
	    $scope.post.likes_count = $scope.post.likes_count + 1;
		
	}
	
    $scope.goPost = function (post) {
		console.debug($scope.posts);
    	$location.path('post/'+post);
    };
	
	$scope.orderPosts = function () {
		return $scope.posts.sort(function(a, b) {
		    return a.created_at < b.created_at;
		});
	};
}
]);

myApp.controller('SalesforceCtrl', ['$scope', '$location', '$http', '$routeParams', 'ForceService',
	function ($scope, $location, $http, $routeParams, ForceService) {
		
		$scope.versions = [{}] ;
		$scope.sfobjects = [{}] ;
		
		
  	$scope.CLIENT_ID ='3MVG9A2kN3Bn17hsQNq5RSRPi9TkUNS8ySH2iQJW2Z0rA25ePO.sz2dNhuD4.FnzOW_hzGcOuQMHgSpWshqLk';
  	$scope.AUTHORIZATION_ENDPOINT = "https://login.salesforce.com/services/oauth2/authorize";
  	
	$scope.init = function () {
	   console.debug("init auth");
		
	   $scope.token = $scope.extractToken('access_token');
	   $scope.user_id =  $scope.extractToken('id');
	   console.debug($scope.user_id);
	   $scope.user_id = $scope.extractUserId($scope.user_id);
	   console.debug($scope.user_id);
	   $scope.base_url = $scope.extractToken('instance_url');
 	   console.debug($scope.token);
   	}; 
	
	$scope.jsonp_callback = function(data) {
		console.debug("callback");
		$scope.versions = data;

		console.debug($scope.versions);
	};
	
	$scope.obj_callback = function(data) {
		console.debug("callback");
		$scope.sfobjects = data.sobjects;
	};
	
	$scope.rev_callback = function(data) {
		console.debug("rev callback");
		$scope.revenue = data.records[0].expr0;
	};
	
	$scope.opp_callback = function(data) {
		console.debug("opp callback");
		$scope.opportunities = data.records[0].expr0;
	};
	
	$scope.getVersions = function() {
		console.debug("SalesforceCtrl getVersions");
		ForceService.getVersions($scope.jsonp_callback, $scope.base_url);
	};
	
	$scope.getObjects = function() {
		console.debug("SalesforceCtrl getObjects");
		ForceService.getObjects($scope.obj_callback, $scope.token, $scope.base_url);
	};
	
	$scope.getOpportunities = function() {
		console.debug("SalesforceCtrl getObjects");
		var query = "SELECT count(Id) FROM Opportunity where Owner.Id = '"+$scope.user_id+"'" ;
		ForceService.get($scope.opp_callback, $scope.token, $scope.base_url, query);
	};
	
	$scope.getOpportunitiesRev = function() {
		console.debug("SalesforceCtrl getObjects");
		var query = "SELECT sum(ExpectedRevenue) FROM Opportunity where Owner.Id = '"+$scope.user_id+"'" ;
		ForceService.get($scope.rev_callback, $scope.token, $scope.base_url, query);
	};
	
	$scope.auth = function () {
		
		var authUrl = $scope.AUTHORIZATION_ENDPOINT + 
		        "?response_type=token" +
		        "&client_id="    + $scope.CLIENT_ID +
		        "&redirect_uri=" + "https://www.invtr.co/auth.html";

		     window.location = authUrl ;
	};
  
	$scope.extractToken = function (name) {
	//	console.debug($location.search().access_token);
	  return decodeURI(
	      (RegExp(name + '=' + '(.+?)(&|$)').exec($location.url())||[,null])[1]
	  );
	};
	
	$scope.extractUserId = function (id) {
	  return RegExp('[^/]*$').exec(id)||[,null][1] ;
	};
	
}  
	  
]);

myApp.controller('DashboardCtrl', ['$scope', 'angularFire', 'angularFireAuth', 'ForceService',
	function ($scope, angularFire, angularFireAuth, ForceService) {

		// initialize the model
		$scope.user = 'angular';
		$scope.repo = 'angular.js';
  
		$scope.revData = [200000]; 
		$scope.oppData = [10]; 
		
		$scope.rev_callback = function(data) {
			console.debug("rev callback");
			$scope.revData[$scope.revData.length+1] = data.records[0].expr0;
		};
	
		$scope.opp_callback = function(data) {
			console.debug("opp callback");
			$scope.oppData[$scope.oppData.length+1] = data.records[0].expr0;
		};
	
		$scope.getData = function() {
			console.debug("DashboardCtrl getData");
			var sf_token = $scope.getCookie("sf_token") ;
			var sf_base_uri = $scope.getCookie("sf_base_uri") ;
			var sf_user_id = $scope.getCookie("sf_user_id") ;
			console.debug("Sf token from cookie: "+sf_token);
			console.debug("Sf base uri from cookie: "+sf_base_uri);
			console.debug("Sf user id from cookie: "+sf_user_id);
			
			var query = "SELECT count(Id) FROM Opportunity where Owner.Id = '"+sf_user_id+"'" ;
			ForceService.get($scope.opp_callback, sf_token, sf_base_uri, query);
			var query = "SELECT sum(ExpectedRevenue) FROM Opportunity where Owner.Id = '"+sf_user_id+"'" ;
			ForceService.get($scope.rev_callback, sf_token, sf_base_uri, query);
		};
		
   	 	$scope.getCookie = function(c_name) {
   	        var i,x,y,ARRcookies=document.cookie.split(";");
   	        for (i=0;i<ARRcookies.length;i++)
   	        {
   	              x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
   	              y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
   	              x=x.replace(/^\s+|\s+$/g,"");
   	              if (x==c_name)
	        	  {
	        		  return unescape(y);
				  }
			}
   	        
   		 };
	
	}
  
]);


myApp.controller('SiteCtrl', ['$scope', 'angularFire', 'angularFireAuth', 'SiteService',
	function ($scope, angularFire, angularFireAuth, SiteService) {
  		var url = 'https://inviter-dev.firebaseio.com/sites';
    	$scope.items = angularFire(url, $scope, 'sites',  [] );

  	    // initialize the model
		$scope.user = 'angular';
		$scope.repo = 'angular.js';
		
		$scope.items.then(function() {
			$scope.getMode() ;
		});

	  	$scope.createSite = function () {
			console.debug("creating new subdomain: "+ $scope.site.subdomain);
			$scope.sites.push($scope.site);
			SiteService.buildSite($scope.build_callback, $scope.site.subdomain, $scope.site.auth)
	  	};
		
		$scope.build_callback = function (data) {
			console.debug("new subdomain successfully created: "+ $scope.site.subdomain);
			console.debug(data);
			$scope.parent.go('/site-ready');
	  	};
  
		$scope.getMode = function () {
			console.debug("get mode");
			
			var host = window.location.host;
			var sub = host.split('.')[0];
			
			console.debug("subdomain: "+sub);
			
			for (var j = 0 ; j < $scope.sites.length ; j ++) {
				if ($scope.sites[j].subdomain === sub) {
					console.debug("mode: "+$scope.sites[j].auth);
					$scope.$parent.mode = $scope.sites[j].auth ;
					$scope.$parent.subdomain = sub ;
					break ;
				}
			}
		};

	}
  
]);



