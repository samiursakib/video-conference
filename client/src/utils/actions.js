import { getMedia, setVideoRef } from './mediaHelper';

export const sendMessage = (socket, msg, to, setMessage) => {
  socket.emit('sendMessage', msg, to);
  setMessage('');
};

export const joinRoom = (socket, room, setJoinedRooms) => {
  socket.emit('joinRoom', room);
  socket.emit('fetchPeersOnConference', room);
  setJoinedRooms((prev) => [...prev, room]);
};

export const leaveRoom = (socket, room, setJoinedRooms) => {
  socket.emit('leaveRoom', room);
  socket.emit('fetchPeersOnConference', room);
  setJoinedRooms((prev) => prev.filter((r) => room !== r));
};

export const disconnectSocket = (socket) => {
  socket.emit('forceDisconnect');
};

export const reconnectSocket = (socket) => {
  socket.socket.connect();
};

export const startPrivateCall = async (
  peer,
  conferenceId,
  selfVideoRef,
  setIsAnswered,
  remoteVideoRef,
  setCall
) => {
  try {
    const selfStream = await getMedia();
    setVideoRef(selfVideoRef, selfStream);
    const newCall = peer.call(conferenceId, selfStream);
    setIsAnswered(true);
    newCall.on('stream', (remoteStream) => {
      setVideoRef(remoteVideoRef, remoteStream);
    });
    newCall.on('close', () => {
      remoteVideoRef.current.srcObject = null;
      selfVideoRef.current.srcObject = null;
      setIsAnswered(false);
    });
    newCall.on('error', (e) => console.log('error in starting call', e));
    setCall(newCall);
  } catch (e) {
    console.log('error while trying to get media stream');
  }
};

export const endPrivateCall = (call, peerCall) => {
  call?.close();
  peerCall?.close();
  console.log('private call ended');
};

export const startGroupCall = async (socket, conferenceId) => {
  try {
    socket.emit('callOthersTriggered', conferenceId);
    // setIsAnswered(true);
    // socket.emit('fetchPeersOnConference', conferenceId);
    // const selfStream = await getMedia();
    // setPeersOnConference((prev) => ({
    //   ...prev,
    //   [socket.id]: selfStream,
    // }));
    // socket.emit('sendStream', conferenceId, { [socket.id]: selfStream });
    // const array = Object.keys(peersOnConference);
    // for (let i = 0; i < array.length - 1; i++) {
    //   for (let j = i + 1; j < array.length; j++) {
    //     const call = peer.call(array[i], selfStream);
    //     call.on('stream', (remoteStream) => {
    //       // setPeersOnConference((prev) => ({
    //       //   ...prev,
    //       //   [remotePeer]: remoteStream,
    //       // }));
    //     });
    //     call.on('error', (e) => console.log('error starting group call'));
    //   }
    // }
  } catch (e) {
    console.log('error while starting group call in catch block');
  }
};

export const endGroupCall = (
  calls,
  peerCalls,
  setCallOthersTriggered,
  setPeersOnConference
) => {
  console.log('ending group call from self');
  for (let key in calls) {
    calls[key]?.close();
  }
  for (let key in peerCalls) {
    peerCalls[key]?.close();
  }
  setCallOthersTriggered(false);
  setPeersOnConference({});
  // socket.emit('leaveCall', conferenceId, socket.id);
};
