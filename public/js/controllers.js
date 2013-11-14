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
		$rootScope.go('dashboard');
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

myApp.controller('DashboardCtrl', ['$scope','$rootScope', 'DataService',
	function ($scope, $rootScope, DataService) {
		
		$scope.metrics = [] ;
		
		DataService.getMetrics()
	            .then(function (result) {
					console.log("Metric results are in ");
					console.log(result); 
	               $scope.metrics = result; 
			        
	            }, function (result) {
	                alert("Error: No data returned");
	            });
		
		DataService.getTimelineData()
	            .then(function (result) {
					console.log("Timeline results are in ");
					console.log(result); 
	               $scope.d3TrendData = result; 
			        
	            }, function (result) {
	                alert("Error: No data returned");
	            });
				
		DataService.getDashboardData()
	            .then(function (result) {
					console.log("Dashboard results are in ");
					console.log(result); 
	               $scope.dashboardData = result; 
        
	            }, function (result) {
	                alert("Error: No data returned");
	            });
		
		$scope.$watch('dashboard', function(newVal, oldValue) {
			
			console.log("dashboard watch fired");
			
			console.debug(JSON.parse($scope.dashboardData));
			
			var data = JSON.parse($scope.dashboardData);
			
			if (typeof data !== "undefined" && data !== null) { 
		
				console.debug("new data:"+data[0]);
			
				for (var i = 0 ; i < data.length ; i++) {
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

myApp.controller('LeaderboardCtrl', ['$scope','DataService',
	function ($scope, DataService) {
  		
		$scope.order = '-oppcount';
		  
		$scope.title = "LeaderboardCtrl";
		
		DataService.getLeaderData(function (result) {
			console.log("Leader results are in ");
		    $scope.leaderdata = result; 
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

myApp.controller('CountdownCtrl', ['$scope', '$timeout', 'SiteConfigService',
	function ($scope,$timeout, SiteConfigService) {
		
		SiteConfigService.getConfig()
                .then(function (result) {
					console.log("CountdownCtrl results are in ");
					
					$scope.config = JSON.parse(result.data.data).record ;
					
					console.log($scope.config); 
					
					var now = new Date().getTime();
					var start = new Date($scope.config.Inviter__StartDate__c).getTime();
					var end = new Date($scope.config.Inviter__EndDate__c).getTime();
					
					console.log(end-start);
					console.log($scope.config.Inviter__Active__c);
			
					if ($scope.config.Inviter__Active__c) {
						$scope.config.showcountdown = true ;
						$scope.config.countdown = (end - start)/1000;
						$scope.config.tagline = 'Incentive ends in';	
					} else if (!$scope.config.Inviter__Active__c && start>now) {
						$scope.config.showcountdown = true ;
				    	$scope.config.countdown = (start - now)/1000;
						$scope.config.tagline = 'Incentive starts in';
					} else {
						$scope.config.showcountdown = false ;
					}
				        
                }, function (result) {
                    alert("Error: No data returned");
                });
            
	}
]);

myApp.controller('SiteConfigCtrl', ['$scope', '$rootScope', '$route', 'SiteConfigService', 
	function ($scope, $rootScope, $route, SiteConfigService) {
  	
		SiteConfigService.getConfig()
                .then(function (result) {
					console.log("SiteConfigCtrl results are in ");
					var cnfg = JSON.parse(result.data.data) ;
					console.log(cnfg); 
                   $scope.site = cnfg.record; 
				   $scope.prizes = cnfg.prizes; 
				        
                }, function (result) {
                    alert("Error: No data returned");
                });
	
	}
  
]);

myApp.controller('FeedCtrl', ['$scope', '$rootScope', '$route', 'RESTService',
	function ($scope, $rootScope, $route, RESTService) {
  	
		$scope.init = function() {
			RESTService.get("https://data.invtr.co/feed", function(data) {
				console.debug("FeedCtrl REST returned:");
				//console.debug(JSON.stringify(data));
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


myApp.controller('Chat', ['$scope', '$timeout', 'DataService', 'socket', '$rootScope',
    function($scope, $timeout, DataService, socket, $rootScope) {
  
	DataService.getChatMessages()
            .then(function (result) {
				console.log("Chat results are in ");
				console.log(result); 
               $scope.messages = result; 
			        
            }, function (result) {
                alert("Error: No data returned");
            });
	 
	  
	 $scope.sendMessage = function () {
		 console.log("send message");
		 
		 var msg = new Object();
		 msg['username'] = $rootScope.currentUser.FirstName + " " + $rootScope.currentUser.LastName;
		 msg['userid'] = $rootScope.currentUser.UserId;
	     msg['message'] = $scope.message.message;
		 msg['photo'] = $rootScope.currentUser.SmallPhotoUrl;
		 var now = new Date().getTime();
		 msg['created_at'] = now ;
		 
		 console.log("Chat username:"+msg['username']+" userid:"+msg['userid']+" photo:"+msg['photo']);
		   
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



