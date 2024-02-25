import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Peer } from 'peerjs';
import { BsFillSendFill } from 'react-icons/bs';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { MdAddCall, MdCallEnd } from 'react-icons/md';
import Section from './components/Section';
import Transition from './components/Transition';
import './App.css';
import Button from './components/Button';
import { getMedia, setVideoRef } from './utils';
import PeerVideo from './components/PeerVideo';

function App() {
  const [socket, setSocket] = useState(null);
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);
  const [calls, setCalls] = useState({});
  const [peerCall, setPeerCall] = useState(null);
  const [peerCalls, setPeerCalls] = useState({});
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [conferenceId, setConferenceId] = useState('');
  const [transited, setTransited] = useState(false);
  const selfVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [peersOnConference, setPeersOnConference] = useState({});
  const [callOthersTriggered, setCallOthersTriggered] = useState(false);
  const [groupCall, setGroupCall] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:80');
    setSocket(newSocket);
    newSocket.on('connect', () => {
      const newPeer = new Peer(newSocket.id, {
        // host: 'localhost',
        // port: 9000,
        // path: '/',
      });
      setPeer(newPeer);
    });
    return () => newSocket.close();
  }, []);

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
          // console.log('before ending call: ', peersOnConference);
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
          setPeersOnConference({});
          setIsAnswered(false);
          selfStream.getTracks().forEach((track) => track.stop());
          console.log('call ended from: ', call.peer);
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

  const sendMessage = (msg, to) => {
    socket.emit('sendMessage', msg, to);
    setMessage('');
  };

  const joinRoom = (room) => {
    socket.emit('joinRoom', room);
    socket.emit('fetchPeersOnConference', room);
    setJoinedRooms((prev) => [...prev, room]);
  };

  const leaveRoom = (room) => {
    socket.emit('leaveRoom', room);
    socket.emit('fetchPeersOnConference', room);
    setJoinedRooms((prev) => prev.filter((r) => room !== r));
  };

  const disconnectSocket = () => {
    socket.emit('forceDisconnect');
  };

  const reconnectSocket = () => {
    socket.socket.connect();
  };

  const startPrivateCall = async (conferenceId) => {
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

  const endPrivateCall = () => {
    call?.close();
    peerCall?.close();
    console.log('private call ended');
  };

  const startGroupCall = async () => {
    try {
      // setIsAnswered(true);
      socket.emit('callOthersTriggered', conferenceId);
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

  const endGroupCall = () => {
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

  const commonProps = {
    setConferenceId,
    peersOnConference,
    setPeersOnConference,
    setTransited,
    message,
    setMessage,
    sendMessage,
    room,
    setRoom,
  };
  const usersProps = {
    ...commonProps,
    title: 'Users',
    list: availableUsers.filter((u) => u !== socket.id),
    forRooms: false,
  };
  const roomsProps = {
    ...commonProps,
    title: 'Rooms',
    list: availableRooms,
    forRooms: true,
    joinRoom,
    leaveRoom,
    joinedRooms,
    setGroupCall,
  };

  console.log('peersOnConference: ', peersOnConference);
  console.log(callOthersTriggered);
  // console.log('calls: ', calls);
  // console.log('peerCalls: ', peerCalls);

  return (
    <div className="container max-w-[900px] h-screen mx-auto font-light relative overflow-hidden scroll-smooth">
      <h4>{conferenceId}</h4>
      <Transition transited={transited} isConference={false}>
        <div className="p-4 text-center text-lg">
          Your id : <span className="font-bold">{socket?.id}</span>
        </div>
        <Section {...usersProps} />
        <Section {...roomsProps} />
        {/* <button onClick={() => disconnectSocket()}>Disconnect</button>
        <button onClick={() => reconnectSocket()}>Reconnect</button> */}
      </Transition>

      <Transition transited={transited} isConference>
        <div className="p-4 text-center text-lg">
          {/* Conference id : <span className="font-bold">{conferenceId}</span> */}
        </div>
        {!groupCall ? (
          <>
            <div className="w-full h-40 mb-2">
              <video className="w-full h-full" ref={selfVideoRef}></video>
            </div>
            <div className="w-full h-40 mb-2">
              <video className="w-full h-full" ref={remoteVideoRef}></video>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap flex-col">
            {Object.keys(peersOnConference).map((key) => (
              <PeerVideo
                key={key}
                peerId={key}
                stream={peersOnConference[key]}
              />
            ))}
          </div>
        )}
        <div className="flex items-center border border-slate-800 rounded">
          <input
            className="block h-full w-full"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            action={'Send'}
            onClick={() => sendMessage(message, conferenceId)}
            icon={<BsFillSendFill />}
            disabled={!message}
          />
        </div>
        <div className="mt-2 flex justify-center bg-slate-700 rounded-sm hover:cursor-pointer">
          <Button
            action={'End call'}
            onClick={groupCall ? endGroupCall : endPrivateCall}
            icon={<MdCallEnd />}
            disabled={false}
            full
          />
          <Button
            action={'Start call'}
            onClick={async () =>
              groupCall
                ? await startGroupCall(conferenceId)
                : await startPrivateCall(conferenceId)
            }
            icon={<MdAddCall />}
            disabled={false}
            full
          />
        </div>
        <div className="mt-2 flex justify-center bg-slate-700 rounded-sm hover:cursor-pointer">
          <Button
            action={'Go back'}
            onClick={() => setTransited(false)}
            icon={<IoMdArrowRoundBack />}
            disabled={false}
            full
          />
        </div>
      </Transition>
    </div>
  );
}

export default App;
