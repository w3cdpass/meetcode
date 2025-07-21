export const sendFriendRequest = async (targetUserId) => {
  try {
    const res = await fetch(`http://localhost:3000/friend-request/${targetUserId}`, {
      method: 'POST',
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
      },
    });

      const data = await res.json();
      console.log(data)
    if (res.ok) {
      alert(data.message);
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
  }
};
