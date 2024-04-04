import React, { memo } from 'react';

const Title = ({ title, id }) => {
  return (
    <div className="mt-4 text-center text-lg">
      {id ? (
        <>
          {title.charAt(0).toUpperCase() + title.slice(1)} id :{' '}
          <span className="font-bold">{id}</span>
        </>
      ) : (
        <span>Initializing socket...</span>
      )}
    </div>
  );
};

export default memo(Title);
