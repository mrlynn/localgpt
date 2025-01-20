// src/context/AppContext.js
import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [chats, setChats] = useState([]);

  return (
    <AppContext.Provider value={{ projects, setProjects, chats, setChats }}>
      {children}
    </AppContext.Provider>
  );
};
