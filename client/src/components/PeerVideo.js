import React, { useEffect, useRef } from 'react';
import { setVideoRef } from '../utils';

const PeerVideo = ({ stream }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    setVideoRef(videoRef, stream);
  }, [stream]);
  return (
    <div className="w-1/2 border border-red-500">
      <video className="w-full h-full" ref={videoRef}></video>
    </div>
  );
};

export default PeerVideo;
