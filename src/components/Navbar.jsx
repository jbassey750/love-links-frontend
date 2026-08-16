import React, { useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";

// Configuration for route-specific titles, badges, and contextual indicators
const PAGE_CONFIG = {
  "/": {
    subtitle: "Find Your Person",
    badgeLabel: "Amsterdam",
    badgeIcon: "bi-geo-alt-fill",
    badgeColor: "bg-success",
  },
  "/more/people": {
    subtitle: "discover",
    badgeLabel: "more people",
    badgeIcon: "bi bi-three-dots",
    badgeColor: "bg-warning",
  },
  "/matches": {
    subtitle: "Mutual Connections",
    badgeLabel: "2 New Matches",
    badgeIcon: "bi-heart-fill",
    badgeColor: "bg-warning",
  },
  "/conversations": {
    subtitle: "Conversations",
    badgeLabel: "3 Unread",
    badgeIcon: "bi-chat-fill",
    badgeColor: "bg-danger",
  },
  "/chat": {
    subtitle: "Messaging",
    badgeLabel: "Online Now",
    badgeIcon: "bi-circle-fill",
    badgeColor: "bg-success",
  },
  "/profile": {
    subtitle: "Your Account",
    badgeLabel: "85% Complete",
    badgeIcon: "bi-person-check-fill",
    badgeColor: "bg-info",
  },
  "/music": {
    subtitle: "Music",
    badgeLabel: "heart beating",
    badgeIcon: "bi-music-note-beamed",
    badgeColor: "bg-danger",
  },
  "/my-date": {
    subtitle: "Plan Your Date",
    badgeLabel: "My Date",
    badgeIcon: "bi-calendar-heart",
    badgeColor: "bg-warning",
  },
  "/diary": {
    subtitle: "Diary",
    badgeLabel: "My Diary",
    badgeIcon: "bi-journal-bookmark",
    badgeColor: "bg-info",
  },
  "/notifications": {
    subtitle: "Notifications",
    badgeLabel: "Updates",
    badgeIcon: "bi-bell-fill",
    badgeColor: "bg-danger",
  },
};

const Navbar = ({ location = "Amsterdam" }) => {
  const currentPath = useLocation().pathname;
  const { unreadCount } = useContext(NotificationContext);
  const hasUnreadNotifications = unreadCount > 0;

  // Fall back to default config if route is unlisted
  const activeConfig = PAGE_CONFIG[currentPath] || {
    subtitle: "Find Your Person",
    badgeLabel: location,
    badgeIcon: "bi-geo-alt-fill",
    badgeColor: "bg-success",
  };

  return (
    <nav
      className="navbar navbar-light bg-white bg-opacity-95 px-3 d-flex justify-content-between align-items-center position-fixed top-0 start-0 end-0 shadow-sm"
      style={{ zIndex: 1040 }}
    >
      {/* Left: Brand Title & Route Subtitle */}
      <div>
        <h1
          className="m-0 fs-3 fw-bold text-serif"
          style={{ color: "#5c1d24", fontFamily: "Georgia, serif" }}
        >
          Amour
        </h1>
        <small
          className="text-uppercase tracking-wider text-muted fw-semibold"
          style={{ fontSize: "0.65rem", letterSpacing: "1.5px" }}
        >
          {activeConfig.subtitle}
        </small>
      </div>

      {/* Right Container: Badge + Navigation Buttons */}
      <div className="d-flex align-items-center gap-2">
        {/* Circular Action Navigation Buttons */}
        <div className="d-flex align-items-center gap-1.5">
          {/* Notification Button with Status Indicator */}

          {/* Music Button */}
          <Link
            to="/music"
            className={`btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm text-decoration-none ${
              currentPath === "/music" ? "text-white" : "text-dark bg-white"
            }`}
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: currentPath === "/music" ? "#5c1d24" : "#ffffff",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
            title="Music"
          >
            <i className="bi bi-music-note-beamed fs-6"></i>
          </Link>

          {/* Diary Button */}
          <Link
            to="/diary"
            className={`btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm text-decoration-none ${
              currentPath === "/diary" ? "text-white" : "text-dark bg-white"
            }`}
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: currentPath === "/diary" ? "#5c1d24" : "#ffffff",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
            title="Diary"
          >
            <i className="bi bi-journal-bookmark fs-6"></i>
          </Link>

          {/* Date Planner Button */}
          <Link
            to="/my-date"
            className={`btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm text-decoration-none ${
              currentPath === "/my-date" ? "text-white" : "text-dark bg-white"
            }`}
            style={{
              width: "36px",
              height: "36px",
              backgroundColor:
                currentPath === "/my-date" ? "#5c1d24" : "#ffffff",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
            title="Plan Your Date"
          >
            <i className="bi bi-calendar-heart fs-6"></i>
          </Link>

          {/* Notifications Button */}
          <Link
            to="/notifications"
            className={`btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm text-decoration-none position-relative ${
              currentPath === "/notifications"
                ? "text-white"
                : "text-dark bg-white"
            }`}
            style={{
              width: "36px",
              height: "36px",
              backgroundColor:
                currentPath === "/notifications" ? "#5c1d24" : "#ffffff",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
            title="Notifications"
          >
            <i className="bi bi-bell fs-6"></i>
            {hasUnreadNotifications && (
              <span
                className="position-absolute top-0 start-100 translate-middle d-flex align-items-center justify-content-center rounded-pill text-white"
                style={{
                  minWidth: "20px",
                  height: "20px",
                  padding: "0 6px",
                  fontSize: "0.65rem",
                  backgroundColor: "#d6333f",
                  transform: "translate(30%, -30%)",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
                <span className="visually-hidden">Unread notifications</span>
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
