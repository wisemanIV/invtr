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
        templateUrl:'partials/post.html'
    })
    $routeProvider.when('/community', {
        templateUrl:'partials/community.html'
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
myApp.run(function (Facebook, $rootScope, $location, $http, $timeout, AuthService, RESTService) {

    // *****
    // Eager load some data using simple REST client
    // *****

    $rootScope.restService = RESTService;
	
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


    // *****
    // Initialize authentication
    // *****
    $rootScope.authService = AuthService;
	
    // *****
    // Initialize facebook
    // *****
    $rootScope.facebookService = Facebook;

    // text input for login/password (only)
    //$rootScope.loginInput = 'git@github.com';
    //$rootScope.passwordInput = 'git';

    $rootScope.$watch('facebookService.authorized()', function () {

        // if never logged in, do nothing (otherwise bookmarks fail)
        if ($rootScope.facebookService.initialState()) {
            // we are public browsing
            return;
        }

        // when user logs in, redirect to home
        if ($rootScope.facebookService.authorized()) {
            $location.path("/");
        }

        // when user logs out, redirect to home
        if (!$rootScope.facebookService.authorized()) {
            $location.path("/");
        }

    }, true);
	
	//Facebook
    $rootScope.info = {};

        $rootScope.$on("fb_statusChange", function (event, args) {
            $rootScope.fb_status = args.status;
            $rootScope.$apply();
        });
        $rootScope.$on("fb_get_login_status", function () {
            Facebook.getLoginStatus();
        });
        $rootScope.$on("fb_login_failed", function () {
            console.log("fb_login_failed");
        });
        $rootScope.$on("fb_logout_succeded", function () {
            console.log("fb_logout_succeded");
            $rootScope.id = "";
        });
        $rootScope.$on("fb_logout_failed", function () {
            console.log("fb_logout_failed!");
        });

      


        $rootScope.updateSession = function () {
            //reads the session variables if exist from php
            $http.post('php/session.php').success(function (data) {
                //and transfers them to angular
                $rootScope.session = data;
            });
        };

        $rootScope.updateSession();


        // button functions
        $rootScope.getLoginStatus = function () {
            Facebook.getLoginStatus();
        };

     //   $rootScope.login = function () {
     //       Facebook.login();
     //       $location.url("/community"); 
     //   };

     //   $rootScope.logout = function () {
     //       Facebook.logout();
     //       $rootScope.session = {};
            //make a call to a php page that will erase the session data
         //   $http.post("php/logout.php");
    //    };
		
		$rootScope.go = function ( path ) {
		  $location.path( path );
		};

        $rootScope.unsubscribe = function () {
            Facebook.unsubscribe();
        }

        $rootScope.getInfo = function () {
            FB.api('/' + $rootScope.session.facebook_id, function (response) {
                console.log('Good to see you, ' + response.name + '.');
            });
            $rootScope.info = $rootScope.session;

        };

});




