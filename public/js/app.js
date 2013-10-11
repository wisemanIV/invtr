'use strict';

// declare top-level module which depends on filters,and services
var myApp = angular.module('myApp',
    ['myApp.filters',
        'myApp.directives', // custom directives
        'ngGrid', // angular grid
        'ui', // angular ui
        'ngSanitize', // for html-bind in ckeditor
        'ui.bootstrap', // jquery ui bootstrap
        '$strap.directives', // angular strap
		'angularjs.media.directives',
		'ngDragDrop',
		'ngCookies',
		'ngRoute',
		'LocalStorageModule'
    ]);
	

// bootstrap angular
myApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    // TODO use html5 *no hash) where possible
    // $locationProvider.html5Mode(true);

    $routeProvider.when('/', {
        templateUrl:'partials/home.html'
    });
    $routeProvider.when('/contact', {
        templateUrl:'partials/contact.html'
    });
    $routeProvider.when('/site-ready', {
        templateUrl:'partials/ready.html'
    });
    $routeProvider.when('/dashboard', {
        templateUrl:'partials/dashboard.html',
	//	authRequired: true,
		controller:'DashboardCtrl'
    });
    $routeProvider.when('/leaderboard', {
        templateUrl:'partials/leaderboard.html',
	//	authRequired: true,
		controller:'LeaderboardCtrl'
    });
    $routeProvider.when('/metrics', {
        templateUrl:'partials/metrics.html',
		controller:'MetricsCtrl'
    });
    $routeProvider.when('/metrics-admin', {
        templateUrl:'partials/metrics-admin.html',
		controller:'MetricsCtrl'
    });
    $routeProvider.when('/create', {
        templateUrl:'partials/setup.html',
		controller:'SiteBuilderCtrl'
    });
    $routeProvider.when('/logout', {
		controller:'LogoutCtrl'
    });
    $routeProvider.when('/about', {
        templateUrl:'partials/about.html'
    })
    $routeProvider.when('/post/:postid', {
        templateUrl:'partials/post.html',
		authRequired: true,
		controller:'ContentCtrl'
    })
    $routeProvider.when('/community', {
        templateUrl:'partials/community.html',
		authRequired: true
    });

    // by default, redirect to site root
    $routeProvider.otherwise({
        redirectTo:'/'
    });

}]);

myApp.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.withCredentials = true;
}]);

// this is run after angular is instantiated and bootstrapped
myApp.run(function ($rootScope, $location, $http, $timeout, RESTService, SiteConfigService, UserService, DataService, socket) {

    // *****
    // Eager load some data using simple REST client
    // *****
	
	$rootScope.acct_items = {}
	
	$rootScope.config = {};
	$rootScope.currentUser = {} ;

    $rootScope.restService = RESTService;
	$rootScope.dataService = DataService ; 
	$rootScope.siteConfigService = SiteConfigService;
	$rootScope.userService = UserService ;
	$rootScope.selectedPost = {};
	
	$rootScope.mode = "sfconnect";
	$rootScope.subdomain = "www";
	$rootScope.siteConfigs = [];
	
	$rootScope.metrics = [] ;
	$rootScope.metricConfig = [] ;
	$rootScope.authenticated = false ;
	
    // async load constants
    //$rootScope.constants = [];
    //$rootScope.restService.get('data/constants.json', function (data) {
    //        $rootScope.constants = data[0];
    //    }
    //);
	

    // async load data do be used in table (playgound grid widget)
    //$rootScope.listData = [];
    //$rootScope.restService.get('data/generic-list.json', function (data) {
    //        $rootScope.listData = data;
    //    }
    //);
   
    $rootScope.go = function (place) {
		console.debug(place);
    	$location.path(place);
    };
	
	$rootScope.$on( "$routeChangeStart", function(event, next, current) {
		console.debug("route change");
		
	      if ( next.authRequired && !$rootScope.authenticated ) {
			  console.debug("auth required but not authenticated")
			  $location.path( "/" );
			 
		  }
	 
	  });
	

});




