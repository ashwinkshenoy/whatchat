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
      'id': 1234
    },
    {
      'name': 'Punith',
      'id': 5678
    },
    {
      'name': 'Ashwin',
      'id': 9876
    },
    {
      'name': 'Derek',
      'id': 5432
    },
    {
      'name': 'Prashanth',
      'id': 1012
    },
    {
      'name': 'Akhilesh',
      'id': 3456
    },
    {
      'name': 'Rajath',
      'id': 7890
    },
    {
      'name': 'Vikram',
      'id': 1111
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
    $scope.initRoom = parseInt(data.id);
    for(var i=0; i<$scope.contacts.length; i++) {
      if($scope.contacts[i].id == $scope.initRoom) {
        $scope.initName = $scope.contacts[i].name;
      }
    }

    // Contacts - last message and time (testing)
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
  socket.on('updatechat', function (username, data, room) {
    var user = {};
    user.date = new Date().getTime();
    if(room == $scope.roomtotal) {
      user.username = username;
      user.message = data;
      $scope.users.push(user);
      if(user.username != $scope.currentUser) {
        type = 'from';
      } else {
        type = 'to';
      }

      history = [];
      if(localStorage.getItem($scope.roomtotal) != null){
        var pastHist = JSON.parse(localStorage.getItem($scope.roomtotal));
        for(var j=0; j<pastHist.length; j++) {
          history.push(pastHist[j]);
        }
      }

      var b = {
        'message': data,
        'date': user.date,
        'type': type
      };
      history.push(b);
      localStorage.setItem($scope.roomtotal, JSON.stringify(history));
    } else {
      history = [];
      if(localStorage.getItem(room) != null){
        var pastHist = JSON.parse(localStorage.getItem(room));
        for(var j=0; j<pastHist.length; j++) {
          history.push(pastHist[j]);
        }
      }
      var b = {
        'message': data,
        'date': user.date,
        'type': 'from'
      };
      history.push(b);
      localStorage.setItem(room, JSON.stringify(history));
    }
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
    $scope.selected = data;
    for(var i=0; i<$scope.contacts.length; i++) {
      if($scope.contacts[i].id == data) {
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
        // Push past History
        if(localStorage.getItem($scope.roomtotal) != null){
          var pastHist = JSON.parse(localStorage.getItem($scope.roomtotal));
          for(var j=0; j<pastHist.length; j++) {
            history.push(pastHist[j]);
          }
        }
        // set $scope.history
        $scope.history = JSON.parse(localStorage.getItem($scope.roomtotal));
      }
    }
    setTimeout(function(){
      $('.white-chat-box').scrollTop($('.white-chat-box')[0].scrollHeight);
    }, 0);
    $scope.chattingWith = mydata.username;
    $scope.currentUser = mydata.username;
    console.log(mydata);
    socket.emit('createroom', mydata);
    // socket.emit('adduser', mydata);
  }


  // on Post send chat
  $scope.doPost = function (message) {
    socket.emit('sendchat', message);
    $scope.message = '';
    $('.chat-txt-field').val('');
  }

  // Menu
  $scope.menu = function() {
    var el = $('.mob-contact');
    if (el.hasClass('toggled')){
      $('.mob-contact').removeClass('toggled');
      $('.overlay').css('display','none');
      $('body').css('overflow','auto');
    } else {
      $('.mob-contact').addClass('toggled');
      $('.overlay').css('display','block');
      $('body').css('overflow','hidden');
    }
  }

});
// Controller end


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
