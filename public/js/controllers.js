'use strict'

myApp.controller('InboxCtrl', ['$scope', 'socket',
  function MyCtrl($scope, socket) {
	  
	$scope.inbox = {} ;
	  
    socket.on('inbox', function (data) {
  		console.debug("inbox data received");
  		console.debug(data);
        
		$scope.inbox = data ;
	});	
 	
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
	
		return [{}];	
	};

    $scope.closeMail = function (index) {
        //console.log("closing mail " + index);
        $scope.recentMail.splice(index, 1);
    };
	
  }
]);

myApp.controller('UserCtrl', ['$scope', '$location', '$rootScope', '$http', 'UserService', 'localStorageService', 'socket',
  function ($scope, $location, $rootScope, $http, UserService, localStorageService, socket) {
   				
	$scope.user = {};
	$scope.authenticated = $rootScope.authenticated;
		   
   	socket.on('accountdata', function (data) {
		console.debug("account data received");
		console.debug(data);
        $scope.user = JSON.parse(data);
		console.debug($scope.user.SmallPhotoUrl);
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
			console.debug("metrics callback");
			console.debug(data);
			
			$scope.metrics = data ;
			
		}
		
		socket.on('invtr:data', function (input) {
			
			console.log("data event received");
			
			var data = JSON.parse(input);
			
			if (typeof data !== "undefined" && data !== null) { 
		
				console.debug("new data:"+data[0]);
				console.debug(data.length);
			
				for (var i = 0 ; i < data.length ; i++) {
					console.debug("metrics length="+$scope.metrics.length);
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
		$scope.order = '-oppcount';
		  
		  $scope.title = "LeaderboardCtrl";
		       
		        $scope.d3OnClick = function(item){
		          alert(item.name);
		        };
				
		$scope.d3TrendData = 
[{"date":"20111001","a":63.4, "b":62.7, "c":72.2},
{"date":"20111002","a":58.0,	"b":59.9, "c":67.7},
{"date":"20111003","a":53.3,	"b":59.1, "c":69.4},
{"date":"20111004","a":55.7,	"b":58.8, "c":68.0}];
		
		$scope.init = function() {
			//	RESTService.get("https://data.invtr.co/leaderboard", $scope.callback);
		}
		
		$scope.callback = function(data) {
			console.debug("leaderboard callback");
			console.debug(data);
			
		}
		
		socket.on('invtr:data', function (data) {
			
			console.debug(data);
			
			if (typeof data !== "undefined" && data !== null) { 
		
				console.debug("leader data:");
			
				$scope.leaderdata = JSON.parse(data) ;
				
		        $scope.d3Data = $scope.leaderdata;
				
				//[
		        //  {name: "Greg", score:98},
		        //  {name: "Ari", score:96},
		       //   {name: "Loser", score: 48}
		       // ];
			}
		    
		});
	
	}
  
]);

myApp.controller('CountdownCtrl', ['$scope', '$timeout', 'SiteConfigService', '$rootScope','RESTService',
	function ($scope,$timeout, SiteConfigService, $rootScope, RESTService) {
		
		
		$scope.init = function() {
			RESTService.get("https://data.invtr.co/incentiveconfig", $scope.callback);
		}
		
		$scope.callback = function(data) {
			console.debug("config callback");
			console.debug(data);
			
			var now = new Date().getTime();
			
		    $scope.$apply(function() {
		              
		          
			$scope.countdownVal = (data.StartDate - now)/1000 ;
			 });
			$rootScope.$broadcast('timer-start');
			
		}
		
			
		
	   
            
	}
]);

myApp.controller('SiteConfigCtrl', ['$scope', '$rootScope', '$route', 'RESTService', 'socket',
	function ($scope, $rootScope, $route, RESTService, socket) {
  	
		RESTService.get("https://data.invtr.co/incentiveconfig", function(data) {
			
			$scope.site = data;
		});
	}
  
]);

myApp.controller('LogoutCtrl', ['$scope', '$location', '$route', 'angularFire', 'SiteConfigService', 'localStorageService','UserService',
	function ($scope, $location, $route, angularFire, SiteConfigService, localStorageService, UserService) {
	
	    console.debug("logout controller");
		UserService.logout() ;
		$scope.$root.go('/?logout=true');
		
	}

]);


myApp.controller('Chat', ['$scope', '$timeout', '$rootScope','localStorageService', 'socket',
    function($scope, $timeout, $rootScope, localStorageService, socket) {
  
  	 $scope.messages = [];
	 
	 socket.on('init:messages', function (data) {
		console.log("CLIENT RECEIVES CHAT MESSAGE");
		
		if (typeof data !== "undefined" && data[0] !== null && data.length>0 && Object.keys(data).length > 0) { 
	
			console.debug(data);
			console.debug("new data:"+data[0].data);
			
	   		 for (var i = 0 ; i < data.length ; i++) {
	   	     	// add the message to our model locally
	   	     	$scope.messages.push(data[i]);
	   		 }
			
		}
	    
	 });
	 
	  
	 $scope.sendMessage = function () {
		 console.log("send message");
		 
		 var msg = new Object();
		 //msg['username'] = $scope.message.username;
		 msg['username'] = "Stephen McCurry";
	     msg['message'] = $scope.message.message;
		 //msg['photo'] = $scope.message.photo;
		 msg['photo'] = "https://c.na15.content.force.com/profilephoto/729i0000000HQIE/T";
		   
	     socket.emit('send:message', msg, function(res) {
			 console.log("EMIT MESSAGE CALLBACK");
			 console.log(res);
	     });

	     // add the message to our model locally
	     $scope.messages.push(msg);

	     // clear message box
	     $scope.message = '';
	   };
	  
	
    }
]);



