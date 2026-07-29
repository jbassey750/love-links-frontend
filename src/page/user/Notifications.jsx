import React, { useState, useEffect } from "react";
import Loader from "../../components/Loader"; // Importing Loader component

// Mock Notification Data
const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    type: "like", // 'like' | 'match' | 'message' | 'system'
    senderName: "Elena Rostova",
    senderPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    title: "Someone liked you ❤️",
    body: "Elena Rostova liked your profile. Tap to see her bio!",
    timestamp: "2 min ago",
    isRead: false,
  },
  {
    id: "n2",
    type: "match",
    senderName: "Sarah Jenkins",
    senderPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    title: "It's a Match! 🎉",
    body: "You and Sarah matched with each other. Start a conversation now!",
    timestamp: "1 hour ago",
    isRead: false,
  },
  {
    id: "n3",
    type: "message",
    senderName: "Alex Chen",
    senderPhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
    title: "New Message 💬",
    body: "Alex: Hey! Are you free for coffee this weekend?",
    timestamp: "3 hours ago",
    isRead: true,
  },
  {
    id: "n4",
    type: "system",
    senderName: "Amour Team",
    senderPhoto: null, // Fallback system icon
    title: "Profile Verified Badge 🛡️",
    body: "Congratulations! Your profile identity has been verified.",
    timestamp: "1 day ago",
    isRead: true,
  },
];

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'unread' | 'match' | 'like'

  // Simulate data loading on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(INITIAL_NOTIFICATIONS);
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Notification actions
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Filter Logic
  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "match") return n.type === "match";
    if (activeFilter === "like") return n.type === "like";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Type Indicator Badges
  const renderTypeIcon = (type) => {
    switch (type) {
      case "like":
        return (
          <span className="position-absolute bottom-0 end-0 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: "22px", height: "22px" }}>
            <i className="bi bi-heart-fill text-danger" style={{ fontSize: "0.7rem" }}></i>
          </span>
        );
      case "match":
        return (
          <span className="position-absolute bottom-0 end-0 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: "22px", height: "22px" }}>
            <i className="bi bi-stars" style={{ color: "#73112d", fontSize: "0.75rem" }}></i>
          </span>
        );
      case "message":
        return (
          <span className="position-absolute bottom-0 end-0 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: "22px", height: "22px" }}>
            <i className="bi bi-chat-dots-fill text-primary" style={{ fontSize: "0.7rem" }}></i>
          </span>
        );
      default:
        return (
          <span className="position-absolute bottom-0 end-0 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: "22px", height: "22px" }}>
            <i className="bi bi-shield-check text-success" style={{ fontSize: "0.7rem" }}></i>
          </span>
        );
    }
  };

  // Render Loader screen while fetching notifications
  if (loading) {
    return <Loader message="Fetching your notifications..." fullScreen={true} />;
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#fbf6f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* Header Bar */}
      <header className="px-4 py-3 bg-white border-bottom sticky-top shadow-sm">
        <div className="mx-auto w-100 d-flex align-items-center justify-content-between" style={{ maxWidth: "800px" }}>
          

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
      <main className="flex-grow-1 px-3 px-sm-4 py-4 mx-auto w-100" style={{ maxWidth: "800px" }}>
        
        {/* Navigation Filters */}
        <div className="d-flex align-items-center gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "like", label: "Likes" },
            { id: "match", label: "Matches" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`btn btn-sm px-3 py-1.5 rounded-pill fw-medium transition-all ${
                activeFilter === tab.id ? "text-white shadow-sm" : "bg-white text-muted border border-light"
              }`}
              style={{
                fontSize: "0.8rem",
                backgroundColor: activeFilter === tab.id ? "#73112d" : undefined,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="d-flex flex-column gap-2">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`card border-0 rounded-4 shadow-sm p-3 transition-all cursor-pointer position-relative ${
                  !item.isRead ? "bg-white" : ""
                }`}
                style={{
                  backgroundColor: !item.isRead ? "#ffffff" : "#f5f0eb",
                  borderLeft: !item.isRead ? "4px solid #73112d" : "4px solid transparent",
                  cursor: "pointer",
                }}
              >
                <div className="d-flex align-items-start gap-3">
                  
                  {/* Avatar Frame with Type Icon */}
                  <div className="position-relative flex-shrink-0">
                    {item.senderPhoto ? (
                      <img
                        src={item.senderPhoto}
                        alt={item.senderName}
                        className="rounded-circle object-cover border"
                        style={{ width: "48px", height: "48px", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white font-bold"
                        style={{ width: "48px", height: "48px", backgroundColor: "#73112d" }}
                      >
                        ❤️
                      </div>
                    )}
                    {renderTypeIcon(item.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-grow-1 min-w-0 me-2">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <h6 className={`m-0 ${!item.isRead ? "fw-bold text-dark" : "fw-semibold text-secondary"}`} style={{ fontSize: "0.9rem" }}>
                        {item.title}
                      </h6>
                      <small className="text-muted flex-shrink-0" style={{ fontSize: "0.7rem" }}>
                        {item.timestamp}
                      </small>
                    </div>

                    <p className="m-0 text-muted text-truncate-2" style={{ fontSize: "0.825rem", lineHeight: "1.3" }}>
                      {item.body}
                    </p>
                  </div>

                  {/* Right Actions & Unread Dot */}
                  <div className="d-flex flex-column align-items-end justify-content-between gap-2 flex-shrink-0 self-stretch">
                    {!item.isRead ? (
                      <span
                        className="rounded-circle"
                        style={{ width: "8px", height: "8px", backgroundColor: "#73112d" }}
                        title="Unread"
                      ></span>
                    ) : <div style={{ height: "8px" }}></div>}

                    <button
                      onClick={(e) => deleteNotification(item.id, e)}
                      className="btn p-0 border-0 bg-transparent text-muted opacity-50 hover-opacity-100"
                      title="Remove notification"
                    >
                      <i className="bi bi-x-lg" style={{ fontSize: "0.75rem" }}></i>
                    </button>
                  </div>

                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="text-center py-5 bg-white rounded-4 border shadow-sm my-3 p-4">
              <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px", backgroundColor: "#efeae4", color: "#73112d" }}>
                <i className="bi bi-bell-slash fs-3"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1" style={{ fontFamily: "Georgia, serif" }}>
                No notifications found
              </h5>
              <p className="text-muted m-0" style={{ fontSize: "0.85rem" }}>
                You're all caught up! Check back later for new matches, likes, and messages.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Notifications;