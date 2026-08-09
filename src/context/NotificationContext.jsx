import { createContext } from "react";

export const NotificationContext = createContext({
  unreadCount: 0,
  refreshUnreadCount: async () => {},
  setUnreadCount: () => {},
});
