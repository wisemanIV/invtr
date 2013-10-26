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
	
	$http.get('/sample_data/user_account.json').success(function(response) {
		console.debug("Account CTRL returned:");
		console.debug(response);
		
        $scope.user = response;
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

myApp.controller('DashboardCtrl', ['$scope','$rootScope', '$location', '$http', 'UserService', 'localStorageService', 'RESTService', 'socket',
	function ($scope, $rootScope, $location, $http, UserService, localStorageService, RESTService, socket) {
  		
		$scope.init = function() {
			$http.get('/sample_data/dashboard_data.json').success(function(response) {
				console.debug("Dashboard CTRL returned:");
				console.debug(response);
				
		        $scope.callback(response);
			 });
		}
		
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

myApp.controller('LeaderboardCtrl', ['$scope', '$location','$http','SiteConfigService','UserService', 'localStorageService', 'RESTService', 'socket',
	function ($scope, $location, $http, SiteConfigService, UserService, localStorageService, RESTService, socket) {
  		
		$scope.leaderdata = [];
		$scope.order = '-oppcount';
		  
		  $scope.title = "LeaderboardCtrl";
		       
		        $scope.d3OnClick = function(item){
		          alert(item.name);
		        };
		
		$scope.callback = function(data) {
			console.debug("leaderboard callback");
			console.debug(data);
			
		}
		
		$http.get('/sample_data/leader_data.json').success(function(response) {
			console.debug("Leaderboard CTRL returned:");
			console.debug(response);
			
			$scope.leaderdata = response ;
			
	        $scope.d3Data = response;
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

myApp.controller('CountdownCtrl', ['$scope', '$timeout', '$http', 'SiteConfigService', '$rootScope','RESTService',
	function ($scope,$timeout, $http, SiteConfigService, $rootScope, RESTService) {
		
		
		$scope.init = function() {
			$http.get('/sample_data/site_config.json').success(function(response) {
				console.debug("CountdownCtrl REST returned:");
				console.debug(response);
				$scope.callback(response);
			 });
			
		}
		
		$scope.callback = function(data) {
			console.debug("config callback");
			console.debug(data);
			
			var now = new Date().getTime();
			
		    $scope.$apply(function() {
		              
			var c = 0 ;
			config.debug(data.StartDate);
			
			
			if (((data.StartDate - now)/1000)>0) {
				c=(data.StartDate - now)/1000;
				config.debug(c);
				$scope.countdownVal = c ;
				//$rootScope.$broadcast('timer-start');
			}
		});
			
		}
		
		
            
	}
]);

myApp.controller('SiteConfigCtrl', ['$scope', '$rootScope', '$http', '$route', 'RESTService', 'socket',
	function ($scope, $rootScope, $http, $route, RESTService, socket) {
		
		$http.get('/sample_data/site_config.json').success(function(response) {
			console.debug("SiteConfigCtrl returned:");
			console.debug(response);
			$scope.site = response;
		 });
	}
  
]);

myApp.controller('LogoutCtrl', ['$scope', '$location', '$route', 'SiteConfigService', 'localStorageService','UserService',
	function ($scope, $location, $route, SiteConfigService, localStorageService, UserService) {
	
	    console.debug("logout controller");
		UserService.logout() ;
		$scope.$root.go('/?logout=true');
		
	}

]);

myApp.controller('FeedCtrl', ['$scope', '$rootScope', '$route', 'RESTService',
	function ($scope, $rootScope, $route, RESTService) {
  	
		$scope.init = function() {
			
			$http.get('/sample_data/feed.json').success(function(response) {
				console.debug("FeedCtrl returned:");
				console.debug(response);
				$scope.feed = response;
			 });
		}
]);


myApp.controller('Chat', ['$scope', '$timeout', '$rootScope','localStorageService', 'socket',
    function($scope, $timeout, $rootScope, localStorageService, socket) {
  
  	 $scope.messages = [];
	 
	 $http.get('/sample_data/chat.json').success(function(response) {
		console.debug("Chat returned:");
		console.debug(response);
		
  		 for (var i = 0 ; i < response.length ; i++) {
  	     	// add the message to our model locally
  	     	$scope.messages.push(response[i]);
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



