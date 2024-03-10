import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Peer } from 'peerjs';

import { getMedia, setVideoRef } from './mediaHelper';

export const useSocketInitialization = (socketUsername) => {
  const [socket, setSocket] = useState(null);
  const [peer, setPeer] = useState(null);
  useEffect(() => {
    const newSocket = io('http://localhost:80');
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
      // setSocketUsername('');
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
  setIsAnswered,
  selfVideoRef,
  remoteVideoRef,
  setPeerCall,
  setPeerCalls
) => {
  useEffect(() => {
    socket?.on('receiveMessage', (msg, from) => {
      alert(`${msg} from ${from}`);
    });
    socket?.on('joinRoomAlert', (socketId, room) => {
      // alert(`${socketId} joined the room ${room}`);
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
    socket?.on('receiveStream', (s) =>
      setPeersOnConference((prev) => ({ ...prev, ...s }))
    );
    socket?.on('receiveCallOthersTriggered', (peerIds, room) => {
      // alert('call triggered');
      setConferenceId(room);
      setCallOthersTriggered(true);
      setPeersOnConference((prev) =>
        peerIds.reduce((obj, key) => ({ ...obj, [key]: null }), {})
      );
    });
    socket?.on('leaveCallAlert', (leftPeerId) => {
      // const restPeers = { ...peersOnConference };
      // console.log('peer left : ', leftPeerId);
      // console.log(peersOnConference[leftPeerId]);
      // console.log(peersOnConference);
      // console.log(Object.keys(restPeers));
      // delete restPeers[leftPeerId];
      // console.log(Object.keys(restPeers));
      // setPeersOnConference((prev) =>
      //   Object.keys(peersOnConference).reduce(
      //     (obj, key) =>
      //       key === leftPeerId
      //         ? { ...obj, [key]: 'absent' }
      //         : { ...obj, [key]: 'present' },
      //     {}
      //   )
      // );
    });
    socket?.emit('fetchData');
    peer?.on('call', async (call) => {
      try {
        setTransited(true);
        setIsAnswered(true);
        const selfStream = await getMedia();
        setPeersOnConference((prev) => ({ ...prev, [peer.id]: selfStream }));
        // if (!groupCall) {
        // setConferenceId(call.peer); //uncomment for private call
        // setVideoRef(selfVideoRef, selfStream); //uncomment for private call
        // }
        call.answer(selfStream);
        call.on('stream', (remoteStream) => {
          setPeersOnConference((prev) => ({
            ...prev,
            [call.peer]: remoteStream,
          }));
          // if (!groupCall) {
          // setVideoRef(remoteVideoRef, remoteStream); //uncomment for private call
          // }
        });
        call.on('close', () => {
          // if (callOthersTriggered) {
          // let restPeers = peersOnConference;
          // delete restPeers[call.peer];
          // setCalls({});
          // setPeerCalls({});
          // setPeersOnConference({});
          setIsAnswered(false);
          selfStream.getTracks().forEach((track) => track.stop());
          // if (!groupCall) {
          // selfVideoRef.current.srcObject = null; //uncomment for private call
          // remoteVideoRef.current.srcObject = null; //uncomment for private call
          // }
        });
        call.on('error', (e) => console.log('error in peer call'));
        setPeerCall(call);
        setPeerCalls((prev) => ({ ...prev, [call.peer]: call }));
      } catch (e) {
        console.log('error while receiving call');
      }
    });
  }, [socket, peer]);
};

export const useCallOthers = (
  peer,
  callOthersTriggered,
  setGroupCall,
  setIsAnswered,
  peersOnConference,
  setPeersOnConference,
  setCalls
) => {
  useEffect(() => {
    const callOthers = async () => {
      if (callOthersTriggered) {
        setGroupCall(true);
        setIsAnswered(true);
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
            console.log('triggered in callOthers useEffect');
            setIsAnswered(false);
            // setPeersOnConference({});
            // setCalls({});
            selfStream.getTracks().forEach((track) => track.stop());
          });
          call?.on('error', (e) => console.log('error while on group call', e));
          setCalls((prev) => ({ ...prev, [remotePeer]: call }));
        }
      }
    };
    // console.log('this useEffect is continuously running');
    callOthers();
  }, [callOthersTriggered, peer]);
};
