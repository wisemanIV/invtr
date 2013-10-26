'use strict'

myApp.controller('InboxCtrl', ['$scope', 'socket', 'RESTService',
  function MyCtrl($scope, socket, RESTService) {
	  
	$scope.inbox = {} ;
	  
	$scope.init = function() {
		RESTService.get("https://data.invtr.co/messages", function(data) {
			console.debug("InboxCtrl REST returned:");
			console.debug(JSON.stringify(data));
			$scope.inbox = data.messages;
		});
	}
 	
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

myApp.controller('ContentCtrl', ['$scope', '$filter', '$location', '$routeParams', 'localStorageService',
  function ($scope, $filter, $location, $routeParams, localStorageService) {
   
	$scope.selectedItem = $routeParams.postid ;
	
	$scope.boo.then(function() {
		$scope.orderedPosts = $scope.orderPosts();
		$scope.post = $scope.orderedPosts[$scope.selectedItem];
	});
	
	$scope.$watch('posts', function() { $scope.orderedPosts = $scope.orderPosts(); });
	
	
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

myApp.controller('DashboardCtrl', ['$scope','$rootScope', '$location', 'UserService', 'localStorageService', 'RESTService', 'socket',
	function ($scope, $rootScope, $location, UserService, localStorageService, RESTService, socket) {
  		
		$scope.init = function() {
			RESTService.get("https://data.invtr.co/metrics", $scope.callback);
		}
		
		$scope.d3TrendData = 
[{"dat":"20111001","a":63.4, "b":62.7, "c":72.2},
{"dat":"20111002","a":58.0,	"b":59.9, "c":67.7},
{"dat":"20111003","a":53.3,	"b":59.1, "c":69.4},
{"dat":"20111004","a":55.7,	"b":58.8, "c":68.0}];
		
		$scope.callback = function(data) {
			console.debug("metrics callback");
			console.debug(JSON.stringify(data));
			
			var m = new Array() ;
			
			for (var j = 0 ; j < data.length ; j++) {
				console.log('metric loop');
				
				if (data[j].Inviter__DisplayField__c) {
				
					var item = new Object() ;
				
					item.title = data[j].Inviter__DisplayLabel__c ;
				    item.data = "0" ;
					// TODO make this dynamic in the data
					item.type = "dial";
					item.format = data[j].Inviter__DisplayFormat__c ;
					item.target = data[j].Inviter__FieldTarget__c ;
					item.ruleid = data[j].Id ;
					item.fieldtype = 'count';
					m.push(item); 
				}
				if (data[j].Inviter__DisplayPointsField__c) {
				
					var item = new Object() ;
				
					item.title = data[j].Inviter__DisplayPointsFieldLabel__c ;
				    item.data = "0" ;
					// TODO make this dynamic in the data
					item.type = "dial";
					item.format = data[j].Inviter__DisplayPointsFieldFormat__c ;
					item.target = data[j].Inviter__PointsFieldTarget__c ;
					item.ruleid = data[j].Id ;
					item.fieldtype = 'points';
					m.push(item); 
				}
				
				
				
			} 
			$scope.metrics = m ;
			
		}
		
		socket.on('invtr:data:'+$location.host().split(".")[0], function (input) {
			
			console.log("data event received");
			
			console.debug(input);
			
			var data = JSON.parse(input);
			
			if (typeof data !== "undefined" && data !== null) { 
		
				console.debug("new data:"+data[0]);
				console.debug(data.length);
			
				for (var i = 0 ; i < data.length ; i++) {
					console.log(data[0]);
					console.debug("metrics length="+$scope.metrics.length);
					console.debug($rootScope.currentUser);
					
					var currId = RegExp('[^/]*$').exec($rootScope.currentUser.UserId)||[,null][1];
					
					if (currId == data[i].Inviter__OwnerId__c) {
						console.log("found matching user");
					
						for (var j = 0 ; j < $scope.metrics.length ; j++) {
							
							if (data[i].Inviter__RuleId__c == $scope.metrics[j].ruleid) {
							
								if ($scope.metrics[j].fieldtype === 'count' && angular.isNumber(data[i].Inviter__Count__c)) {
									
									$scope.metrics[j].data = data[i].Inviter__Count__c ;
								} else if ($scope.metrics[j].fieldtype === 'points' && angular.isNumber(data[i].Inviter__Points__c)) {
									
									$scope.metrics[j].data = data[i].Inviter__Points__c ;
								} else {
									$scope.metrics[j].data = $scope.metrics[j].data;
								}
								
							}
							
						}
					}
				}
			}
		    
		});
		
		$scope.toggleType = function() {
			console.log('toggle the dashbaord');
			console.log($scope.dashboard.type);
			
			if ($scope.dashboard.type === 'standard') {
				$scope.dashboard.type = 'trendline';
				$scope.dashboard.toggleText = 'Standard View';
			} else {
				$scope.dashboard.type = 'standard';
				$scope.dashboard.toggleText = 'Trendline View';
			}
		}
	
	}
  
]);

myApp.controller('LeaderboardCtrl', ['$scope', '$location','SiteConfigService','UserService', 'localStorageService', 'RESTService', 'socket',
	function ($scope, $location, SiteConfigService, UserService, localStorageService, RESTService, socket) {
  		
		$scope.leaderdata = [];
		$scope.order = '-oppcount';
		  
		$scope.title = "LeaderboardCtrl";
		
		$scope.init = function() {
			//	RESTService.get("https://data.invtr.co/leaderboard", $scope.callback);
		}
		
		$scope.callback = function(data) {
			console.debug("leaderboard callback");
			console.debug(data);
			
		}
		
		socket.on('invtr:leaderdata:'+$location.host().split(".")[0], function (data) {
			
			console.debug(data);
			
			if (typeof data !== "undefined" && data !== null) { 
		
				console.debug("leader data:");
			
				$scope.leaderdata = JSON.parse(data) ;
				
		        $scope.d3Data = $scope.leaderdata;
				
			}
		    
		});
		
		$scope.toggleType = function() {
			console.log('toggle the leaderboard');
			console.log($scope.leaderboard.type);
			
			if ($scope.leaderboard.type === 'standard') {
				$scope.leaderboard.type = 'bar';
				$scope.leaderboard.toggleText = 'Standard View';
			} else {
				$scope.leaderboard.type = 'standard';
				$scope.leaderboard.toggleText = 'Bar Chart View';
			}
		}
	
	}
  
]);

myApp.controller('CountdownCtrl', ['$scope', '$timeout', 'SiteConfigService', '$rootScope','RESTService',
	function ($scope,$timeout, SiteConfigService, $rootScope, RESTService) {
		
		
		$scope.init = function() {
			RESTService.get("https://data.invtr.co/incentiveconfig", $scope.callback);
		}
		
		$scope.callback = function(data) {
			console.debug("CountdownCtrl callback");
			console.debug(data);
			
			var now = new Date().getTime();
			
			$scope.config = data ;
			
		    $scope.config.countdown = (data.startdate - now)/1000;
			
		}
            
	}
]);

myApp.controller('SiteConfigCtrl', ['$scope', '$rootScope', '$route', 'RESTService', 'socket',
	function ($scope, $rootScope, $route, RESTService, socket) {
  	
		RESTService.get("https://data.invtr.co/incentiveconfig", function(data) {
			console.debug("SiteConfigCtrl REST returned:");
			console.debug(JSON.stringify(data));
			$scope.site = data;
		});
		
	
	}
  
]);

myApp.controller('FeedCtrl', ['$scope', '$rootScope', '$route', 'RESTService',
	function ($scope, $rootScope, $route, RESTService) {
  	
		$scope.init = function() {
			RESTService.get("https://data.invtr.co/feed", function(data) {
				console.debug("FeedCtrl REST returned:");
				console.debug(JSON.stringify(data));
				$scope.feed = data.items;
			});
		}
	
	
		$scope.incrementLike = function(feedItemId) {
			RESTService.post("https://data.invtr.co/feed-item/"+feedItemId+"/like", function(data) {
				console.debug("Increment Like REST returned:");
				console.debug(JSON.stringify(data));
			});
		
		}
	
		$scope.addComment = function(feedItemId) {
			
			RESTService.post("https://data.invtr.co/feed-item/"+feedItemId+"/comment", JSON.stringify({"text":"my comment"}), function(data) {
				console.debug("Add comment REST returned:");
				console.debug(JSON.stringify(data));
				$scope.comment = {};
			});
		}
		
	}
  
]);

myApp.controller('LogoutCtrl', ['$scope', '$location', '$route', 'SiteConfigService', 'localStorageService','UserService',
	function ($scope, $location, $route, SiteConfigService, localStorageService, UserService) {
	
	    console.debug("logout controller");
		UserService.logout() ;
		$scope.$root.go('/?logout=true');
		
	}

]);


myApp.controller('Chat', ['$scope', '$timeout', '$rootScope','$location', 'socket',
    function($scope, $timeout, $rootScope, $location, socket) {
  
  	 $scope.messages = [];
	 
	 socket.on('init:messages:'+$location.host().split(".")[0], function (input) {
		console.log("CLIENT RECEIVES CHAT MESSAGE");
		
		console.debug("new chat data:"+input);
		
		var data = JSON.parse(input);
		
		if (typeof data !== "undefined" && data[0] !== null && data.length>0 && Object.keys(data).length > 0) { 
	
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
		 var now = new Date().getTime();
		 msg['created_at'] = now ;
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



