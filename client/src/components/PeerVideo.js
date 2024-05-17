import React, { memo, useEffect, useRef, useState } from 'react';
import { cn, setVideoRef } from '../utils/helper';
import Button from './Button';
import { GoUnmute, GoMute } from 'react-icons/go';
import { IoVideocamOffOutline, IoVideocamOutline } from 'react-icons/io5';
import { sendMediaTrackChangedControls } from '../utils/actions';

const PeerVideo = ({ peer, stream, own, socket, conferenceId, controls }) => {
  const videoRef = useRef(null);
  const rootDiv = useRef(null);
  const [audioTrackEnabled, setAudioTrackEnabled] = useState(
    controls?.audioTrackEnabled
  );
  const [videoTrackEnabled, setVideoTrackEnabled] = useState(
    controls?.videoTrackEnabled
  );
  useEffect(() => {
    setVideoRef(videoRef, stream);
  }, [stream]);
  useEffect(() => {
    setAudioTrackEnabled(controls?.audioTrackEnabled);
    setVideoTrackEnabled(controls?.videoTrackEnabled);
  }, [controls]);
  const handleMuteUnmute = () => {
    if (!own) return;
    let [audioTrack] = stream.getAudioTracks();
    audioTrack.enabled = !audioTrack.enabled;
    setAudioTrackEnabled(audioTrack.enabled);
    sendMediaTrackChangedControls(
      socket,
      { audioTrackEnabled: !audioTrackEnabled, videoTrackEnabled },
      conferenceId
    );
  };
  const handleCameraOnOff = () => {
    if (!own) return;
    let [videoTrack] = stream.getVideoTracks();
    videoTrack.enabled = !videoTrack.enabled;
    setVideoTrackEnabled(videoTrack.enabled);
    sendMediaTrackChangedControls(
      socket,
      { audioTrackEnabled, videoTrackEnabled: !videoTrackEnabled },
      conferenceId
    );
  };
  return (
    <div
      className="flex-[1_1_50%] flex justify-center transition-all duration-300"
      ref={rootDiv}
    >
      <div className="h-64 aspect-[4/3] relative">
        <video className="w-full h-full rounded-md" ref={videoRef}></video>
        <div className="z-10 p-1 absolute bottom-0 w-full text-xs rounded-sm bg-gradient-to-t from-[#151515/50] to-transparent">
          <div className="w-full flex items-center">
            <div className="mr-auto ml-3 text-sm">{peer}</div>
            <div className="flex">
              <Button
                className={cn([
                  'hover:bg-transparent text-white/50 hover:cursor-default',
                  {
                    'hover:text-[#fff] hover:cursor-pointer': own,
                  },
                ])}
                onClick={handleCameraOnOff}
                icon={
                  videoTrackEnabled ? (
                    <IoVideocamOutline />
                  ) : (
                    <IoVideocamOffOutline />
                  )
                }
                full
                circle
              />
              <Button
                className={cn([
                  'hover:bg-transparent text-white/50 hover:cursor-default',
                  { 'hover:text-[#fff] hover:cursor-pointer': own },
                ])}
                onClick={handleMuteUnmute}
                icon={audioTrackEnabled ? <GoUnmute /> : <GoMute />}
                full
                circle
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PeerVideo);
