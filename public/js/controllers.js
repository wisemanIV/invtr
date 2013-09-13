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

myApp.controller('UserCtrl', ['$scope', '$location', '$rootScope','angularFire', 'ForceService', 'UserService', 'localStorageService',
  function ($scope, $location, $rootScope, angularFire, ForceService, UserService, localStorageService) {
    var url = 'https://inviter-dev.firebaseio.com/sites/'+localStorageService.get("invtr.subdomain")+'/accounts/'+localStorageService.get("invtr.sf_user_id");
    $scope.usr = angularFire(url, $scope, 'user',  {} );
	
	
	$scope.usr.then(function() {
		console.debug("user loaded");
		console.debug($scope.user);
		$rootScope.currentUser = $scope.user ;
		console.debug("Welcome "+$rootScope.currentUser.first_name);
		
	});
	
	$scope.login = function() {
		UserService.login($scope.$parent.mode) ;
	};
	$scope.logout = function() {
		UserService.logout($scope.$parent.mode) ;
	};
	$scope.isAuthenticated = function() {
		return UserService.isAuthenticated() ;
	};
	
	$scope.redirectAuth = function() {
		UserService.redirectAuth();
	};
	
	$scope.init = function() {
		console.debug("init auth");
	};
	
	$scope.$on("auth:login", function() {
		var user_uri = localStorageService.get('invtr.sf_user_uri');
	 	ForceService.getUserDetails($scope.callback, user_uri, localStorageService.get("invtr.sf_token")) ;
	}); 
	
	$scope.callback = function (data) {
		console.debug("user details callback");
		
		console.debug(data); 
		
		var userDetails = new Object() ;
		userDetails.first_name = data.first_name ;
		userDetails.last_name = data.last_name ;
		userDetails.email = data.email ;
		userDetails.photo_url_thumb = data.photos.thumbnail ;
		userDetails.photo_url = data.photos.picture ;
		
        var url = 'https://inviter-dev.firebaseio.com/sites/'+localStorageService.get("invtr.subdomain")+'/accounts';
		console.debug("user url:"+url);
	  	var ref = new Firebase(url);

	  	var acct = ref.child(localStorageService.get("invtr.sf_user_id")).set(userDetails);
	
	};
	
	$scope.$on("UserService:error", function(evt, err) {
		console.debug("auth error", err)
		
		
	  // There was an error during authentication.
	});
	
	
  }
]);

