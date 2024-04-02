import React, { useEffect, useRef } from 'react';
import { cn, setVideoRef } from '../utils/helper';

const PeerVideo = ({ peerId, stream }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    setVideoRef(videoRef, stream);
  }, [stream]);
  return (
    <div className="flex-[1_1_50%] flex justify-center transition-all duration-300 relative">
      <span className="px-2 py-1 absolute bottom-0 text-xs bg-[#333] text-white rounded-sm">
        {peerId}
      </span>
      <video className="h-64 aspect-[4/3] rounded-md" ref={videoRef}></video>
    </div>
  );
};

export default PeerVideo;
