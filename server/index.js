const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { PeerServer } = require('peer');
const serverless = require('serverless-http');
const { fetchData, fetchPeersOnConference } = require('./utils');

const port = process.env.PORT || 80;

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
const peerServer = new PeerServer({
  port: 9000,
  path: '/',
});

// app.use(
//   cors({
//     origin: 'https://video-conference-client.vercel.app',
//     credentials: true,
//   })
// );

app.options('/', function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.end();
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

  socket.on('callOthersTriggered', (room) => {
    const peersOnConference = fetchPeersOnConference(io, room);
    io.to(room).emit('receiveCallOthersTriggered', peersOnConference, room);
  });

  socket.on('leaveCall', (room, socketId) => {
    console.log(socketId);
    socket.broadcast.to(room).emit('leaveCallAlert', socket.id, room);
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

module.exports.handler = serverless(app);
