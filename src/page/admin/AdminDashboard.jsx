import React, { useState } from "react";

// Mock initial data
const MOCK_STATS = {
  totalUsers: 12450,
  activeMatches: 3820,
  pendingVerifications: 14,
  openReports: 8,
};

const MOCK_USERS = [
  { id: "1", name: "Alex Chen", email: "alex@example.com", age: 30, location: "Amsterdam", status: "Active", verified: true, reports: 0 },
  { id: "2", name: "Sarah Jenkins", email: "sarah.j@example.com", age: 26, location: "London", status: "Pending Verification", verified: false, reports: 0 },
  { id: "3", name: "Michael Scott", email: "mscott@dunder.com", age: 45, location: "Scranton", status: "Suspended", verified: true, reports: 4 },
  { id: "4", name: "Elena Rostova", email: "elena@example.com", age: 28, location: "Paris", status: "Active", verified: false, reports: 1 },
];

const MOCK_REPORTS = [
  { id: "r1", reportedUser: "Michael Scott", reportedBy: "Elena Rostova", reason: "Inappropriate messages", date: "2026-03-28", status: "Open" },
  { id: "r2", reportedUser: "Dmitri Vance", reportedBy: "Sarah Jenkins", reason: "Fake profile / Impersonation", date: "2026-03-29", status: "Open" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'reports'
  const [users, setUsers] = useState(MOCK_USERS);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [searchTerm, setSearchTerm] = useState("");

  // Action Handlers
  const toggleSuspend = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === "Suspended" ? "Active" : "Suspended";
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const verifyUser = (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: true, status: u.status === "Pending Verification" ? "Active" : u.status } : u));
  };

  const removeUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setReports(prev => prev.filter(r => r.reportedUser !== users.find(u => u.id === userId)?.name));
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#fbf6f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: "1.2rem" }}>❤️</span>
          <h1 className="m-0 fs-4 fw-bold" style={{ fontFamily: "Georgia, serif", color: "#73112d" }}>
            Amour Admin
          </h1>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-light text-dark border px-3 py-2 fw-semibold" style={{ fontSize: "0.75rem" }}>
            Super Admin
          </span>
        </div>
      </header>

      <div className="container-fluid px-4 py-4 flex-grow-1">
        
        {/* Section Title */}
        <div className="mb-4">
          <h2 className="fs-3 fw-bold text-dark m-0" style={{ fontFamily: "Georgia, serif" }}>
            Dashboard Overview
          </h2>
          <p className="text-muted m-0" style={{ fontSize: "0.85rem" }}>
            Monitor system activity, review profile verifications, and manage flagged content.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
              <div>
                <small className="text-uppercase text-muted fw-bold d-block" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Total Users</small>
                <h3 className="fw-bold m-0 mt-1" style={{ fontSize: "1.5rem" }}>{MOCK_STATS.totalUsers.toLocaleString()}</h3>
              </div>
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "42px", height: "42px", backgroundColor: "#efeae4", color: "#73112d" }}>
                <i className="bi bi-people-fill fs-5"></i>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
              <div>
                <small className="text-uppercase text-muted fw-bold d-block" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Active Matches</small>
                <h3 className="fw-bold m-0 mt-1" style={{ fontSize: "1.5rem" }}>{MOCK_STATS.activeMatches.toLocaleString()}</h3>
              </div>
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "42px", height: "42px", backgroundColor: "#efeae4", color: "#73112d" }}>
                <i className="bi bi-heart-fill fs-5"></i>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
              <div>
                <small className="text-uppercase text-muted fw-bold d-block" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Pending Verification</small>
                <h3 className="fw-bold m-0 mt-1" style={{ fontSize: "1.5rem" }}>{MOCK_STATS.pendingVerifications}</h3>
              </div>
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "42px", height: "42px", backgroundColor: "#efeae4", color: "#0d6efd" }}>
                <i className="bi bi-patch-check-fill fs-5"></i>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between">
              <div>
                <small className="text-uppercase text-muted fw-bold d-block" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>Open Reports</small>
                <h3 className="fw-bold m-0 mt-1" style={{ fontSize: "1.5rem" }}>{reports.length}</h3>
              </div>
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "42px", height: "42px", backgroundColor: "#efeae4", color: "#dc3545" }}>
                <i className="bi bi-shield-exclamation fs-5"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
          <div className="d-flex gap-2">
            <button 
              onClick={() => setActiveTab("users")}
              className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold transition-all ${activeTab === "users" ? "text-white" : "btn-light text-muted"}`}
              style={{ backgroundColor: activeTab === "users" ? "#73112d" : undefined }}
            >
              Manage Users ({users.length})
            </button>
            <button 
              onClick={() => setActiveTab("reports")}
              className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold transition-all ${activeTab === "reports" ? "text-white" : "btn-light text-muted"}`}
              style={{ backgroundColor: activeTab === "reports" ? "#73112d" : undefined }}
            >
              User Reports ({reports.length})
            </button>
          </div>

          {activeTab === "users" && (
            <div style={{ maxWidth: "250px" }} className="w-100">
              <input 
                type="text" 
                placeholder="Search user..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control form-control-sm border-0 rounded-3 px-3 py-2 shadow-none"
                style={{ backgroundColor: "#efeae4", fontSize: "0.85rem" }}
              />
            </div>
          )}
        </div>

        {/* TAB 1: User Management Panel */}
        {activeTab === "users" && (
          <div className="bg-white rounded-3 border shadow-sm overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
                <thead style={{ backgroundColor: "#efeae4" }}>
                  <tr>
                    <th className="py-3 px-3 border-0 text-uppercase text-muted" style={{ fontSize: "0.65rem" }}>User</th>
                    <th className="py-3 px-3 border-0 text-uppercase text-muted" style={{ fontSize: "0.65rem" }}>Age / Location</th>
                    <th className="py-3 px-3 border-0 text-uppercase text-muted" style={{ fontSize: "0.65rem" }}>Status</th>
                    <th className="py-3 px-3 border-0 text-uppercase text-muted" style={{ fontSize: "0.65rem" }}>Verification</th>
                    <th className="py-3 px-3 border-0 text-uppercase text-muted text-end" style={{ fontSize: "0.65rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="py-3 px-3">
                        <div className="fw-bold text-dark">{user.name}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>{user.email}</div>
                      </td>
                      <td className="py-3 px-3 text-muted">
                        {user.age} yrs • {user.location}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`badge ${user.status === "Active" ? "bg-success-subtle text-success border border-success-subtle" : user.status === "Suspended" ? "bg-danger-subtle text-danger border border-danger-subtle" : "bg-warning-subtle text-warning border border-warning-subtle"} px-2 py-1`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {user.verified ? (
                          <span className="text-primary fw-bold d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }}>
                            <i className="bi bi-patch-check-fill"></i> Verified
                          </span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: "0.75rem" }}>Unverified</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          {!user.verified && (
                            <button 
                              onClick={() => verifyUser(user.id)}
                              className="btn btn-sm btn-outline-primary py-1 px-2"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Verify
                            </button>
                          )}
                          <button 
                            onClick={() => toggleSuspend(user.id)}
                            className={`btn btn-sm py-1 px-2 ${user.status === "Suspended" ? "btn-outline-success" : "btn-outline-warning"}`}
                            style={{ fontSize: "0.75rem" }}
                          >
                            {user.status === "Suspended" ? "Unsuspend" : "Suspend"}
                          </button>
                          <button 
                            onClick={() => removeUser(user.id)}
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: User Reports Panel */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-3 border shadow-sm overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
                <thead style={{ backgroundColor: "#efeae4" }}>
                  <tr>
                    <th className="py-3 px-3 border-0 text-uppercase text-muted" style={{ fontSize: "0.65rem" }}>Reported User</th>
                    <th className="py-3 px-3 border-0 text-uppercase text-muted" style={{ fontSize: "0.65rem" }}>Reported By</th>
                    <th className="py-3 px-3 border-0 text-uppercase text-muted" style={{ fontSize: "0.65rem" }}>Reason</th>
                    <th className="py-3 px-3 border-0 text-uppercase text-muted" style={{ fontSize: "0.65rem" }}>Date</th>
                    <th className="py-3 px-3 border-0 text-uppercase text-muted text-end" style={{ fontSize: "0.65rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="py-3 px-3 fw-bold text-dark">{report.reportedUser}</td>
                      <td className="py-3 px-3 text-muted">{report.reportedBy}</td>
                      <td className="py-3 px-3 text-danger fw-semibold">{report.reason}</td>
                      <td className="py-3 px-3 text-muted">{report.date}</td>
                      <td className="py-3 px-3 text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          <button 
                            onClick={() => {
                              const target = users.find(u => u.name === report.reportedUser);
                              if (target) removeUser(target.id);
                            }}
                            className="btn btn-sm btn-danger py-1 px-2"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Remove User
                          </button>
                          <button 
                            onClick={() => setReports(prev => prev.filter(r => r.id !== report.id))}
                            className="btn btn-sm btn-light border py-1 px-2"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Dismiss
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No pending reports!
                      </td>
                    </tr>
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