import React, { memo } from 'react';
import { cn } from '../utils/helper';

const Button = ({
  className,
  action,
  onClick,
  icon,
  disabled,
  full,
  circle,
}) => {
  return (
    <button
      className={cn([
        'flex items-center justify-center hover:bg-dim px-1 py-1 space-x-2 hover:cursor-pointer transition-all',
        className,
        {
          'w-full h-full': full,
          'rounded-full w-[40px] h-[40px]': circle,
          'rounded-sm h-full': !circle,
        },
      ])}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{icon}</span>
      {action && <span>{action}</span>}
    </button>
  );
};

export default memo(Button);
