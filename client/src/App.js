import { useState } from 'react';

import { BsFillSendFill } from 'react-icons/bs';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { MdAddCall, MdCallEnd } from 'react-icons/md';

import {
  useCallOthers,
  useSetUsername,
  useSocketEventListener,
  useSocketInitialization,
} from './utils/effects';

import {
  sendMessage,
  joinRoom,
  leaveRoom,
  startCall,
  endCall,
} from './utils/actions';

import Section from './components/Section';
import Transition from './components/Transition';
import Button from './components/Button';
import PeerVideo from './components/PeerVideo';
import Title from './components/Title';
import Profile from './components/Profile';

import './App.css';

function App() {
  const [calls, setCalls] = useState({});
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [conferenceId, setConferenceId] = useState('');
  const [transited, setTransited] = useState(false);
  const [peersOnConference, setPeersOnConference] = useState({});
  const [callOthersTriggered, setCallOthersTriggered] = useState(false);
  const [socketUsername, setSocketUsername] = useState('username');

  const { socket, setSocket, peer, setPeer } =
    useSocketInitialization(socketUsername);
  const { runSetUsername, setRunSetUsername } = useSetUsername(
    socket,
    socketUsername
  );
  useSocketEventListener(
    socket,
    peer,
    setPeersOnConference,
    setAvailableUsers,
    availableRooms,
    setAvailableRooms,
    setConferenceId,
    setCallOthersTriggered,
    setTransited,
    calls,
    setCalls
  );
  useCallOthers(
    peer,
    callOthersTriggered,
    peersOnConference,
    setPeersOnConference,
    setCalls,
    setTransited
  );

  const commonProps = {
    socket,
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
    setJoinedRooms,
    leaveRoom,
    joinedRooms,
  };

  // console.log(peersOnConference);

  return (
    <div className="">
      {/* <div className="left-[400px] top-[200px] absolute h-[400px] w-[400px] bg-slate-500 rounded-full -z-10"></div> */}
      <div className="pt-2 container bg-bermuda-light/50 backdrop-blur-[50px] text-bermuda-dark max-w-[700px] h-[600px] mx-auto overflow-x-hidden overflow-y-scroll font-light relative rounded-xl shadow-lg">
        <Title title={'your'} id={socket?.id} />
        <Transition transited={transited} isConference={false}>
          <Profile
            avatarUrl={socket?.avatarUrl}
            username={socket?.username}
            socketUsername={socketUsername}
            setSocketUsername={setSocketUsername}
            setRunSetUsername={setRunSetUsername}
          />
          <Section {...usersProps} />
          <Section {...roomsProps} />
        </Transition>

        <Transition transited={transited} isConference>
          <Title title={'conference'} id={conferenceId} />
          <div className="mt-2 flex justify-center rounded-sm hover:cursor-pointer">
            <Button
              onClick={() => setTransited(false)}
              icon={<IoMdArrowRoundBack />}
              disabled={false}
              circle={true}
            />
            <Button
              className="ml-auto"
              onClick={async () => await startCall(socket, conferenceId)}
              icon={<MdAddCall />}
              disabled={false}
              circle
            />
            <Button
              className="ml-2"
              onClick={() =>
                endCall(
                  socket,
                  calls,
                  setCalls,
                  conferenceId,
                  setCallOthersTriggered,
                  setPeersOnConference
                )
              }
              icon={<MdCallEnd />}
              disabled={false}
              circle
              color={'#F54545'}
            />
          </div>
          <div className="flex flex-grow flex-wrap relative gap-5">
            {Object.keys(peersOnConference).map((key) => (
              <PeerVideo
                key={key}
                peerId={key}
                stream={peersOnConference[key]}
                layoutChangable={Object.keys(peersOnConference).length === 2}
                self={key === socket.id}
              />
            ))}
          </div>
          {/* <div className="">
            <ul>
              <li>1</li>
              <li>1</li>
              <li>1</li>
            </ul>
          </div> */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              onClick={() => sendMessage(message, conferenceId)}
              icon={<BsFillSendFill />}
              disabled={!message}
            />
          </div>
        </Transition>
      </div>
    </div>
  );
}

export default App;
