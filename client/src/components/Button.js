import React from 'react';

export default function Button({ action, onClick, icon, disabled, full }) {
  return (
    <button
      className={`flex items-center bg-slate-700 text-[#7b9eff] h-full focus:outline focus:outline-slate-200 px-3 py-1 space-x-2 rounded disabled:text-[#42568d] disabled:bg-slate-900 ${
        full ? ' w-full justify-center' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="text-lg">{icon}</span>
      <span>{action}</span>
    </button>
  );
}
