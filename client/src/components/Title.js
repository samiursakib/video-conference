import React from 'react';

export default function Title({ id }) {
  return (
    <div className="p-4 pb-8 text-center text-lg">
      {id ? (
        <>
          Your id : <span className="font-bold">{id}</span>
        </>
      ) : (
        <span>Initializing socket...</span>
      )}
    </div>
  );
}
