export const getMedia = async () => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
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

export const isConferenceIdInRooms = (availableRooms, conferenceId) => {
  return conferenceId in availableRooms;
};
