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

const fetchPeersOnConference = (io, room) => {
  const rooms = io.of('/').adapter.rooms;
  for (const [id, value] of rooms.entries()) {
    if (id === room) return Array.from(value);
  }
  return [];
};

module.exports = { fetchData, fetchPeersOnConference };