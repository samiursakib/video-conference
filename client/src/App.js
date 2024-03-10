import { useEffect, useState, useRef, useCallback } from 'react';

import { BsFillSendFill } from 'react-icons/bs';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { MdAddCall, MdCallEnd } from 'react-icons/md';

import { getMedia, setVideoRef } from './utils/mediaHelper';
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
  startPrivateCall,
  endPrivateCall,
  startGroupCall,
  endGroupCall,
} from './utils/actions';
import Section from './components/Section';
import Transition from './components/Transition';
import Button from './components/Button';
import PeerVideo from './components/PeerVideo';
import Title from './components/Title';
import Profile from './components/Profile';

import './App.css';

function App() {
  const [call, setCall] = useState(null);
  const [calls, setCalls] = useState({});
  const [peerCall, setPeerCall] = useState(null);
  const [peerCalls, setPeerCalls] = useState({});
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [conferenceId, setConferenceId] = useState('');
  const [transited, setTransited] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [peersOnConference, setPeersOnConference] = useState({});
  const [callOthersTriggered, setCallOthersTriggered] = useState(false);
  const [groupCall, setGroupCall] = useState(false);
  const [socketUsername, setSocketUsername] = useState('username');
  const selfVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

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
    setAvailableRooms,
    setConferenceId,
    setCallOthersTriggered,
    setTransited,
    setIsAnswered,
    selfVideoRef,
    remoteVideoRef,
    setPeerCall,
    setPeerCalls
  );
  useCallOthers(
    peer,
    callOthersTriggered,
    setGroupCall,
    setIsAnswered,
    peersOnConference,
    setPeersOnConference,
    setCalls
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
    setGroupCall,
  };

  // console.log('peersOnConference: ', peersOnConference);

  return (
    <div className="">
      {/* <div className="left-[400px] top-[200px] absolute h-[400px] w-[400px] bg-slate-500 rounded-full -z-10"></div> */}
      <div className="mt-16 container bg-[#2E4F4F]/60 backdrop-blur-[7px] max-w-[700px] h-[800px] mx-auto font-light relative overflow-hidden scroll-smooth rounded-xl">
        <Title id={socket?.id} conferenceId={conferenceId} />
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
          <Title id={conferenceId} conferenceId={conferenceId} />
          <div className="mt-2 flex justify-center rounded-sm hover:cursor-pointer">
            <Button
              onClick={() => setTransited(false)}
              icon={<IoMdArrowRoundBack />}
              disabled={false}
              circle={true}
            />
            <Button
              className="ml-auto"
              onClick={async () =>
                groupCall
                  ? await startGroupCall(socket, conferenceId)
                  : await startPrivateCall(
                      peer,
                      conferenceId,
                      selfVideoRef,
                      setIsAnswered,
                      remoteVideoRef,
                      setCall
                    )
              }
              icon={<MdAddCall />}
              disabled={false}
              circle
            />
            <Button
              className="ml-2"
              onClick={
                groupCall
                  ? () =>
                      endGroupCall(
                        calls,
                        peerCalls,
                        setCallOthersTriggered,
                        setPeersOnConference
                      )
                  : () => endPrivateCall(call, peerCall)
              }
              icon={<MdCallEnd />}
              disabled={false}
              circle
              color={'#F54545'}
            />
          </div>
          {!groupCall ? (
            <>
              <div className="w-full h-40 mb-2">
                <video className="w-full h-full" ref={selfVideoRef}></video>
              </div>
              <div className="w-full h-40 mb-2">
                <video className="w-full h-full" ref={remoteVideoRef}></video>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-5">
              {Object.keys(peersOnConference).map((key) => (
                <PeerVideo
                  key={key}
                  peerId={key}
                  stream={peersOnConference[key]}
                />
              ))}
            </div>
          )}
          <div className="overflow-auto">
            {/* <ul>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
            </ul> */}
          </div>
          <div className="flex items-center h-[40px] border border-[#0E8388] rounded">
            <input
              className="pl-4 block h-full w-full"
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
