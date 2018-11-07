'use strict';

angular.module('cookingjeje.services', ['firebase'])
    .constant("baseURL", "http://localhost:3000/")
    .service('refFactory', ['$firebaseArray', '$firebaseObject', '$firebaseAuth',
        function ($firebaseArray, $firebaseObject, $firebaseAuth) {
            var database = firebase.database();

            this.getEvents = function () {
                var ref = database.ref("/Events");
                return $firebaseArray(ref);
            };

            this.getEvent = function (eventId) {
                var ref = database.ref("/Events/" + eventId);
                return $firebaseObject(ref);
            };

            this.getUser = function (userId) {
                var ref = database.ref("/Users/" + userId);
                return $firebaseObject(ref);
            };

            this.getcurrentUser = function () {
                var user = $firebaseAuth().$getAuth();
                var userId = user.uid;
                var ref = database.ref("/Users/" + userId);
                return $firebaseObject(ref);
            };

            this.getJoinedEvents = function (userId) {
                var ref = database.ref("/ParticipantRel").orderByChild("user").equalTo(userId);
                return $firebaseArray(ref);
            };

            this.getMyEvents = function (userId) {
                var ref = database.ref("/Events").orderByChild("admin").equalTo(userId);
                return $firebaseArray(ref);
            };


            this.getParticipants = function (eventId) {
                var ref = database.ref("/ParticipantRel").orderByChild("event").equalTo(eventId);
                return $firebaseArray(ref);
            };

            this.getComments = function (eventId) {
                var ref = database.ref("/Comments").orderByChild("event").equalTo(eventId);
                return $firebaseArray(ref);
            };

            this.getJoinref = function () {
                var ref = database.ref("/ParticipantRel")
                return $firebaseArray(ref);
            };

            this.getCommentref = function () {
                var ref = database.ref("/Comments")
                return $firebaseArray(ref);
            };


            this.getLikesref = function () {
                var ref = database.ref("/Likes")
                return $firebaseArray(ref);
            };

            this.getLikedEvents = function (userId) {
                var ref = database.ref("/Likes").orderByChild("user").equalTo(userId);
                return $firebaseArray(ref);
            };

        }])

    .service('userTracker', ['$firebaseArray', function ($firebaseArray) {
        var database = firebase.database();
        //returns boolean wether user exists in database or not
        this.newUser = function (uid) {
            database.ref("/Users/" + userId);
        }
    }
    ])

    .factory('Auth', ['$firebaseAuth', function ($firebaseAuth) {
        return $firebaseAuth();
    }]);