myApp.controller('ContentCtrl', ['$scope', '$filter', '$location', 'angularFire', '$routeParams', 'localStorageService',
  function ($scope, $filter, $location, angularFire, $routeParams, localStorageService) {
    var url = 'https://inviter-dev.firebaseio.com/'+localStorageService.get("invtr.subdomain")+'/posts';
    $scope.boo = angularFire(url, $scope, 'posts',  [] );
	
	$scope.selectedItem = $routeParams.postid ;
	
	$scope.boo.then(function() {
		$scope.orderedPosts = $scope.orderPosts();
		$scope.post = $scope.orderedPosts[$scope.selectedItem];
	});
	
	$scope.$watch('posts', function() { $scope.orderedPosts = $scope.orderPosts(); });
	
	$scope.addComment = function(post) {
		
	//	$scope.comment.submitter_id = $scope.$parent.currentUser.id
	//	$scope.comment.submitter_name = $scope.$parent.currentUser.name
		
		if (typeof post.comments == "undefined") post.comments = new Array();
	    post.comments.push($scope.comment);
		
		$scope.comment = {};
	}
	
	$scope.addPost = function() {
		
		var now = new Date();
		$scope.post.created_at = now
	//	$scope.post.submitter_id = $scope.$parent.currentUser.id
	//	$scope.post.submitter_name = $scope.$parent.currentUser.name
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
	
	$scope.jsonp_callback = function(data) {
		console.debug("callback");
		$scope.versions = data;

		console.debug($scope.versions);
	};
	
	$scope.obj_callback = function(data) {
		console.debug("callback");
		$scope.sfobjects = data.sobjects;
	};
	
	$scope.getVersions = function() {
		console.debug("SalesforceCtrl getVersions");
		ForceService.getVersions($scope.jsonp_callback, $scope.base_url);
	};
	
	$scope.getObjects = function() {
		console.debug("SalesforceCtrl getObjects");
		ForceService.getObjects($scope.obj_callback, $scope.token, $scope.base_url);
	};
	
}  
	  
]);

myApp.controller('DashboardCtrl', ['$scope', '$location', 'angularFire', 'ForceService','SiteConfigService','UserService', 'localStorageService',
	function ($scope, $location, angularFire, ForceService, SiteConfigService, UserService, localStorageService) {
  		var url = 'https://inviter-dev.firebaseio.com/sites/'+localStorageService.get("invtr.subdomain") +'/metrics';
    	$scope.item = angularFire(url, $scope, 'metrics',  [] );
			
		$scope.item.then(function() {
			console.debug("dashboardctrl then function");
			console.debug($scope.metrics);
			$scope.getData() ;
		});
		
		$scope.data = [];
		
		$scope.data_callback = function(data) {
			console.debug("dashboard data callback");
		};
	
		$scope.getData = function() {
			console.debug("DashboardCtrl getData");
			
			var sf_token = localStorageService.get("invtr.sf_token") ;
			var sf_base_uri = localStorageService.get("invtr.sf_base_uri") ;
			var sf_user_id = localStorageService.get("invtr.sf_user_id") ;
			console.debug("Sf token from UserService: "+sf_token);
			console.debug("Sf base uri from UserService: "+sf_base_uri);
			console.debug("Sf user id from UserService: "+sf_user_id);
			console.debug($scope.metrics);
			
			for (var i = 0 ; i < $scope.metrics.length ; i++) {
				
				var q = $scope.metrics[i].query.replace('%SF_USER_ID%',sf_user_id);
				console.debug(q);
				console.debug("Metric: "+$scope.metrics[i].title);
				console.debug($scope.metrics[i].format);
				ForceService.get($scope.data_callback, sf_token, sf_base_uri, q, $scope.metrics[i]);
			}
		};
		
	
	}
  
]);

myApp.controller('LeaderboardCtrl', ['$scope', '$location', 'angularFire', 'ForceService','SiteConfigService','UserService', 'localStorageService',
	function ($scope, $location, angularFire, ForceService, SiteConfigService, UserService, localStorageService) {
  		var url = 'https://inviter-dev.firebaseio.com/sites/'+localStorageService.get("invtr.subdomain") +'/metrics';
    	$scope.item = angularFire(url, $scope, 'metrics',  [] );
			
		$scope.item.then(function() {
			console.debug("leaderboardctrl then function");
			console.debug($scope.metrics);
			$scope.getData() ;
		});
		
		$scope.data = [];
		
		$scope.data_callback = function(data) {
			console.debug("leaderboard data callback");
			console.debug(data);
		};
		
		$scope.getData = function() {
			console.debug("LeaderboardCtrl getData");
			
			var sf_token = localStorageService.get("invtr.sf_token") ;
			var sf_base_uri = localStorageService.get("invtr.sf_base_uri") ;
			var sf_user_id = localStorageService.get("invtr.sf_user_id") ;
			console.debug("Sf token from UserService: "+sf_token);
			console.debug("Sf base uri from UserService: "+sf_base_uri);
			console.debug("Sf user id from UserService: "+sf_user_id);
			
			for (var i = 0 ; i < $scope.metrics.length ; i++) {
				
				var q = $scope.metrics[i].leaderboard;
				console.debug("Metric: "+q);
				ForceService.get($scope.data_callback, sf_token, sf_base_uri, q, $scope.metrics[i]);
			}
		};
	
	}
  
]);


myApp.controller('SiteBuilderCtrl', ['$scope', 'angularFire', 'SiteBuilderService', 'SiteConfigService','localStorageService',
	function ($scope, angularFire, SiteBuilderService, SiteConfigService, localStorageService) {

	  	$scope.createSite = function () {
			console.debug("creating new subdomain: "+ $scope.site.subdomain);
			console.debug($scope.site.startdate);
			console.debug($scope.site.enddate);
			
			SiteConfigService.saveConfig($scope.site);
			SiteBuilderService.buildSite($scope.build_callback, $scope.site.subdomain, $scope.site.auth);
			
			localStorageService.add('invtr.subdomain',$scope.site.subdomain) ;
			
		    $scope.site = {};
			$scope.$parent.go('/metrics');
			
	  	};
		
		$scope.build_callback = function (data) {
			console.debug("new subdomain successfully created");
	  	};

	}
  
]);

myApp.controller('MetricsCtrl', ['$scope', '$location', 'angularFire', 'SiteConfigService','localStorageService',
	function ($scope, $location, angularFire, SiteConfigService, localStorageService) {
  		var url = 'https://inviter-dev.firebaseio.com/sites/'+localStorageService.get('invtr.subdomain')+'/metrics';
    	$scope.item = angularFire(url, $scope, 'metrics',  [] );	
		
		$scope.init = function() {
			console.debug("init metrics");
			
			console.debug($scope.metrics);
			console.debug($scope.item);
			
			
			if (typeof $scope.metrics == "undefined") {
			    console.debug("setting metric array: "+localStorageService.get('invtr.subdomain'));
				$scope.metrics = new Array(); 
		    }
		};
		 
  		$scope.list5 = [
  		    { 'title': 'Opportunity count', 'type':'dial', 'format':'', 'target':'85', 'drag': true, 'query':"SELECT count(Id) FROM Opportunity where Owner.Id='%SF_USER_ID%'", 'leaderboard':"SELECT count(Id) FROM Opportunity group by Owner.Id" },
  		    { 'title': 'Opportunity expected revenue', 'type':'dial', 'format':'$', 'target':'6000000', 'drag': true, 'query':"SELECT sum(ExpectedRevenue) FROM Opportunity where Owner.Id='%SF_USER_ID%'",'leaderboard':"SELECT sum(ExpectedRevenue) FROM Opportunity group by Owner.Id" }
  		  ];
		
	    // Limit items to be dropped in list1
	     $scope.optionsList1 = {
	       accept: function(dragEl) {
	           return true;
	       }
	     };
		
		$scope.continue = function() {
			console.debug("continuing..."+$scope.site);
			window.location = "https://"+localStorageService.get('invtr.subdomain')+".invtr.co";
		};

	}
  
]);

myApp.controller('SiteConfigCtrl', ['$scope', '$location', '$route', 'angularFire', 'SiteConfigService', 'localStorageService','UserService',
	function ($scope, $location, $route, angularFire, SiteConfigService, localStorageService, UserService) {
  		var url = 'https://inviter-dev.firebaseio.com/sites/'+$location.host().split('.')[0];
    	$scope.site = angularFire(url, $scope, 'siteConfig',  {} );	
		
		$scope.site.then(function() {
			console.debug("then siteconfigctrl");
			console.debug($scope.siteConfig.auth);
			$scope.$root.mode = $scope.siteConfig.auth ;
			
			console.debug($scope.extractToken('logout'));
			
			if ($scope.extractToken('logout') === 'null') {

				localStorageService.add('invtr.subdomain', $location.host().split('.')[0]);
			
				var user_id = $scope.extractToken("sf_user_id");
				console.log("user_id: "+user_id);
				if (typeof user_id === "undefined" || user_id === 'null' || user_id === "") {
					console.debug("skipping set local storage user id:"+user_id);
				} else {

					console.debug("setting local storage user id:"+user_id);
					
					var sf_token = $scope.extractToken("token");
					var sf_user_uri = $scope.extractToken("user_uri");
					var sf_base_uri = decodeURIComponent($scope.extractToken("base_uri"));
					
					localStorageService.add('invtr.sf_user_id', user_id);
					localStorageService.add('invtr.sf_token', sf_token);
					localStorageService.add('invtr.sf_base_uri', sf_base_uri);
					localStorageService.add('invtr.sf_user_uri', sf_user_uri);
					
					$scope.$root.$broadcast("auth:login");
				}
			}
			
		});
		
		$scope.extractToken = function (name) {
		  console.debug($location.url());
		  return decodeURI(
		      (RegExp(name + '=' + '(.+?)(&|$)').exec($location.url())||[,null])[1]
		  );
	  	}
		
	
		
	}
  
]);

myApp.controller('LogoutCtrl', ['$scope', '$location', '$route', 'angularFire', 'SiteConfigService', 'localStorageService','UserService',
	function ($scope, $location, $route, angularFire, SiteConfigService, localStorageService, UserService) {
	
	    console.debug("logout controller");
		UserService.logout() ;
		$scope.$root.go('/?logout=true');
		
	}

]);


myApp.controller('Chat', ['$scope', '$timeout', '$rootScope','angularFireCollection','localStorageService',
    function($scope, $timeout, $rootScope, angularFireCollection, localStorageService) {
      var url = 'https://inviter-dev.firebaseio.com/sites/'+localStorageService.get("invtr.subdomain")+'/chat';
	  
      $scope.messages = angularFireCollection(new Firebase(url).limit(50));
	  
      $scope.addMessage = function() {
		  
		console.debug('addMessage'); 
		console.debug($rootScope.currentUser.photo_url_thumb);
		
		$scope.message.created_at = new Date() ;
		$scope.message.from = $rootScope.currentUser.first_name ;
		$scope.message.photo = $rootScope.currentUser.photo_url_thumb ;
		
        $scope.messages.add($scope.message);
        $scope.message = {};
      };
	  
	
    }
]);



