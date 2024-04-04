const fetchData = (io) => {
  const sids = io.of('/').adapter.sids;
  const users = Array.from(sids.keys());
  let rooms = [];
  for (const [id, _] of io.of('/').adapter.rooms.entries()) {
    if (users.indexOf(id) === -1) rooms.push(id);
  }
  return {
    users,
    rooms,
  };
};

const fetchPeersOnConference = (io, socketId, conferenceId) => {
  const rooms = io.of('/').adapter.rooms;
  let temp = [];
  for (const [id, value] of rooms.entries()) {
    if (id === conferenceId) {
      temp = [...Array.from(value)];
      break;
    }
  }
  if (!temp.some((item) => item === socketId)) temp.push(socketId);
  return temp;
};

const fetchSocketsData = async (io) => {
  const fetchedSockets = await io.fetchSockets();
  return fetchedSockets.map((s) => s.data);
};

module.exports = { fetchData, fetchPeersOnConference, fetchSocketsData };
