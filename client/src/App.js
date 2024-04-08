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
import Button from './components/Button';
import PeerVideo from './components/PeerVideo';
import Title from './components/Title';
import Profile from './components/Profile';

import './App.css';
import { AiFillMessage } from 'react-icons/ai';
import avatarSekeletonMale from './images/avatar-skeleton-male.png';
import Message from './components/Message';
import { findSocket } from './utils/helper';

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
  const [isConversationOpen, setIsConversationOpen] = useState(true);
  const [conversations, setConversations] = useState({});
  const [socketsData, setSocketsData] = useState([]);

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
    setConversations,
    socketsData,
    setSocketsData
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
    room,
    setRoom,
    socketsData,
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
  console.log(conferenceId);

  return (
    <div className="w-full h-screen mx-auto bg-blue text-white text-2xl sm:text-xl">
      <div className="flex flex-col h-full">
        <Title
          socketId={socket?.id}
          socketUsername={socket?.username}
          conferenceId={conferenceId}
          conferenceUsername={findSocket(socketsData, conferenceId)}
          transited={transited}
        />
        <div className="grow flex flex-col">
          {!transited ? (
            <div className="p-4 sm:p-0 flex flex-col">
              <div className="w-full sm:w-3/5 max-w-screen-lg mx-auto">
                <Profile
                  avatarUrl={socket?.avatarUrl}
                  username={socket?.username}
                  socketUsername={socketUsername}
                  setSocketUsername={setSocketUsername}
                  setRunSetUsername={setRunSetUsername}
                />
              </div>
              <div className="w-full sm:w-3/5 max-w-screen-lg mx-auto basis-[calc(100vh-8rem)] overflow-auto">
                <div className="grow flex flex-col">
                  <Section {...usersProps} />
                  <Section {...roomsProps} />
                </div>
              </div>
            </div>
          ) : (
            <div className="grow flex">
              <div className="w-2/3 flex flex-wrap justify-around items-center">
                {Object.keys(peersOnConference).length !== 0 ? (
                  Object.keys(peersOnConference).map((key) => (
                    <PeerVideo
                      key={key}
                      peerId={key}
                      stream={peersOnConference[key]}
                    />
                  ))
                ) : (
                  <div className="">No one is here</div>
                )}
              </div>
              {/* {isConversationOpen && ( */}
              <div className="w-1/3 flex flex-col border-l border-slate-700">
                <div className="basis-[calc(100vh-8rem)] overflow-auto">
                  <div className="flex flex-col">
                    <ul className="flex flex-col gap-1">
                      {conferenceId in conversations
                        ? conversations[conferenceId].map((m, id) => (
                            <Message
                              key={id}
                              sender={
                                findSocket(socketsData, m.sender)?.username
                              }
                              avatar={avatarSekeletonMale}
                              msg={m.message}
                            />
                          ))
                        : null}
                    </ul>
                  </div>
                </div>
                <div className="px-3 basis-16 flex justify-between items-center space-x-2">
                  <input
                    className="w-0 grow"
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button
                    className="rotate-45"
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
                    circle
                  />
                </div>
              </div>
              {/* )} */}
              <div className="pt-2 basis-16 flex flex-col items-center gap-4 border-l border-slate-700">
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
                  color="#c92a2a"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
