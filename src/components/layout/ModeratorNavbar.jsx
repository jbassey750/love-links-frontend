import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ModeratorNavbar = ({ isConnected }) => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("[Moderator Logout] Logout request failed:", error);
    } finally {
      localStorage.removeItem("token");

      navigate("/moderate/logs/workspace", {
        replace: true,
      });

      setLoggingOut(false);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top py-2 px-3 shadow-sm">
      <div className="container-fluid">

        {/* Brand */}
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
            style={{
              width: "38px",
              height: "38px",
              backgroundColor: "#5c1d24",
            }}
          >
            L
          </div>

          <span
            className="navbar-brand fw-bold mb-0 fs-5 text-dark"
            style={{ fontFamily: "Georgia, serif" }}
          >
            LoveLink{" "}
            <span className="fs-6 fw-normal text-muted ms-1">
              Moderator Console
            </span>
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
                <i className="bi bi-chat-dots-fill me-1"></i>
                Messages
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
                <i className="bi bi-bar-chart-line-fill me-1"></i>
                Analytics
              </NavLink>
            </li>
          </ul>

          {/* Connection Status */}
          <div className="d-flex align-items-center gap-2">
            <span
              className={`rounded-circle ${
                isConnected ? "bg-success" : "bg-secondary"
              }`}
              style={{
                width: "8px",
                height: "8px",
              }}
            ></span>

            <span
              className="text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              {isConnected ? "Connected" : "Offline"}
            </span>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3"
            style={{
              backgroundColor: "#f8e9eb",
              color: "#5c1d24",
              border: "none",
              fontSize: "0.8rem",
              fontWeight: "600",
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default ModeratorNavbar;