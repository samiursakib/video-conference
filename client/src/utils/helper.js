import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const getMedia = async () => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  return mediaStream;
};

export const setVideoRef = (videoRef, stream) => {
  videoRef.current.srcObject = stream;
  let selfPlayPromise = videoRef.current.play();
  if (selfPlayPromise !== undefined) {
    selfPlayPromise
      .then((_) => {
        // console.log('playing self stream');
      })
      .catch((e) => {
        // console.log('error while playing self stream');
      });
  }
};

export const cn = (...args) => {
  return twMerge(clsx(args));
};

export const isIdInRooms = (availableRooms, id) => {
  return id in availableRooms;
};

export const findSocket = (data, socketId) => {
  return data.filter((s) => s.id === socketId)[0];
};
