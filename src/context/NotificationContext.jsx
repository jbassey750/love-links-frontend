import { createContext } from "react";

export const NotificationContext = createContext({
  unreadCount: 0,
  notifications: [],
  latestNotification: null,
  latestMessage: null,
  messageEvents: [],
  messageEventVersion: 0,
  userStatusEvents: [],
  connectionStatus: "disconnected",
  realtimeReconnectVersion: 0,
  refreshUnreadCount: async () => {},
  refreshNotifications: async () => {},
  setUnreadCount: () => {},
  setNotifications: () => {},
  clearLatestNotification: () => {},
  API_ORIGIN: "",
});
