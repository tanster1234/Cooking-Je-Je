angular.module('cookingjeje.controllers', ['firebase'])

  .controller('AppCtrl', ['refFactory', '$scope', '$ionicModal', '$state', 'Auth',
    function (refFactory, $scope, $ionicModal, $state, Auth) {

      // With the new view caching in Ionic, Controllers are only called
      // when they are recreated or on app start, instead of every page change.
      // To listen for when this page is active (for example, to refresh data),
      // listen for the $ionicView.enter event:
      //$scope.$on('$ionicView.enter', function(e) {
      //});
      $scope.platform = ionic.Platform;
      // Form data for the login modal
      $scope.event = {
        name: "",
        description: "",
        admin: "",
        maxParticipants: 25,
        image: 'img/buffet.png',
        location: "",
        date: new Date(),
        participants: "",
        categories: ""
      };

      $scope.logout = function () {
        Auth.$signOut();
      }

    }])

  .controller('CreateEventController', ['$scope', '$state', 'refFactory', '$ionicPopup', '$firebaseAuth',
    function ($scope, $state, refFactory, $ionicPopup, $firebaseAuth) {
      var admin = firebase.auth().currentUser;
      console.log(admin);

      $scope.event = {
        name: "",
        description: "",
        admin: admin.uid,
        adminName: admin.displayName,
        maxParticipants: 25,
        image: 'img/buffet.png',
        location: "",
        date: new Date(),
        categories: ""
      };


      // Perform the login action when the user submits the login form
      $scope.doCreation = function () {
        $scope.event.date = $scope.event.date.toString();
        refFactory.getEvents().$add($scope.event).then(function (ref) {
          // $scope.join();
          $state.go('app.myevents', null, { reload: true });
          eventId = ref.path.o[1];
          finishUpload();
        })
        console.log($scope.event);
      };

      $scope.join = function () {
        refFactory.getJoinref().$add({
          event: $stateParams.id,
          user: currentUser.uid
        })
      }

      var storage = firebase.storage();
      var database = firebase.database();
      var file = {};
      $scope.upload = function () {
        var fileUpload = document.getElementById('fileUpload');
        fileUpload.addEventListener('change', function (e) {
          //get file
          file = e.target.files[0];
          // create storage ref
        });
      }

      function finishUpload() {
        var profileRef = storage.ref('/' + eventId + ".png");
        // upload
        var task = profileRef.put(file);

        // handle progress bar
        task.on('state_changed',
          function progress(snapshot) {

          },
          function error(err) {

          },
          function complete() {
            storage.ref().child(eventId + '.png').getDownloadURL().then(function (url) {
              database.ref('Events/' + eventId).update({ image: url });
            }).catch(function (error) {
              console.log(error);
            });
            console.log('Upload Complete!');
          });
      }


    }])

  .controller('EventController', ['$scope', '$state', 'refFactory', '$ionicPopup', '$ionicFilterBar', function ($scope, $state, refFactory, $ionicPopup, $ionicFilterBar) {

    $scope.shouldShowDelete = false;
    $scope.showMenu = false;
    $scope.message = "Loading ...";
    $scope.events = refFactory.getEvents();
    $scope.showMenu = true;
    var vm = this;



    $scope.toggleDelete = function () {
      $scope.shouldShowDelete = !$scope.shouldShowDelete;
      console.log($scope.shouldShowDelete);
    }

    $scope.deleteEvent = function (eventid) {
      var confirmPopup = $ionicPopup.confirm({
        title: '<h3>Confirm Delete</h3>',
        template: '<p>Are you sure you want to delete this event?</p>'
      });

      confirmPopup.then(function (res) {
        if (res) {
          $scope.events.$remove(eventid);
          $state.go($state.current, null, { reload: true });
        }
      });

      $scope.shouldShowDelete = false;
    }

     $scope.showFilterBar = function () {
     console.log('Ich bin im showFilterBar');

          filterBarInstance = $ionicFilterBar.show({

            items: $scope.events,
            update: function (filteredItems) {
            console.log(filteredItems);
              $scope.events = filteredItems;
            },
            filterProperties: 'name'
          });


        };

  }])
  //login controller
  .controller('LoginCtrl', ["refFactory", '$scope', '$state', '$firebaseAuth',
    function (refFactory, $scope, $state, $firebaseAuth) {
      var auth = $firebaseAuth();
      var database = firebase.database();

      $scope.loginWithFacebook = function () {

        auth.$signInWithPopup('facebook').then(function (result) {
        });

        auth.$onAuthStateChanged(function (user) {
          if (user) {
            console.log("user");
            var ref = database.ref("/Users");
            ref.once('value', function (snapshot) {
              if (!snapshot.hasChild(user.uid)) {
                console.log("user should be redirected to userprofile");
                database.ref('Users/' + user.uid).set({
                  name: user.displayName,
                  email: (user.email ? (user.email) : null),
                  profile_picture: user.photoURL,
                  description: "Hi there! My name is " + user.displayName
                });
                $state.go('app.myinfo');
              }
            });
            $state.go('app.home');

          } else {
            console.log("Signed out");
          }
        });
      };
    }])

  .controller('eventCtrl', ['$scope', '$stateParams', 'Auth', '$firebaseArray', 'refFactory', '$firebaseObject', '$ionicPopup', '$rootScope',
    function ($scope, $stateParams, Auth, $firebaseArray, refFactory, $firebaseObject, $ionicPopup, $rootScope) {
      //elements that will be stored in user
      start($stateParams.id);
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        start(toParams.id);

      });

      var currentUser, relid, likeREF;
      function start(params) {
        $scope.event = refFactory.getEvent(params);
        currentUser = Auth.$getAuth();
        relid = "";
        //display button only if is admin

        $scope.event.$loaded().then(function () {
          $scope.isAdmin = currentUser.uid == $scope.event.admin;
          console.log("isAdmin :" + $scope.isAdmin);
        })
        $scope.hasJoined = false;

        likeREF = $firebaseArray(firebase.database().ref("/Likes/").orderByChild("user"));
        likeREF.$watch(function (event) {
          $scope.hasLiked = false;
          likeREF.$loaded().then(function (like) {
            like.forEach(function (element) {
              if (element.event == params) {
                $scope.hasLiked = true;
              }
            })
          })
        })

        refFactory.getParticipants(params).$watch(function (event) {
          $scope.hasJoined = false;
          $scope.participants = [];
          refFactory.getParticipants(params).$loaded().then(function (participants) {
            participants.forEach(function (participant, index) {
              if (participant.user == currentUser.uid) {
                $scope.hasJoined = true;
                relid = participant.$id;
              }
              $scope.participants.push(refFactory.getUser(participant.user));
            });
          });
        })

        refFactory.getComments(params).$watch(function (event) {
          $scope.comments = refFactory.getComments(params);
        });

        $scope.like = function () {
          refFactory.getLikesref().$add({
            event: params,
            user: currentUser.uid
          })
        }

        $scope.checkLike = function () {
          if ($scope.hasLiked) {
            return "Dislike"
          } else {
            return "Like"
          }
        };

        $scope.checkJoin = function () {
          if ($scope.hasJoined) {
            return "Leave"
          } else {
            return "Join"
          }
        };



        $scope.unlike = function () {
          likeREF.$loaded().then(function (like) {
            like.forEach(function (element) {
              if (element.event == params) {
                $firebaseObject(firebase.database().ref("/Likes/" + element.$id)).$remove();
              }
            })
          });
        }

        $scope.join = function () {
          refFactory.getJoinref().$add({
            event: params,
            user: currentUser.uid
          })
        }

        $scope.leave = function () {
          $firebaseObject(firebase.database().ref("/ParticipantRel/" + relid)).$remove();
        }

        $scope.checkJoinOnClick = function () {
          if ($scope.hasJoined) {
            $scope.leave();
          } else {
            $scope.join();
          }
        };


        $scope.checkLikeOnClick = function () {
          if ($scope.hasLiked) {
            $scope.unlike();
          } else {
            $scope.like();
          }
        };

      }




      $scope.showPopup = function () {
        $scope.data = {}

        // Custom popup
        var myPopup = $ionicPopup.show({
          template: '<input type = "text" ng-model = "data.model">',
          title: 'Add your comment',
          scope: $scope,

          buttons: [
            { text: 'Cancel' }, {
              text: '<b>Save</b>',
              type: 'button-positive',
              onTap: function (e) {

                if (!$scope.data.model) {
                  //don't allow the user to close unless he enters model...
                  e.preventDefault();
                } else {
                  return $scope.data.model;
                }
              }
            }
          ]


        });

        myPopup.then(function (res) {
          refFactory.getCommentref().$add({
            event: $stateParams.id,
            text: res,
            creator: currentUser.uid,
            creatorName: currentUser.displayName,
            created: new Date().toString()
          });
        });
      };

    }])

  .controller('joinedCtrl', ['$scope', '$stateParams', 'Auth', '$firebaseArray', 'refFactory',
    function ($scope, $stateParams, Auth, firebaseArray, refFactory) {
      var user = firebase.auth().currentUser;
      var joinedEvents = refFactory.getJoinedEvents(user.uid);
      joinedEvents.$watch(function (event) {
        $scope.events = [];
        joinedEvents.forEach(function (value) {
          refFactory.getEvent(value.event).$loaded().then(function (event) {
            $scope.events.push(event);
          })
        });
      })
    }])

  .controller('myeventsCtrl', ['$scope', '$stateParams', 'Auth', '$firebaseArray', 'refFactory',
    function ($scope, $stateParams, Auth, firebaseArray, refFactory) {

      var user = firebase.auth().currentUser;
      var myevents = refFactory.getMyEvents(user.uid);

      myevents.$watch(function (event) {
        $scope.events = myevents;
      })

    }])


  .controller('LikedEventController', ['$scope', '$state', 'refFactory', '$firebaseArray',
    function ($scope, $state, refFactory, baseURL, $ionicPopup, $firebaseArray) {
      var user = firebase.auth().currentUser;
      $scope.events = [];
      var likedEvents = refFactory.getLikedEvents(user.uid);
      likedEvents.$watch(function (event) {
        $scope.events = [];
        likedEvents.forEach(function (id) {
          refFactory.getEvent(id.event).$loaded().then(function (event) {
            $scope.events.push(event);
          })
        });
      })
    }])

  .controller('myInfoCtrl', ['$scope', '$state', 'Auth', '$firebaseArray', 'refFactory',
    function ($scope, $state, Auth, firebaseArray, refFactory) {
      //elements that will be stored in user
      $scope.user = refFactory.getcurrentUser();
      $scope.update = function () {
        $scope.user.$save();
        $state.go("app.myinfo");
      }

    }])

  .controller('editEventCtrl', ['$scope', '$state', 'refFactory', '$ionicPopup', '$firebaseAuth', '$stateParams',
    function ($scope, $state, refFactory, $ionicPopup, $firebaseAuth, $stateParams) {

      $scope.event = refFactory.getEvent($stateParams.id);
      console.log($scope.event);
      // Perform the login action when the user submits the login form
      $scope.submit = function () {
        finishUpload();
        $scope.event.$save();

        $state.go('app.myevents');
      }

      $scope.deleteEvent = function () {
           var confirmPopup = $ionicPopup.confirm({
             title: 'Delete event?',
             template: 'Are you sure you want to delete this event?'
           });

           confirmPopup.then(function(res) {
             if(res) {
                       $scope.event.$remove();
                       $state.go('app.myevents');
             } else {
               console.log('Deleve event canceled');
             }
           });
         };

      var eventId = $stateParams.id;
      var storage = firebase.storage();
      var database = firebase.database();
      var file = {};
      $scope.upload = function () {
        var fileUpload = document.getElementById('fileUpload');
        fileUpload.addEventListener('change', function (e) {
          //get file
          file = e.target.files[0];
          // create storage ref
        });
      }

      function finishUpload() {
        var profileRef = storage.ref('/' + eventId + ".png");
        // upload
        var task = profileRef.put(file);

        // handle progress bar
        task.on('state_changed',
          function progress(snapshot) {

          },
          function error(err) {

          },
          function complete() {
            storage.ref().child(eventId + '.png').getDownloadURL().then(function (url) {
              database.ref('Events/' + eventId).update({ image: url });
            }).catch(function (error) {
              console.log(error);
            });
            console.log('Upload Complete!');
          });
      }

    }])
