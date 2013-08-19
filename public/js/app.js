'use strict';

// declare top-level module which depends on filters,and services
var myApp = angular.module('myApp',
    ['myApp.filters',
        'myApp.directives', // custom directives
        'ngGrid', // angular grid
        'ui', // angular ui
        'ngSanitize', // for html-bind in ckeditor
		'firebase',
        'ui.bootstrap', // jquery ui bootstrap
        '$strap.directives' // angular strap
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
    $routeProvider.when('/about', {
        templateUrl:'partials/about.html'
    })
    $routeProvider.when('/post', {
        templateUrl:'partials/post.html',
		authRequired: true
    })
    $routeProvider.when('/community', {
        templateUrl:'partials/community.html',
		authRequired: true
    });

    // note that to minimize playground impact on app.js, we
    // are including just this simple route with a parameterized 
    // partial value (see playground.js and playground.html)
    $routeProvider.when('/playground/:widgetName', {
        templateUrl:'playground/playground.html',
        controller:'PlaygroundCtrl'
    });

    // by default, redirect to site root
    $routeProvider.otherwise({
        redirectTo:'/'
    });

}]);

// this is run after angular is instantiated and bootstrapped
myApp.run(function ($rootScope, $location, $http, $timeout, RESTService) {

    // *****
    // Eager load some data using simple REST client
    // *****

    $rootScope.restService = RESTService;
	
	$rootScope.loggedIn = false 
	$rootScope.currentUser = {} 
	
    // async load constants
    $rootScope.constants = [];
    $rootScope.restService.get('data/constants.json', function (data) {
            $rootScope.constants = data[0];
        }
    );

    // async load data do be used in table (playgound grid widget)
    $rootScope.listData = [];
    $rootScope.restService.get('data/generic-list.json', function (data) {
            $rootScope.listData = data;
        }
    );
	
    $rootScope.doLogin = function (user) {
    	$location.path("community");
		$rootScope.loggedIn = true ;
		$rootScope.currentUser = user; 
    };
    $rootScope.doLogout = function () {
    	$location.path("logout");
		$rootScope.loggedIn = false ;
		$rootScope.currentUser = {} ;
    };
    $rootScope.clickLogin = function () {
    	$location.path("community");
    };

  

});




