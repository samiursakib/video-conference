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
import { cn } from './utils/helper';

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
  const [peerIdsOnConference, setPeerIdsOnConference] = useState([]);
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
    setPeerIdsOnConference,
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
    peerIdsOnConference,
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

  console.log(peersOnConference);

  return (
    // <div className="">
    <div className=" p-5 h-screen bg-blue text-white w-full sm:w-4/5 md:w-3/5 mx-auto">
      {!transited ? (
        <div className="w-full flex flex-col">
          <Title title={'your'} id={socket?.id} />
          <Profile
            avatarUrl={socket?.avatarUrl}
            username={socket?.username}
            socketUsername={socketUsername}
            setSocketUsername={setSocketUsername}
            setRunSetUsername={setRunSetUsername}
          />
          <Section {...usersProps} />
          <Section {...roomsProps} />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col">
          <Title title={'your'} id={socket?.id} />
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
          <div
            className={cn([
              'w-full flex grow flex-wrap relative',
              {
                'w-full': Object.keys(peersOnConference).length === 2,
              },
            ])}
          >
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
          {/* <ul className="">
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
          </ul> */}
          <div className="mt-auto flex items-center gap-2">
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
        </div>
      )}
    </div>
    // </div>
  );
}

export default App;
