import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../../context/AuthContex";
import { Theme } from "../../../theme/globalTheme";
import { addMessage } from "../../../redux/features/chats/chatSlice";
import { fetchLastTwoDaysMessages } from "../../../redux/features/chats/chatThunks";
import { formatDateHeader } from "../../../../utils/DateFormater";
import { useTyping } from "../../../context/TypingContext";
import { useSocket } from "../../../context/SocketContext";
export function Messaging({ slectedFriends, goBack }) {
  const { socket, isReady } = useSocket();
  const { user } = useAuth();
  const { updateTyping } = useTyping();
  const currentUserId = user?._id;
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);

  const [message, setMessage] = useState("");
  const [typingUserId, setTypingUserId] = useState(null);
  const typingTimeoutRef = useRef(null);
  // const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  // Socket connection (only once)
  // useEffect(() => {
  //   socketRef.current = io(SOCKET_URL, { withCredentials: true });

  //   return () => {
  //     socketRef.current.disconnect();
  //   };
  // }, []);

  // Fetch messages on chat change
  useEffect(() => {
    if (slectedFriends?.chatId) {
      dispatch(fetchLastTwoDaysMessages(slectedFriends.chatId));
    }
  }, [slectedFriends, dispatch]);

  // Handle incoming messages & typing indicators
  // useEffect(() => {
  //   const socket = socketRef.current;

  //   const handleMessage = (data) => {
  //     if (data.from === slectedFriends._id) {
  //       dispatch(addMessage(data));
  //     }
  //   };

  //   const handleTyping = ({ chatId, senderId }) => {
  //     if (chatId === slectedFriends.chatId && senderId !== currentUserId) {
  //       setTypingUserId(senderId);
  //     }
  //     updateTyping(senderId, true)
  //     setTimeout(() => updateTyping(senderId, false), 400);
  //   };

  //   const handleStopTyping = ({ chatId, senderId }) => {
  //     if (chatId === slectedFriends.chatId && senderId !== currentUserId) {
  //       setTypingUserId(null);
  //     }
  //   };

  //   socket.on("receive_message", handleMessage);
  //   socket.on("user typing", handleTyping);
  //   socket.on("user stop typing", handleStopTyping);

  //   return () => {
  //     socket.off("receive_message", handleMessage);
  //     socket.off("user typing", handleTyping);
  //     socket.off("user stop typing", handleStopTyping);
  //   };
  // }, [slectedFriends, currentUserId, dispatch]);

  useEffect(() => {
    if (!socket || !slectedFriends?.chatId) return;

    const handleMessage = (data) => {
      if (data.from === slectedFriends._id) {
        dispatch(addMessage(data));
      }
    };

    // debounce

    let typingTimeout;
    const handleTyping = ({ chatId, senderId }) => {
      if (chatId === slectedFriends.chatId && senderId !== currentUserId) {
        setTypingUserId(senderId);
        updateTyping(senderId, true);

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          updateTyping(senderId, false);
          setTypingUserId(null);
        }, 1000);
      }
    };

    const handleStopTyping = ({ chatId, senderId }) => {
      if (chatId === slectedFriends.chatId && senderId !== currentUserId) {
        // no need to do anything here if you're using updateTyping
      }
    };

    socket.on("receive_message", handleMessage);
    socket.on("user typing", handleTyping);
    socket.on("user stop typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("user typing", handleTyping);
      socket.off("user stop typing", handleStopTyping);
    };
  }, [socket, slectedFriends, currentUserId, dispatch]);

  const groupedMessages = useMemo(() => {
    const groups = {};
    for (const msg of messages) {
      const header = formatDateHeader(msg.timestamp);
      if (!groups[header]) groups[header] = [];
      groups[header].push(msg);
    }
    return groups;
  }, [messages]);
  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!socket || !slectedFriends.chatId) return;

    socket.emit("typing", {
      chatId: slectedFriends.chatId,
      senderId: currentUserId,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", {
        chatId: slectedFriends.chatId,
        senderId: currentUserId,
      });
    }, 400);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    const newMsg = {
      from: currentUserId,
      to: slectedFriends._id,
      text: message,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", newMsg);
    dispatch(addMessage(newMsg));
    setMessage("");
  };

  return (
    <>
      <div
        className="max-md:hidden w-[25%] h-screen flex flex-col relative"
        style={{ backgroundColor: Theme.primaryBackgroundColor }}
      >
        {/* Header */}
        <header className="sticky top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center gap-3 z-10 border-b border-gray-100 dark:border-gray-700">
           <button
          onClick={goBack}
          className="h-6 w-6 bg-gray-400 text-[#333] rounded-full text-sm cursor-pointer"
        >
          <li className="fa-solid fa-arrow-left"></li>
        </button>
          <img
            src={slectedFriends.picture}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 dark:border-gray-600"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {slectedFriends.name}
              </span>
              <span className="w-2 h-2 bg-green-500 rounded-full "></span>
              {/* {!off ? <span className="w-2 h-2 bg-green-500 rounded-full "></span> : <span className="w-2 h-2 rounded-full bg-green-500"></span>} */}
            </div>
            {typingUserId === slectedFriends._id && (
              <span className=" absolute text-xs text-gray-500 dark:text-gray-400">
                Typing...
              </span>
            )}
          </div>
        </header>

        {/* Messages Container */}
        <main className="flex-1 pt-4 pb-10 overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-600 scrollbar-track-transparent">
          {Object.entries(groupedMessages).map(([dateHeader, msgs]) => (
            <div key={dateHeader} className="flex flex-col px-4 mb-4">
              {/* Date header */}
              <div className="sticky top-0 z-0 text-center mx-auto mb-3">
                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-xs font-medium py-1 px-3 rounded-full text-gray-600 dark:text-gray-300">
                  {dateHeader}
                </span>
              </div>

              {/* Messages */}
              <div className="flex flex-col gap-2">
                {msgs.map((msg, index) => {
                  const isFromFriend =
                    (msg.sender && msg.sender === slectedFriends._id) ||
                    (msg.from && msg.from === slectedFriends._id);

                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isFromFriend ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[75%] px-4 py-2 text-sm rounded-2xl ${
                          isFromFriend
                            ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none shadow"
                            : "bg-blue-500 text-white rounded-tr-none shadow"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                        <small
                          className={`block text-xs mt-1 ${
                            isFromFriend
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-blue-100"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        {/* Typing Indicator */}
        {typingUserId === slectedFriends._id && (
          <div className="absolute bottom-20 left-4  px-2 py-1 rounded-full  text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center ">
              <div className="de">
                <div className="bou"></div>
                <div className="bou2"></div>
                <div className="bou3"></div>
              </div>
            </span>
          </div>
        )}

        {/* Message Input */}
        <footer
          className="sticky bottom-0 w-full px-4 py-3 border-t border-gray-100 dark:border-gray-700"
          style={{ backgroundColor: Theme.thirdBackgroundColor }}
        >
          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 bg-white dark:bg-gray-700 p-2 rounded-full shadow"
          >
            <button
              type="button"
              className="text-blue-500 dark:text-blue-400 p-1"
            >
              <i className="fa-regular fa-face-smile text-xl"></i>
            </button>
            <input
              type="text"
              placeholder="Write a message..."
              value={message}
              onChange={handleInputChange}
              onBlur={() =>
                socket.emit("stop typing", {
                  chatId: slectedFriends.chatId,
                  senderId: currentUserId,
                })
              }
              className="flex-1 px-3 py-2 outline-none bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full text-white font-medium text-sm transition-colors"
            >
              Send <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </form>
        </footer>
      </div>
    </>
  );
}

{
  /* {messages.map((msg, index) => {
            const isFromFriend =
              (msg.sender && msg.sender === slectedFriends._id) ||
              (msg.from && msg.from === slectedFriends._id);
            return (
              <div
                key={index}
                className={`max-w-[70%] px-4 py-2 shadow-sm text-sm ${
                  isFromFriend
                    ? "bg-white self-start text-gray-800 rounded-tr-2xl rounded-br-2xl rounded-sm"
                    : "self-end text-right text-black client_1 rounded-tl-2xl rounded-bl-2xl rounded-sm"
                }`}
              >
                <div>
                  <div>
                    {(() => {
                      const date = new Date(msg.timestamp);
                      const day = date.toLocaleString("en-US", {
                        weekday: "short",
                      });
                      const dayNum = date.getDate();
                      const shortYear = date.getFullYear().toString().slice(-2);

                      return (
                        <>
                          <span>{day}</span>-<span>{dayNum}</span>-
                          <span>{shortYear}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <p>{msg.text}</p>
                <small className="block text-[0.65rem] text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
            );
          })} */
}
