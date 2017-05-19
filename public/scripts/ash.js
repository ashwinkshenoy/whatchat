'use strict';

var app = angular.module('myApp', []);

// Directive
app.directive('scroll', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      scope.$watchCollection(attr.scroll, function(newVal) {
        $timeout(function() {
         element[0].scrollTop = element[0].scrollHeight;
        });
      });
    }
  }
});

// Controllers
app.controller('AppCtrl', function ($scope, socket) {

  $scope.contacts = [
    {
      'name': 'Neeraj',
      'room': 1234
    },
    {
      'name': 'Punith',
      'room': 5678
    },
    {
      'name': 'Ashwin',
      'room': 9876
    },
    {
      'name': 'Derek',
      'room': 5432
    },
    {
      'name': 'Prashanth',
      'room': 1012
    },
    {
      'name': 'Akhilesh',
      'room': 3456
    },
    {
      'name': 'Rajath',
      'room': 7890
    },
    {
      'name': 'Vikram',
      'room': 1111
    }
  ];

  var history = [];
  var contactHistory = [];
  var type;
  $scope.users = [];
  $scope.currentUser = '';
  socket.on('connect', function () { });



  // Initialization
  // $scope.initName
  // $scope.initRoom
  $scope.init = function (data) {
    $scope.initRoom = parseInt(data.room);
    for(var i=0; i<$scope.contacts.length; i++) {
      if($scope.contacts[i].room == $scope.initRoom) {
        $scope.initName = $scope.contacts[i].name;
      }
    }

    // Contacts - last message and time
    // var lastContact = [];
    // var lastContObj = {}
    // for(var i=0; i < $scope.contacts.length; i++) {
    //   var myroom = [];
    //   if($scope.initRoom != $scope.contacts[i].room){
    //     myroom.push($scope.initRoom);
    //     myroom.push($scope.contacts[i].room);
    //     // Sort myroom
    //     myroom.sort(function(a, b){return a - b});
    //     // Join myroom
    //     var newRoom = myroom.join("");
    //     lastContact.push(newRoom)
    //   }
    // }
    // console.log(lastContact);

    // Get message
    // for(var i=0; i < $scope.contacts.length; i++) {
    //   if($scope.initRoom != $scope.contacts[i].room){
    //     console.log(lastContact[i]);
    //     if(localStorage.getItem(lastContact[i]) != null){
    //       var data = JSON.parse(localStorage.getItem(lastContact[i]));
    //       var b = {
    //         'message': data[data.length-1].message,
    //         'time': data[data.length-1].time
    //       };
    //       console.log(b);
    //       $scope.contacts[i]['lastinteraction'] = b;
    //       // console.log($scope.contacts);
    //     }
    //   }
    // }

  }


  // on Update
  // on send/receive chat
  socket.on('updatechat', function (username, data) {
    var user = {};
    user.username = username;
    user.message = data;
    user.date = new Date().getTime();
    $scope.users.push(user);

    if(user.username != $scope.currentUser) {
      type = 'from';
    } else {
      type = 'to';
    }

    var b = {
      'message': data,
      'time': user.date,
      'type': type
    };
    history.push(b);
    localStorage.setItem($scope.roomtotal, JSON.stringify(history));
  });


  // On Room Creation (testing)
  socket.on('roomcreated', function (data) {
    socket.emit('adduser', data);
  });

  // $scope.createRoom = function (data) {
  //   $scope.currentUser = data.username;
  //   socket.emit('createroom', data);
  // }


  // on Joining Room
  // $scope.currentUser
  // $scope.currentUser
  // $scope.history
  $scope.joinRoom = function (data) {
    history = [];
    var mydata = {};
    $scope.users = [];
    var myroom = [];
    for(var i=0; i<$scope.contacts.length; i++) {
      if($scope.contacts[i].room == data) {
        myroom.push($scope.initRoom);
        myroom.push(data);
        // Sort myroom
        myroom.sort(function(a, b){return a - b});
        // Join myroom
        var newRoom = myroom.join("");
        // var sum = myroom.reduce(function(a, b) { return a + b; }, 0);
        mydata.username = $scope.contacts[i].name;
        mydata.room = newRoom;
        $scope.roomtotal = newRoom;
        $scope.history = JSON.parse(localStorage.getItem($scope.roomtotal));
      }
    }
    $scope.chattingWith = mydata.username;
    $scope.currentUser = mydata.username;
    console.log(mydata);
    socket.emit('createroom', mydata);
    // socket.emit('adduser', mydata);
  }

  $scope.doPost = function (message) {
    socket.emit('sendchat', message);
    $scope.message = '';
    $('.chat-txt-field').val('');
  }

  // $scope.history = JSON.parse(localStorage.getItem($scope.roomtotal));

  // $('.menu-splash').click(function(){
  //   $('.mob-contact').show();
  //   console.log('opened');
  // });

  // Menu
  $scope.menu = function() {
    $('.mob-contact').toggle();
    $('.overlay').toggle();
    console.log('opened');
  }
});


/* Services */
app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});
