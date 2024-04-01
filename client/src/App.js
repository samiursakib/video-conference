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
  const [transited, setTransited] = useState(true);
  const [peersOnConference, setPeersOnConference] = useState({});
  const [peerIdsOnConference, setPeerIdsOnConference] = useState([]);
  const [callOthersTriggered, setCallOthersTriggered] = useState(false);
  const [socketUsername, setSocketUsername] = useState('username');
  const [isConversationOpen, setIsConversationOpen] = useState(true);
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
    <div className="w-full h-screen mx-auto bg-blue text-white">
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
        // <div className="flex flex-col text-black h-full">
        //   <div className="bg-slate-500 basis-16">
        //     <Title title={'your'} id={socket?.id} />
        //   </div>
        //   <div className="bg-slate-300 grow flex">
        //     <div className="bg-green-500 grow border-8 flex">
        //       <div className="bg-purple-300 basis-40 aspect-video"></div>
        //       {Object.keys(peersOnConference).length !== 0 && (
        //         <div className={cn(['flex flex-wrap gap-2 relative'])}>
        //           {Object.keys(peersOnConference).map((key) => (
        //             <PeerVideo
        //               key={key}
        //               peerId={key}
        //               stream={peersOnConference[key]}
        //               layoutChangable={
        //                 Object.keys(peersOnConference).length === 2
        //               }
        //               self={key === socket.id}
        //             />
        //           ))}
        //         </div>
        //       )}
        //     </div>
        //     {isConversationOpen && (
        //       <div className="bg-red-500 grow flex flex-col border-8 border-green-500">
        //         <div className="basis-[calc(100vh-7rem)] overflow-auto">
        //           <div className="bg-green-300 flex flex-col">
        //             <ul className="flex flex-col">
        //               {conferenceId in conversations
        //                 ? conversations[conferenceId].map((m, id) => (
        //                     <li key={id} className="mb-2">
        //                       <div>{m.sender.substr(-3)}</div>
        //                       <div>{m.message}</div>
        //                     </li>
        //                   ))
        //                 : null}
        //             </ul>
        //           </div>
        //         </div>
        //         <div className="pl-2 bg-gray basis-12 flex justify-between items-center">
        //           <input
        //             className="w-0 grow"
        //             type="text"
        //             value={message}
        //             onChange={(e) => setMessage(e.target.value)}
        //           />
        //           <Button
        //             className="basis-10"
        //             onClick={() =>
        //               sendMessage(
        //                 socket,
        //                 message,
        //                 conferenceId,
        //                 setMessage,
        //                 setConversations
        //               )
        //             }
        //             icon={<BsFillSendFill />}
        //             disabled={!message}
        //           />
        //         </div>
        //       </div>
        //     )}
        //     <div className="bg-yellow-500 basis-16 flex flex-col items-center gap-2 border-l">
        //       <Button
        //         onClick={() => setTransited(false)}
        //         icon={<IoMdArrowRoundBack />}
        //         disabled={false}
        //         circle
        //       />
        //       <Button
        //         onClick={() => setIsConversationOpen((prev) => !prev)}
        //         icon={<AiFillMessage />}
        //         circle
        //       />
        //       <Button
        //         onClick={async () => await startCall(socket, conferenceId)}
        //         icon={<MdAddCall />}
        //         disabled={false}
        //         circle
        //       />
        //       <Button
        //         onClick={() =>
        //           endCall(
        //             socket,
        //             calls,
        //             setCalls,
        //             conferenceId,
        //             setCallOthersTriggered,
        //             setPeersOnConference
        //           )
        //         }
        //         icon={<MdCallEnd />}
        //         disabled={false}
        //         circle
        //         color={'#F54545'}
        //       />
        //     </div>
        //   </div>
        // </div>
        <div className="flex flex-col h-full">
          <div className="bg-slate-900 basis-16"></div>
          <div className="bg-slate-300 grow flex">
            <div className="bg-green-400 border-8 border-yellow-300 grow-[2] w-[400px] flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="bg-purple-300 w-[200px] h-40"></div>
              ))}
            </div>
            <div className="bg-red-400 border-8 border-white grow flex"></div>
            <div className="bg-yellow-400 border-8 border-green-300 basis-12 flex"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
