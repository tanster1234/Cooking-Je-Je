// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('cookingjeje', ['ionic', 'cookingjeje.controllers', 'cookingjeje.services', 'firebase', 'ion-datetime-picker', 'jett.ionic.filter.bar'])
  .config(function ($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom');
  })
  .constant('FirebaseUrl', "https://cookingjeje-334de.firebaseio.com")
  //.service('rootRef', ['FirebaseUrl', Firebase])


  .run(function ($ionicPlatform, $rootScope, $state) {

    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });

    $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
      if (error === "AUTH_REQUIRED") {
        console.log("Please login first");
        $state.go("login");
      }
    });

  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl',
        resolve: {
          // controller will not be loaded until $waitForSignIn resolves
          // Auth refers to our $firebaseAuth wrapper in the factory below
          "currentAuth": ["Auth", function (Auth) {
            // $waitForSignIn returns a promise so the resolve waits for it to complete
            return Auth.$waitForSignIn();
          }]
        }
      })

      .state('app.home', {
        url: '/home',
        resolve: {
          // controller will not be loaded until $requireSignIn resolves
          // Auth refers to our $firebaseAuth wrapper in the factory below
          "currentAuth": ["Auth", function (Auth) {
            // $requireSignIn returns a promise so the resolve waits for it to complete
            // If the promise is rejected, it will throw a $stateChangeError (see above)
            return Auth.$requireSignIn();
          }]
        },
        views: {
          'mainContent': {
            templateUrl: 'templates/home.html',
            controller: 'EventController'
          }
        }
      })

      .state('app.event', {
        url: '/event/:id',
        resolve: {
          "currentAuth": ["Auth", function (Auth) {
            return Auth.$requireSignIn();
          }]
        },
        views: {
          'mainContent': {
            templateUrl: 'templates/activity.html',
            controller: 'eventCtrl'
          }
        }
      })

      .state('app.createevents', {
        url: '/createevents',
        resolve: {
          "currentAuth": ["Auth", function (Auth) {
            return Auth.$requireSignIn();
          }]
        },
        views: {
          'mainContent': {
            templateUrl: 'templates/createevent.html',
            controller: 'CreateEventController'
          }
        }
      })

      .state('app.myinfo', {
        url: '/myinfo',
        resolve: {
          "currentAuth": ["Auth", function (Auth) {
            return Auth.$requireSignIn();
          }]
        },
        views: {
          'mainContent': {
            templateUrl: 'templates/myinfo.html',
            controller: 'myInfoCtrl'
          }
        }
      })

      .state('app.editInfo', {
        url: '/edit',
        resolve: {
          "currentAuth": ["Auth", function (Auth) {
            return Auth.$requireSignIn();
          }]
        },
        views: {
          'mainContent': {
            templateUrl: 'templates/editProfile.html',
            controller: 'myInfoCtrl'
          }
        }
      })

      .state('app.editEvent', {
        url: '/editEvent/:id',
        resolve: {
          "currentAuth": ["Auth", function (Auth) {
            return Auth.$requireSignIn();
          }]
        },
        views: {
          'mainContent': {
            templateUrl: 'templates/editEvent.html',
            controller: 'editEventCtrl'
          }
        }
      })

      .state('app.myevents', {
        url: '/myevents',
        resolve: {
          "currentAuth": ["Auth", function (Auth) {
            return Auth.$requireSignIn();
          }]
        },
        views: {
          'mainContent': {
            templateUrl: 'templates/myevents.html',
            controller: 'myeventsCtrl'
          }
        }
      })

      .state('app.joinedevents', {
        url: '/joinedevents',
        resolve: {
          "currentAuth": ["Auth", function (Auth) {
            return Auth.$requireSignIn();
          }]
        },
        views: {
          'mainContent': {
            templateUrl: 'templates/joinedevents.html',
            controller: 'joinedCtrl'
          }
        }
      })

      .state('app.likedevents', {
        url: '/likedevents',
        resolve: {
          "currentAuth": ["Auth", function (Auth) {
            return Auth.$requireSignIn();
          }]
        },
        views: {
          'mainContent': {
            templateUrl: 'templates/likedevents.html',
            controller: 'LikedEventController'
          }
        }
      })
      ;
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('login');
  })
