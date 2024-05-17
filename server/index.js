const http = require('http');
const express = require('express');
const serverless = require('serverless-http');
const { Server } = require('socket.io');

const {
  fetchData,
  fetchPeersOnConference,
  fetchSocketsData,
} = require('./utils.js');

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

io.on('connection', async (socket) => {
  console.log('new user connected: ', socket.id);
  socket.data.id = socket.id;
  socket.data.username = 'username';
  socket.data.controls = { audioTrackEnabled: true, videoTrackEnabled: true };
  const data = fetchData(io);
  const fetchedSocketsData = await fetchSocketsData(io);
  io.emit('receiveData', data);
  io.emit('updateData', fetchedSocketsData);

  socket.on('sendMessage', (msg, to) => {
    console.log('message from: ', socket.id);
    socket.broadcast.to(to).emit('receiveMessage', msg, socket.id, to);
  });

  socket.on('sendMediaTrackChangedControls', (controls, to) => {
    console.log('controls changed of ', socket.id, ' to ', controls);
    socket.data.controls = controls;
    socket.broadcast
      .to(to)
      .emit('receiveMediaTrackChangedControls', controls, socket.id, to);
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

  socket.on('callOthersTriggered', (socketId, conferenceId) => {
    const peersOnConference = fetchPeersOnConference(
      io,
      socketId,
      conferenceId
    );
    console.log('peersOnConference: ', peersOnConference);
    io.to(conferenceId).emit(
      'receiveCallOthersTriggered',
      peersOnConference,
      conferenceId,
      socketId
    );
  });

  socket.on('endCall', (peerId, room) => {
    console.log('ended call by ', peerId, ' from ', room);
    socket.broadcast.to(room).emit('peerEndCall', peerId);
  });

  socket.on('changeData', async (socketUsername) => {
    socket.data.id = socket.id;
    socket.data.username = socketUsername;
    // socket.data.controls = { audioTrackEnabled, videoTrackEnabled };
    const fetchedSocketsData = await fetchSocketsData(io);
    console.log(fetchedSocketsData);
    io.emit('updateData', fetchedSocketsData);
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
