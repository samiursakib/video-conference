const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { fetchData } = require('./utils');

const port = process.env.PORT || 8080;

const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
  },
});

app.get('/', (req, res) => {
  res.send({ title: 'user connected' });
});

io.on('connection', (socket) => {
  console.log('new user connected: ', socket.id);
  const data = fetchData(io);
  io.emit('receiveData', data);

  socket.on('sendMessage', (msg, to) => {
    const from = socket.id;
    console.log('message from: ', from);
    socket.broadcast.to(to).emit('receiveMessage', msg, from);
  });

  socket.on('joinRoom', (room) => {
    socket.join(room);
    const data = fetchData(io);
    io.emit('receiveData', data);
    socket.broadcast.to(room).emit('joinRoomAlert', socket.id, room);
  });

  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    const data = fetchData(io);
    io.emit('receiveData', data);
    socket.broadcast.to(room).emit('leaveRoomAlert', socket.id, room);
  });

  socket.on('fetchData', () => {
    const data = fetchData(io);
    socket.emit('receiveData', data);
  });

  socket.on('forceDisconnect', () => {
    socket.disconnect(true);
  });

  socket.on('disconnect', () => {
    const data = fetchData(io);
    io.emit('receiveData', data);
    console.log('user has left from server', socket.id);
  });

  // ask a ques on github for cleaner way
  // socket.onAny((event) => {
  //   console.log(`${event} fired`);
  //   const data = fetchData(io);
  //   console.log(data);
  //   io.emit('receiveData', data);
  // });
});

server.listen(port, () => {
  console.log(`Server running at port: ${port}`);
});
