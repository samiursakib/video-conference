import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BsFillSendFill } from 'react-icons/bs';
import { IoMdArrowRoundBack } from 'react-icons/io';
import Section from './components/Section';
import Transition from './components/Transition';
import './App.css';
import Button from './components/Button';

function App() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [conferenceId, setConferenceId] = useState('');
  const [transited, setTransited] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:8080');
    setSocket(newSocket);
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
  }, [socket]);

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
    list: availableUsers,
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
