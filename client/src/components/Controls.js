import React, { memo } from 'react';
import Button from './Button';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { AiFillMessage } from 'react-icons/ai';
import { MdAddCall, MdCallEnd } from 'react-icons/md';
import { endCall, startCall } from '../utils/actions';

const Controls = ({
  setTransited,
  setIsConversationOpen,
  socket,
  conferenceId,
  calls,
  setCalls,
  setCallOthersTriggered,
  setPeersOnConference,
  isOnCall,
}) => {
  return (
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
      {!isOnCall ? (
        <Button
          onClick={async () => await startCall(socket, conferenceId)}
          icon={<MdAddCall />}
          disabled={false}
          circle
        />
      ) : (
        <Button
          className="bg-[#c92a2a]/70 hover:bg-[#c92a2a]"
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
        />
      )}
    </div>
  );
};

export default memo(Controls);
