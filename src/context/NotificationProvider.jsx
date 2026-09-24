import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";
import { NotificationContext } from "./NotificationContext";

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);

  const socketRef = useRef(null);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Remove /api because Socket.IO connects to the server root.
  const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

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
      const response = await axios.get(
        "/notifications/unread-count"
      );

      const count =
        response.data?.unread ??
        response.data?.count ??
        response.data?.unreadCount ??
        0;

      setUnreadCount(Number(count) || 0);
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
    const userId = getCurrentUserId();

    if (!userId) {
      console.log(
        "No logged-in user found. Notification socket will not connect."
      );

      return;
    }

    console.log(
      "Connecting notification socket:",
      SOCKET_URL
    );

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // ------------------------------------------
    // Socket connected
    // ------------------------------------------

    socket.on("connect", () => {
      console.log(
        "🔌 Notification socket connected:",
        socket.id
      );

      console.log(
        "👤 Joining notification room:",
        userId
      );

      socket.emit("join-user", userId.toString());
    });

    // ------------------------------------------
    // Socket connection error
    // ------------------------------------------

    socket.on("connect_error", (error) => {
      console.error(
        "❌ Notification socket connection error:",
        error
      );
    });

    // ------------------------------------------
    // NEW NOTIFICATION
    // ------------------------------------------

    socket.on("new-notification", (notification) => {
      console.log(
        "🔔 New notification received:",
        notification
      );

      if (!notification) return;

      const notificationId =
        notification?._id || notification?.id;

      // Add notification to global notification list
      setNotifications((prev) => {
        if (!notificationId) {
          return [notification, ...prev];
        }

        const alreadyExists = prev.some((item) => {
          const existingId =
            item?._id || item?.id;

          return (
            existingId?.toString() ===
            notificationId?.toString()
          );
        });

        if (alreadyExists) {
          return prev;
        }

        return [notification, ...prev];
      });

      // Update unread count
      setUnreadCount((prev) => prev + 1);

      // Make popup available globally
      setLatestNotification(notification);
    });

    // ------------------------------------------
    // NOTIFICATION READ
    // ------------------------------------------

    socket.on("notification-read", (data) => {
      console.log(
        "Notification marked as read:",
        data
      );

      const notificationId =
        data?.notificationId;

      setNotifications((prev) =>
        prev.map((notification) => {
          const currentId =
            notification?._id ||
            notification?.id;

          if (
            currentId?.toString() ===
            notificationId?.toString()
          ) {
            return {
              ...notification,
              isRead: true,
            };
          }

          return notification;
        })
      );

      setUnreadCount((prev) =>
        Math.max(0, prev - 1)
      );
    });

    // ------------------------------------------
    // ALL NOTIFICATIONS READ
    // ------------------------------------------

    socket.on("all-notifications-read", () => {
      console.log(
        "All notifications marked as read"
      );

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
      console.log(
        "Notification deleted:",
        data
      );

      const notificationId =
        data?.notificationId;

      setNotifications((prev) =>
        prev.filter((notification) => {
          const currentId =
            notification?._id ||
            notification?.id;

          return (
            currentId?.toString() !==
            notificationId?.toString()
          );
        })
      );

      refreshUnreadCount();
    });

    // ------------------------------------------
    // Disconnect
    // ------------------------------------------

    socket.on("disconnect", (reason) => {
      console.log(
        "🔌 Notification socket disconnected:",
        reason
      );
    });

    // ------------------------------------------
    // Cleanup
    // ------------------------------------------

    return () => {
      console.log(
        "Cleaning up notification socket..."
      );

      socket.off("connect");
      socket.off("connect_error");
      socket.off("new-notification");
      socket.off("notification-read");
      socket.off("all-notifications-read");
      socket.off("notification-deleted");
      socket.off("disconnect");

      socket.disconnect();

      socketRef.current = null;
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