import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";
import { NotificationContext } from "./NotificationContext";

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.id || payload?._id || payload?.userId || null;
    } catch (error) {
      console.error("Failed to parse auth token for notification socket:", error);
      return null;
    }
  };

  const refreshUnreadCount = async () => {
    try {
      const response = await axios.get("/notifications/unread-count");
      const count =
        response.data?.unread ?? response.data?.count ?? response.data?.unreadCount ?? 0;
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to refresh unread notifications count:", error);
    }
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      await refreshUnreadCount();
    };
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Notification socket connected:", socket.id);
      const userId = getCurrentUserId();
      if (userId) {
        socket.emit("join-user", userId);
      }
    });

    socket.on("new-notification", () => {
      setUnreadCount((prevCount) => prevCount + 1);
    });

    socket.on("notification-read", () => {
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    });

    socket.on("all-notifications-read", () => {
      setUnreadCount(0);
    });

    socket.on("notification-deleted", () => {
      refreshUnreadCount();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, refreshUnreadCount, setUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
