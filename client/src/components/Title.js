import React from 'react';

export default function Title({ title, id }) {
  return (
    <div className="text-center text-lg">
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
}
