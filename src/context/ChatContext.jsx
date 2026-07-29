import React, { createContext, useState } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null);

  // Store distinct message histories by chat ID
  const [chatMessages, setChatMessages] = useState({
    1: [
      { id: 1, sender: "them", text: "Hey there! How's your day going?", time: "10:00 AM" }
    ],
    2: [
      { id: 1, sender: "them", text: "Exactly. Do you have a favorite director whose work you always go back to?", time: "4:40 PM" }
    ]
  });

  const addMessage = (chatId, newMessage) => {
    setChatMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage]
    }));
  };

  return (
    <ChatContext.Provider value={{ selectedChat, setSelectedChat, chatMessages, addMessage }}>
      {children}
    </ChatContext.Provider>
  );
};