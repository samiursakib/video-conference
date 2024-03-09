import React, { useState, useRef } from 'react';
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
  return (
    <div className="flex items-center gap-4 py-4">
      <img src={avatarUrl} alt={avatarUrl} width="40px" height="40px" />
      {hiddenEditInput ? (
        <div className="flex w-full justify-between items-center max-h-8">
          <div className="">{username}</div>
          <Button
            action={'Edit'}
            onClick={() => setHiddenEditInput(false)}
            icon={<RiEditBoxFill />}
          />
        </div>
      ) : (
        <div className="flex w-full items-center border border-[#0E8388] rounded">
          <input
            className="pl-3 block w-full"
            type="text"
            value={socketUsername}
            onChange={(e) => setSocketUsername(e.target.value)}
          />
          <Button
            className="ml-auto"
            action={'Set'}
            onClick={() => {
              setRunSetUsername(true);
              setHiddenEditInput(true);
            }}
            icon={<RiEditBoxFill />}
            disabled={!socketUsername}
          />
        </div>
      )}
    </div>
  );
}
