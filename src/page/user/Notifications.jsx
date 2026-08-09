import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Hook for SPA navigation without page reload
import Loader from "../../components/Loader"; // Importing Loader component
import axios from "../../api/axios"; // Importing axios instance for API calls
import { NotificationContext } from "../../context/NotificationContext";

const Notifications = () => {
  const navigate = useNavigate();
  const { unreadCount, refreshUnreadCount, setUnreadCount } = useContext(NotificationContext);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'unread' | 'match' | 'like'
  const [popupMessage, setPopupMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null); // Tracks pending action per item
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Helper function to show temporary pop-up messages
  const showPopup = (msg) => {
    setPopupMessage(msg);
    setTimeout(() => {
      setPopupMessage("");
    }, 3000);
  };

  const formatNotificationTime = (createdAt) => {
    if (!createdAt) {
      console.warn("Notification missing createdAt:", createdAt);
      return "Unknown";
    }

    const timestamp = new Date(createdAt).getTime();
    if (Number.isNaN(timestamp) || timestamp <= 0) {
      console.warn("Invalid notification createdAt:", createdAt);
      return "Unknown";
    }

    const deltaSeconds = Math.floor((currentTime - timestamp) / 1000);
    if (deltaSeconds < 60) {
      return "Just now";
    }

    const deltaMinutes = Math.floor(deltaSeconds / 60);
    if (deltaMinutes < 60) {
      return `${deltaMinutes} ${deltaMinutes === 1 ? "min" : "mins"} ago`;
    }

    const deltaHours = Math.floor(deltaMinutes / 60);
    if (deltaHours < 24) {
      return `${deltaHours} ${deltaHours === 1 ? "hour" : "hours"} ago`;
    }

    const deltaDays = Math.floor(deltaHours / 24);
    if (deltaDays === 1) {
      return "Yesterday";
    }
    if (deltaDays < 7) {
      return `${deltaDays} days ago`;
    }

    const deltaWeeks = Math.floor(deltaDays / 7);
    if (deltaWeeks < 4) {
      return `${deltaWeeks} ${deltaWeeks === 1 ? "week" : "weeks"} ago`;
    }

    const deltaMonths = Math.floor(deltaDays / 30);
    if (deltaMonths < 12) {
      return `${deltaMonths} ${deltaMonths === 1 ? "month" : "months"} ago`;
    }

    const deltaYears = Math.floor(deltaDays / 365);
    return `${deltaYears} ${deltaYears === 1 ? "year" : "years"} ago`;
  };

  // 1. Fetch initial data (Notifications & Unread Count)
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resNotifications, resUnread] = await Promise.all([
        axios.get("/notifications"),
        axios.get("/notifications/unread-count"),
      ]);

      const notificationsPayload =
        resNotifications.data?.notifications ||
        resNotifications.data?.data ||
        resNotifications.data ||
        [];

      setNotifications(
        Array.isArray(notificationsPayload) ? notificationsPayload : [],
      );
      setUnreadCount(
        resUnread.data?.unread ??
          resUnread.data?.count ??
          resUnread.data?.unreadCount ??
          0,
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // 3. Mark Single Notification as Read
  const markAsRead = async (id) => {
    const target = notifications.find((n) => (n._id || n.id) === id);
    if (!target || target.isRead) return;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => ((n._id || n.id) === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await axios.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      fetchInitialData();
    }
  };

  // 4. Handle Notification Click (Routing without page reloads)
  const handleNotificationClick = (item, e) => {
    if (e) e.preventDefault();
    const itemKey = item._id || item.id;

    // Mark as read first
    markAsRead(itemKey);

    // Dynamic routing based on notification type
    if (item.type === "message") {
      const chatId = item.chatId || item.conversationId;
      const senderId = item.senderId || item.sender?._id;

      if (chatId) {
        navigate(`/chat/${chatId}`);
      } else if (senderId) {
        navigate(`/conversations/`);
      } else {
        navigate("/messages");
      }
    }

    // Like notification
    else if (item.type === "like") {
      const targetUserId =
        item.data?.userId || item.senderId || item.sender?._id;

      if (targetUserId) {
        navigate(`/profile/${targetUserId}`);
      }
    }

    // Match notification
    else if (item.type === "match") {
      const chatId = item.data?.chatId;

      if (chatId) {
        navigate(`/chat/${chatId}`); // Replace '/chat/' with your actual chat route if different
      } else {
        showPopup("Unable to open this conversation.");
      }
    }
  };

  // 5. Interactive Action: Like Back Button
  const handleLikeBack = async (item, e) => {
    e.stopPropagation(); // Prevents card click navigation
    const itemKey = item._id || item.id;
    const targetUserId = item.senderId || item.sender?._id;

    if (!targetUserId) {
      showPopup("Unable to find user details to like back.");
      return;
    }

    try {
      setActionLoadingId(itemKey);
      await axios.post("/matches/like", { targetUserId });
      showPopup(`You liked ${item.senderName || "user"} back! ❤️`);
      markAsRead(itemKey);
    } catch (error) {
      console.error("Failed to like back:", error);

      const targetName =
        error.response?.data?.userName ||
        error.response?.data?.name ||
        item.senderName ||
        "this user";

      if (error.response && error.response.status === 400) {
        showPopup(`You have already liked this user: ${targetName}.`);
      } else {
        showPopup("Failed to send like. Please try again.");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // 6. Mark All Notifications as Read
  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await axios.patch("/notifications/read-all");
      showPopup("All notifications marked as read! 🎉");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      showPopup("Failed to mark all as read. Please try again.");
      fetchInitialData();
      refreshUnreadCount();
    }
  };

  // 7. Delete Notification API Call
  const deleteNotification = async (id, e) => {
    e.stopPropagation();

    const itemToDelete = notifications.find((n) => (n._id || n.id) === id);

    setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
    if (itemToDelete && !itemToDelete.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await axios.delete(`/notifications/${id}`);
      showPopup("Notification deleted successfully");
      refreshUnreadCount();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      showPopup("Failed to delete notification. Restoring...");
      fetchInitialData();
      refreshUnreadCount();
    }
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Filter Logic
  const notificationsArray = Array.isArray(notifications) ? notifications : [];
  const filteredNotifications = notificationsArray.filter((n) => {
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "match") return n.type === "match";
    if (activeFilter === "like") return n.type === "like";
    return true;
  });

  // Type Indicator Badges
  const renderTypeIcon = (type) => {
    switch (type) {
      case "like":
        return (
          <span
            className="position-absolute bottom-0 end-0 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center"
            style={{ width: "22px", height: "22px" }}
          >
            <i
              className="bi bi-heart-fill text-danger"
              style={{ fontSize: "0.7rem" }}
            ></i>
          </span>
        );
      case "match":
        return (
          <span
            className="position-absolute bottom-0 end-0 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center"
            style={{ width: "22px", height: "22px" }}
          >
            <i
              className="bi bi-stars"
              style={{ color: "#73112d", fontSize: "0.75rem" }}
            ></i>
          </span>
        );
      case "message":
        return (
          <span
            className="position-absolute bottom-0 end-0 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center"
            style={{ width: "22px", height: "22px" }}
          >
            <i
              className="bi bi-chat-dots-fill text-primary"
              style={{ fontSize: "0.7rem" }}
            ></i>
          </span>
        );
      default:
        return (
          <span
            className="position-absolute bottom-0 end-0 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center"
            style={{ width: "22px", height: "22px" }}
          >
            <i
              className="bi bi-shield-check text-success"
              style={{ fontSize: "0.7rem" }}
            ></i>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <Loader message="Fetching your notifications..." fullScreen={true} />
    );
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        backgroundColor: "#fbf6f0",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Pop-up Alert Notification */}
      {popupMessage && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-3 z-3 bg-dark text-white px-4 py-2 rounded-pill shadow"
          style={{ fontSize: "0.85rem", animation: "fadeIn 0.3s" }}
        >
          {popupMessage}
        </div>
      )}

      {/* Header Bar */}
      <header className="px-4 py-3 bg-white border-bottom sticky-top shadow-sm">
        <div
          className="mx-auto w-100 d-flex align-items-center justify-content-between"
          style={{ maxWidth: "800px" }}
        >
          <div className="d-flex align-items-center gap-2">
            <h5 className="m-0 fw-bold text-dark">Notifications</h5>
            {unreadCount > 0 && (
              <span
                className="badge rounded-pill bg-danger"
                style={{ backgroundColor: "#73112d" }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn btn-sm btn-link text-decoration-none p-0 border-0 fw-semibold"
                style={{ color: "#73112d", fontSize: "0.8rem" }}
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && unreadCount === 0 && (
              <button
                onClick={clearAll}
                className="btn btn-sm btn-link text-decoration-none p-0 border-0 text-muted fw-semibold"
                style={{ fontSize: "0.8rem" }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main
        className="flex-grow-1 px-3 px-sm-4 py-4 mx-auto w-100"
        style={{ maxWidth: "800px" }}
      >
        {/* Navigation Filters */}
        <div className="d-flex align-items-center gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "like", label: "Likes" },
            { id: "match", label: "Matches" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`btn btn-sm px-3 py-1.5 rounded-pill fw-medium transition-all ${
                activeFilter === tab.id
                  ? "text-white shadow-sm"
                  : "bg-white text-muted border border-light"
              }`}
              style={{
                fontSize: "0.8rem",
                backgroundColor:
                  activeFilter === tab.id ? "#73112d" : undefined,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="d-flex flex-column gap-2">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const itemKey = item._id || item.id;
              return (
                <div
                  key={itemKey}
                  onClick={(e) => handleNotificationClick(item, e)}
                  className="card border-0 rounded-4 shadow-sm p-3 transition-all position-relative"
                  style={{
                    backgroundColor: !item.isRead ? "#ffffff" : "#f5f0eb",
                    borderLeft: !item.isRead
                      ? "4px solid #73112d"
                      : "4px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  <div className="d-flex align-items-start gap-3">
                    {/* Avatar Frame with Type Icon */}
                    <div className="position-relative flex-shrink-0">
                      {item.sender?.photo ? (
                        <img
                          src={`http://localhost:5000/uploads/${item.sender.photo}`}
                          alt={item.sender?.fullName || "Sender"}
                          className="rounded-circle border"
                          style={{
                            width: "48px",
                            height: "48px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: "#73112d",
                          }}
                        >
                          ❤️
                        </div>
                      )}
                      {renderTypeIcon(item.type)}
                    </div>

                    {/* Body Content */}
                    <div className="flex-grow-1 min-w-0 me-2">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <h6
                          className={`m-0 ${!item.isRead ? "fw-bold text-dark" : "fw-semibold text-secondary"}`}
                          style={{ fontSize: "0.9rem" }}
                        >
                          {item.title}
                        </h6>
                        <small
                          className="text-muted flex-shrink-0"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {formatNotificationTime(item.createdAt)}
                        </small>
                      </div>

                      <p
                        className="m-0 text-muted text-truncate-2"
                        style={{ fontSize: "0.825rem", lineHeight: "1.3" }}
                      >
                        {item.body || item.message}
                      </p>

                      {/* Interactive Button: Like Back for Likes */}
                      {item.type === "like" && (
                        <div className="mt-2">
                          <button
                            onClick={(e) => handleLikeBack(item, e)}
                            disabled={actionLoadingId === itemKey}
                            className="btn btn-sm rounded-pill text-white font-semibold border-0 px-3 py-1 d-inline-flex align-items-center gap-1 shadow-sm"
                            style={{
                              backgroundColor: "#73112d",
                              fontSize: "0.75rem",
                            }}
                          >
                            {actionLoadingId === itemKey ? (
                              "Liking..."
                            ) : (
                              <>
                                <i className="bi bi-heart-fill"></i> Like Back
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right Actions & Delete Button */}
                    <div className="d-flex flex-column align-items-end justify-content-between gap-2 flex-shrink-0 align-self-stretch">
                      {!item.isRead ? (
                        <span
                          className="rounded-circle"
                          style={{
                            width: "8px",
                            height: "8px",
                            backgroundColor: "#73112d",
                          }}
                          title="Unread"
                        ></span>
                      ) : (
                        <div style={{ height: "8px" }}></div>
                      )}

                      {/* Delete Button calling DELETE /notifications/:id */}
                      <button
                        onClick={(e) => deleteNotification(itemKey, e)}
                        className="btn p-0 border-0 bg-transparent text-muted opacity-50 hover-opacity-100"
                        title="Delete notification"
                      >
                        <i
                          className="bi bi-trash-fill text-danger"
                          style={{ fontSize: "0.85rem" }}
                        ></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="text-center py-5 bg-white rounded-4 border shadow-sm my-3 p-4">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#efeae4",
                  color: "#73112d",
                }}
              >
                <i className="bi bi-bell-slash fs-3"></i>
              </div>
              <h5
                className="fw-bold text-dark mb-1"
                style={{ fontFamily: "Georgia, serif" }}
              >
                No notifications found
              </h5>
              <p className="text-muted m-0" style={{ fontSize: "0.85rem" }}>
                You're all caught up! Check back later for new matches, likes,
                and messages.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
