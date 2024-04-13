import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Peer } from 'peerjs';

import { getMedia } from './helper';

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
      socket.emit('changeData', socketUsername);
      setRunSetUsername(false);
    }
  }, [runSetUsername, socket, socketUsername]);
  return { runSetUsername, setRunSetUsername };
};

export const useSocketEventListener = (
  socket,
  peer,
  setPeersOnConference,
  setPeerIdsOnConference,
  setAvailableUsers,
  setAvailableRooms,
  setConferenceId,
  setCallOthersTriggered,
  setTransited,
  calls,
  setCalls,
  setConversations,
  setSocketsData
) => {
  useEffect(() => {
    let ignore = false;
    socket?.on('receiveMessage', (msg, from, room) => {
      let temp = socket.id === room ? from : room;
      if (!ignore) {
        setConversations((prev) => {
          const oldConversation = temp in prev ? prev[temp] : [];
          const newConversation = [
            ...oldConversation,
            {
              sender: from,
              message: msg,
              time: new Date().toLocaleString(),
            },
          ];
          return { ...prev, [temp]: newConversation };
        });
      }
    });
    socket?.on('joinRoomAlert', (socketId, room) => {
      //
    });
    socket?.on('leaveRoomAlert', (socketId, room) => {
      alert(`${socketId} left the room ${room}`);
    });
    socket?.on('receivePeersOnConference', (peersOnConference) => {
      // setPeersOnConference(peersOnConference);
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
    socket?.on(
      'receiveCallOthersTriggered',
      (peerIds, conferenceId, caller) => {
        console.log('peerIds: ', peerIds);
        setConferenceId(socket.id === conferenceId ? caller : conferenceId);
        setCallOthersTriggered(true);
        setPeerIdsOnConference([...peerIds]);
      }
    );
    socket?.on('leaveCallAlert', (leftPeerId) => {
      //
    });
    socket?.on('updateData', (fetchedSocketsData) => {
      setSocketsData(fetchedSocketsData);
      // console.log('effect: ', fetchedSocketsData);
    });
    socket?.emit('fetchData');
    peer?.on('call', async (call) => {
      try {
        setTransited(true);
        const selfStream = await getMedia();
        console.log(peer.id, selfStream);
        setPeersOnConference((prev) => ({ ...prev, [peer.id]: selfStream }));
        call.answer(selfStream);
        call.on('stream', (remoteStream) => {
          console.log(call.peer, remoteStream);
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
    return () => {
      ignore = true;
    };
  }, [socket, peer]);
};

export const useCallOthers = (
  peer,
  callOthersTriggered,
  peersOnConference,
  peerIdsOnConference,
  setPeersOnConference,
  setCalls,
  setTransited
) => {
  useEffect(() => {
    const callOthers = async () => {
      if (callOthersTriggered) {
        setTransited(true);
        const selfStream = await getMedia();
        // console.log(peer.id, selfStream);
        setPeersOnConference((prev) => ({ ...prev, [peer.id]: selfStream }));
        // console.log('peerIdsOnConference: ', peerIdsOnConference);
        for (const remotePeer of peerIdsOnConference) {
          if (remotePeer === peer.id) continue;
          const call = peer.call(remotePeer, selfStream);
          call?.on('stream', (remoteStream) => {
            // console.log(remotePeer, remoteStream);
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
