'use strict';
	
angular.module('myApp.controllers', [])
    .controller('MainCtrl', ['$scope', function ($scope) {
        $scope.status = "It works!";
    }])
	.controller('LeaderboardCtrl', ['$scope','DataService',
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

])
.controller('SiteConfigCtrl', ['$scope', 'SiteConfigService', 
	function ($scope, SiteConfigService) {
  	
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
