import React from 'react';

export default function Transition({ children, transited, isConference }) {
  return (
    <div
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
        transition: 'all 0.5s ease',
      }}
    >
      {children}
    </div>
  );
}
