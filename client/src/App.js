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

  console.log(socketsData);

  return (
    <div className="w-full h-screen mx-auto bg-blue text-white">
      {!transited ? (
        <div className="w-full flex flex-col">
          <Title title={'your'} id={socket?.username} />
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
        <div className="flex flex-col h-full">
          <div className="bg-slate-900 basis-16 text-slate-400 flex justify-center items-center flex-col gap-1">
            <span className="">{socket?.username}</span>
            <span className="text-sm">{conferenceId}</span>
          </div>
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
              <div className="basis-[calc(100vh-7rem)] overflow-auto">
                <div className="flex flex-col">
                  <ul className="flex flex-col gap-1">
                    {conferenceId in conversations
                      ? conversations[conferenceId].map((m, id) => (
                          <Message
                            key={id}
                            sender={findSocket(socketsData, m.sender).username}
                            // sender={m.sender}
                            avatar={avatarSekeletonMale}
                            msg={m.message}
                          />
                        ))
                      : null}
                  </ul>
                </div>
              </div>
              <div className="pl-2 basis-12 flex justify-between items-center">
                <input
                  className="w-0 grow"
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                  className="basis-10"
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
            {/* )} */}
            <div className="basis-16 flex flex-col items-center gap-4 border-l border-slate-700">
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
