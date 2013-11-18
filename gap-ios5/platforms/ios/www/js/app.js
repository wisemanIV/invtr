var myApp = angular.module('myApp', 
	['ngRoute',
	 'myApp.directives',
	 'myApp.controllers',
	 'myApp.services'
	])
    // .config(['$compileProvider', function ($compileProvider) {
    //     $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    // }])
    .config(function ($routeProvider) {
        $routeProvider
        .when('/', {
            controller: 'MainCtrl',
            templateUrl: 'partials/main.html'
        })
        .when('/leaderboard', {
            controller: 'LeaderboardCtrl',
            templateUrl: 'partials/leaderboard.html'
        })
        .when('/progress', {
            controller: 'SiteConfigCtrl',
            templateUrl: 'partials/progress.html'
        })
        .otherwise({redirectTo: '/'});
    });