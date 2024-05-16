import React, { memo, useState, useRef, useEffect } from 'react';
import Message from './Message';
import avatarSkeletonMale from '../images/avatar-skeleton-male.png';
import { cn, findSocket } from '../utils/helper';
import Button from './Button';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { BsFillSendFill } from 'react-icons/bs';
import { scrollToLastMessage, sendMessage } from '../utils/actions';

const ConversationContainer = ({
  conversations,
  conferenceId,
  socketsData,
  socket,
  setConversations,
}) => {
  const [message, setMessage] = useState('');
  const [scrolledHeight, setScrolledHeight] = useState(0);
  const [scrollBottom, setScrollBottom] = useState(true);
  const messageEndRef = useRef(null);
  const conversationContainer = useRef(null);

  const conversation = conversations[conferenceId];
  useEffect(() => {
    scrollToLastMessage(messageEndRef);
  }, [conversation, scrollBottom]);
  const onScroll = () => {
    const value =
      conversationContainer.current?.scrollHeight -
      conversationContainer.current?.clientHeight -
      conversationContainer.current?.scrollTop;
    setScrolledHeight(value);
  };

  return (
    <div className="w-1/3 flex flex-col border-l border-slate-700">
      <div
        className="basis-[calc(100vh-8rem)] overflow-auto relative"
        ref={conversationContainer}
        onScroll={onScroll}
      >
        {conferenceId in conversations ? (
          <div className="flex flex-col">
            <ul className="flex flex-col gap-1">
              {conversations[conferenceId].map((m, id) => {
                const foundSocket = findSocket(socketsData, m.sender);
                return (
                  <Message
                    key={id}
                    sender={
                      foundSocket?.username === 'username'
                        ? foundSocket?.id
                        : foundSocket?.username
                    }
                    avatar={avatarSkeletonMale}
                    msg={m.message}
                  />
                );
              })}
              <li ref={messageEndRef}></li>
            </ul>
          </div>
        ) : (
          <div className="h-full flex justify-center items-center">
            No message yet
          </div>
        )}
        <Button
          className={cn([
            '-rotate-90 fixed bottom-20 right-24',
            {
              'hidden hover:cursor-pointer': scrolledHeight <= 100,
            },
          ])}
          onClick={() => setScrollBottom((prev) => !prev)}
          icon={<IoMdArrowRoundBack />}
          circle
        />
      </div>
      <div className="px-3 basis-16 flex justify-between items-center space-x-2">
        <input
          className="w-0 grow"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          className="rotate-45"
          onClick={() =>
            sendMessage(
              socket,
              message,
              conferenceId,
              setMessage,
              setConversations
            )
          }
          icon={<BsFillSendFill />}
          disabled={!message}
          circle
        />
      </div>
    </div>
  );
};

export default memo(ConversationContainer);
