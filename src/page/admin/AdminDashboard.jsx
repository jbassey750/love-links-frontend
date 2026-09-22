import React, { useEffect, useState } from "react";
import AdminNavbar from "./adminHearder";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");

  const [stats, setStats] = useState({
    totalUsers: 0,
    managedUsers: 0,
    premiumUsers: 0,
    moderators: 0,
    activeMatches: 0,
    pendingVerifications: 0,
  });

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [statsError, setStatsError] = useState("");
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      setStatsError("");

      const response = await api.get("/admin/dashboard-stats");

      if (response.data?.success) {
        setStats({
          totalUsers: response.data.stats?.totalUsers || 0,
          managedUsers: response.data.stats?.managedUsers || 0,
          premiumUsers: response.data.stats?.premiumUsers || 0,
          moderators: response.data.stats?.moderators || 0,
          activeMatches: response.data.stats?.activeMatches || 0,
          pendingVerifications:
            response.data.stats?.pendingVerifications || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard statistics:", error);

      setStatsError(
        error.response?.data?.message ||
          "Failed to load dashboard statistics."
      );
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError("");

      const response = await api.get("/admin/real-users");

      if (response.data?.success) {
        setUsers(response.data.users || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);

      setUsersError(
        error.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "Offline";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const getLocation = (user) => {
    if (user.state && user.region) {
      return `${user.state}, ${user.region}`;
    }

    if (user.state) {
      return user.state;
    }

    if (user.region) {
      return user.region;
    }

    return "Not provided";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "online":
        return "bg-success-subtle text-success border border-success-subtle";

      case "away":
        return "bg-warning-subtle text-warning border border-warning-subtle";

      default:
        return "bg-secondary-subtle text-secondary border border-secondary-subtle";
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    return (
      user.fullName?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.state?.toLowerCase().includes(search) ||
      user.region?.toLowerCase().includes(search)
    );
  });

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        backgroundColor: "#fbf6f0",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <AdminNavbar />

      <div className="container-fluid px-4 py-4 flex-grow-1">
        {/* Section Title */}
        <div className="mb-4">
          <h2
            className="fs-3 fw-bold text-dark m-0"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Dashboard Overview
          </h2>

          <p
            className="text-muted m-0"
            style={{ fontSize: "0.85rem" }}
          >
            Monitor system activity, review profile verifications, and
            manage your platform.
          </p>
        </div>

        {/* Statistics Error */}
        {statsError && (
          <div className="alert alert-danger py-2 small mb-4">
            {statsError}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="row g-3 mb-4">
          {/* Total Users */}
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between h-100">
              <div>
                <small
                  className="text-uppercase text-muted fw-bold d-block"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "1px",
                  }}
                >
                  Total Users
                </small>

                <h3
                  className="fw-bold m-0 mt-1"
                  style={{ fontSize: "1.5rem" }}
                >
                  {loadingStats
                    ? "..."
                    : stats.totalUsers.toLocaleString()}
                </h3>
              </div>

              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "42px",
                  height: "42px",
                  backgroundColor: "#efeae4",
                  color: "#73112d",
                }}
              >
                <i className="bi bi-people-fill fs-5"></i>
              </div>
            </div>
          </div>

          {/* Managed Users */}
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between h-100">
              <div>
                <small
                  className="text-uppercase text-muted fw-bold d-block"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "1px",
                  }}
                >
                  Managed Users
                </small>

                <h3
                  className="fw-bold m-0 mt-1"
                  style={{ fontSize: "1.5rem" }}
                >
                  {loadingStats
                    ? "..."
                    : stats.managedUsers.toLocaleString()}
                </h3>
              </div>

              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "42px",
                  height: "42px",
                  backgroundColor: "#efeae4",
                  color: "#73112d",
                }}
              >
                <i className="bi bi-person-badge-fill fs-5"></i>
              </div>
            </div>
          </div>

          {/* Premium Users */}
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between h-100">
              <div>
                <small
                  className="text-uppercase text-muted fw-bold d-block"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "1px",
                  }}
                >
                  Premium
                </small>

                <h3
                  className="fw-bold m-0 mt-1"
                  style={{ fontSize: "1.5rem" }}
                >
                  {loadingStats
                    ? "..."
                    : stats.premiumUsers.toLocaleString()}
                </h3>
              </div>

              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "42px",
                  height: "42px",
                  backgroundColor: "#efeae4",
                  color: "#73112d",
                }}
              >
                <i className="bi bi-gem fs-5"></i>
              </div>
            </div>
          </div>

          {/* Moderators */}
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between h-100">
              <div>
                <small
                  className="text-uppercase text-muted fw-bold d-block"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "1px",
                  }}
                >
                  Moderators
                </small>

                <h3
                  className="fw-bold m-0 mt-1"
                  style={{ fontSize: "1.5rem" }}
                >
                  {loadingStats
                    ? "..."
                    : stats.moderators.toLocaleString()}
                </h3>
              </div>

              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "42px",
                  height: "42px",
                  backgroundColor: "#efeae4",
                  color: "#73112d",
                }}
              >
                <i className="bi bi-shield-check fs-5"></i>
              </div>
            </div>
          </div>

          {/* Active Matches */}
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between h-100">
              <div>
                <small
                  className="text-uppercase text-muted fw-bold d-block"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "1px",
                  }}
                >
                  Active Matches
                </small>

                <h3
                  className="fw-bold m-0 mt-1"
                  style={{ fontSize: "1.5rem" }}
                >
                  {loadingStats
                    ? "..."
                    : stats.activeMatches.toLocaleString()}
                </h3>
              </div>

              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "42px",
                  height: "42px",
                  backgroundColor: "#efeae4",
                  color: "#73112d",
                }}
              >
                <i className="bi bi-heart-fill fs-5"></i>
              </div>
            </div>
          </div>

          {/* Pending Verification */}
          <div className="col-12 col-sm-6 col-xl-2">
            <div className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between h-100">
              <div>
                <small
                  className="text-uppercase text-muted fw-bold d-block"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "1px",
                  }}
                >
                  Pending Verification
                </small>

                <h3
                  className="fw-bold m-0 mt-1"
                  style={{ fontSize: "1.5rem" }}
                >
                  {loadingStats
                    ? "..."
                    : stats.pendingVerifications.toLocaleString()}
                </h3>
              </div>

              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "42px",
                  height: "42px",
                  backgroundColor: "#efeae4",
                  color: "#0d6efd",
                }}
              >
                <i className="bi bi-patch-check-fill fs-5"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3 flex-wrap gap-2">
          <div className="d-flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("users")}
              className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold transition-all ${
                activeTab === "users"
                  ? "text-white"
                  : "btn-light text-muted"
              }`}
              style={{
                backgroundColor:
                  activeTab === "users" ? "#73112d" : undefined,
              }}
            >
              Manage Users ({users.length})
            </button>
          </div>

          {activeTab === "users" && (
            <div
              style={{ maxWidth: "280px" }}
              className="w-100"
            >
              <input
                type="text"
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control form-control-sm border-0 rounded-3 px-3 py-2 shadow-none"
                style={{
                  backgroundColor: "#efeae4",
                  fontSize: "0.85rem",
                }}
              />
            </div>
          )}
        </div>

        {/* User Management Panel */}
        {activeTab === "users" && (
          <div className="bg-white rounded-3 border shadow-sm overflow-hidden">
            <div className="table-responsive">
              <table
                className="table table-hover align-middle mb-0"
                style={{ fontSize: "0.85rem" }}
              >
                <thead style={{ backgroundColor: "#efeae4" }}>
                  <tr>
                    <th
                      className="py-3 px-3 border-0 text-uppercase text-muted"
                      style={{ fontSize: "0.65rem" }}
                    >
                      User
                    </th>

                    <th
                      className="py-3 px-3 border-0 text-uppercase text-muted"
                      style={{ fontSize: "0.65rem" }}
                    >
                      Age / Location
                    </th>

                    <th
                      className="py-3 px-3 border-0 text-uppercase text-muted"
                      style={{ fontSize: "0.65rem" }}
                    >
                      Account
                    </th>

                    <th
                      className="py-3 px-3 border-0 text-uppercase text-muted"
                      style={{ fontSize: "0.65rem" }}
                    >
                      Status
                    </th>

                    <th
                      className="py-3 px-3 border-0 text-uppercase text-muted"
                      style={{ fontSize: "0.65rem" }}
                    >
                      Verification
                    </th>

                    <th
                      className="py-3 px-3 border-0 text-uppercase text-muted text-end"
                      style={{ fontSize: "0.65rem" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loadingUsers ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-5 text-muted"
                      >
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></div>
                        Loading users...
                      </td>
                    </tr>
                  ) : usersError ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-5"
                      >
                        <div className="text-danger mb-2">
                          {usersError}
                        </div>

                        <button
                          onClick={fetchUsers}
                          className="btn btn-sm btn-outline-dark"
                        >
                          Try Again
                        </button>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-5 text-muted"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        {/* User */}
                        <td className="py-3 px-3">
                          <div className="fw-bold text-dark">
                            {user.fullName}
                          </div>

                          <div
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            @{user.username}
                          </div>

                          <div
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {user.email}
                          </div>
                        </td>

                        {/* Age / Location */}
                        <td className="py-3 px-3 text-muted">
                          {user.age} yrs • {getLocation(user)}
                        </td>

                        {/* Account */}
                        <td className="py-3 px-3">
                          {user.role === "premium" ? (
                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">
                              Premium
                            </span>
                          ) : (
                            <span className="badge bg-light text-muted border px-2 py-1">
                              User
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`badge ${getStatusClass(
                              user.status
                            )} px-2 py-1`}
                          >
                            {getStatusLabel(user.status)}
                          </span>
                        </td>

                        {/* Verification */}
                        <td className="py-3 px-3">
                          {user.verified ? (
                            <span
                              className="text-primary fw-bold d-flex align-items-center gap-1"
                              style={{ fontSize: "0.75rem" }}
                            >
                              <i className="bi bi-patch-check-fill"></i>
                              Verified
                            </span>
                          ) : (
                            <span
                              className="text-muted"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Unverified
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-end">
                          <div className="d-flex align-items-center justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary py-1 px-2"
                              style={{ fontSize: "0.75rem" }}
                              onClick={() => {
                                console.log(
                                  "View user:",
                                  user
                                );
                              }}
                            >
                              View
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-dark py-1 px-2"
                              style={{ fontSize: "0.75rem" }}
                              onClick={() => {
                                alert(
                                  "User management actions will be connected to the backend next."
                                );
                              }}
                            >
                              Manage
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;