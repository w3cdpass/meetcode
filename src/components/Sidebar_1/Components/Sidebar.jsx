import { useContext, useEffect, useState } from "react";
import { Theme } from "../../../theme/globalTheme";
import { Link } from "react-router-dom";
import { UserContext } from "../../../context/Profile";

export function Sidebar_One({ token }) {
    const [active, setActive] = useState(null);
    const [open, setOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const {setIsProfile} = useContext(UserContext)
    const { setCodeEditor } = useContext(UserContext);
    function handleClick(str) {
        setActive(str);
    }

    useEffect(() => {
        if (open) {
            fetch(`${import.meta.env.VITE_BACK_DEV_API}/api/me`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json()) // <--- parse JSON here
                .then((data) => {
                    const user = data.user;
                    if (user?.friendRequestsReceived) {
                        setRequests(user.friendRequestsReceived);
                    } else {
                        setRequests([]); // fallback if no requests
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch /api/me:", err);
                    setRequests([]);
                });
        }
    }, [open]);
    const handleAccept = (senderId) => {
        fetch(`${import.meta.env.VITE_BACK_DEV_API}/frnd-req/${senderId}/accept`, {
            method: "POST",
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        }).then(() => setRequests((prev) => prev.filter((id) => id !== senderId)));
    };
    const handleDecline = (senderId) => {
        fetch(`${import.meta.env.VITE_BACK_DEV_API}/frnd-req/${senderId}/decline`, {
            method: "POST",
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
        }).then(() => setRequests((prev) => prev.filter((id) => id !== senderId)));
    };
    return (
        <div
            className="w-[15%] sm:w-[10%] md:w-[5%]"
            style={{ backgroundColor: Theme.thirdBackgroundColor }}
        >
            <div className="flex items-center justify-between h-screen flex-col py-5">
                <div className="flex flex-col gap-5  lg:text-xl text-sm ">
                    <i className="fa-solid fa-bars cursor-pointer"></i>
                    <i
                        className="fa-solid fa-message cursor-pointer"
                        title="Chats"
                        onClick={() => setIsProfile(false)}
                        style={{
                            color:
                                active === "msg" ? Theme.button.active : Theme.button.inactive,
                        }}
                    ></i>
                    <i className="fa-solid fa-code  cursor-pointer "  title="Code" onClick={() => setCodeEditor(true)}></i>
                </div>
                <div className="flex flex-col gap-3 lg:text-xl text-sm">
                    <div>
                        <div onClick={() => setOpen(!open)} className="flex   justify-center items-end">
                            <div className="">
                                {open ? (
                                <i className="fa-regular fa-envelope-open"></i>
                            ) : (
                                <i className="fa-regular fa-envelope"></i>
                            )}
                            </div>
                            <span className="bg-black p-[4px] rounded-full   absolute "></span>
                        </div>

                        {open && (
                            <div className="popup absolute bottom-1/12 rounded-lg left-12 md:left-15 bg-red-300 z-20 p-2">
                                <div className="flex  items-center gap-1 ">
                                <h3>Friend Requests</h3>
                                <div className="bg-black w-4 h-4 rounded-full text-white text-[0.6rem]  text-center flex items-center justify-center font-semibold">2</div>
                                </div>
                                {requests.length === 0 ? (
                                    <p>No new requests.</p>
                                ) : (
                                    requests.map((req) => (
                                        <div key={req._id} className="request-item flex items-end">
                                            <div className="flex items-end justify-center ">
                                            <img className="w-13 rounded-xl" src={req.picture} alt={req.name} />
                                            <span className="w-13 absolute  bg-amber-300 px-[11px] rounded-b-xl text-xs text-center ">{req.name}</span>
                                            </div>
                                            <div className="flex gap-1 p-1">
                                            <button onClick={() => handleDecline(req._id)} className="bg-red-100 p-0.5 rounded-md text-xs">
                                                Decline
                                            </button>
                                                <button onClick={() => handleAccept(req._id)} className="bg-amber-300 p-1 rounded-md text-sm ">
                                                Accept
                                            </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    <i className="fa-solid fa-user" onClick={() => setIsProfile(true)}></i>
                    
                    <i className="fa-solid fa-gear"></i>
                </div>
            </div>
        </div>
    );
}
