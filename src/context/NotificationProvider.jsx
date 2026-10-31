import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import axios from "../api/axios";
import { NotificationContext } from "./NotificationContext";

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);
  const [latestMessage, setLatestMessage] = useState(null);
  const [messageEvents, setMessageEvents] = useState([]);
  const [messageEventVersion, setMessageEventVersion] = useState(0);
  const [socket, setSocket] = useState(null);

  const socketRef = useRef(null);
  const socketUserIdRef = useRef(null);
  const loadedUserIdRef = useRef(null);
  const notificationIdsRef = useRef(new Set());
  const realtimeNotificationIdsRef = useRef(new Set());
  const notificationFingerprintsRef = useRef(new Map());
  const messageIdsRef = useRef(new Set());
  const messageEventVersionRef = useRef(0);
  const notificationEventVersionRef = useRef(0);
  const notificationsRef = useRef(notifications);
  const location = useLocation();

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

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
    const requestEventVersion = notificationEventVersionRef.current;
    const requestUserId = loadedUserIdRef.current;

    try {
      const response = await axios.get(
        "/notifications/unread-count"
      );

      const count =
        response.data?.unread ??
        response.data?.count ??
        response.data?.unreadCount ??
        0;

      if (
        notificationEventVersionRef.current === requestEventVersion &&
        loadedUserIdRef.current === requestUserId
      ) {
        setUnreadCount(Number(count) || 0);
      }
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
    const requestUserId = loadedUserIdRef.current;

    try {
      const response = await axios.get("/notifications");
      if (loadedUserIdRef.current !== requestUserId) return;

      const notificationsPayload =
        response.data?.notifications ||
        response.data?.data ||
        response.data ||
        [];

      if (Array.isArray(notificationsPayload)) {
        setNotifications((current) => {
          const currentRealtimeById = new Map(
            current
              .map((item) => {
                const id = item?._id || item?.id;
                return [id?.toString(), item];
              })
              .filter(([id]) =>
                id && realtimeNotificationIdsRef.current.has(id)
              )
          );
          const fetchedIds = new Set(
            notificationsPayload
              .map((item) => item?._id || item?.id)
              .filter(Boolean)
              .map((id) => id.toString())
          );
          const merged = [
            ...current.filter((item) => {
              const id = item?._id || item?.id;
              return (
                id &&
                realtimeNotificationIdsRef.current.has(id.toString()) &&
                !fetchedIds.has(id.toString())
              );
            }),
            ...notificationsPayload.map((item) => {
              const id = item?._id || item?.id;
              return id
                ? currentRealtimeById.get(id.toString()) || item
                : item;
            }),
          ];

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
        setSocket(null);
      }

      if (loadedUserIdRef.current) {
        notificationEventVersionRef.current += 1;
        loadedUserIdRef.current = null;
        notificationIdsRef.current.clear();
        realtimeNotificationIdsRef.current.clear();
        notificationFingerprintsRef.current.clear();
        messageIdsRef.current.clear();
        setLatestMessage(null);
        setMessageEvents([]);
        setMessageEventVersion(0);
        messageEventVersionRef.current = 0;
        setNotifications([]);
        setUnreadCount(0);
        setLatestNotification(null);
      }

      return;
    }

    const normalizedUserId = userId.toString();

    if (loadedUserIdRef.current !== normalizedUserId) {
      notificationEventVersionRef.current += 1;
      loadedUserIdRef.current = normalizedUserId;
      notificationIdsRef.current.clear();
      realtimeNotificationIdsRef.current.clear();
      notificationFingerprintsRef.current.clear();
      setNotifications([]);
      setUnreadCount(0);
      setLatestNotification(null);
      setLatestMessage(null);
      setMessageEvents([]);
      setMessageEventVersion(0);
      messageIdsRef.current.clear();
      messageEventVersionRef.current = 0;
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
    setSocket(socket);

    const handleIncomingNotification = (notification) => {
      if (!notification) return;

      const body =
        notification.body ||
        notification.message ||
        notification.title ||
        "You have a new notification.";
      const fingerprint = JSON.stringify([
        notification.type || "",
        notification.title || "",
        body,
        notification.data?.chatId?.toString?.() || notification.data?.chatId || "",
        notification.data?.matchId?.toString?.() || notification.data?.matchId || "",
        notification.data?.likeId?.toString?.() || notification.data?.likeId || "",
        notification.data?.userId?.toString?.() || notification.data?.userId || "",
      ]);
      const now = Date.now();
      const fingerprints = notificationFingerprintsRef.current;

      for (const [key, expiresAt] of fingerprints) {
        if (expiresAt <= now) fingerprints.delete(key);
      }

      if ((fingerprints.get(fingerprint) || 0) > now) return;
      fingerprints.set(fingerprint, now + 2000);

      const notificationId =
        notification?._id || notification?.id;
      const normalizedNotificationId = notificationId?.toString();

      if (
        normalizedNotificationId &&
        realtimeNotificationIdsRef.current.has(normalizedNotificationId)
      ) {
        return;
      }

      const normalizedNotification = {
        ...notification,
        _id: normalizedNotificationId || `realtime-${now}`,
        body,
        createdAt: notification.createdAt || new Date(now).toISOString(),
      };

      realtimeNotificationIdsRef.current.add(normalizedNotification._id);
      notificationEventVersionRef.current += 1;

      setNotifications((prev) =>
        prev.some(
          (item) =>
            (item?._id || item?.id)?.toString() ===
            normalizedNotification._id.toString()
        )
          ? prev
          : [normalizedNotification, ...prev]
      );
      setUnreadCount((prev) => prev + 1);
      setLatestNotification(normalizedNotification);
    };

    const handleIncomingMessage = (message) => {
      if (!message) return;

      const messageId = message?._id || message?.id;
      const normalizedMessageId = messageId?.toString();
      const senderId =
        message.sender?._id?.toString?.() ||
        message.senderId?.toString?.() ||
        message.sender?.toString?.();

      if (
        !normalizedMessageId ||
        messageIdsRef.current.has(normalizedMessageId) ||
        senderId === normalizedUserId
      ) {
        return;
      }

      messageIdsRef.current.add(normalizedMessageId);
      if (messageIdsRef.current.size > 200) {
        messageIdsRef.current.delete(messageIdsRef.current.values().next().value);
      }

      messageEventVersionRef.current += 1;
      const event = {
        ...message,
        eventVersion: messageEventVersionRef.current,
      };
      setLatestMessage(event);
      setMessageEventVersion(event.eventVersion);
      setMessageEvents((prev) => [...prev, event].slice(-100));
    };

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

    socket.on("new-notification", handleIncomingNotification);
    socket.on("notification", handleIncomingNotification);

    socket.on("new-message", handleIncomingMessage);

    socket.on("notification-read", (data) => {
      notificationEventVersionRef.current += 1;
      console.log(
        "Notification marked as read:",
        data
      );

      const notificationId =
        data?.notificationId;
      if (notificationId) {
        realtimeNotificationIdsRef.current.add(notificationId.toString());
      }

      setNotifications((prev) =>
        prev.map((notification) => {
          const currentId = notification?._id || notification?.id;
          if (currentId?.toString() !== notificationId?.toString()) {
            return notification;
          }

          return { ...notification, isRead: true };
        })
      );

      refreshUnreadCount();
    });

    // ------------------------------------------
    // ALL NOTIFICATIONS READ
    // ------------------------------------------

    socket.on("all-notifications-read", () => {
      notificationEventVersionRef.current += 1;
      notificationsRef.current.forEach((notification) => {
        const id = notification?._id || notification?.id;
        if (id) realtimeNotificationIdsRef.current.add(id.toString());
      });
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
      notificationEventVersionRef.current += 1;
      console.log(
        "Notification deleted:",
        data
      );

      const notificationId =
        data?.notificationId;
      if (notificationId) {
        realtimeNotificationIdsRef.current.add(notificationId.toString());
      }

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

  }, [location.pathname, SOCKET_URL]);

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

  const clearLatestNotification = useCallback(() => {
    setLatestNotification(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        latestNotification,
        latestMessage,
        messageEvents,
        messageEventVersion,
        socket,
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