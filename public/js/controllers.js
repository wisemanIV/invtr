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

myApp.controller('AuthCtrl', ['$scope', '$location', 'angularFire', '$cookies', 'UserService',
  function ($scope, $location, angularFire, $cookies, UserService) {
  	
	//angularFireAuth.initialize(url, {scope: $scope, name: "user", path: "/login"});
	
	$scope.login = function() {
		UserService.login($scope.$parent.mode) ;
	};
	
	$scope.redirectAuth = function() {
		UserService.redirectAuth();
	};
	
	$scope.extractToken = function (name) {
	  console.debug($location.url());
	  return decodeURI(
	      (RegExp(name + '=' + '(.+?)(&|$)').exec($location.url())||[,null])[1]
	  );
	};
	
	$scope.extractSfUserId = function (id) {
	  return RegExp('[^/]*$').exec(id)||[,null][1] ;
	};
	
	$scope.logout = function() {
		console.debug("logging out");
//		angularFireAuth.logout();
	};
	
	$scope.$on("angularFireAuth:login", function(evt, user) {
	  console.debug("login event", evt);
//	  $scope.$parent.doLogin(user);
//	  $scope.$emit("AuthCtrl:bbbb",user);
	});
	
	$scope.$on("angularFireAuth:logout", function(evt) {
	   console.debug("logout event")
//	   $scope.$parent.doLogout();
	});
	$scope.$on("angularFireAuth:error", function(evt, err) {
		console.debug("auth error", err)
	  // There was an error during authentication.
	});
	
	
  }
]);

myApp.controller('ContentCtrl', ['$scope', '$filter', '$location', 'angularFire', '$routeParams',
  function ($scope, $filter, $location, angularFire, $routeParams) {
    var url = 'https://inviter-dev.firebaseio.com/'+$cookies.subdomain+'/posts';
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

myApp.controller('DashboardCtrl', ['$scope', '$location','$cookies', 'angularFire', 'ForceService','SiteConfigService','UserService',
	function ($scope, $location, $cookies, angularFire, ForceService, SiteConfigService, UserService) {
  		var url = 'https://inviter-dev.firebaseio.com/sites/'+$cookies.subdomain+'/metrics';
    	$scope.item = angularFire(url, $scope, 'metrics',  [] );
			
		$scope.item.then(function() {
			console.debug("then dashboardctrl");
			console.debug($scope.metrics);
			$scope.getData() ;
		});
		
		$scope.data = [];
		
		$scope.data_callback = function(data) {
			console.debug("data callback");
		};
		
		$scope.init = function() {
			console.debug("init dash");
			console.debug($scope.metrics);
		}
	
		$scope.getData = function() {
			console.debug("DashboardCtrl getData");
			console.debug($scope.metrics);
			
			var sf_token = UserService.getUser().sf_token ;
			var sf_base_uri = UserService.getUser().sf_base_uri ;
			var sf_user_id = UserService.getUser().sf_user_id ;
			console.debug("Sf token from UserService: "+sf_token);
			console.debug("Sf base uri from UserService: "+sf_base_uri);
			console.debug("Sf user id from UserService: "+sf_user_id);
			
			for (var i = 0 ; i < $scope.metrics.length ; i++) {
				
				var q = $scope.metrics[i].query.replace('%SF_USER_ID%',sf_user_id);
				console.debug(q);
				ForceService.get($scope.data_callback, sf_token, sf_base_uri, q, $scope.metrics[i]);
			}
		};
		
	
	}
  
]);


myApp.controller('SiteBuilderCtrl', ['$scope', 'angularFire', 'SiteBuilderService', 'SiteConfigService','$cookies',
	function ($scope, angularFire, SiteBuilderService, SiteConfigService, $cookies) {
  		
  	    // initialize the model
		$scope.user = 'angular';
		$scope.repo = 'angular.js';

	  	$scope.createSite = function () {
			console.debug("creating new subdomain: "+ $scope.site.subdomain);
			
			$cookies.sudomain = $scope.site.subdomain ;
			SiteConfigService.saveConfig($scope.site);
			SiteBuilderService.buildSite($scope.build_callback, $scope.site.subdomain, $scope.site.auth);
		    
			$scope.$parent.go('/metrics');
			$scope.site = {};
			
	  	};
		
		$scope.build_callback = function (data) {
			console.debug("new subdomain successfully created: "+ $scope.site.subdomain);
	  	};

	}
  
]);

myApp.controller('MetricsCtrl', ['$scope', '$location', 'angularFire', 'SiteConfigService','$cookies',
	function ($scope, $location, angularFire, SiteConfigService, $cookies) {
  		var url = 'https://inviter-dev.firebaseio.com/sites/'+$cookies.subdomain+'/metrics';
    	$scope.item = angularFire(url, $scope, 'metrics',  [] );	
		
		$scope.init = function() {
			console.debug("init metrics");
			console.debug($scope.metrics);
			console.debug($scope.item);
			if (typeof $scope.metrics == "undefined") {
			    console.debug("setting metric array: "+$scope.site);
				$scope.metrics = new Array(); 
		    }
		};
		 
  		$scope.list5 = [
  		    { 'title': 'Opportunity count', 'type':'dial', 'data-format':'', 'data-type':'count', 'drag': true, 'query':"SELECT count(Id) FROM Opportunity where Owner.Id='%SF_USER_ID%'" },
  		    { 'title': 'Opportunity expected revenue', 'type':'dial', 'data-format':'$0', 'data-type':'$', 'drag': true, 'query':"SELECT sum(ExpectedRevenue) FROM Opportunity where Owner.Id='%SF_USER_ID%'"  }
  		  ];
		
	    // Limit items to be dropped in list1
	     $scope.optionsList1 = {
	       accept: function(dragEl) {
	           return true;
	       }
	     };
		
		$scope.continue = function() {
			console.debug("continuing..."+$scope.site);
			window.location = "https://"+$cookies.subdomain+".invtr.co";
		};

	}
  
]);

myApp.controller('SiteConfigCtrl', ['$scope', '$location', 'angularFire', 'SiteConfigService', '$cookies',
	function ($scope, $location, angularFire, SiteConfigService, $cookies) {
  		var url = 'https://inviter-dev.firebaseio.com/sites/'+$location.host().split('.')[0];
    	$scope.site = angularFire(url, $scope, 'siteConfig',  {} );	
		
		$scope.site.then(function() {
			console.debug("then siteconfigctrl");
			console.debug($scope.siteConfig.auth);
			$scope.$root.mode = $scope.siteConfig.auth ;
			$cookies.subdomain = $scope.siteConfig.subdomain;
			$cookies.sf_user_id = $scope.extractToken('sf_user_id');
		});
		
		 $scope.extractToken=function (name) {
		  console.debug($location.url());
		  return decodeURI(
		      (RegExp(name + '=' + '(.+?)(&|$)').exec($location.url())||[,null])[1]
		  );
		 }
		
		
	}
  
]);



