import React, { useEffect, useRef } from 'react';
import { setVideoRef } from '../utils';

const PeerVideo = ({ peerId, stream }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    setVideoRef(videoRef, stream);
  }, [stream]);
  return (
    <div className="flex items-stretch justify-center sm:w-full w-1/4 border relative">
      <h1 className="absolute text-xs text-center">{peerId}</h1>
      <video
        className="block object-cover object-center w-full"
        ref={videoRef}
      ></video>
    </div>
  );
};

export default PeerVideo;
