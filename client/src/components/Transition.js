import React from 'react';

export default function Transition({ children, transited, isConference }) {
  return (
    <div className="p-8 pt-0 w-full h-full flex flex-col gap-4">{children}</div>
  );
}
