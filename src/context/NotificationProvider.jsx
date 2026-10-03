import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import axios from "../api/axios";
import { NotificationContext } from "./NotificationContext";

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);

  const socketRef = useRef(null);
  const socketUserIdRef = useRef(null);
  const loadedUserIdRef = useRef(null);
  const notificationIdsRef = useRef(new Set());
  const realtimeNotificationIdsRef = useRef(new Set());
  const notificationEventVersionRef = useRef(0);
  const location = useLocation();

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

  // Remove /api because Socket.IO connects to the server root.
  const SOCKET_URL = API_ORIGIN;

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
      const encodedPayload = token.split(".")[1];
      if (!encodedPayload) return null;

      const base64Payload = encodedPayload
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const payload = JSON.parse(
        atob(base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, "="))
      );

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
  // Refresh all notifications
  // ==========================================

  const refreshNotifications = async () => {
    const requestEventVersion = notificationEventVersionRef.current;

    try {
      const response = await axios.get("/notifications");

      const notificationsPayload =
        response.data?.notifications ||
        response.data?.data ||
        response.data ||
        [];

      if (Array.isArray(notificationsPayload)) {
        const fetchedIds = new Set(
          notificationsPayload
            .map((item) => item?._id || item?.id)
            .filter(Boolean)
            .map((id) => id.toString())
        );

        setNotifications((current) => {
          const liveNotifications =
            notificationEventVersionRef.current !== requestEventVersion
              ? current.filter((item) => {
                  const id = item?._id || item?.id;
                  return (
                    id &&
                    realtimeNotificationIdsRef.current.has(id.toString()) &&
                    !fetchedIds.has(id.toString())
                  );
                })
              : [];
          const merged = [...liveNotifications, ...notificationsPayload];

          notificationIdsRef.current = new Set(
            merged
              .map((item) => item?._id || item?.id)
              .filter(Boolean)
              .map((id) => id.toString())
          );

          return merged;
        });
      }
    } catch (error) {
      console.error(
        "Failed to refresh notifications:",
        error,
      );
    }
  };

  // Connect once a user token is available, including after SPA login.
  useEffect(() => {
    const userId = getCurrentUserId();

    if (!userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        socketUserIdRef.current = null;
      }

      if (loadedUserIdRef.current) {
        loadedUserIdRef.current = null;
        notificationIdsRef.current.clear();
        realtimeNotificationIdsRef.current.clear();
        setNotifications([]);
        setUnreadCount(0);
        setLatestNotification(null);
      }

      return;
    }

    const normalizedUserId = userId.toString();

    if (loadedUserIdRef.current !== normalizedUserId) {
      loadedUserIdRef.current = normalizedUserId;
      notificationIdsRef.current.clear();
      realtimeNotificationIdsRef.current.clear();
      setNotifications([]);
      setUnreadCount(0);
      setLatestNotification(null);
      refreshUnreadCount();
      refreshNotifications();
    }

    if (
      socketRef.current &&
      socketUserIdRef.current === normalizedUserId
    ) {
      return;
    }

    socketRef.current?.disconnect();

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
  socketUserIdRef.current = normalizedUserId;

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
        normalizedUserId
      );

      socket.emit("join-user", normalizedUserId);
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

      const normalizedNotificationId = notificationId?.toString();

      if (
        normalizedNotificationId &&
        notificationIdsRef.current.has(normalizedNotificationId)
      ) {
        return;
      }

      if (normalizedNotificationId) {
        notificationIdsRef.current.add(normalizedNotificationId);
        realtimeNotificationIdsRef.current.add(normalizedNotificationId);
      }

      notificationEventVersionRef.current += 1;

      // Add notification to global notification list
      setNotifications((prev) => {
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
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      socketUserIdRef.current = null;
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
        refreshNotifications,
        setUnreadCount,
        setNotifications,
        clearLatestNotification,
        API_ORIGIN,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};