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
import { AiFillMessage } from 'react-icons/ai';

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
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [conversations, setConversations] = useState({});

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
    setCalls,
    setConversations
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

  console.log(conversations);

  return (
    <div className=" p-5 h-screen bg-blue text-white w-full mx-auto">
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
          <div className="flex flex-row items-stretch">
            <div className="flex grow">
              {Object.keys(peersOnConference).length !== 0 && (
                <div className={cn(['flex grow flex-wrap relative'])}>
                  {Object.keys(peersOnConference).map((key) => (
                    <PeerVideo
                      key={key}
                      peerId={key}
                      stream={peersOnConference[key]}
                      layoutChangable={
                        Object.keys(peersOnConference).length === 2
                      }
                      self={key === socket.id}
                    />
                  ))}
                </div>
              )}
              {isConversationOpen && (
                <div className="flex flex-col grow">
                  <ul className="flex flex-col grow">
                    {conferenceId in conversations
                      ? conversations[conferenceId].map((m, id) => (
                          <li key={id} className="mb-2">
                            <div>{m.sender.substr(-3)}</div>
                            <div>{m.message}</div>
                          </li>
                        ))
                      : null}
                  </ul>
                  <div className="mt-auto flex items-center gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button
                      onClick={() =>
                        sendMessage(
                          socket,
                          message,
                          conferenceId,
                          setMessage,
                          setConversations
                        )
                      }
                      icon={<BsFillSendFill />}
                      disabled={!message}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="w-16 flex flex-col justify-start border-l border-slate-700 rounded-sm hover:cursor-pointer">
              <Button
                onClick={() => setTransited(false)}
                icon={<IoMdArrowRoundBack />}
                disabled={false}
                circle
              />
              <Button
                onClick={() => setIsConversationOpen((prev) => !prev)}
                icon={<AiFillMessage />}
                circle
              />
              <Button
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
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
