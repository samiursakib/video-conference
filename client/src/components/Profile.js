import React, { useState } from 'react';
import { RiEditBoxFill } from 'react-icons/ri';
import Button from './Button';

export default function Profile({
  avatarUrl,
  username,
  socketUsername,
  setSocketUsername,
  setRunSetUsername,
}) {
  const [hiddenEditInput, setHiddenEditInput] = useState(true);
  const handleStartEditInput = () => setHiddenEditInput(false);
  const handleStopEditInput = () => {
    setRunSetUsername(true);
    setHiddenEditInput(true);
  };
  return (
    <div className="mt-4 flex items-center gap-2">
      <img src={avatarUrl} alt={avatarUrl} width="40px" height="40px" />
      {hiddenEditInput ? (
        <div className="flex-grow ml-3">{username}</div>
      ) : (
        <input
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
}
