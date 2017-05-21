var express = require('express');

var app = express();
app.set('port', process.env.PORT || 9000);
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = app.get('port');

app.use(express.static('public'));

server.listen(port, function () {
  console.log("Server listening on: http://localhost:%s", port);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/chat.html');
});

var usernames = {};
var rooms = [];

io.sockets.on('connection', function (socket) {

  socket.on('adduser', function (data) {
    var username = data.username;
    var room = data.room;

    if (rooms.indexOf(room) != -1) {
      socket.username = username;
      socket.room = room;
      usernames[username] = username;
      socket.join(room);
      // console.log('Joined room: '+ room);
    } else {
      socket.emit('updatechat', 'SERVER', 'Please enter valid code.');
    }
  });

  socket.on('createroom', function (data) {
    if (rooms.indexOf(data.room) == -1) {
      var new_room = data.room;
      rooms.push(new_room);
      data.room = new_room;
      console.log('Room Created: '+new_room);
      console.log(rooms);
      socket.emit('roomcreated', data);
    } else {
      socket.emit('roomcreated', data);
    }
  });

  socket.on('sendchat', function (data) {
    io.sockets.in(socket.room).emit('updatechat', socket.username, data.message, socket.room, data.senderId);
  });

  socket.on('disconnect', function () {
    delete usernames[socket.username];
    io.sockets.emit('updateusers', usernames);
    if (socket.username !== undefined) {
      socket.leave(socket.room);
    }
  });
});
