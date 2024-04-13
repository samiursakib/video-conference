import React, { memo, useState } from 'react';
import { RiEditBoxFill } from 'react-icons/ri';
import Button from './Button';

const Profile = ({
  avatarUrl,
  username,
  socketUsername,
  setSocketUsername,
  setRunSetUsername,
}) => {
  const [hiddenEditInput, setHiddenEditInput] = useState(true);
  const handleStartEditInput = () => setHiddenEditInput(false);
  const handleStopEditInput = () => {
    setRunSetUsername(true);
    setHiddenEditInput(true);
  };
  console.log('prof');
  return (
    <div className="w-full sm:w-3/5 max-w-screen-lg mx-auto">
      <div className="py-2 flex items-center gap-2">
        <img src={avatarUrl} alt={avatarUrl} width="40px" height="40px" />
        <input
          style={{
            paddingLeft: '15px',
            fontSize: '20px',
            border: `1px solid ${hiddenEditInput ? '#33415500' : '#334155ff'}`,
            cursor: hiddenEditInput ? 'default' : 'text',
          }}
          className="w-0 grow pl-2"
          type="text"
          value={socketUsername}
          onChange={(e) => setSocketUsername(e.target.value)}
          disabled={hiddenEditInput}
        />
        <Button
          className="w-10 h-10"
          onClick={hiddenEditInput ? handleStartEditInput : handleStopEditInput}
          icon={<RiEditBoxFill />}
          disabled={!socketUsername}
          circle
        />
      </div>
    </div>
  );
};

export default memo(Profile);
