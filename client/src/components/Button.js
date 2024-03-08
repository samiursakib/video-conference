import React from 'react';

export default function Button({
  className,
  action,
  onClick,
  icon,
  disabled,
  full,
  circle,
}) {
  return (
    <button
      className={`flex items-center justify-center bg-[#0E8388] focus:outline focus:outline-slate-200 px-3 py-1 space-x-2 ${
        full ? 'w-full h-full' : ''
      } disabled:bg-[#0E8388] ${
        circle ? 'rounded-full w-[40px] h-[40px]' : 'rounded-sm h-full'
      } ${className ? className : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="text-lg">{icon}</span>
      {action && <span>{action}</span>}
    </button>
  );
}
