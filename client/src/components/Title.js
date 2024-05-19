import React, { memo } from 'react';

const Title = ({ socketId, socketUsername, conference, transited }) => {
  return (
    <div className="py-1 bg-lightblue basis-16 flex flex-col items-center justify-center gap-1 text-sm">
      <span className="text-2xl">{socketUsername}</span>
      <span>
        {transited ? (
          conference
        ) : socketId !== undefined ? (
          socketId
        ) : (
          <span className="flex gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Initializing socket...
          </span>
        )}
      </span>
    </div>
  );
};

export default memo(Title);
