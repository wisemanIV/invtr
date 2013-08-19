'use strict'

myApp.controller('InboxCtrl', ['$scope', 'angularFire',
  function MyCtrl($scope, angularFire) {
    var url = 'https://inviter-dev.firebaseio.com/messages';
    $scope.items = angularFire(url, $scope, 'messages',  {});
	
    // modal
    $scope.open = function () {
        $scope.shouldBeOpen = true;
    };

    $scope.close = function () {
        $scope.closeMsg = 'I was closed at: ' + new Date();
        $scope.shouldBeOpen = false;
    };
    // end modal

    $scope.recentMail = [
        { type:'unread', from:'Phil Jenkins', msg:'Your password will expire in 23 days' },
        { type:'unread', from:'Paul Terry', msg:'CRM system updated.' },
        { type:'read', from:'Matt Lundquist', msg:'Successfully deployed Oracle 11g' },
        { type:'read', from:'Lindsay Dugan', msg:'Closed support ticket #4455' },
        { type:'read', from:'Lindsay Dugan', msg:'Reminder: Offsite in San Diego (comicon)' }
    ];

    $scope.closeMail = function (index) {
        //console.log("closing mail " + index);
        $scope.recentMail.splice(index, 1);
    };
	
  }
]);

myApp.controller('UsersCtrl', ['$scope', 'angularFire', 'angularFireAuth',
  function UsersCtrl($scope, angularFire, angularFireAuth) {
    var url = 'https://inviter-dev.firebaseio.com';
	angularFireAuth.initialize(url, {scope: $scope, name: "user", path: "/login"});
	
	
	$scope.addUser = function(user) {
		console.debug("new user", user)
	    users.push(user);
	}
	
	$scope.login = function() {
		console.debug("logging in")
	    angularFireAuth.login("facebook");
	};
	
	$scope.logout = function() {
		console.debug("logging out")
		angularFireAuth.logout();
	};
	
	$scope.$on("angularFireAuth:login", function(evt, user) {
	  console.debug("login event", user)
	  $scope.$parent.doLogin(user);
	});
	$scope.$on("angularFireAuth:logout", function(evt) {
	   console.debug("logout event")
	   $scope.$parent.doLogout();
	});
	$scope.$on("angularFireAuth:error", function(evt, err) {
		console.debug("auth error", err)
	  // There was an error during authentication.
	});
	
	
  }
]);

myApp.controller('PostsCtrl', ['$scope', 'angularFire',
  function MyCtrl($scope, angularFire) {
    var url = 'https://inviter-dev.firebaseio.com/posts';
    $scope.items = angularFire(url, $scope, 'posts',  [] );
	
	$scope.addComment = function(post,comment) {
	    post.comments.push({body:comment});
	}
	
	$scope.addPost = function(post, submitter) {
		var now = new Date();
	    $scope.posts.push({message:post, created_at:now, submitter:submitter});
	}
	
  }
]);



