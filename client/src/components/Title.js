import React, { memo } from 'react';

const Title = ({ socketId, socketUsername, conference, transited }) => {
  return (
    <div className="py-1 bg-lightblue basis-16 flex flex-col items-center gap-1">
      <span>{socketUsername}</span>
      {transited ? (
        <span className="text-sm">{conference}</span>
      ) : (
        <span className="text-sm">
          {socketId !== undefined ? socketId : 'Initializing socket...'}
        </span>
      )}
    </div>
  );
};

export default memo(Title);
