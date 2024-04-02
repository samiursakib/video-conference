import React, { useState } from 'react';
import { MdJoinFull, MdLibraryAdd } from 'react-icons/md';
import { IoEnter, IoLogOut } from 'react-icons/io5';
import { AiFillMessage } from 'react-icons/ai';
import Button from './Button';

export default function Section({
  socket,
  setConferenceId,
  setTransited,
  message,
  setMessage,
  sendMessage,
  room,
  setRoom,
  title,
  list,
  forRooms,
  joinRoom,
  leaveRoom,
  joinedRooms,
  setJoinedRooms,
  // setGroupCall,
}) {
  const enterConference = (conferenceId) => {
    setTransited(true);
    setConferenceId(conferenceId);
    // if (forRooms) {
    //   setGroupCall(true);
    // }
  };
  return (
    <div className="grow">
      <div className="">
        <div
          className={`my-5 flex flex-col sm:flex-row items-start sm:justify-between gap-2 ${
            forRooms ? '' : ''
          }`}
        >
          <div className="font-semibold">{title}</div>
          {forRooms && (
            <div className="flex items-center gap-2">
              <input
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
              />
            </div>
          )}
        </div>
      </div>
      {list?.length ? (
        <ul className="flex flex-col">
          {list.map((item, index) => (
            <li
              className="flex justify-between items-center hover:bg-[#fff]/20 pl-3 pr-1 py-1 rounded-md transition-all duration"
              key={index}
            >
              <span className="text-md">{item}</span>
              {forRooms ? (
                <span>
                  {!joinedRooms?.some((r) => r === item) ? (
                    <Button
                      // action={'Join'}
                      onClick={() => joinRoom(socket, item, setJoinedRooms)}
                      icon={<MdJoinFull />}
                    />
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        // action={'Enter'}
                        onClick={() => enterConference(item)}
                        icon={<IoEnter />}
                      />
                      <Button
                        // action={'Leave'}
                        onClick={() => leaveRoom(socket, item, setJoinedRooms)}
                        icon={<IoLogOut />}
                      />
                    </div>
                  )}
                </span>
              ) : (
                <span>
                  <Button
                    // action={'Chat'}
                    onClick={() => enterConference(item)}
                    icon={<IoEnter />}
                    disabled={false}
                    full
                  />
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <span className="mt-2 block">No {title.toLowerCase()} available</span>
      )}
    </div>
  );
}
