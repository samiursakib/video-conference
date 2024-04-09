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
  return (
    <div className="py-2 flex items-center content-center gap-2">
      <img src={avatarUrl} alt={avatarUrl} width="40px" height="40px" />
      {hiddenEditInput ? (
        <div className="flex-grow ml-3">{username}</div>
      ) : (
        <input
          className="w-full"
          type="text"
          value={socketUsername}
          onChange={(e) => setSocketUsername(e.target.value)}
        />
      )}
      <Button
        onClick={hiddenEditInput ? handleStartEditInput : handleStopEditInput}
        icon={<RiEditBoxFill />}
        disabled={!socketUsername}
        circle
      />
    </div>
  );
};

export default memo(Profile);
