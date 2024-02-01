const fetchData = (io) => {
  const sids = io.of('/').adapter.sids;
  const users = Array.from(sids.keys());
  let rooms = new Set([]);
  for (const [id, roomSet] of sids.entries()) {
    for (const room of Array.from(roomSet)) {
      if (room !== id) rooms.add(room);
    }
  }
  return {
    users,
    rooms: Array.from(rooms),
  };
};

module.exports = { fetchData };
