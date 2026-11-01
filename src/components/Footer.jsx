import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";

const Footer = () => {
  const { unreadCount } = useContext(NotificationContext);
  const hasUnreadNotifications = unreadCount > 0;
  const location = useLocation();

  const isActive = (path) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`) ||
      (path === "/conversations" &&
        location.pathname.startsWith("/chat/"))
    );
  };

  const navItems = [
    {
      label: "Home",
      path: "/discover",
      icon: "bi-people",
      active: isActive("/discover"),
    },
    {
      label: "Chat",
      path: "/conversations",
      icon: "bi-chat-dots",
      active: isActive("/conversations"),
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: "bi-bell",
      active: isActive("/notifications"),
      badge: hasUnreadNotifications ? unreadCount : 0,
    },
    {
      label: "Profile",
      path: "/profile/me",
      icon: "bi-person",
      active: isActive("/profile"),
    },
  ];

  return (
    <footer
      className="position-fixed bottom-0 start-50 translate-middle-x"
      style={{
        zIndex: 1030,
        width: "calc(100% - 32px)",
        maxWidth: "600px",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      }}
    >
      <div
        className="bg-white shadow-lg d-flex justify-content-around align-items-center"
        style={{
          borderRadius: "50px",
          padding: "10px 12px",
          border: "1px solid rgba(92, 29, 36, 0.10)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.10)",
        }}
      >
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="d-flex flex-column align-items-center gap-1 text-decoration-none"
            style={{
              fontSize: "0.7rem",
              minWidth: "55px",
              flex: "1",
              color: item.active ? "#5c1d24" : "#6c757d",
            }}
            title={item.label}
            aria-label={item.label}
            aria-current={item.active ? "page" : undefined}
          >
            <span
              className="rounded-circle d-flex align-items-center justify-content-center position-relative"
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: item.active ? "#5c1d24" : "#ffffff",
                color: item.active ? "#ffffff" : "#343a40",
                border: "1px solid rgba(0,0,0,0.05)",
                transition: "all 0.2s ease",
              }}
            >
              <i className={`bi ${item.icon} fs-6`}></i>

              {item.badge > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle d-flex align-items-center justify-content-center rounded-pill text-white"
                  style={{
                    minWidth: "20px",
                    height: "20px",
                    padding: "0 6px",
                    fontSize: "0.65rem",
                    backgroundColor: "#d6333f",
                    fontWeight: "600",
                  }}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                  <span className="visually-hidden">
                    Unread notifications
                  </span>
                </span>
              )}
            </span>

            <span
              className={`text-uppercase fw-semibold ${
                item.active ? "text-danger" : "text-muted"
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </footer>
  );
};

export default Footer;