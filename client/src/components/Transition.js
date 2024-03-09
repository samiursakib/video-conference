import React from 'react';

export default function Transition({ children, transited, isConference }) {
  return (
    <div
      className="p-8 pt-0 flex flex-col gap-4"
      style={{
        position: 'absolute',
        left: isConference
          ? transited
            ? '0%'
            : '150%'
          : transited
          ? '-150%'
          : '0%',
        width: '100%',
        height: '100vh',
        transition: 'all 0.5s ease',
      }}
    >
      {children}
    </div>
  );
}
