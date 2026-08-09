import React from "react";
import { NavLink } from "react-router-dom";

const ModeratorNavbar = ({ isConnected }) => {
  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top py-2 px-3 shadow-sm">
      <div className="container-fluid">
        {/* Brand */}
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
            style={{ width: "38px", height: "38px", backgroundColor: "#5c1d24" }}
          >
            L
          </div>
          <span className="navbar-brand fw-bold mb-0 fs-5 text-dark" style={{ fontFamily: "Georgia, serif" }}>
            LoveLink <span className="fs-6 fw-normal text-muted ms-1">Moderator Console</span>
          </span>
        </div>

        {/* Navigation & Socket Status */}
        <div className="d-flex align-items-center gap-3">
          <ul className="navbar-nav d-flex flex-row gap-2">
            <li className="nav-item">
              <NavLink
                to="/moderator/workspace"
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded-pill fw-medium transition-all ${
                    isActive ? "active shadow-sm" : ""
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "#5c1d24" : "transparent",
                  color: isActive ? "#ffffff" : "#6c757d",
                })}
              >
                <i className="bi bi-chat-dots-fill me-1"></i> Messages
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="stats"
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded-pill fw-medium transition-all ${
                    isActive ? "active shadow-sm" : ""
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "#5c1d24" : "transparent",
                  color: isActive ? "#ffffff" : "#6c757d",
                })}
              >
                <i className="bi bi-bar-chart-line-fill me-1"></i> Analytics
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default ModeratorNavbar;