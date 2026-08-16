import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";
import { NotificationContext } from "./NotificationContext";

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);

  const socketRef = useRef(null);

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      return (
        payload?.id ||
        payload?._id ||
        payload?.userId ||
        null
      );
    } catch (error) {
      console.error(
        "Failed to parse auth token for notification socket:",
        error
      );

      return null;
    }
  };

  // ==========================================
  // Refresh unread notification count
  // ==========================================
  const refreshUnreadCount = async () => {
    try {
      const response = await axios.get("/notifications/unread-count");

      const count =
        response.data?.unread ??
        response.data?.count ??
        response.data?.unreadCount ??
        0;

      setUnreadCount(count);
    } catch (error) {
      console.error(
        "Failed to refresh unread notifications count:",
        error
      );
    }
  };

  // ==========================================
  // Initial unread count
  // ==========================================
  useEffect(() => {
    refreshUnreadCount();
  }, []);

  // ==========================================
  // Socket.IO
  // ==========================================
  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        transports: ["websocket"],
        withCredentials: true,
      }
    );

    socketRef.current = socket;

    // ------------------------------------------
    // Socket connected
    // ------------------------------------------
    socket.on("connect", () => {
      console.log("Notification socket connected:", socket.id);

      const userId = getCurrentUserId();

      if (userId) {
        console.log("Joining notification room:", userId);

        socket.emit("join-user", userId);
      }
    });

    // ------------------------------------------
    // NEW NOTIFICATION
    // ------------------------------------------
    socket.on("new-notification", (notification) => {
      console.log("🔔 New notification received:", notification);

      // Add notification to global notification list
      setNotifications((prev) => {
        const notificationId =
          notification?._id || notification?.id;

        const alreadyExists = prev.some(
          (item) =>
            (item?._id || item?.id) === notificationId
        );

        if (alreadyExists) {
          return prev;
        }

        return [notification, ...prev];
      });

      // Increase unread count
      setUnreadCount((prev) => prev + 1);

      // Store latest notification
      // This is what other pages can use
      setLatestNotification(notification);
    });

    // ------------------------------------------
    // NOTIFICATION READ
    // ------------------------------------------
    socket.on("notification-read", (data) => {
      console.log("Notification marked as read:", data);

      setUnreadCount((prev) =>
        Math.max(0, prev - 1)
      );

      setNotifications((prev) =>
        prev.map((notification) => {
          const notificationId =
            notification?._id || notification?.id;

          if (
            notificationId === data?.notificationId
          ) {
            return {
              ...notification,
              isRead: true,
            };
          }

          return notification;
        })
      );
    });

    // ------------------------------------------
    // ALL NOTIFICATIONS READ
    // ------------------------------------------
    socket.on("all-notifications-read", () => {
      console.log("All notifications marked as read");

      setUnreadCount(0);

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    });

    // ------------------------------------------
    // NOTIFICATION DELETED
    // ------------------------------------------
    socket.on("notification-deleted", (data) => {
      console.log("Notification deleted:", data);

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            (notification?._id || notification?.id) !==
            data?.notificationId
        )
      );

      refreshUnreadCount();
    });

    // ------------------------------------------
    // Disconnect
    // ------------------------------------------
    socket.on("disconnect", () => {
      console.log("Notification socket disconnected");
    });

    // Cleanup
    return () => {
      socket.off("connect");
      socket.off("new-notification");
      socket.off("notification-read");
      socket.off("all-notifications-read");
      socket.off("notification-deleted");
      socket.off("disconnect");

      socket.disconnect();
    };
  }, []);

  // ==========================================
  // Clear popup notification
  // ==========================================
  const clearLatestNotification = () => {
    setLatestNotification(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        latestNotification,
        refreshUnreadCount,
        setUnreadCount,
        clearLatestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};