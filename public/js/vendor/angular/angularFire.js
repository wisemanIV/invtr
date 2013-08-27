'use strict';

angular.module('firebase', []).value('Firebase', Firebase);

// Implicit syncing. angularFire binds a model to $scope and keeps the dat
// synchronized with a Firebase location both ways.
// TODO: Optimize to use child events instead of whole 'value'.
angular.module('firebase').factory('angularFire', ['$q', '$parse', function($q, $parse) {
  return function(ref, scope, name, ret) {
    var af = new AngularFire($q, $parse, ref);
    return af.associate(scope, name, ret);
  };
}]);

function AngularFire($q, $parse, ref) {
  this._q = $q;
  this._parse = $parse;
  this._initial = true;
  this._remoteValue = false;

  if (typeof ref == "string") {
    this._fRef = new Firebase(ref);
  } else {
    this._fRef = ref;
  }
}
AngularFire.prototype = {
  associate: function($scope, name, ret) {
    var self = this;
    if (ret == undefined) {
      ret = [];
    }
    var deferred = this._q.defer();
    var promise = deferred.promise;
    this._fRef.on('value', function(snap) {
      var resolve = false;
      if (deferred) {
        resolve = deferred;
        deferred = false;
      }
      self._remoteValue = ret;
      if (snap && snap.val() != undefined) {
        var val = snap.val();
        if (typeof val != typeof ret) {
          self._log("Error: type mismatch");
          return;
        }
        // Also distinguish between objects and arrays.
        var check = Object.prototype.toString;
        if (check.call(ret) != check.call(val)) {
          self._log("Error: type mismatch");
          return;
        }
        self._remoteValue = angular.copy(val);
        if (angular.equals(val, $scope[name])) {
          return;
        }
      }
      self._safeApply($scope,
        self._resolve.bind(self, $scope, name, resolve, self._remoteValue));
    });
    return promise;
  },
  _log: function(msg) {
    if (console && console.log) {
      console.log(msg);
    }
  },
  _resolve: function($scope, name, deferred, val) {
    this._parse(name).assign($scope, angular.copy(val));
    this._remoteValue = angular.copy(val);
    if (deferred) {
      deferred.resolve(val);
      this._watch($scope, name);
    }
  },
  _watch: function($scope, name) {
    // Watch for local changes.
    var self = this;
    $scope.$watch(name, function() {
      if (self._initial) {
        self._initial = false;
        return;
      }
      var val = JSON.parse(angular.toJson($scope[name]));
      if (angular.equals(val, self._remoteValue)) {
        return;
      }
      self._fRef.ref().set(val);
    }, true);
  },
  _safeApply: function($scope, fn) {
    var phase = $scope.$root.$$phase;
    if (phase == '$apply' || phase == '$digest') {
      fn();
    } else {
      $scope.$apply(fn);
    }
  }
};

