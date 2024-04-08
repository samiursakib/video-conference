import React, { memo } from 'react';

const Title = ({
  socketId,
  socketUsername,
  conferenceId,
  conferenceUsername,
  transited,
}) => {
  return (
    <div className="bg-lightblue basis-16 flex justify-center items-center flex-col gap-1">
      <span className="">{socketId}</span>
      {transited && <span className="text-sm">{conferenceId}</span>}
    </div>
  );
};

export default memo(Title);
