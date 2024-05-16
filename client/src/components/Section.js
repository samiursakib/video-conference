import React, { memo, useState } from 'react';
import { MdJoinFull, MdLibraryAdd } from 'react-icons/md';
import { IoEnter, IoLogOut } from 'react-icons/io5';
import Button from './Button';
import { findSocket } from '../utils/helper';

const Section = ({
  socket,
  setConferenceId,
  setTransited,
  socketsData,
  title,
  list,
  forRooms,
  joinRoom,
  leaveRoom,
  joinedRooms,
  setJoinedRooms,
}) => {
  const [room, setRoom] = useState('');
  const enterConference = (conferenceId) => {
    setTransited(true);
    setConferenceId(conferenceId);
  };
  return (
    <div className="grow">
      <div className="my-5 flex flex-col sm:flex-row items-start sm:justify-between">
        <div className="font-semibold uppercase">{title}</div>
        {forRooms && (
          <div className="w-full sm:w-64 flex items-center gap-2 mt-2 sm:mt-0">
            <input
              className="w-0 grow"
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <Button
              // action={'Create'}
              onClick={() => {
                joinRoom(socket, room, setJoinedRooms);
                setRoom('');
              }}
              icon={<MdLibraryAdd />}
              disabled={!room}
              circle
            />
          </div>
        )}
      </div>
      {list?.length ? (
        <ul className="py-2 flex flex-col bg-lightblue shadow-md rounded-lg">
          {list.map((item, index) => (
            <li
              className="flex justify-between items-center pl-4 pr-2 rounded-md transition-all duration"
              key={index}
            >
              <span className="text-md">
                {!forRooms ? findSocket(socketsData, item)?.username : item}
              </span>
              {forRooms ? (
                <span>
                  {!joinedRooms?.some((r) => r === item) ? (
                    <Button
                      // action={'Join'}
                      onClick={() => joinRoom(socket, item, setJoinedRooms)}
                      icon={<MdJoinFull />}
                      circle
                    />
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        // action={'Enter'}
                        onClick={() => enterConference(item)}
                        icon={<IoEnter />}
                        circle
                      />
                      <Button
                        // action={'Leave'}
                        onClick={() => leaveRoom(socket, item, setJoinedRooms)}
                        icon={<IoLogOut />}
                        circle
                      />
                    </div>
                  )}
                </span>
              ) : (
                <span>
                  <Button
                    // action={'Enter'}
                    onClick={() => enterConference(item)}
                    icon={<IoEnter />}
                    disabled={false}
                    circle
                  />
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="h-28 flex justify-center items-center text-lg bg-lightblue shadow-md rounded-lg">
          No {title.toLowerCase()} available
        </div>
      )}
    </div>
  );
};

export default memo(Section);
