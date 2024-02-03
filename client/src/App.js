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
  const [peersOnConference, setPeerOnConference] = useState([]);

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
      alert(`${socketId} joined the room ${room}`);
    });
    socket?.on('leaveRoomAlert', (socketId, room) => {
      alert(`${socketId} left the room ${room}`);
    });
    socket?.on('receiveData', (data) => {
      setAvailableUsers(data.users);
      setAvailableRooms(data.rooms);
    });
    socket?.emit('fetchData');

    // peer?.on('open', (peerId) => console.log('My peer id is: ', peerId));
    peer?.on('call', async (call) => {
      try {
        const selfStream = await getMedia();
        setConferenceId(call.peer);
        call.answer(selfStream);
        setTransited(true);
        setIsAnswered(true);
        setVideoRef(selfVideoRef, selfStream);
        call.on('stream', (remoteStream) => {
          setVideoRef(remoteVideoRef, remoteStream);
        });
        call.on('close', () => {
          console.log('from peer call ended');
          remoteVideoRef.current.srcObject = null;
          if (remoteVideoRef.current.srcObject)
            console.log('answer call remote video');
          selfVideoRef.current.srcObject = null;
          if (selfVideoRef.current.srcObject)
            console.log('answer call self video');
          setIsAnswered(false);
        });
        call.on('error', (e) => console.log('error in peer call'));
        setPeerCall(call);
      } catch (e) {
        console.log('error while receiving call');
      }
    });
  }, [socket, peer]);

  const sendMessage = (msg, to) => {
    console.log('sending message');
    socket.emit('sendMessage', msg, to);
    setMessage('');
  };

  const joinRoom = (room) => {
    socket.emit('joinRoom', room);
    setJoinedRooms((prev) => [...prev, room]);
  };

  const leaveRoom = (room) => {
    socket.emit('leaveRoom', room);
    setJoinedRooms((prev) => prev.filter((r) => room !== r));
  };

  const disconnectSocket = () => {
    socket.emit('forceDisconnect');
  };

  const reconnectSocket = () => {
    socket.socket.connect();
  };

  const startCall = async (conferenceId) => {
    try {
      const selfStream = await getMedia();
      console.log('calling: ', selfStream);
      setVideoRef(selfVideoRef, selfStream);
      const newCall = peer.call(conferenceId, selfStream);
      setIsAnswered(true);
      newCall.on('stream', (remoteStream) => {
        setVideoRef(remoteVideoRef, remoteStream);
      });
      newCall.on('close', () => {
        console.log('from client call ended');
        remoteVideoRef.current.srcObject = null;
        if (remoteVideoRef.current.srcObject)
          console.log('client call remote video');
        selfVideoRef.current.srcObject = null;
        if (selfVideoRef.current.srcObject)
          console.log('client call self video');
        setIsAnswered(false);
      });
      newCall.on('error', (e) => console.log('error in starting call'));
      setCall(newCall);
    } catch (e) {
      console.log('error while trying to get media stream');
    }
  };

  const endCall = () => {
    call?.close();
    peerCall?.close();
    console.log('call ended');
  };

  const commonProps = {
    setConferenceId,
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
        <div className="w-full h-40 mb-2">
          <video className="w-full h-full" ref={selfVideoRef}></video>
        </div>{' '}
        <div className="w-full h-40 mb-2">
          <video className="w-full h-full" ref={remoteVideoRef}></video>
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
              onClick={endCall}
              icon={<MdCallEnd />}
              disabled={false}
              full
            />
          ) : (
            <Button
              action={'Start call'}
              onClick={async () => await startCall(conferenceId)}
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
