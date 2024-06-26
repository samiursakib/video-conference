import React, { memo } from 'react';

const Message = ({ sender, avatar, msg }) => {
  return (
    <li className="p-1 flex gap-2 items-start">
      <div className="mt-1 ml-1">
        <img src={avatar} alt="avatar-skeleton-male" />
      </div>
      <div className="grow flex flex-col basis-60">
        <div className="text-base">{sender}</div>
        <div className="text-sm text-slate-300/70">{msg}</div>
      </div>
    </li>
  );
};

export default memo(Message);
