import { useEffect, useState } from "react";
import Logo from "/profile.svg";
const UserProfile = () => {
  const [currentUser, setCurrentUser] = useState([]);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/me", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex justify-around">
          <span className="border-b-2 p-1">Profile</span>
          <span className="border-b-2 p-1">Appearance</span>
        </div>
        <div className="bg-gray-200 rounded-md flex">
          <div className="p-2 bg-gray-500">
            <p>Username</p>
            <input
              type="text"
              className="outline-none border rounded-lg py-1.5 px-2.5 "
            />
            <p className="mt-4">About</p>
            <span>Hi! i a meetup user.</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
