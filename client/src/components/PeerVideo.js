import React, { useEffect, useRef } from 'react';
import { cn, setVideoRef } from '../utils/helper';

const PeerVideo = ({ peerId, stream, layoutChangable, self }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    setVideoRef(videoRef, stream);
  }, [stream]);
  return (
    <div
      className={cn([
        'p-2 flex flex-col w-1/2 sm:w-1/2 transition-all duration-300',
        {
          'absolute top-2 right-2 w-1/4 sm:w-1/4': layoutChangable && self,
        },
        {
          'w-full sm:w-full': layoutChangable && !self,
        },
      ])}
    >
      <h1 className="text-center text-xs">{peerId}</h1>
      <video
        className="w-full aspect-video object-cover object-center"
        ref={videoRef}
      ></video>
    </div>
  );
};

export default PeerVideo;
