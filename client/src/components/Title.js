import React, { memo } from 'react';

const Title = ({
  socketId,
  socketUsername,
  conferenceId,
  conferenceUsername,
  transited,
}) => {
  return (
    <div className="bg-lightblue basis-16 flex flex-col items-center gap-1">
      <span>{socketUsername}</span>
      {transited ? (
        <span className="text-xs">{conferenceId}</span>
      ) : (
        <span className="text-xs">{socketId}</span>
      )}
    </div>
  );
};

export default memo(Title);
