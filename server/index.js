const http = require('http');
const express = require('express');
const serverless = require('serverless-http');
const { Server } = require('socket.io');

const { fetchData, fetchPeersOnConference } = require('./utils.js');

const port = process.env.PORT || 80;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://video-conference-client.vercel.app',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST'],
  },
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

  socket.on('callOthersTriggered', (room) => {
    const peersOnConference = fetchPeersOnConference(io, room);
    io.to(room).emit('receiveCallOthersTriggered', peersOnConference, room);
  });

  socket.on('endCall', (peerId, room) => {
    console.log('ended call by ', peerId, ' from ', room);
    socket.broadcast.to(room).emit('peerEndCall', peerId);
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
  //   console.log(${event} fired);
  //   const data = fetchData(io);
  //   console.log(data);
  //   io.emit('receiveData', data);
  // });
});

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'hello' });
});

app.use('/', router);

server.listen(port, () => {
  console.log(`Server running at port: ${port}`);
});

module.exports.handler = serverless(app);
