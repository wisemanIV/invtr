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

myApp.controller('AuthCtrl', ['$scope', 'angularFire', 'angularFireAuth',
  function ($scope, angularFire, angularFireAuth) {
    var url = 'https://inviter-dev.firebaseio.com/accounts';
	$scope.acct_items = angularFire(url, $scope, 'accounts',  [] );
	
	angularFireAuth.initialize(url, {scope: $scope, name: "user", path: "/login"});
	
	$scope.login = function() {
		console.debug("logging in")
	    angularFireAuth.login("facebook",{
  		 rememberMe: true,
  	   	 scope: 'user_hometown, user_location'
	 	});
	};
	
	$scope.logout = function() {
		console.debug("logging out");
		angularFireAuth.logout();
	};
	
	$scope.$on("angularFireAuth:login", function(evt, user) {
	  console.debug("login event", evt);
	  $scope.$parent.doLogin(user);
	  $scope.$emit("AuthCtrl:bbbb",user);
	});
		
	$scope.$on("AuthCtrl:bbbb", function(evt, user) {
	  console.debug("adding account");
	  console.debug(evt);
	  $scope.$apply(function () {
	//     evt.currentScope.accounts.push({id:user.id, first_name:user.first_name, last_name:user.last_name});
	  });
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

myApp.controller('ContentCtrl', ['$scope', '$filter', '$location', 'angularFire', '$routeParams',
  function ($scope, $filter, $location, angularFire, $routeParams) {
    var url = 'https://inviter-dev.firebaseio.com/posts';
    $scope.boo = angularFire(url, $scope, 'posts',  [] );
	
	$scope.selectedItem = $routeParams.postid ;
	
	$scope.boo.then(function() {
		$scope.orderedPosts = $scope.orderPosts();
		$scope.post = $scope.orderedPosts[$scope.selectedItem];
	});
	
	$scope.$watch('posts', function() { $scope.orderedPosts = $scope.orderPosts(); });
	
	$scope.addComment = function(post) {
		
		$scope.comment.submitter_id = $scope.$parent.currentUser.id
		$scope.comment.submitter_name = $scope.$parent.currentUser.name
		
		if (typeof post.comments == "undefined") post.comments = new Array();
	    post.comments.push($scope.comment);
		
		$scope.comment = {};
	}
	
	$scope.addPost = function() {
		
		var now = new Date();
		$scope.post.created_at = now
		$scope.post.submitter_id = $scope.$parent.currentUser.id
		$scope.post.submitter_name = $scope.$parent.currentUser.name
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



