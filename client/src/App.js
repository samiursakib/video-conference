import {
  useCallOthers,
  useSetUsername,
  useSocketEventListener,
  useSocketInitialization,
} from './utils/effects';

import { joinRoom, leaveRoom } from './utils/actions';

import Section from './components/Section';
import PeerVideo from './components/PeerVideo';
import Title from './components/Title';
import Profile from './components/Profile';

import './App.css';
import { findSocket } from './utils/helper';
import ConversationContainer from './components/ConversationContainer';
import Controls from './components/Controls';
import { useState } from 'react';

function App() {
  const [calls, setCalls] = useState({});
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
    setAvailableRooms,
    setConferenceId,
    setCallOthersTriggered,
    setTransited,
    calls,
    setCalls,
    setConversations,
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
    joinRoom,
    setJoinedRooms,
    leaveRoom,
    joinedRooms,
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
  };
  const foundSocket = findSocket(socketsData, conferenceId);
  const titleProps = {
    socketId: socket?.id,
    socketUsername: socket?.username,
    conference:
      foundSocket?.username === 'username'
        ? foundSocket?.id
        : foundSocket?.username,
    transited,
  };
  const profileProps = {
    avatarUrl: socket?.avatarUrl,
    username: socket?.username,
    socketUsername,
    setSocketUsername,
    setRunSetUsername,
  };
  const conversationContainerProps = {
    conversations,
    conferenceId,
    socketsData,
    socket,
    setConversations,
  };
  const controlsProps = {
    setTransited,
    setIsConversationOpen,
    socket,
    conferenceId,
    calls,
    setCalls,
    setCallOthersTriggered,
    setPeersOnConference,
    isOnCall: Object.keys(peersOnConference).length !== 0,
  };

  return (
    <div className="w-full h-screen mx-auto bg-blue text-white text-2xl sm:text-xl">
      <div className="flex flex-col h-full">
        <Title {...titleProps} />
        <div className="grow flex flex-col">
          {!transited ? (
            <div className="p-4 sm:p-0 flex flex-col">
              <Profile {...profileProps} />
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
                  Object.keys(peersOnConference).map((key) => {
                    const foundSocket = findSocket(socketsData, key);
                    return (
                      <PeerVideo
                        key={key}
                        peer={
                          foundSocket?.username === 'username'
                            ? foundSocket?.id
                            : foundSocket?.username
                        }
                        stream={peersOnConference[key]}
                        own={foundSocket?.id === socket?.id}
                        socket={socket}
                        conferenceId={conferenceId}
                        controls={foundSocket?.controls}
                        setSocketsData={setSocketsData}
                      />
                    );
                  })
                ) : (
                  <div className="">No one is here</div>
                )}
              </div>
              <ConversationContainer {...conversationContainerProps} />
              <Controls {...controlsProps} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
