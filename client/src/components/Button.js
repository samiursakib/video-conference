import React from 'react';

export default function Button({
  className,
  action,
  onClick,
  icon,
  disabled,
  full,
  circle,
  color,
}) {
  return (
    <button
      className={`flex items-center justify-center text-bermuda-dark focus:outline focus:outline-bermuda-dark px-1 py-1 space-x-2 ${
        full ? 'w-full h-full' : ''
      } disabled:bg-transparent ${
        circle ? 'rounded-full w-[40px] h-[40px]' : 'rounded-sm h-full'
      } ${className ? className : ''} ${color ? `bg-[#c92a2a]` : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{icon}</span>
      {action && <span>{action}</span>}
    </button>
  );
}
