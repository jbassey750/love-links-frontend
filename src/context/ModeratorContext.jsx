import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { socket } from "../../services/socket";

export const ModeratorContext = createContext();

export const ModeratorProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Single-reply lock state: true when moderator has sent a reply and is waiting for the real user
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const playNotificationSound = () => {
    const audio = new Audio("/sounds/notification.mp3");
    audio.play().catch((err) => console.log("Audio play blocked by browser:", err));
  };

  const triggerBrowserNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  };

  // Fetch all assigned conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get("/moderator/conversations");
      const data = response.data?.conversations || response.data || [];
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch moderator conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const response = await api.get(`/moderator/conversations/${conversationId}/messages`);
      const msgData = response.data?.messages || response.data || [];
      setMessages(msgData);

      // Lock input if the last message was sent by the fake account (moderator)
      if (msgData.length > 0) {
        const lastMsg = msgData[msgData.length - 1];
        setIsWaitingForReply(lastMsg.senderType === "fake");
      } else {
        setIsWaitingForReply(false);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
      showToast("Could not load message history.", "error");
    }
  }, []);

  // Socket setup & real-time event handling
  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onNewMessage(data) {
      // data: { conversationId, message, senderType }
      playNotificationSound();
      triggerBrowserNotification("New Message Received", data.message?.text || "New media attached");

      fetchConversations();

      if (activeChat && activeChat.id === data.conversationId) {
        setMessages((prev) => [...prev, data.message]);
        if (data.senderType === "real") {
          setIsWaitingForReply(false); // Unlock input for moderator
        }
      }
    }

    function onChatAssigned(data) {
      showToast(`New chat assigned: ${data.realUserName}`, "info");
      fetchConversations();
    }

    function onUserTyping(data) {
      if (activeChat && activeChat.id === data.conversationId) {
        setIsTyping(data.isTyping);
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new-message", onNewMessage);
    socket.on("chat-assigned", onChatAssigned);
    socket.on("user-typing", onUserTyping);

    fetchConversations();

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new-message", onNewMessage);
      socket.off("chat-assigned", onChatAssigned);
      socket.off("user-typing", onUserTyping);
      socket.disconnect();
    };
  }, [activeChat, fetchConversations]);

  // Select active conversation
  const selectConversation = (chat) => {
    setActiveChat(chat);
    fetchMessages(chat.id);
  };

  // Send single reply
  const sendMessage = async (text, mediaUrl = null, mediaType = "text") => {
    if (!activeChat || isWaitingForReply || actionLoading) return;

    try {
      setActionLoading(true);
      const payload = {
        conversationId: activeChat.id,
        text,
        mediaUrl,
        mediaType,
      };

      const response = await api.post("/moderator/reply", payload);
      const newMsg = response.data?.message || {
        id: Date.now(),
        text,
        mediaUrl,
        mediaType,
        senderType: "fake",
        timestamp: new Date().toISOString(),
        status: "sent",
      };

      setMessages((prev) => [...prev, newMsg]);
      setIsWaitingForReply(true); // Lock until next real user message arrives
      fetchConversations();
    } catch (err) {
      console.error("Failed to send message:", err);
      showToast("Failed to send reply. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ModeratorContext.Provider
      value={{
        conversations,
        activeChat,
        messages,
        loading,
        actionLoading,
        isConnected,
        isWaitingForReply,
        isTyping,
        toast,
        setToast,
        selectConversation,
        sendMessage,
        fetchConversations,
      }}
    >
      {children}
    </ModeratorContext.Provider>
  );
};