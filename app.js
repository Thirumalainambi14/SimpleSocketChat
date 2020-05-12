const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
const rooms = {};

app.get('/', (req, res) => res.render('index', { rooms: rooms }));

app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/');
  }
  rooms[req.body.room] = { users: {} };
  res.redirect(req.body.room);

  //send message that new room is created
  io.emit('room-created', req.body.room);
})

app.get('/:room', (req, res) => {
  console.log('roomsss', req.params.room);

  if (rooms[req.params.room] === null) {
    return res.redirect('/');
  }
  res.render('room', { roomName: req.params.room });
})



io.on('connection', socket => {
  // socket.emit('chat-message', 'Hello World!');


  socket.on('send-chat-message', (room, message) => {
    // console.log(message);

    if (message.name === null) {
      message.name = "You"
    }
    socket.to(room).broadcast.emit('chat-message', { message, name: rooms[room].users[socket.id] });
  });

  socket.on('new-user', (room, name) => {
    socket.join(room);
    rooms[room].users[socket.id] = name;
    console.log('aaa', rooms[room]);

    socket.to(room).broadcast.emit('user-connected', name);
  });

  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.broadcast.emit('user-disconnected', rooms[room].users[socket.id]);
      // console.log(socket.id);
      delete rooms[room].users[socket.id];
    })
  })
});

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) {
      names.push(name);
    }
    return names

  }, [])
}

server.listen(3000, () => {
  console.log("listening on 3000");

})