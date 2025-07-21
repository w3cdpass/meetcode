import { setMessages } from "./chatSlice";

export const fetchLastTwoDaysMessages = (chatId) => async (dispatch) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACK_DEV_API}/chats/${chatId}/messages`, {
            method: "GET",
            credentials: 'include',
        });

        const data = await response.json();

        const lastTwoDays = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        const filtered = data.messages.messages.filter((msg) => new Date(msg.timestamp) >= lastTwoDays);

        dispatch(setMessages(filtered));
    } catch (err) {
        console.error("Failed to load chat:", err);
    }
};