import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AdminNavbar = ({ activeTab, onTabChange, pendingLikesCount = 3 }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "bi-speedometer2",
      path: "/admin/dashboard",
    },
    {
      id: "pending-likes",
      label: "Pending Likes",
      icon: "bi-heart-arrow",
      badge: pendingLikesCount,
      path: "/admin/pending-likes",
    },
    {
      id: "Regular-user-accounts",
      label: "Regular-user-accounts",
      icon: "bi-person-gear",
      path: "/admin/fake-accounts/dashboard",
    },
    {
      id: "Notifications",
      label: "Notifications",
      icon: "bi-bell",
      path: "/admin/notifications",
    },
    {
      id: "admin-match",
      label: "matches",
      icon: "bi-bell",
      path: "/admin/matches",
    },
  ];

  const currentTab =
    activeTab ||
    navItems.find((item) => location.pathname.startsWith(item.path))?.id ||
    "dashboard";

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow-sm py-2 sticky-top"
      style={{ backgroundColor: "#5c1d24" }}
    >
      <div className="container-fluid px-3 px-md-4">
        {/* Brand / Logo */}
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle bg-white text-dark fw-bold d-flex align-items-center justify-content-center"
            style={{ width: "34px", height: "34px", fontSize: "0.9rem" }}
          >
            A
          </div>
          <span className="navbar-brand mb-0 h1 fw-bold fs-6 tracking-wide">
            ADMIN PANEL
          </span>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0 shadow-none px-2"
          type="button"
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-expanded={isNavOpen}
          aria-label="Toggle navigation"
        >
          <i
            className={`bi ${isNavOpen ? "bi-x-lg" : "bi-list"} fs-3 text-white`}
          ></i>
        </button>

        {/* Navigation Links */}
        <div
          className={`collapse navbar-collapse ${isNavOpen ? "show pt-3 pt-lg-0" : ""}`}
        >
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1 gap-lg-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <li className="nav-item" key={item.id}>
                  <button
                    onClick={() => {
                      if (onTabChange) onTabChange(item.id);
                      setIsNavOpen(false);
                      navigate(item.path);
                    }}
                    className={`nav-link border-0 btn btn-link d-flex align-items-center gap-2 px-3 py-2 rounded-pill text-decoration-none transition-all ${
                      isActive
                        ? "bg-white text-dark fw-bold shadow-sm"
                        : "text-white-50 hover-text-white"
                    }`}
                    style={{ fontSize: "0.875rem" }}
                  >
                    <i
                      className={`bi ${item.icon} ${isActive ? "text-dark" : "text-white-50"}`}
                    ></i>
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span
                        className={`badge rounded-pill ${isActive ? "bg-danger text-white" : "bg-white text-dark"}`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Admin Profile & Status */}
          <div className="d-flex align-items-center gap-3 border-top border-secondary border-opacity-25 pt-3 pt-lg-0 border-lg-0">
            <div className="d-flex align-items-center gap-2 text-white">
              <span className="position-relative d-inline-block">
                <i className="bi bi-shield-check fs-5 text-warning"></i>
                <span
                  className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-dark"
                  style={{ width: "8px", height: "8px" }}
                ></span>
              </span>
              <div className="d-none d-xl-block leading-tight">
                <div className="fw-semibold small">Moderator System</div>
                <div className="text-white-50" style={{ fontSize: "0.7rem" }}>
                  Online
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
