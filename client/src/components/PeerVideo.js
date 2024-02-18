import React, { useEffect, useRef } from 'react';
import { setVideoRef } from '../utils';

const PeerVideo = ({ peerId, stream }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    setVideoRef(videoRef, stream);
  }, [stream]);
  return (
    <div className="w-1/4 border border-red-500">
      <h1>{peerId}</h1>
      <video className="w-full h-full" ref={videoRef}></video>
    </div>
  );
};

export default PeerVideo;
