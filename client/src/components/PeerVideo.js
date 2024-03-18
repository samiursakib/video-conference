import React, { useEffect, useRef } from 'react';
import { setVideoRef } from '../utils/helper';

const PeerVideo = ({ peerId, stream, layoutChangable, self }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    setVideoRef(videoRef, stream);
  }, [stream]);
  console.log('layoutChangable', layoutChangable);
  return (
    <div
      className={`flex items-stretch justify-center border-[1px] ${
        layoutChangable
          ? `${
              self ? 'absolute top-2 right-2 w-[100px] h-32' : 'w-full h-full'
            }`
          : 'w-1/4 h-32'
      } transition-all duration-300`}
    >
      <h1 className="absolute text-xs text-center">{peerId}</h1>
      <video
        className={`block object-cover object-center ${
          layoutChangable ? '' : ''
        }`}
        ref={videoRef}
      ></video>
    </div>
  );
};

export default PeerVideo;
