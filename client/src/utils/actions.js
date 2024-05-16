import { getMedia, setVideoRef } from './helper';

export const sendMediaTrackChangedControls = (socket, controls, to) => {
  socket.emit('sendMediaTrackChangedControls', controls, to);
};

export const sendMessage = (socket, msg, to, setMessage, setConversations) => {
  socket.emit('sendMessage', msg, to);
  setMessage('');
  setConversations((prev) => {
    const oldConversation = to in prev ? prev[to] : [];
    const newConversation = [
      ...oldConversation,
      {
        sender: socket.id,
        message: msg,
        time: new Date().toLocaleString(),
      },
    ];
    return { ...prev, [to]: newConversation };
  });
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

export const startCall = async (socket, conferenceId) => {
  try {
    socket.emit('callOthersTriggered', socket.id, conferenceId);
  } catch (e) {
    console.log('error while starting group call in catch block');
  }
};

export const endCall = (
  socket,
  calls,
  setCalls,
  conferenceId,
  setCallOthersTriggered,
  setPeersOnConference
) => {
  socket.emit('endCall', socket.id, conferenceId);
  for (let key in calls) {
    calls[key]?.close();
  }
  setCallOthersTriggered(false);
  setCalls({});
  setPeersOnConference({});
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

export const scrollToLastMessage = (elem) => {
  elem.current?.scrollIntoView({ behavior: 'smooth' });
};
