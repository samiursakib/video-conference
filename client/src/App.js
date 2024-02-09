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
  const [peerCall, setPeerCall] = useState(null);
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
  const remoteStreams = {};

  // const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:8080');
    setSocket(newSocket);
    newSocket.on('connect', () => {
      const newPeer = new Peer(newSocket.id, {
        host: 'localhost',
        port: 9000,
        path: '/',
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
    socket?.on('callOthersTriggered', () => {
      // alert('call triggered');
      setCallOthersTriggered(true);
    });
    socket?.emit('fetchData');
    peer?.on('call', async (call) => {
      try {
        const selfStream = await getMedia();
        // setPeersOnConference((prev) => ({ ...prev, [peer.id]: selfStream }));
        call.answer(selfStream);
        setTransited(true);
        setIsAnswered(true);
        call.on('stream', (remoteStream) => {
          setPeersOnConference((prev) => ({
            ...prev,
            [call.peer]: remoteStream,
          }));
        });
        call.on('close', () => {
          remoteVideoRef.current.srcObject = null;
          selfVideoRef.current.srcObject = null;
          setIsAnswered(false);
        });
        call.on('error', (e) => console.log('error in peer call'));
        setPeerCall(call);
      } catch (e) {
        console.log('error while receiving call');
      }
    });
  }, [socket, peer]);

  useEffect(() => {
    const callOthers = async () => {
      if (callOthersTriggered) {
        const selfStream = await getMedia();
        setPeersOnConference((prev) => ({ ...prev, [peer.id]: selfStream }));
        console.log('before calling: ', peersOnConference);
        for (const remotePeer in peersOnConference) {
          if (remotePeer === peer.id) continue;
          console.log(remotePeer);
          const call = peer.call(remotePeer, selfStream);
          call.on('stream', (remoteStream) => {
            setPeersOnConference((prev) => ({
              ...prev,
              [remotePeer]: remoteStream,
            }));
          });
          console.log('after calling: ', peersOnConference);
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
      newCall.on('error', (e) => console.log('error in starting call'));
      setCall(newCall);
    } catch (e) {
      console.log('error while trying to get media stream');
    }
  };

  const endPrivateCall = () => {
    call?.close();
    peerCall?.close();
    console.log('call ended');
  };

  const startGroupCall = async () => {
    try {
      socket.emit('callOthersTriggered', conferenceId);
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

  const endGroupCall = () => {};

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
  };

  console.log('peersOnConference: ', peersOnConference);

  return (
    <div className="container max-w-[900px] h-screen mx-auto font-light relative overflow-hidden scroll-smooth">
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
          Conference id : <span className="font-bold">{conferenceId}</span>
        </div>
        {/* <div className="w-full h-40 mb-2">
          <video className="w-full h-full" ref={selfVideoRef}></video>
        </div>{' '}
        <div className="w-full h-40 mb-2">
          <video className="w-full h-full" ref={remoteVideoRef}></video>
        </div> */}
        <div className="flex flex-wrap">
          {/* <PeerVideo key={'local'} stream={localStream} /> */}
          {Object.keys(peersOnConference).map((key) => (
            <PeerVideo key={key} stream={peersOnConference[key]} />
          ))}
        </div>
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
          {isAnswered ? (
            <Button
              action={'End call'}
              onClick={endPrivateCall}
              icon={<MdCallEnd />}
              disabled={false}
              full
            />
          ) : (
            <Button
              action={'Start call'}
              onClick={async () => await startGroupCall(conferenceId)}
              icon={<MdAddCall />}
              disabled={false}
              full
            />
          )}
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
