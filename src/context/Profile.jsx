import { createContext, useState } from 'react';

export const UserContext = createContext();
export const UserProvider = ({ children }) => {
    const [isProfile, setIsProfile] = useState(false)
    const [codeEditor,setCodeEditor ] = useState(false)
    return (
        <UserContext.Provider value={{
            isProfile, setIsProfile,
            codeEditor,setCodeEditor
        }}>
            {children}
        </UserContext.Provider>
    )
};