// Explicit syncing. Provides a collection object you can modify.
// Original code by @petebacondarwin, from:
// https://github.com/petebacondarwin/angular-firebase/blob/master/ng-firebase-collection.js
angular.module('firebase').factory('angularFireCollection', ['$timeout', function($timeout) {
  function angularFireItem(ref, index) {
    this.$ref = ref.ref();
    this.$id = ref.name();
    this.$index = index;
    angular.extend(this, ref.val());
  }

  return function(collectionUrlOrRef, initialCb) {
    var collection = [];
    var indexes = {};

    var collectionRef;
    if (typeof collectionUrlOrRef == "string") {
      collectionRef = new Firebase(collectionUrlOrRef);
    } else {
      collectionRef = collectionUrlOrRef;
    }

    function getIndex(prevId) {
      return prevId ? indexes[prevId] + 1 : 0;
    }
    
    function addChild(index, item) {
      indexes[item.$id] = index;
      collection.splice(index, 0, item);
    }

    function removeChild(id) {
      var index = indexes[id];
      // Remove the item from the collection.
      collection.splice(index, 1);
      indexes[id] = undefined;
    }

    function updateChild (index, item) {
      collection[index] = item;
    }

    function moveChild (from, to, item) {
      collection.splice(from, 1);
      collection.splice(to, 0, item);
      updateIndexes(from, to);
    }

    function updateIndexes(from, to) {
      var length = collection.length;
      to = to || length;
      if (to > length) {
        to = length;
      }
      for (var index = from; index < to; index++) {
        var item = collection[index];
        item.$index = indexes[item.$id] = index;
      }
    }

    if (initialCb && typeof initialCb == 'function') {
      collectionRef.once('value', initialCb);
    }

    collectionRef.on('child_added', function(data, prevId) {
      $timeout(function() {
        var index = getIndex(prevId);
        addChild(index, new angularFireItem(data, index));
        updateIndexes(index);
      });
    });

    collectionRef.on('child_removed', function(data) {
      $timeout(function() {
        var id = data.name();
        var pos = indexes[id];
        removeChild(id);
        updateIndexes(pos);
      });
    });

    collectionRef.on('child_changed', function(data, prevId) {
      $timeout(function() {
        var index = indexes[data.name()];
        var newIndex = getIndex(prevId);
        var item = new angularFireItem(data, index);
        
        updateChild(index, item);
        if (newIndex !== index) {
          moveChild(index, newIndex, item);
        }
      });
    });

    collectionRef.on('child_moved', function(ref, prevId) {
      $timeout(function() {
        var oldIndex = indexes[ref.name()];
        var newIndex = getIndex(prevId);
        var item = collection[oldIndex];
        moveChild(oldIndex, newIndex, item);
      });
    });

    collection.add = function(item, cb) {
      var ref;
      if (!cb) {
        ref = collectionRef.ref().push(item);
      } else {
        ref = collectionRef.ref().push(item, cb);
      }
      return ref.name();
    };
    collection.remove = function(itemOrId) {
      var item = angular.isString(itemOrId) ? collection[indexes[itemOrId]] : itemOrId;
      item.$ref.remove();
    };

    collection.update = function(itemOrId) {
      var item = angular.isString(itemOrId) ? collection[indexes[itemOrId]] : itemOrId;
      var copy = {};
      angular.forEach(item, function(value, key) {
        if (key.indexOf('$') !== 0) {
          copy[key] = value;
        }
      });
      item.$ref.set(copy);
    };

    return collection;
  };
}]);

