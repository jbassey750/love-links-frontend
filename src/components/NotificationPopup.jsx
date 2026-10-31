import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";

const NotificationPopup = () => {
  const navigate = useNavigate();

  const {
    latestNotification,
    clearLatestNotification,
  } = useContext(NotificationContext);

  useEffect(() => {
    if (!latestNotification) {
      return;
    }

    const timer = setTimeout(clearLatestNotification, 5000);

    return () => clearTimeout(timer);
  }, [latestNotification, clearLatestNotification]);

  if (!latestNotification) {
    return null;
  }

  const notification = latestNotification;
  const notificationHeading =
    notification.data?.senderName ||
    notification.sender?.fullName ||
    notification.title ||
    "New Notification";

  const handleClick = () => {
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
    if (
      notification.type === "match" ||
      notification.type === "match-reminder"
    ) {
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

    if (
      notification.type === "date" ||
      notification.type === "date-reminder"
    ) {
      navigate("/my-date");
      return;
    }

    // Default notification
    navigate("/notifications");
  };

  const handleClose = (e) => {
    e.stopPropagation();
    clearLatestNotification();
  };

  const getNotificationText = (item) =>
    (item?.type === "message" && item?.data?.messageType === "image"
      ? "Photo"
      : item?.type === "message" && item?.data?.message) ||
    item?.body ||
    item?.message ||
    item?.data?.message ||
    item?.data?.body ||
    "You have a new notification.";

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

  const notificationType = (notification.type || "notification")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const notificationTime = notification.createdAt
    ? new Date(notification.createdAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "Just now";

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
                {notificationHeading}
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
              {getNotificationText(notification)}
            </p>

            <div className="d-flex align-items-center justify-content-between gap-2">
              <small
                className="fw-semibold"
                style={{
                  color: "#73112d",
                  fontSize: "0.75rem",
                }}
              >
                {notificationType} · {notificationTime}
              </small>
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