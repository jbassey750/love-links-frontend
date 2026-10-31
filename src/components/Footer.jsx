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
      (path === "/conversations" && location.pathname.startsWith("/chat/"))
    );
  };

  const navItems = [
    {
      label: "People",
      path: "/more/people",
      icon: "bi-people",
      active: isActive("/more/people"),
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
      className="bg-white border-top py-2 px-4 shadow-sm position-fixed bottom-0 start-0 end-0"
      style={{ zIndex: 1030 }}
    >
      <div
        className="d-flex justify-content-around align-items-center mx-auto"
        style={{ maxWidth: "600px" }}
      >
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="d-flex flex-column align-items-center gap-1 text-decoration-none"
            style={{ fontSize: "0.7rem", minWidth: "55px" }}
            title={item.label}
            aria-label={item.label}
          >
            <span
              className="rounded-circle d-flex align-items-center justify-content-center position-relative shadow-sm"
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
                  }}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                  <span className="visually-hidden">Unread notifications</span>
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
