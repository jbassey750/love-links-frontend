import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import Loader from "../../components/Loader";

import axios from "../../api/axios";

import { NotificationContext } from "../../context/NotificationContext";

const Notifications = () => {
  const navigate = useNavigate();

  const {
    unreadCount,
    notifications,
    refreshNotifications,
    refreshUnreadCount,
    setUnreadCount,
    setNotifications,
    API_ORIGIN,
  } = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [popupMessage, setPopupMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] =
    useState(null);
  const [currentTime, setCurrentTime] =
    useState(Date.now());

  // ==========================================
  // Temporary popup
  // ==========================================

  const showPopup = (message) => {
    setPopupMessage(message);

    setTimeout(() => {
      setPopupMessage("");
    }, 3000);
  };

  // ==========================================
  // Load notifications
  // ==========================================

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);

        await Promise.all([
          refreshNotifications(),
          refreshUnreadCount(),
        ]);
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // ==========================================
  // Update relative timestamps
  // ==========================================

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // Format notification time
  // ==========================================

  const formatNotificationTime = (createdAt) => {
    if (!createdAt) return "Unknown";

    const timestamp =
      new Date(createdAt).getTime();

    if (
      Number.isNaN(timestamp) ||
      timestamp <= 0
    ) {
      return "Unknown";
    }

    const deltaSeconds = Math.floor(
      (currentTime - timestamp) / 1000
    );

    if (deltaSeconds < 60) {
      return "Just now";
    }

    const deltaMinutes = Math.floor(
      deltaSeconds / 60
    );

    if (deltaMinutes < 60) {
      return `${deltaMinutes} ${
        deltaMinutes === 1 ? "min" : "mins"
      } ago`;
    }

    const deltaHours = Math.floor(
      deltaMinutes / 60
    );

    if (deltaHours < 24) {
      return `${deltaHours} ${
        deltaHours === 1 ? "hour" : "hours"
      } ago`;
    }

    const deltaDays = Math.floor(
      deltaHours / 24
    );

    if (deltaDays === 1) {
      return "Yesterday";
    }

    if (deltaDays < 7) {
      return `${deltaDays} days ago`;
    }

    const deltaWeeks = Math.floor(
      deltaDays / 7
    );

    if (deltaWeeks < 4) {
      return `${deltaWeeks} ${
        deltaWeeks === 1 ? "week" : "weeks"
      } ago`;
    }

    const deltaMonths = Math.floor(
      deltaDays / 30
    );

    if (deltaMonths < 12) {
      return `${deltaMonths} ${
        deltaMonths === 1 ? "month" : "months"
      } ago`;
    }

    const deltaYears = Math.floor(
      deltaDays / 365
    );

    return `${deltaYears} ${
      deltaYears === 1 ? "year" : "years"
    } ago`;
  };

  // ==========================================
  // Mark single notification as read
  // ==========================================

  const markAsRead = async (id) => {
    const target = notifications.find(
      (notification) =>
        (notification._id || notification.id) === id
    );

    if (!target || target.isRead) return;

    // Optimistic notification update
    setNotifications((prev) =>
      prev.map((notification) =>
        (notification._id || notification.id) === id
          ? {
              ...notification,
              isRead: true,
            }
          : notification
      )
    );

    setUnreadCount((prev) =>
      Math.max(0, prev - 1)
    );

    try {
      await axios.patch(
        `/notifications/${id}/read`
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );

      await Promise.all([
        refreshNotifications(),
        refreshUnreadCount(),
      ]);
    }
  };

  // ==========================================
  // Notification click
  // ==========================================

  const handleNotificationClick = (
    item,
    event
  ) => {
    if (event) {
      event.preventDefault();
    }

    const itemKey =
      item._id || item.id;

    markAsRead(itemKey);

    // Message
    if (item.type === "message") {
      const chatId =
        item.data?.chatId ||
        item.chatId ||
        item.conversationId;

      const senderId =
        item.data?.senderId ||
        item.senderId ||
        item.sender?._id;

      if (chatId) {
        navigate(`/chat/${chatId}`);
      } else if (senderId) {
        navigate("/conversations");
      } else {
        navigate("/conversations");
      }

      return;
    }

    // Like
    if (item.type === "like") {
      const targetUserId =
        item.data?.userId ||
        item.senderId ||
        item.sender?._id;

      if (targetUserId) {
        navigate(
          `/profile/${targetUserId}`
        );
      }

      return;
    }

    // Match
    if (item.type === "match") {
      const chatId =
        item.data?.chatId ||
        item.chatId;

      if (chatId) {
        navigate(`/chat/${chatId}`);
      } else {
        navigate("/conversations");
      }

      return;
    }

    navigate("/notifications");
  };

  // ==========================================
  // Like Back
  // ==========================================

  const handleLikeBack = async (
    item,
    event
  ) => {
    event.stopPropagation();

    const itemKey =
      item._id || item.id;

    const targetUserId =
      item.senderId ||
      item.sender?._id;

    if (!targetUserId) {
      showPopup(
        "Unable to find this user's details."
      );
      return;
    }

    try {
      setActionLoadingId(itemKey);

      await axios.post(
        "/matches/like",
        {
          targetUserId,
        }
      );

      showPopup(
        `You liked ${
          item.senderName || "this user"
        } back!`
      );

      await markAsRead(itemKey);
    } catch (error) {
      console.error(
        "Failed to like back:",
        error
      );

      const targetName =
        error.response?.data?.userName ||
        error.response?.data?.name ||
        item.senderName ||
        "this user";

      if (
        error.response?.status === 400
      ) {
        showPopup(
          `You have already liked ${targetName}.`
        );
      } else {
        showPopup(
          "Failed to send like. Please try again."
        );
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // ==========================================
  // Mark all as read
  // ==========================================

  const markAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );

    setUnreadCount(0);

    try {
      await axios.patch(
        "/notifications/read-all"
      );

      showPopup(
        "All notifications marked as read."
      );
    } catch (error) {
      console.error(
        "Failed to mark all as read:",
        error
      );

      showPopup(
        "Failed to mark all as read. Please try again."
      );

      await Promise.all([
        refreshNotifications(),
        refreshUnreadCount(),
      ]);
    }
  };

  // ==========================================
  // Delete notification
  // ==========================================

  const deleteNotification = async (
    id,
    event
  ) => {
    event.stopPropagation();

    const itemToDelete =
      notifications.find(
        (notification) =>
          (notification._id ||
            notification.id) === id
      );

    setNotifications((prev) =>
      prev.filter(
        (notification) =>
          (notification._id ||
            notification.id) !== id
      )
    );

    if (
      itemToDelete &&
      !itemToDelete.isRead
    ) {
      setUnreadCount((prev) =>
        Math.max(0, prev - 1)
      );
    }

    try {
      await axios.delete(
        `/notifications/${id}`
      );

      showPopup(
        "Notification deleted."
      );

      refreshUnreadCount();
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error
      );

      showPopup(
        "Failed to delete notification. Restoring..."
      );

      await Promise.all([
        refreshNotifications(),
        refreshUnreadCount(),
      ]);
    }
  };

  // ==========================================
  // Clear all
  // ==========================================

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // ==========================================
  // Filter
  // ==========================================

  const notificationsArray =
    Array.isArray(notifications)
      ? notifications
      : [];

  const filteredNotifications =
    notificationsArray.filter(
      (notification) => {
        if (activeFilter === "unread") {
          return !notification.isRead;
        }

        if (activeFilter === "match") {
          return notification.type === "match";
        }

        if (activeFilter === "like") {
          return notification.type === "like";
        }

        return true;
      }
    );

  // ==========================================
  // Notification icon
  // ==========================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return {
          icon: "bi-heart-fill",
          background: "#fff0f3",
          color: "#c6284f",
        };

      case "match":
        return {
          icon: "bi-stars",
          background: "#f7edf1",
          color: "#73112d",
        };

      case "message":
        return {
          icon: "bi-chat-dots-fill",
          background: "#eef4ff",
          color: "#3567b8",
        };

      default:
        return {
          icon: "bi-bell-fill",
          background: "#f3eee9",
          color: "#73112d",
        };
    }
  };

  // ==========================================
  // Avatar
  // ==========================================

  const getAvatarUrl = (photo) => {
    if (!photo) return null;

    if (
      photo.startsWith("http://") ||
      photo.startsWith("https://")
    ) {
      return photo;
    }

    return `${API_ORIGIN}/uploads/${photo}`;
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <Loader
        message="Fetching your notifications..."
        fullScreen={true}
      />
    );
  }

  return (
    <div
      className="min-vh-100"
      style={{
        backgroundColor: "#fbf6f0",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Temporary Action Message */}
      {popupMessage && (
        <div
          className="position-fixed start-50 translate-middle-x px-4 py-2 rounded-pill shadow-lg text-white"
          style={{
            top: "20px",
            zIndex: 10000,
            backgroundColor: "#2c2d43",
            fontSize: "0.84rem",
            animation:
              "notificationToastIn 0.3s ease",
          }}
        >
          <i className="bi bi-check-circle-fill me-2"></i>
          {popupMessage}
        </div>
      )}

      {/* Header */}
      <header
        className="sticky-top bg-white border-bottom"
        style={{
          zIndex: 100,
          boxShadow:
            "0 2px 14px rgba(45, 30, 25, 0.05)",
        }}
      >
        <div
          className="mx-auto px-3 px-sm-4 py-3"
          style={{
            maxWidth: "820px",
          }}
        >
          <div className="d-flex align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: "42px",
                  height: "42px",
                  backgroundColor: "#f7e9ed",
                  color: "#73112d",
                }}
              >
                <i
                  className="bi bi-bell-fill"
                  style={{
                    fontSize: "1.1rem",
                  }}
                ></i>
              </div>

              <div>
                <h5
                  className="mb-0 fw-bold text-dark"
                  style={{
                    fontFamily:
                      "Georgia, serif",
                  }}
                >
                  Notifications
                </h5>

                <small
                  className="text-muted"
                  style={{
                    fontSize: "0.75rem",
                  }}
                >
                  Stay updated with your activity
                </small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {unreadCount > 0 && (
                <span
                  className="rounded-pill px-3 py-2 fw-semibold"
                  style={{
                    backgroundColor: "#73112d",
                    color: "#fff",
                    fontSize: "0.72rem",
                  }}
                >
                  {unreadCount} unread
                </span>
              )}

              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="btn btn-sm rounded-pill px-3 fw-semibold"
                  style={{
                    color: "#73112d",
                    backgroundColor: "#f8edf0",
                    border: "1px solid #eddce1",
                    fontSize: "0.75rem",
                  }}
                >
                  <i className="bi bi-check2-all me-1"></i>
                  <span className="d-none d-sm-inline">
                    Mark all
                  </span>
                  <span className="d-sm-none">
                    Read
                  </span>
                </button>
              ) : (
                notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="btn btn-sm rounded-pill px-3 fw-semibold text-muted"
                    style={{
                      backgroundColor: "#f7f3ef",
                      border:
                        "1px solid #e9e1da",
                      fontSize: "0.75rem",
                    }}
                  >
                    <i className="bi bi-trash3 me-1"></i>
                    Clear
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        className="mx-auto px-3 px-sm-4 py-4"
        style={{
          maxWidth: "820px",
        }}
      >
        {/* Filter Section */}
        <div className="mb-4">
          <div
            className="d-flex gap-2 overflow-auto pb-1"
            style={{
              scrollbarWidth: "none",
            }}
          >
            {[
              {
                id: "all",
                label: "All",
                icon: "bi-grid",
              },
              {
                id: "unread",
                label: `Unread ${
                  unreadCount > 0
                    ? `(${unreadCount})`
                    : ""
                }`,
                icon: "bi-circle-fill",
              },
              {
                id: "like",
                label: "Likes",
                icon: "bi-heart",
              },
              {
                id: "match",
                label: "Matches",
                icon: "bi-stars",
              },
            ].map((tab) => {
              const active =
                activeFilter === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveFilter(tab.id)
                  }
                  className="btn btn-sm rounded-pill px-3 py-2 fw-semibold flex-shrink-0"
                  style={{
                    backgroundColor: active
                      ? "#73112d"
                      : "#ffffff",
                    color: active
                      ? "#ffffff"
                      : "#6c625c",
                    border: active
                      ? "1px solid #73112d"
                      : "1px solid #e7ded7",
                    fontSize: "0.76rem",
                    boxShadow: active
                      ? "0 4px 12px rgba(115,17,45,0.16)"
                      : "none",
                  }}
                >
                  <i
                    className={`bi ${tab.icon} me-1`}
                    style={{
                      fontSize: "0.7rem",
                    }}
                  ></i>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section heading */}
        {filteredNotifications.length > 0 && (
          <div className="d-flex align-items-center justify-content-between mb-2 px-1">
            <div>
              <span
                className="fw-bold text-dark"
                style={{
                  fontSize: "0.9rem",
                }}
              >
                {activeFilter === "all"
                  ? "Recent activity"
                  : activeFilter === "unread"
                  ? "Unread notifications"
                  : activeFilter === "like"
                  ? "Likes"
                  : "Matches"}
              </span>
            </div>

            <small
              className="text-muted"
              style={{
                fontSize: "0.72rem",
              }}
            >
              {filteredNotifications.length}{" "}
              {filteredNotifications.length === 1
                ? "notification"
                : "notifications"}
            </small>
          </div>
        )}

        {/* Notifications */}
        <div className="d-flex flex-column gap-2">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(
              (item) => {
                const itemKey =
                  item._id || item.id;

                const icon =
                  getNotificationIcon(
                    item.type
                  );

                const avatarUrl =
                  getAvatarUrl(
                    item.sender?.photo
                  );

                const isUnread =
                  !item.isRead;

                return (
                  <div
                    key={itemKey}
                    onClick={(event) =>
                      handleNotificationClick(
                        item,
                        event
                      )
                    }
                    className="position-relative rounded-4 p-3"
                    style={{
                      cursor: "pointer",
                      backgroundColor: isUnread
                        ? "#ffffff"
                        : "rgba(255,255,255,0.58)",
                      border: isUnread
                        ? "1px solid #ead8de"
                        : "1px solid #eee5de",
                      boxShadow: isUnread
                        ? "0 5px 18px rgba(74,38,45,0.07)"
                        : "0 2px 8px rgba(74,38,45,0.025)",
                      transition:
                        "all 0.2s ease",
                    }}
                  >
                    {isUnread && (
                      <div
                        className="position-absolute top-0 start-0 rounded-start-4"
                        style={{
                          width: "4px",
                          height: "100%",
                          backgroundColor:
                            "#73112d",
                        }}
                      ></div>
                    )}

                    <div className="d-flex align-items-start gap-3">
                      {/* Avatar */}
                      <div
                        className="position-relative flex-shrink-0"
                        style={{
                          width: "52px",
                          height: "52px",
                        }}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={
                              item.sender
                                ?.fullName ||
                              "Sender"
                            }
                            className="rounded-circle"
                            style={{
                              width: "52px",
                              height: "52px",
                              objectFit: "cover",
                              border:
                                "2px solid #ffffff",
                              boxShadow:
                                "0 3px 10px rgba(0,0,0,0.08)",
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "52px",
                              height: "52px",
                              backgroundColor:
                                icon.background,
                              color: icon.color,
                              border:
                                "1px solid #eee3e5",
                            }}
                          >
                            <i
                              className={`bi ${icon.icon}`}
                              style={{
                                fontSize:
                                  "1.15rem",
                              }}
                            ></i>
                          </div>
                        )}

                        {/* Type badge */}
                        <div
                          className="position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "21px",
                            height: "21px",
                            backgroundColor:
                              "#ffffff",
                            border:
                              "1px solid #eee5e0",
                            boxShadow:
                              "0 2px 5px rgba(0,0,0,0.08)",
                          }}
                        >
                          <i
                            className={`bi ${icon.icon}`}
                            style={{
                              color: icon.color,
                              fontSize:
                                "0.65rem",
                            }}
                          ></i>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-grow-1 min-w-0 pe-1">
                        <div className="d-flex align-items-start justify-content-between gap-2">
                          <div className="min-w-0">
                            <h6
                              className="mb-1"
                              style={{
                                color: isUnread
                                  ? "#262026"
                                  : "#625b58",
                                fontSize:
                                  "0.88rem",
                                fontWeight:
                                  isUnread
                                    ? 700
                                    : 600,
                              }}
                            >
                              {item.title ||
                                "Notification"}
                            </h6>

                            <p
                              className="mb-0"
                              style={{
                                color:
                                  "#756d69",
                                fontSize:
                                  "0.8rem",
                                lineHeight: 1.45,
                              }}
                            >
                              {item.body ||
                                item.message ||
                                "You have a new notification."}
                            </p>
                          </div>

                          <small
                            className="text-muted flex-shrink-0"
                            style={{
                              fontSize:
                                "0.68rem",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formatNotificationTime(
                              item.createdAt
                            )}
                          </small>
                        </div>

                        {/* Like back */}
                        {item.type === "like" && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={(event) =>
                                handleLikeBack(
                                  item,
                                  event
                                )
                              }
                              disabled={
                                actionLoadingId ===
                                itemKey
                              }
                              className="btn btn-sm rounded-pill px-3 fw-semibold"
                              style={{
                                backgroundColor:
                                  "#73112d",
                                color: "#ffffff",
                                border:
                                  "none",
                                fontSize:
                                  "0.72rem",
                                boxShadow:
                                  "0 4px 10px rgba(115,17,45,0.15)",
                              }}
                            >
                              {actionLoadingId ===
                              itemKey ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-1"
                                    style={{
                                      width:
                                        "0.7rem",
                                      height:
                                        "0.7rem",
                                    }}
                                  ></span>
                                  Sending
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-heart-fill me-1"></i>
                                  Like Back
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right controls */}
                      <div className="d-flex flex-column align-items-end justify-content-between align-self-stretch flex-shrink-0">
                        {isUnread ? (
                          <span
                            title="Unread"
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius:
                                "50%",
                              backgroundColor:
                                "#73112d",
                              boxShadow:
                                "0 0 0 3px #f7e8ed",
                            }}
                          ></span>
                        ) : (
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                            }}
                          ></span>
                        )}

                        <button
                          type="button"
                          onClick={(event) =>
                            deleteNotification(
                              itemKey,
                              event
                            )
                          }
                          className="btn p-1 border-0 rounded-circle"
                          title="Delete notification"
                          style={{
                            width: "30px",
                            height: "30px",
                            color: "#9b918c",
                            backgroundColor:
                              "transparent",
                          }}
                        >
                          <i
                            className="bi bi-trash3"
                            style={{
                              fontSize:
                                "0.78rem",
                            }}
                          ></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )
          ) : (
            <div
              className="rounded-4 text-center px-4 py-5"
              style={{
                backgroundColor: "#ffffff",
                border:
                  "1px solid #ebe2db",
                boxShadow:
                  "0 5px 20px rgba(74,38,45,0.045)",
              }}
            >
              <div
                className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "72px",
                  height: "72px",
                  background:
                    "linear-gradient(145deg, #f9edf0, #f3e6e0)",
                  color: "#73112d",
                }}
              >
                <i
                  className="bi bi-bell-slash"
                  style={{
                    fontSize: "1.7rem",
                  }}
                ></i>
              </div>

              <h5
                className="fw-bold text-dark mb-2"
                style={{
                  fontFamily:
                    "Georgia, serif",
                }}
              >
                {activeFilter === "all"
                  ? "You're all caught up"
                  : activeFilter === "unread"
                  ? "Nothing unread"
                  : activeFilter === "like"
                  ? "No likes yet"
                  : "No matches yet"}
              </h5>

              <p
                className="text-muted mx-auto mb-0"
                style={{
                  maxWidth: "400px",
                  fontSize: "0.82rem",
                  lineHeight: 1.6,
                }}
              >
                {activeFilter === "all"
                  ? "New likes, matches, messages, and other activity will appear here."
                  : "There are no notifications in this category right now."}
              </p>
            </div>
          )}
        </div>
      </main>

      <style>
        {`
          @keyframes notificationToastIn {
            from {
              opacity: 0;
              transform: translate(-50%, -12px);
            }

            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Notifications;