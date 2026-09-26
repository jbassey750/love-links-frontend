import { createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";

export const NotificationContext = createContext({
  unreadCount: 0,
  notifications: [],
  latestNotification: null,
  refreshUnreadCount: async () => {},
  refreshNotifications: async () => {},
  setUnreadCount: () => {},
  setNotifications: () => {},
  clearLatestNotification: () => {},
  API_ORIGIN: "",
});

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);

  const socketRef = useRef(null);

  // =========================================================
  // API + SOCKET URL
  // =========================================================

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

  const SOCKET_URL = API_ORIGIN;

  // =========================================================
  // Get unread notification count
  // =========================================================

  const refreshUnreadCount = async () => {
    try {
      const response = await axios.get("/notifications/unread-count");

      const count =
        response.data?.unread ??
        response.data?.count ??
        response.data?.unreadCount ??
        0;

      setUnreadCount(Number(count) || 0);
    } catch (error) {
      console.error(
        "Failed to refresh notification unread count:",
        error,
      );
    }
  };

  // =========================================================
  // Get all notifications
  // =========================================================

  const refreshNotifications = async () => {
    try {
      const response = await axios.get("/notifications");

      const notificationsPayload =
        response.data?.notifications ||
        response.data?.data ||
        response.data ||
        [];

      if (Array.isArray(notificationsPayload)) {
        setNotifications(notificationsPayload);
      }
    } catch (error) {
      console.error(
        "Failed to refresh notifications:",
        error,
      );
    }
  };

  // =========================================================
  // Clear global notification popup
  // =========================================================

  const clearLatestNotification = () => {
    setLatestNotification(null);
  };

  // =========================================================
  // Initial notification data
  // =========================================================

  useEffect(() => {
    refreshUnreadCount();
    refreshNotifications();
  }, []);

  // =========================================================
  // GLOBAL SOCKET.IO NOTIFICATION LISTENER
  // =========================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      console.warn(
        "No logged-in user found. Notification socket will not connect.",
      );
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "Invalid user data in localStorage:",
        error,
      );
      return;
    }

    const userId = user?._id || user?.id;

    if (!userId) {
      console.warn(
        "No user ID found. Notification socket will not connect.",
      );
      return;
    }

    console.log(
      "Connecting notification socket:",
      SOCKET_URL,
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

    // =======================================================
    // SOCKET CONNECTED
    // =======================================================

    socket.on("connect", () => {
      console.log(
        "🔌 Notification socket connected:",
        socket.id,
      );

      socket.emit("join-user", userId.toString());

      console.log(
        "👤 Joined notification room:",
        userId.toString(),
      );
    });

    // =======================================================
    // CONNECTION ERROR
    // =======================================================

    socket.on("connect_error", (error) => {
      console.error(
        "❌ Notification socket connection error:",
        error,
      );
    });

    // =======================================================
    // NEW NOTIFICATION
    // =======================================================

    socket.on("new-notification", (notification) => {
      console.log(
        "🔔 New notification received:",
        notification,
      );

      if (!notification) {
        return;
      }

      const notificationId =
        notification._id || notification.id;

      // -------------------------------------------------------
      // Prevent duplicate notification
      // -------------------------------------------------------

      setNotifications((prev) => {
        if (!notificationId) {
          return [notification, ...prev];
        }

        const alreadyExists = prev.some(
          (item) =>
            (item._id || item.id)?.toString() ===
            notificationId.toString(),
        );

        if (alreadyExists) {
          return prev;
        }

        return [notification, ...prev];
      });

      // -------------------------------------------------------
      // Store latest notification globally.
      //
      // This is what allows the slide-down notification
      // popup to work on every page.
      // -------------------------------------------------------

      setLatestNotification(notification);

      // -------------------------------------------------------
      // Increase unread count
      // -------------------------------------------------------

      setUnreadCount((prev) => prev + 1);
    });

    // =======================================================
    // NOTIFICATION MARKED AS READ
    // =======================================================

    socket.on(
      "notification-read",
      ({ notificationId }) => {
        console.log(
          "Notification marked as read:",
          notificationId,
        );

        setNotifications((prev) =>
          prev.map((notification) => {
            const id =
              notification._id || notification.id;

            if (
              id?.toString() ===
              notificationId?.toString()
            ) {
              return {
                ...notification,
                isRead: true,
              };
            }

            return notification;
          }),
        );

        setUnreadCount((prev) =>
          Math.max(0, prev - 1),
        );
      },
    );

    // =======================================================
    // ALL NOTIFICATIONS MARKED AS READ
    // =======================================================

    socket.on("all-notifications-read", () => {
      console.log(
        "All notifications marked as read.",
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount(0);
    });

    // =======================================================
    // NOTIFICATION DELETED
    // =======================================================

    socket.on(
      "notification-deleted",
      ({ notificationId }) => {
        console.log(
          "Notification deleted:",
          notificationId,
        );

        setNotifications((prev) =>
          prev.filter((notification) => {
            const id =
              notification._id || notification.id;

            return (
              id?.toString() !==
              notificationId?.toString()
            );
          }),
        );

        refreshUnreadCount();
      },
    );

    // =======================================================
    // SOCKET DISCONNECTED
    // =======================================================

    socket.on("disconnect", (reason) => {
      console.log(
        "🔌 Notification socket disconnected:",
        reason,
      );
    });

    // =======================================================
    // CLEANUP
    // =======================================================

    return () => {
      console.log(
        "Cleaning up notification socket...",
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

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        latestNotification,
        refreshUnreadCount,
        refreshNotifications,
        setUnreadCount,
        clearLatestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};