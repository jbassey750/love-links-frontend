import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";

const NotificationPopup = () => {
  const navigate = useNavigate();

  const {
    latestNotification,
    clearLatestNotification,
  } = useContext(NotificationContext);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!latestNotification) {
      return;
    }

    setVisible(true);

    // Automatically hide after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);

      setTimeout(() => {
        clearLatestNotification();
      }, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [latestNotification, clearLatestNotification]);

  if (!latestNotification || !visible) {
    return null;
  }

  const notification = latestNotification;

  const handleClick = () => {
    setVisible(false);

    clearLatestNotification();

    // Message notification
    if (notification.type === "message") {
      const chatId =
        notification.data?.chatId ||
        notification.chatId;

      if (chatId) {
        navigate(`/chat/${chatId}`);
      } else {
        navigate("/conversations");
      }

      return;
    }

    // Like notification
    if (notification.type === "like") {
      const userId =
        notification.data?.userId ||
        notification.sender?._id ||
        notification.senderId;

      if (userId) {
        navigate(`/profile/${userId}`);
      }

      return;
    }

    // Match notification
    if (notification.type === "match") {
      const chatId =
        notification.data?.chatId ||
        notification.chatId;

      if (chatId) {
        navigate(`/chat/${chatId}`);
      } else {
        navigate("/matches");
      }

      return;
    }

    // Default notification
    navigate("/notifications");
  };

  const handleClose = (e) => {
    e.stopPropagation();

    setVisible(false);

    setTimeout(() => {
      clearLatestNotification();
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return "❤️";

      case "match":
        return "💕";

      case "message":
        return "💬";

      default:
        return "🔔";
    }
  };

  return (
    <div
      className="position-fixed top-0 start-50 translate-middle-x"
      style={{
        zIndex: 9999,
        width: "min(420px, calc(100% - 30px))",
        marginTop: "20px",
      }}
    >
      <div
        onClick={handleClick}
        className="bg-white rounded-4 shadow-lg border p-3"
        style={{
          cursor: "pointer",
          animation: "notificationSlideDown 0.35s ease",
        }}
      >
        <div className="d-flex align-items-start gap-3">
          
          {/* Notification Icon */}
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "#fbf0f3",
              fontSize: "22px",
            }}
          >
            {getIcon()}
          </div>

          {/* Notification Content */}
          <div className="flex-grow-1 min-w-0">
            <div className="d-flex align-items-center justify-content-between gap-2">
              <h6 className="fw-bold mb-1 text-dark">
                {notification.title || "New Notification"}
              </h6>

              <button
                type="button"
                onClick={handleClose}
                className="btn p-0 border-0 text-muted"
                style={{
                  fontSize: "18px",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <p
              className="mb-1 text-secondary"
              style={{
                fontSize: "0.85rem",
                lineHeight: "1.4",
              }}
            >
              {notification.body ||
                notification.message ||
                "You have a new notification."}
            </p>

            <small
              className="fw-semibold"
              style={{
                color: "#73112d",
                fontSize: "0.75rem",
              }}
            >
              Tap to view
            </small>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes notificationSlideDown {
            from {
              opacity: 0;
              transform: translateY(-25px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotificationPopup;