import { useCallback, useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import { NotificationContext } from "./NotificationContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const getTokenUserId = (token) => {
  if (!token) return null;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return payload?.id || payload?._id || payload?.userId || null;
  } catch (error) {
    console.error("Failed to parse authenticated user from token:", error);
    return null;
  }
};

const getNotificationId = (notification) =>
  notification?._id?.toString?.() || notification?.id?.toString?.() || null;

const getMessageId = (message) =>
  message?._id?.toString?.() || message?.id?.toString?.() || null;

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);
  const [latestMessage, setLatestMessage] = useState(null);
  const [messageEvents, setMessageEvents] = useState([]);
  const [messageEventVersion, setMessageEventVersion] = useState(0);
  const [userStatusEvents, setUserStatusEvents] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [realtimeReconnectVersion, setRealtimeReconnectVersion] = useState(0);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const lastEventIdRef = useRef(null);
  const notificationIdsRef = useRef(new Set());
  const messageIdsRef = useRef(new Set());
  const notificationEventVersionRef = useRef(0);
  const messageEventVersionRef = useRef(0);
  const userStatusEventVersionRef = useRef(0);
  const hadConnectionRef = useRef(false);
  const notificationsRef = useRef(notifications);
  const loadedUserIdRef = useRef(null);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "token") setToken(event.newValue);
    };
    const handleTokenChange = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-token-changed", handleTokenChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-token-changed", handleTokenChange);
    };
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    const requestVersion = notificationEventVersionRef.current;
    const requestUserId = loadedUserIdRef.current;

    try {
      const response = await axios.get("/notifications/unread-count");
      const count =
        response.data?.unread ??
        response.data?.count ??
        response.data?.unreadCount ??
        0;
      if (
        notificationEventVersionRef.current === requestVersion &&
        loadedUserIdRef.current === requestUserId
      ) {
        setUnreadCount(Number(count) || 0);
      }
    } catch (error) {
      console.error("Failed to refresh unread notifications count:", error);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    const requestVersion = notificationEventVersionRef.current;
    const requestUserId = loadedUserIdRef.current;

    try {
      const response = await axios.get("/notifications");
      if (loadedUserIdRef.current !== requestUserId) return;

      const payload =
        response.data?.notifications ||
        response.data?.data ||
        response.data ||
        [];
      if (!Array.isArray(payload)) return;

      setNotifications((current) => {
        const byId = new Map(
          payload.map((item) => [getNotificationId(item), item]),
        );
        if (notificationEventVersionRef.current !== requestVersion) {
          current.forEach((item) => {
            const id = getNotificationId(item);
            if (id && notificationIdsRef.current.has(id)) byId.set(id, item);
          });
        }
        const merged = [...byId.values()].filter(Boolean);
        notificationIdsRef.current = new Set(
          merged.map(getNotificationId).filter(Boolean),
        );
        return merged.sort(
          (a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
      });
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    }
  }, []);

  useEffect(() => {
    const userId = getTokenUserId(token);
    const normalizedUserId = userId?.toString() || null;
    if (loadedUserIdRef.current !== normalizedUserId) {
      loadedUserIdRef.current = normalizedUserId;
      lastEventIdRef.current = null;
      notificationIdsRef.current.clear();
      messageIdsRef.current.clear();
      notificationEventVersionRef.current += 1;
      messageEventVersionRef.current = 0;
      userStatusEventVersionRef.current = 0;
      hadConnectionRef.current = false;
      setUnreadCount(0);
      setNotifications([]);
      setLatestNotification(null);
      setLatestMessage(null);
      setMessageEvents([]);
      setMessageEventVersion(0);
      setUserStatusEvents([]);
    }

    if (!token || !userId) {
      return undefined;
    }

    let stopped = false;
    let controller;

    const handleEvent = (event) => {
      if (event.id) lastEventIdRef.current = event.id;

      if (event.type === "sync-required") {
        void refreshNotifications();
        void refreshUnreadCount();
      }

      if (
        event.type === "new-notification" ||
        event.type === "notification" ||
        event.type === "notification-created"
      ) {
        const notification =
          event.type === "notification-created"
            ? event.data?.notification
            : event.data;
        if (!notification) return;
        const id = getNotificationId(notification);
        if (id && notificationIdsRef.current.has(id)) return;

        const normalized = {
          ...notification,
          _id: id || `realtime-${event.id || Date.now()}`,
          createdAt: notification.createdAt || new Date().toISOString(),
        };
        if (id) notificationIdsRef.current.add(id);
        notificationEventVersionRef.current += 1;
        setNotifications((current) =>
          current.some(
            (item) => getNotificationId(item) === getNotificationId(normalized),
          )
            ? current
            : [normalized, ...current],
        );
        if (!normalized.isRead) setUnreadCount((count) => count + 1);
        setLatestNotification(normalized);
        return;
      }

      if (event.type === "notification-read") {
        notificationEventVersionRef.current += 1;
        const id = event.data?.notificationId?.toString();
        const target = notificationsRef.current.find(
          (item) => getNotificationId(item) === id,
        );
        if (target && !target.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        setNotifications((current) =>
          current.map((item) =>
            getNotificationId(item) === id ? { ...item, isRead: true } : item,
          ),
        );
        return;
      }

      if (event.type === "all-notifications-read") {
        notificationEventVersionRef.current += 1;
        setUnreadCount(0);
        setNotifications((current) =>
          current.map((item) => ({ ...item, isRead: true })),
        );
        return;
      }

      if (event.type === "notification-deleted") {
        notificationEventVersionRef.current += 1;
        const id = event.data?.notificationId?.toString();
        const target = notificationsRef.current.find(
          (item) => getNotificationId(item) === id,
        );
        if (target && !target.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        setNotifications((current) =>
          current.filter((item) => getNotificationId(item) !== id),
        );
        return;
      }

      if (event.type === "new-message") {
        const message = event.data;
        const id = getMessageId(message);
        const senderId =
          message?.sender?._id?.toString?.() ||
          message?.senderId?.toString?.() ||
          message?.sender?.toString?.();
        if (!id || messageIdsRef.current.has(id) || senderId === normalizedUserId) {
          return;
        }

        messageIdsRef.current.add(id);
        if (messageIdsRef.current.size > 500) {
          messageIdsRef.current.delete(messageIdsRef.current.values().next().value);
        }
        messageEventVersionRef.current += 1;
        const normalized = {
          ...message,
          eventVersion: messageEventVersionRef.current,
        };
        setLatestMessage(normalized);
        setMessageEventVersion(normalized.eventVersion);
        setMessageEvents((current) => [...current, normalized].slice(-100));
        return;
      }

      if (event.type === "user-status-changed") {
        userStatusEventVersionRef.current += 1;
        setUserStatusEvents((current) =>
          [
            ...current,
            {
              ...event.data,
              eventVersion: userStatusEventVersionRef.current,
            },
          ].slice(-100),
        );
      }
    };

    const parseFrame = (frame) => {
      const dataLines = [];
      for (const line of frame.split("\n")) {
        if (line.startsWith("id:")) {
          lastEventIdRef.current = line.slice(3).trim();
        } else if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trimStart());
        }
      }
      if (!dataLines.length) return;
      try {
        handleEvent(JSON.parse(dataLines.join("\n")));
      } catch (error) {
        console.error("Failed to parse real-time event:", error);
      }
    };

    const consumeStream = async (response, signal) => {
      if (!response.body) throw new Error("SSE response has no readable body.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!signal.aborted) {
        const { value, done } = await reader.read();
        if (done) throw new Error("Real-time stream closed.");
        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          parseFrame(buffer.slice(0, boundary));
          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf("\n\n");
        }
      }
    };

    const runStream = async () => {
      let retryDelay = 1000;
      while (!stopped) {
        controller = new AbortController();
        try {
          setConnectionStatus("connecting");
          const headers = { Authorization: `Bearer ${token}` };
          if (lastEventIdRef.current) {
            headers["Last-Event-ID"] = lastEventIdRef.current;
          }
          const response = await fetch(`${API_URL}/events/stream`, {
            method: "GET",
            headers,
            signal: controller.signal,
            credentials: "include",
          });

          if (response.status === 401 || response.status === 403) {
            setConnectionStatus("unauthorized");
            return;
          }
          if (!response.ok) {
            throw new Error(`Real-time stream returned HTTP ${response.status}.`);
          }

          const isReconnect = hadConnectionRef.current;
          hadConnectionRef.current = true;
          retryDelay = 1000;
          setConnectionStatus("connected");
          void refreshNotifications();
          void refreshUnreadCount();
          if (isReconnect) {
            setRealtimeReconnectVersion((version) => version + 1);
          }
          await consumeStream(response, controller.signal);
        } catch (error) {
          if (stopped || error.name === "AbortError") return;
          setConnectionStatus("reconnecting");
          if (hadConnectionRef.current) {
            void refreshNotifications();
            void refreshUnreadCount();
            setRealtimeReconnectVersion((version) => version + 1);
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          retryDelay = Math.min(retryDelay * 2, 30000);
        }
      }
    };

    void runStream();
    return () => {
      stopped = true;
      controller?.abort();
      setConnectionStatus("disconnected");
    };
  }, [token, refreshNotifications, refreshUnreadCount]);

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
        userStatusEvents,
        connectionStatus,
        realtimeReconnectVersion,
        refreshUnreadCount,
        refreshNotifications,
        setUnreadCount,
        setNotifications,
        clearLatestNotification,
        API_ORIGIN: API_URL.replace(/\/api\/?$/, ""),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
