import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Peer } from 'peerjs';

import { getMedia } from './mediaHelper';

const host = 'https://video-conference-server-ncpz.onrender.com';
// const host = 'http://localhost:80';

export const useSocketInitialization = (socketUsername) => {
  const [socket, setSocket] = useState(null);
  const [peer, setPeer] = useState(null);
  useEffect(() => {
    const newSocket = io(host);
    newSocket.username = socketUsername;
    newSocket.avatarUrl = `images/avatar${
      Math.floor(Math.random() * 5) + 1
    }.png`;
    newSocket.on('connect', () => {
      const newPeer = new Peer(newSocket.id);
      setPeer(newPeer);
    });
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);
  return { socket, setSocket, peer, setPeer };
};

export const useSetUsername = (socket, socketUsername) => {
  const [runSetUsername, setRunSetUsername] = useState(false);
  useEffect(() => {
    if (runSetUsername) {
      socket.username = socketUsername;
      setRunSetUsername(false);
    }
  }, [runSetUsername, socket, socketUsername]);
  return { runSetUsername, setRunSetUsername };
};

export const useSocketEventListener = (
  socket,
  peer,
  setPeersOnConference,
  setAvailableUsers,
  setAvailableRooms,
  setConferenceId,
  setCallOthersTriggered,
  setTransited,
  calls,
  setCalls
) => {
  useEffect(() => {
    socket?.on('receiveMessage', (msg, from) => {
      alert(`${msg} from ${from}`);
    });
    socket?.on('joinRoomAlert', (socketId, room) => {
      //
    });
    socket?.on('leaveRoomAlert', (socketId, room) => {
      alert(`${socketId} left the room ${room}`);
    });
    socket?.on('receivePeersOnConference', (peersOnConference) => {
      setPeersOnConference(peersOnConference);
    });
    socket?.on('receiveData', (data) => {
      setAvailableUsers(data.users);
      setAvailableRooms(data.rooms);
    });
    socket?.on('peerEndCall', (peerId) => {
      calls[peerId]?.close();
      setCalls((prev) =>
        Object.keys(prev)
          .filter((key) => key !== peerId)
          .reduce((obj, key) => ({ ...obj, [key]: prev[key] }), {})
      );
      setPeersOnConference((prev) => {
        if (Object.keys(prev).length === 1) {
          setCallOthersTriggered(false);
          setTransited(false);
          return {};
        }
        return Object.keys(prev)
          .filter((key) => key !== peerId)
          .reduce((obj, key) => ({ ...obj, [key]: prev[key] }), {});
      });
    });
    socket?.on('receiveCallOthersTriggered', (peerIds, room) => {
      setConferenceId(room);
      setCallOthersTriggered(true);
      setPeersOnConference((prev) =>
        peerIds.reduce((obj, key) => ({ ...obj, [key]: null }), {})
      );
    });
    socket?.on('leaveCallAlert', (leftPeerId) => {
      //
    });
    socket?.emit('fetchData');
    peer?.on('call', async (call) => {
      try {
        setTransited(true);
        const selfStream = await getMedia();
        setPeersOnConference((prev) => ({ ...prev, [peer.id]: selfStream }));
        call.answer(selfStream);
        call.on('stream', (remoteStream) => {
          setPeersOnConference((prev) => ({
            ...prev,
            [call.peer]: remoteStream,
          }));
        });
        call.on('close', () => {
          selfStream.getTracks().forEach((track) => track.stop());
        });
        call.on('error', (e) => console.log('error in peer call'));
      } catch (e) {
        console.log('error while receiving call');
      }
    });
  }, [socket, peer]);
};

export const useCallOthers = (
  peer,
  callOthersTriggered,
  peersOnConference,
  setPeersOnConference,
  setCalls,
  setTransited
) => {
  useEffect(() => {
    const callOthers = async () => {
      if (callOthersTriggered) {
        setTransited(true);
        const selfStream = await getMedia();
        setPeersOnConference((prev) => ({ ...prev, [peer.id]: selfStream }));
        for (const remotePeer in peersOnConference) {
          if (remotePeer === peer.id) continue;
          const call = peer.call(remotePeer, selfStream);
          call?.on('stream', (remoteStream) => {
            setPeersOnConference((prev) => ({
              ...prev,
              [remotePeer]: remoteStream,
            }));
          });
          call?.on('close', () => {
            selfStream.getTracks().forEach((track) => track.stop());
          });
          call?.on('error', (e) => console.log('error while on group call', e));
          setCalls((prev) => ({ ...prev, [remotePeer]: call }));
        }
      }
    };
    callOthers();
  }, [callOthersTriggered, peer]);
};