// Defines the `angularFireAuth` service that provides authentication support
// for AngularFire.
angular.module("firebase").factory("angularFireAuth", [
   "$rootScope", "$parse", "$timeout", "$location", "$route", "$q",
   function($rootScope, $parse, $timeout, $location, $route, $q) {
 
    // Helper function to extract claims from a JWT. Does *not* verify the
    // validity of the token.
    function deconstructJWT(token) {
      var segments = token.split(".");
      if (!segments instanceof Array || segments.length !== 3) {
        throw new Error("Invalid JWT");
      }
      var claims = segments[1];
      return JSON.parse(decodeURIComponent(escape(window.atob(claims))));
    }
 
    // Updates the provided model.
    function updateExpression(scope, name, val, cb) {
      if (name) {
        $timeout(function() {
          $parse(name).assign(scope, val);
          cb();
        });
      }
    }
 
    // A function to check whether the current path requires authentication,
    // and if so, whether a redirect to a login page is needed.
    function authRequiredRedirect(route, path, self) {
      if (route.authRequired && !self._authenticated){
        if (route.pathTo === undefined) {
          self._redirectTo = $location.path();
        } else {
          self._redirectTo = route.pathTo === path ? "/" : route.pathTo;
        }
        $location.replace();
        $location.path(path);
      }
    }
 
    return {
      // Initializes the authentication service. Takes a Firebase URL and
      // an options object, that may contain the following properties:
      //
      // * `scope`: The scope to which user authentication status will be
      // bound to. Defaults to `$rootScope` if not provided.
      // * `name`: Name of the model to which user auth state is bound.
      // * `callback`: A function that will be called when there is a change
      // in authentication state.
      // * `path`: The path to which the user will be redirected if the
      // `authRequired` property was set to true in the `$routeProvider`, and
      // the user isn't logged in.
      // * `simple`: AngularFireAuth requires inclusion of the
      // `firebase-simple-login.js` file by default. If this value is set to
      // false, this requirement is waived, but only custom login functionality
      // will be enabled.
      initialize: function(url, options) {
        var self = this;
 
        options = options || {};
        this._scope = $rootScope;
        if (options.scope) {
          this._scope = options.scope;
        }
        if (options.name) {
          this._name = options.name;
        }
        this._cb = function(){};
        if (options.callback && typeof options.callback === "function") {
          this._cb = options.callback;
        }
 
        this._redirectTo = null;
        this._authenticated = false;
        if (options.path) {
          // Check if the current page requires authentication.
          if ($route.current) {
            authRequiredRedirect($route.current, options.path, self);
          }
          // Set up a handler for all future route changes, so we can check
          // if authentication is required.
          $rootScope.$on("$routeChangeStart", function(e, next) {
            authRequiredRedirect(next, options.path, self);
          });
        }
 
        // Initialize user authentication state to `null`.
        this._ref = new Firebase(url);
        if (options.simple && options.simple === false) {
          updateExpression(this._scope, this._name, null);
          return;
        }
 
        // Initialize Simple Login.
        if (!window.FirebaseSimpleLogin) {
          var err = new Error("FirebaseSimpleLogin undefined, " +
            "did you include firebase-simple-login.js?");
          $rootScope.$broadcast("angularFireAuth:error", err);
          return;
        }
        var client = new FirebaseSimpleLogin(this._ref, function(err, user) {
          self._cb(err, user);
          if (err) {
            $rootScope.$broadcast("angularFireAuth:error", err);
          } else if (user) {
            self._loggedIn(user)
          } else {
            self._loggedOut();
          }
        });
        this._authClient = client;
      },
 
      // The login method takes a provider (for Simple Login) or a token
      // (for Custom Login) and authenticates the Firebase URL with which
      // the service was initialized.
      login: function(tokenOrProvider, options) {
        var promise = this._watchForLogin();
        switch (tokenOrProvider) {
        case "github":
        case "persona":
        case "twitter":
        case "facebook":
        case "password":
          if (!this._authClient) {
            var err = new Error("Simple Login not initialized");
            $rootScope.$broadcast("angularFireAuth:error", err);
          } else {
            this._authClient.login(tokenOrProvider, options);
          }
          break;
        // A token was provided, so initialize custom login.
        default:
          var claims, self = this;
          try {
            // Extract claims and update user auth state to include them.
            claims = deconstructJWT(tokenOrProvider);
            this._ref.auth(tokenOrProvider, function(err) {
              if (err) {
                $rootScope.$broadcast("angularFireAuth:error", err);
              } else {
                self._loggedIn(claims);
              }
            });
          } catch(e) {
            $rootScope.$broadcast("angularFireAuth:error", e)
          }
        }
        return promise;
      },
 
      // Function cb receives a Simple Login user object
      createUser: function(email, password, cb){
        var self = this;
        this._authClient.createUser(email, password, function(err, user){
          try {
            if (err) {
              $rootScope.$broadcast("angularFireAuth:error", err);
            } else {
              self._loggedIn(user);
            }
          } catch(e) {
            $rootScope.$broadcast("angularFireAuth:error", e);
          }
          if (cb) {
            $timeout(function(){
              cb(user);
            });
          }
        });
      },
 
      // Unauthenticate the Firebase reference.
      logout: function() {
        if (this._authClient) {
          this._authClient.logout();
        } else {
          this._ref.unauth();
          this._loggedOut();
        }
      },
 
      // Common function to trigger a login event on the root scope.
      _loggedIn: function(user) {
        var self = this;
        this._authenticated = true;
        updateExpression(this._scope, this._name, user, function() {
          $rootScope.$broadcast("angularFireAuth:login", user);
          if (self._redirectTo) {
            $location.replace();
            $location.path(self._redirectTo);
            self._redirectTo = null;
          }
        });
      },
 
      // Common function to trigger a logout event on the root scope.
      _loggedOut: function() {
        this._authenticated = false;
        updateExpression(this._scope, this._name, null, function() {
          $rootScope.$broadcast("angularFireAuth:logout");
        });
      },
 
      _watchForLogin: function() {
        var subs = [], def = $q.defer();
        function done(err, user) {
          // timeout is necessary because it a) allows the auth callbacks to take
          // effect (applying auth parms before this is invoked) and b) forces
          // $scope.apply(), which is necessary to make the promise resolve()
          // event actually get sent to the listeners
          $timeout(function() {
            if (err) {
              def.reject(err);
            } else {
              def.resolve(user);
            }
          });
          for (var i=0; i < subs.length; i++) {
            subs[i]();
          }
        }
        subs.push($rootScope.$on("angularFireAuth:login", function(evt, user) {
          done(null, user);
        }));
        subs.push($rootScope.$on("angularFireAuth:error", function(evt, err) {
          done(err, null);
        }));
        return def.promise;
      }
    }
  }
]);