import { createContext, useContext, useState } from "react";

const TypingContext = createContext();

export function TypingProvider({ children }) {
  const [typingUsers, setTypingUsers] = useState({}); // { userId: true }

  const updateTyping = (userId, isTyping) => {
    setTypingUsers((prev) => ({
      ...prev,
      [userId]: isTyping,
    }));
  };

  return (
    <TypingContext.Provider value={{ typingUsers, updateTyping }}>
      {children}
    </TypingContext.Provider>
  );
}

// Custom hook
export const useTyping = () => useContext(TypingContext);
