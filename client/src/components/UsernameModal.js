import { memo, useEffect, useRef } from 'react';
import Button from './Button';
import { ImCheckmark } from 'react-icons/im';

const UsernameModal = ({
  socketUsername,
  setSocketUsername,
  setRunSetUsername,
  setIsModalOpen,
}) => {
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current.focus();
  });
  return (
    <div>
      <div className="text-center font-bold">Set your username</div>
      <div className="mt-8 flex">
        <input
          ref={inputRef}
          style={{ fontSize: '16px', padding: '10px 15px' }}
          className="grow mr-2"
          type="text"
          value={socketUsername}
          onChange={(e) => setSocketUsername(e.target.value)}
        />
        <Button
          className="w-10 h-10"
          onClick={() => {
            setRunSetUsername(true);
            setIsModalOpen(false);
          }}
          icon={<ImCheckmark />}
          disabled={!socketUsername}
          circle
        />
      </div>
    </div>
  );
};

export default memo(UsernameModal);
