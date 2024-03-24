import React, { useEffect, useRef } from 'react';
import { setVideoRef } from '../utils/helper';

const PeerVideo = ({ peerId, stream, layoutChangable, self }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    setVideoRef(videoRef, stream);
  }, [stream]);
  // console.log('layoutChangable', layoutChangable);
  return (
    <div
      className={`flex items-stretch justify-center border ${
        layoutChangable
          ? `${
              self
                ? 'absolute top-2 right-2 w-1/3 sm:w-2/5 h-24 sm:h-40'
                : 'w-full h-full'
            }`
          : 'w-1/3 sm:w-2/5 h-24 sm:h-40'
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
