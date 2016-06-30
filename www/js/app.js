angular.module('chat-app', ['ionic', 'firebase'])

.factory("FB", function() {
    // Initialize Firebase
    var config = {
        //Fill this config with your firebase 3 API
    };
    return firebase.initializeApp(config);
})

.controller("AppCtrl", ['FB', '$firebaseAuth', '$firebaseArray', '$scope', '$ionicScrollDelegate', function(FB, $firebaseAuth, $firebaseArray, $scope, $ionicScrollDelegate) {
    //Init firebaseAuth instance
    var Auth = $firebaseAuth();

    //Watch changes on Auth instance
    Auth.$onAuthStateChanged(function(authData) {
        if (authData) {
            console.log("signed in as:", authData.email);
            $scope.loggedInUser = authData;
        } else {
            console.log("signed out");
            $scope.loggedInUser = null;
        }
    });

    $scope.createUser = function(user) {
        Auth.$createUserWithEmailAndPassword(user.email, user.password)
            .then(function() {
                //user created successfully, then log them in
                return Auth.$signInWithEmailAndPassword(user.email, user.password)
            })
            .then(function(authData) {
                console.log("User created with data: ", authData);
            }).catch(function(error) {
                console.log("Error has occured: ", error);
            });
    }

    $scope.loginUser = function(user) {
        Auth.$signInWithEmailAndPassword(user.email, user.password)
            .then(function(authData) {
                console.log("Signed in as:", authData.uid);
                $scope.loggedInUser = authData;
            }).catch(function(error) {
                console.error("Authentication failed:", error);
            });
    }

    $scope.logout = function() {
        Auth.$signOut();
    }

    //init database location and bind firebase db messages to $scope.messages
    var Messages = FB.database().ref().child("messages");
    $scope.messages = $firebaseArray(Messages);

    $scope.addMessage = function(message) {
        if ($scope.loggedInUser) {
            $scope.messages.$add({
                email: $scope.loggedInUser.email,
                text: message.text
            });
            //Scroll to bottom when new message entered
            $ionicScrollDelegate.scrollBottom();
            message.text = "";
        }
    }

}])

.run(['$ionicPlatform', function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
}])
