import React from 'react';

export default function Title({ id, conferenceId }) {
  return (
    <div className="mt-4 text-center text-lg">
      {id ? (
        <>
          {id === conferenceId ? 'Conference' : 'Your'} id : <span className="font-bold">{id}</span>
        </>
      ) : (
        <span>Initializing socket...</span>
      )}
    </div>
  );
}
