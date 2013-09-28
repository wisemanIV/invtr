'use strict'

myApp.controller('InboxCtrl', ['$scope', 'angularFire','angularFireAuth',
  function MyCtrl($scope, angularFire, angularFireAuth) {
  //  var ref = new Firebase('https://inviter-dev.firebaseio.com/accounts');
  //  $scope.items = angularFire(ref, $scope, 'msgaccounts',  []);
	
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
	
	//$scope.items.then(function() {
//		console.debug("jit");
//		$scope.recentMail = $scope.getMail();
//	});
	
    

    $scope.closeMail = function (index) {
        //console.log("closing mail " + index);
        $scope.recentMail.splice(index, 1);
    };
	
  }
]);

myApp.controller('UserCtrl', ['$scope', '$location', '$rootScope', '$cookieStore', '$http', 'UserService', 'localStorageService', 'socket',
  function ($scope, $location, $rootScope, $cookieStore, $http, UserService, localStorageService, socket) {
   				
	 $scope.user = {};
	 $scope.authenticated = $rootScope.authenticated;
 
	 $http({
	       method: 'GET',
	       url: 'https://data.invtr.co/account',
	       withCredentials: true
	     }).
	       success(function(data, status, headers, config) {
			   console.debug("setting user");
			   console.debug(data);
	           $scope.user = data;
			   $rootScope.currentUser = $scope.user ;
			   $rootScope.authenticated = true ;
			   $scope.authenticated = true;
	       }).
	       error(function(data, status, headers, config) {
	           console.log(status);
			   $rootScope.authenticated = false ;
	       });
		   
		   
   	socket.on('accountdata', function (data) {
		console.debug("account data received");
		console.debug(data);
        $scope.user = data;
	    $rootScope.currentUser = $scope.user ;
	    $rootScope.authenticated = true ;
	    $scope.authenticated = true;
	});	
	
	$scope.login = function() {
		UserService.login($scope.$parent.mode) ;
	};
	$scope.logout = function() {
		UserService.logout($scope.$parent.mode) ;
	};
	$scope.init = function() {
		console.debug("UserCtrl init");
	};
	
	$scope.$on("UserService:error", function(evt, err) {
		console.debug("auth error", err)
		
		
	  // There was an error during authentication.
	});
	
	
  }
]);

myApp.controller('ContentCtrl', ['$scope', '$filter', '$location', 'angularFire', '$routeParams', 'localStorageService',
  function ($scope, $filter, $location, angularFire, $routeParams, localStorageService) {
    var ref = new Firebase('https://inviter-dev.firebaseio.com/'+localStorageService.get("invtr.subdomain")+'/posts');
    $scope.boo = angularFire(ref, $scope, 'posts',  [] );
	
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

myApp.controller('DashboardCtrl', ['$scope','$rootScope', 'UserService', 'localStorageService', 'RESTService', 'socket',
	function ($scope, $rootScope, UserService, localStorageService, RESTService, socket) {
  		
		$scope.init = function() {
			RESTService.get("https://data.invtr.co/metrics", $scope.callback);
		}
		
		$scope.callback = function(data) {
			console.debug("dashboard callback");
			console.debug(data);
			
			$scope.metrics = data ;
			
		}
		
		socket.on('sfdata', function (data) {
		
			var data = JSON.parse(data);
			
			if (typeof data !== "undefined" && data !== null && Object.keys(data).length > 0) { 
		
				console.debug("new data:"+data[0].data);
				console.debug(data[0].id);
				console.debug(data);
				console.debug(data.length);
			
				for (var i = 0 ; i < data.length ; i++) {
					for (var j = 0 ; j < $scope.metrics.length ; j++) {
						if (data[i].id === $scope.metrics[j].id)	{
							$scope.metrics[j].data = data[i].data;
						}
					}
				}
			}
		    
		});
	
	}
  
]);

myApp.controller('LeaderboardCtrl', ['$scope', '$location','SiteConfigService','UserService', 'localStorageService', 'RESTService', 'socket',
	function ($scope, $location, SiteConfigService, UserService, localStorageService, RESTService, socket) {
  		
		$scope.leaderdata = [];
		
		$scope.init = function() {
			RESTService.get("https://data.invtr.co/leaderboard", $scope.callback);
		}
		
		$scope.callback = function(data) {
			console.debug("leaderboard callback");
			console.debug(data);
			
		}
		
		socket.on('leaderdata', function (data) {
			
			console.debug(data);
			
			if (typeof data !== "undefined" && data !== null && Object.keys(data).length > 0) { 
		
				console.debug("leader data:");
			
				$scope.leaderdata = data ;
			}
		    
		});
	
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
  		var ref = new Firebase('https://inviter-dev.firebaseio.com/sites/'+localStorageService.get('invtr.subdomain')+'/metrics/config');
    	$scope.item = angularFire(ref, $scope, 'metrics',  [] );	
		
		$scope.init = function() {
			console.debug("init metrics");
			
			console.debug($scope.metrics);
			console.debug($scope.item);
			
		};
		 
  		$scope.list5 = [
  		     {'id':'oppcount','title': 'Opportunity count', 'type':'dial', 'format':'', 'target':'85', 'drag': true, 'query':"SELECT count(Id) FROM Opportunity where Owner.Id='%SF_USER_ID%'", 'leaderboard':"SELECT count(Id) FROM Opportunity group by Owner.Id" },
  		     {'id':'opprev','title': 'Opportunity expected revenue', 'type':'dial', 'format':'$', 'target':'6000000', 'drag': true, 'query':"SELECT sum(ExpectedRevenue) FROM Opportunity where Owner.Id='%SF_USER_ID%'",'leaderboard':"SELECT sum(ExpectedRevenue) FROM Opportunity group by Owner.Id" }
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

myApp.controller('SiteConfigCtrl', ['$scope', '$location', '$route', 'angularFire', 'SiteConfigService', 'localStorageService','UserService', 'DataService',
	function ($scope, $location, $route, angularFire, SiteConfigService, localStorageService, UserService, DataService) {
  		var ref = new Firebase('https://inviter-dev.firebaseio.com/sites/'+$location.host().split('.')[0]);
    	$scope.site = angularFire(ref, $scope, 'siteConfig',  {} );	
		
		$scope.site.then(function() {
			console.debug("then siteconfigctrl");
			console.debug($scope.siteConfig.auth);
			$scope.$root.mode = $scope.siteConfig.auth ;
			$scope.$root.metricConfig = $scope.siteConfig.metrics.config ;
			
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
      var ref = new Firebase('https://inviter-dev.firebaseio.com/sites/'+localStorageService.get("invtr.subdomain")+'/chat');
	  
     // $scope.messages = angularFireCollection(ref.limit(50));
	 $scope.messages = angularFireCollection(ref);
	  
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



