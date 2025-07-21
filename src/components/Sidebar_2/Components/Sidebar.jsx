import { useContext, useEffect, useState } from "react";
import { Theme } from "../../../theme/globalTheme";
import Logo from "/logo.svg";
import { Messaging } from "../../Message/Components/Message";
import { useTyping } from "../../../context/TypingContext";
import useOnline from "../../../utils/CheckOnline";
import { UserContext } from "../../../context/Profile";
import UserProfile from "../../Profile/PersonalInfo";
import CollaborativeEditor from "../../code/Editor";

export function Sidebar_Two({ token }) {
  const off = useOnline();
  const { typingUsers } = useTyping();
  const [active, setActive] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friends, setFriends] = useState([]);
  const { isProfile, setIsProfile } = useContext(UserContext);
  const { codeEditor } = useContext(UserContext);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACK_DEV_API}/chats`, {
      method: "GET",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const friends = data?.friends;
        if (friends) {
          setFriends(friends);
        } else {
          setFriends([]);
        }
      })
      .catch((err) => {
        console.log("Failed to fetch Friends", err);
      });
  }, [token]);

  function handleFriendSelect(friend) {
    setSelectedFriend(friend);
  }

  // if (codeEditor) {
  //   return (
  //     <>
  //       <div
  //         className="hidden md:flex w-[75%] p-1.5  py-5  justify-center items-center "
  //         style={{ backgroundColor: Theme.primaryBackgroundColor }}
  //       >
  //         <div className="flex justify-center">
  //           <div className="w-full">
  //             <img className="pic w-full" src={Logo} alt="meetup logo" />
  //             <p
  //               className="text-2xl text-center text- font-semibold "
  //               style={{ color: Theme.primaryTextColor }}
  //             >
  //               "Type, Send, Smile – No Fuss Messaging."
  //             </p>
  //           </div>
  //         </div>
  //       </div>
  //     </>
  //   )else {

  //     return <CollaborativeEditor />;
  //   }
  // }

  if (isProfile) {
    return (
      <div className="w-[65%] p-4 flex flex-col gap-4 bg-gray-500">
        <button
          onClick={() => setIsProfile(false)}
          className="h-6 w-6 bg-blue-400 text-white rounded-full text-sm cursor-pointer"
        >
          <li className="fa-solid fa-arrow-left"></li>
        </button>
        <UserProfile />
      </div>
    );
  }

  return (
    <>
      {codeEditor ? (
        <CollaborativeEditor />
      ) : (
        <div
          className="hidden md:flex w-[75%] p-1.5  py-5  justify-center items-center "
          style={{ backgroundColor: Theme.primaryBackgroundColor }}
        >
          <div className="flex justify-center">
            <div className="w-full">
              <img className="pic w-full" src={Logo} alt="meetup logo" />
              <p
                className="text-2xl text-center text- font-semibold "
                style={{ color: Theme.primaryTextColor }}
              >
                "Type, Send, Smile – No Fuss Messaging."
              </p>
            </div>
          </div>
        </div>
      )}
      {!selectedFriend ? (
        <div
          className=" w-[100%] md:w-[25%] "
          style={{ backgroundColor: Theme.secondaryBackgroundColor }}
        >
          <div className="flex justify-between px-5">
            <div className="flex gap-4">
              <p className="font-semibold">Chats</p>
              <p className="font-semibold">Streams</p>
            </div>
            {!off && <h1>Offline</h1>}
            <div>
              <i className="fa-solid fa-tower-broadcast"></i>
            </div>
          </div>
          <div className="flex justify-center px-4  items-center gap-1">
            <input
              className="w-full p-1 my-4 rounded"
              type="search"
              placeholder="Search Chats or Starts a new Chats"
              style={{ backgroundColor: Theme.searchInout }}
            />
            <div
              className=" p-1 rounded"
              style={{ backgroundColor: Theme.searchInout }}
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
          </div>
          <div
            className="overflow-y-auto scrollbar scrollbar-thin scrollbar-track-sky-200  scrollbar-thumb-blue-400 max-h-[calc(100vh-112px)] px-2"
            style={{ scrollbarGutter: "stable" }}
          >
            {friends.map((friend) => (
              <div
                onClick={() => handleFriendSelect(friend)}
                key={friend._id}
                // className="px-5 py-1  flex items-start justify-between mb-1 rounded-sm"
                className={`px-5 py-2 flex items-start justify-between mb-1 rounded-sm cursor-pointer ${
                  selectedFriend?._id === friend._id
                    ? "bg-blue-100 border border-blue-300"
                    : "bg-white"
                }`}
                style={{
                  backgroundColor:
                    active === friend.id
                      ? Theme.onchat.inactive
                      : Theme.onchat.active,
                  border:
                    active === friend.id
                      ? `1px solid ${Theme.onchat.borderColor}`
                      : "",
                }}
              >
                <div className="flex gap-2">
                  <img
                    className="w-10 h-10 rounded-full mix-blend-multiply"
                    src={friend.picture}
                    alt={`profile picture of ${friend.name}`}
                  />
                  <div className="">
                    <span>{friend.name}</span>
                    {/* {console.log(friend)} */}
                    {friend._id && typingUsers[friend._id] ? (
                      <p className="mr-2">typing ..</p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <span>
                  {friend.lastMessageAt
                    ? new Date(friend.lastMessageAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Messaging
          slectedFriends={selectedFriend}
          goBack={() => setSelectedFriend(null)}
        />
      )}
    </>
  );
}
