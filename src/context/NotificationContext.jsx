import { createContext } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";

export const NotificationContext = createContext({
  unreadCount: 0,
  notifications: [],
  latestNotification: null,
  refreshUnreadCount: async () => {},
  setUnreadCount: () => {},
  clearLatestNotification: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);

  // ==========================================
  // Get current unread notification count
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
        "Failed to refresh notification unread count:",
        error
      );
    }
  };

  // ==========================================
  // Clear the notification currently shown
  // in the global popup
  // ==========================================
  const clearLatestNotification = () => {
    setLatestNotification(null);
  };

  // ==========================================
  // Initial unread count
  // ==========================================
  useEffect(() => {
    refreshUnreadCount();
  }, []);

  // ==========================================
  // Global Socket.IO notification listener
  // ==========================================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      console.warn(
        "No logged-in user found. Notification socket will not connect."
      );
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user data in localStorage:", error);
      return;
    }

    const userId = user?._id || user?.id;

    if (!userId) {
      console.warn(
        "No user ID found. Notification socket will not connect."
      );
      return;
    }

    const socketUrl =
      import.meta.env.VITE_API_URL || "http://localhost:5000";

    console.log("Connecting notification socket:", socketUrl);

    const socket = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    // ==========================================
    // Socket connected
    // ==========================================
    socket.on("connect", () => {
      console.log(
        "🔌 Notification socket connected:",
        socket.id
      );

      // Join this user's private Socket.IO room
      socket.emit("join-user", userId);

      console.log(
        "👤 Joined notification room:",
        userId
      );
    });

    // ==========================================
    // NEW NOTIFICATION
    // ==========================================
    socket.on("new-notification", (notification) => {
      console.log(
        "🔔 New notification received:",
        notification
      );

      // Store notification for the global popup
      setLatestNotification(notification);

      // Increase unread count
      setUnreadCount((prev) => prev + 1);
    });

    // ==========================================
    // Notification marked as read
    // ==========================================
    socket.on("notification-read", ({ notificationId }) => {
      console.log(
        "Notification marked as read:",
        notificationId
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    // ==========================================
    // All notifications marked as read
    // ==========================================
    socket.on("all-notifications-read", () => {
      console.log("All notifications marked as read.");

      setUnreadCount(0);
    });

    // ==========================================
    // Notification deleted
    // ==========================================
    socket.on("notification-deleted", ({ notificationId }) => {
      console.log(
        "Notification deleted:",
        notificationId
      );

      // We refresh from the backend instead of guessing
      // whether the deleted notification was unread.
      refreshUnreadCount();
    });

    // ==========================================
    // Socket disconnected
    // ==========================================
    socket.on("disconnect", (reason) => {
      console.log(
        "🔌 Notification socket disconnected:",
        reason
      );
    });

    // ==========================================
    // Cleanup
    // ==========================================
    return () => {
      console.log("Cleaning up notification socket...");

      socket.off("connect");
      socket.off("new-notification");
      socket.off("notification-read");
      socket.off("all-notifications-read");
      socket.off("notification-deleted");
      socket.off("disconnect");

      socket.disconnect();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
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