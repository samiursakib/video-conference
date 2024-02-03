import React, { useState } from 'react';
import { MdJoinFull, MdLibraryAdd } from 'react-icons/md';
import { IoEnter, IoLogOut } from 'react-icons/io5';
import { AiFillMessage } from 'react-icons/ai';
import Button from './Button';

export default function Section({
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
}) {
  const enterConference = (conferenceId) => {
    setTransited(true);
    setConferenceId(conferenceId);
  };
  return (
    <div className="p-8">
      <div className="pb-2 border-b border-b-slate-800 text-md flex justify-between items-center">
        <div className="font-semibold text-lg">{title}</div>
        {forRooms && (
          <div className="flex items-center border border-slate-800 rounded">
            <input
              className="block h-full"
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <Button
              action={'Create'}
              onClick={() => {
                joinRoom(room);
                setRoom('');
              }}
              icon={<MdLibraryAdd />}
              disabled={!room}
            />
          </div>
        )}
      </div>
      {list?.length ? (
        <ul>
          {list.map((item, index) => (
            <li className="mt-2 flex justify-between items-center" key={index}>
              <span>{item}</span>
              {forRooms ? (
                <span>
                  {!joinedRooms?.some((r) => r === item) ? (
                    <Button
                      action={'Join'}
                      onClick={() => joinRoom(item)}
                      icon={<MdJoinFull />}
                    />
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        action={'Enter'}
                        onClick={() => enterConference(item)}
                        icon={<IoEnter />}
                      />
                      <Button
                        action={'Leave'}
                        onClick={() => leaveRoom(item)}
                        icon={<IoLogOut />}
                      />
                    </div>
                  )}
                </span>
              ) : (
                <span>
                  <Button
                    action={'Chat'}
                    onClick={() => enterConference(item)}
                    icon={<AiFillMessage />}
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
