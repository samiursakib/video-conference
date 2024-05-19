import { memo } from 'react';
import Button from './Button';
import { MdCall, MdCallEnd } from 'react-icons/md';

const CallingAnimation = () => {
  const dot = (
    <div className="flex gap-1 my-4 justify-center">
      <div className="mr-2 text-xl">Calling</div>
      <div className="mt-4 w-1 h-1 bg-white rounded-full animate-[callingDot_1s_ease-in-out_infinite] animat"></div>
      <div className="mt-4 w-1 h-1 bg-white rounded-full animate-[callingDot_1s_ease-in-out_infinite_200ms]"></div>
      <div className="mt-4 w-1 h-1 bg-white rounded-full animate-[callingDot_1s_ease-in-out_infinite_400ms]"></div>
    </div>
  );
  return dot;
};

const CallerModal = () => {
  return (
    <>
      <div className="text-center font-bold">Sakib</div>
      <CallingAnimation />
      <div className="flex justify-evenly gap-8">
        <Button
          className="bg-[#399948]/70 hover:bg-[#57a063]"
          onClick={() => {}}
          icon={<MdCall />}
          disabled={false}
          circle
        />
        <Button
          className="bg-[#c92a2a]/70 hover:bg-[#c92a2a]"
          onClick={() => {}}
          icon={<MdCallEnd />}
          disabled={false}
          circle
        />
      </div>
    </>
  );
};

export default memo(CallerModal);
