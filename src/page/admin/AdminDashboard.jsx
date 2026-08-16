import React, { useState } from "react";
import AdminNavbar from "./adminHearder";

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

const initialUserFields = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  gender: "male",
  dateOfBirth: "",
  age: "",
  region: "",
  state: "",
  location: "",
  bio: "",
  photo: "",
  lookingfor: ["female"],
  interests: "",
  relationshipStatus: "single",
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'reports' | 'create-premium' | 'create-moderator' | 'create-package'
  const [users, setUsers] = useState(MOCK_USERS);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State: Create Premium User
  const [premiumUserForm, setPremiumUserForm] = useState({
    ...initialUserFields,
    fullName: "Alex Morgan",
    username: "alexmorgan",
    email: "alex@example.com",
    password: "Password123",
    phone: "+15550123460",
    gender: "non-binary",
    dateOfBirth: "1997-05-15",
    age: 27,
    region: "North America",
    state: "Washington",
    location: "Seattle",
    photo: "",
    bio: "Creative soul who loves music festivals, art galleries, and meeting new people.",
    interests: "Music, Gaming, Art, Travel",
    lookingfor: ["male", "female", "non-binary"],
    relationshipStatus: "single",
    badge: "Friends",
    role: "premium"
  });

  // Form State: Create Moderator
  const [moderatorForm, setModeratorForm] = useState({
    ...initialUserFields,
    role: "moderator"
  });

  // Form State: Create Subscription Package
  const [packageForm, setPackageForm] = useState({
    packageName: "",
    price: "",
    billingCycle: "monthly",
    durationMonths: 1,
    features: "",
    description: "",
    isPopular: false
  });

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

  const handleLookingForChange = (gender, formType) => {
    const setForm = formType === "premium" ? setPremiumUserForm : setModeratorForm;
    setForm(prev => {
      const current = prev.lookingfor || [];
      const updated = current.includes(gender)
        ? current.filter(g => g !== gender)
        : [...current, gender];
      return { ...prev, lookingfor: updated };
    });
  };

  const handleCreatePremiumUser = (e) => {
    e.preventDefault();
    const newUser = {
      id: Date.now().toString(),
      name: premiumUserForm.fullName,
      email: premiumUserForm.email,
      age: Number(premiumUserForm.age),
      location: premiumUserForm.location,
      status: "Active",
      verified: true,
      reports: 0
    };
    setUsers(prev => [...prev, newUser]);
    alert(`User ${premiumUserForm.fullName} created successfully!`);
  };

  const handleCreateModerator = (e) => {
    e.preventDefault();
    alert(`Moderator account created for ${moderatorForm.email}`);
    setModeratorForm({ ...initialUserFields, role: "moderator" });
  };

  const handleCreatePackage = (e) => {
    e.preventDefault();
    alert(`Subscription Package "${packageForm.packageName}" created successfully!`);
    setPackageForm({
      packageName: "",
      price: "",
      billingCycle: "monthly",
      durationMonths: 1,
      features: "",
      description: "",
      isPopular: false
    });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper render function for profile form inputs
  const renderProfileInputs = (formData, setFormData, formType) => (
    <div className="row g-3" style={{ fontSize: "0.85rem" }}>
      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-dark">Full Name!</label>
        <input
          type="text"
          className="form-control border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-dark">Username!</label>
        <input
          type="text"
          className="form-control border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-dark">Email!</label>
        <input
          type="email"
          className="form-control border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-dark">Password!</label>
        <input
          type="password"
          className="form-control border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-dark">Phone!</label>
        <input
          type="text"
          className="form-control border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-dark">Gender!</label>
        <select
          className="form-select border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
        </select>
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-dark">Date of Birth!</label>
        <input
          type="date"
          className="form-control border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-dark">Age!</label>
        <input
          type="number"
          className="form-control border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        />
      </div>

      <div className="col-12 col-md-4">
        <label className="form-label fw-semibold text-dark">Region!</label>
        <input
          type="text"
          className="form-control border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
        />
      </div>

      <div className="col-12 col-md-4">
        <label className="form-label fw-semibold text-dark">State!</label>
        <input
          type="text"
          className="form-control border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
        />
      </div>

      <div className="col-12 col-md-4">
        <label className="form-label fw-semibold text-dark">Location!</label>
        <input
          type="text"
          className="form-control border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-dark">Photo URL!</label>
        <input
          type="file"
          className="form-control border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.photo}
          onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-dark">Relationship Status!</label>
        <select
          className="form-select border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.relationshipStatus}
          onChange={(e) => setFormData({ ...formData, relationshipStatus: e.target.value })}
        >
          <option value="single">Single</option>
          <option value="in-relationship">In a Relationship</option>
          <option value="engaged">Engaged</option>
          <option value="married">Married</option>
          <option value="divorced">Divorced</option>
          <option value="widowed">Widowed</option>
          <option value="complicated">It's Complicated</option>
        </select>
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-dark d-block">Looking For!</label>
        <div className="d-flex gap-3 pt-1">
          {["male", "female", "non-binary"].map((gender) => (
            <div className="form-check" key={gender}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`${formType}-looking-${gender}`}
                checked={(formData.lookingfor || []).includes(gender)}
                onChange={() => handleLookingForChange(gender, formType)}
              />
              <label className="form-check-label text-capitalize" htmlFor={`${formType}-looking-${gender}`}>
                {gender}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold text-dark">Interests (comma separated)!</label>
        <input
          type="text"
          className="form-control border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.interests}
          onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
        />
      </div>

      <div className="col-12">
        <label className="form-label fw-semibold text-dark">Bio!</label>
        <textarea
          rows="3"
          className="form-control border-1 rounded-3"
          style={{ backgroundColor: "#efeae4" }}
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        ></textarea>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#fbf6f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* Top Header */}
      <AdminNavbar />

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
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3 flex-wrap gap-2">
          <div className="d-flex gap-2 flex-wrap">
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
            <button 
              onClick={() => setActiveTab("create-premium")}
              className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold transition-all ${activeTab === "create-premium" ? "text-white" : "btn-light text-muted"}`}
              style={{ backgroundColor: activeTab === "create-premium" ? "#73112d" : undefined }}
            >
              Create Premium User
            </button>
            <button 
              onClick={() => setActiveTab("create-moderator")}
              className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold transition-all ${activeTab === "create-moderator" ? "text-white" : "btn-light text-muted"}`}
              style={{ backgroundColor: activeTab === "create-moderator" ? "#73112d" : undefined }}
            >
              Create Moderator
            </button>
            <button 
              onClick={() => setActiveTab("create-package")}
              className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold transition-all ${activeTab === "create-package" ? "text-white" : "btn-light text-muted"}`}
              style={{ backgroundColor: activeTab === "create-package" ? "#73112d" : undefined }}
            >
              Create Package
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

        {/* TAB 3: Create Premium User */}
        {activeTab === "create-premium" && (
          <div className="bg-white rounded-3 border shadow-sm p-4" style={{ maxWidth: "800px" }}>
            <h3 className="fs-5 fw-bold mb-3" style={{ fontFamily: "Georgia, serif", color: "#73112d" }}>
              Create Premium User
            </h3>
            <form onSubmit={handleCreatePremiumUser}>
              {renderProfileInputs(premiumUserForm, setPremiumUserForm, "premium")}
              <div className="row g-3 mt-1" style={{ fontSize: "0.85rem" }}>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark">Badge!</label>
                  <input
                    type="text"
                    className="form-control border-1 rounded-3"
                    style={{ backgroundColor: "#efeae4" }}
                    value={premiumUserForm.badge}
                    onChange={(e) => setPremiumUserForm({ ...premiumUserForm, badge: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark">Role!</label>
                  <select
                    className="form-select border-1 rounded-3"
                    style={{ backgroundColor: "#efeae4" }}
                    value={premiumUserForm.role}
                    onChange={(e) => setPremiumUserForm({ ...premiumUserForm, role: e.target.value })}
                  >
                    <option value="admin">admin</option>
                    <option value="user">user</option>
                    <option value="premium">premium</option>
                  </select>
                </div>
                <div className="col-12 pt-2">
                  <button type="submit" className="btn text-white px-4 py-2 fw-semibold" style={{ backgroundColor: "#73112d" }}>
                    Create Premium User
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: Create Moderator/Agent */}
        {activeTab === "create-moderator" && (
          <div className="bg-white rounded-3 border shadow-sm p-4" style={{ maxWidth: "800px" }}>
            <h3 className="fs-5 fw-bold mb-3" style={{ fontFamily: "Georgia, serif", color: "#73112d" }}>
              Create Moderator / Agent
            </h3>
            <form onSubmit={handleCreateModerator}>
              {renderProfileInputs(moderatorForm, setModeratorForm, "moderator")}
              <div className="row g-3 mt-1" style={{ fontSize: "0.85rem" }}>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark">Role!</label>
                  <input
                    type="text"
                    className="form-control border-1 rounded-3 text-muted"
                    style={{ backgroundColor: "#efeae4" }}
                    value="moderator"
                    disabled
                  />
                </div>
                <div className="col-12 pt-2">
                  <button type="submit" className="btn text-white px-4 py-2 fw-semibold" style={{ backgroundColor: "#73112d" }}>
                    Create Moderator Account
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: Create Subscription Package */}
        {activeTab === "create-package" && (
          <div className="bg-white rounded-3 border shadow-sm p-4" style={{ maxWidth: "650px" }}>
            <h3 className="fs-5 fw-bold mb-3" style={{ fontFamily: "Georgia, serif", color: "#73112d" }}>
              Create Subscription Package
            </h3>
            <form onSubmit={handleCreatePackage}>
              <div className="row g-3" style={{ fontSize: "0.85rem" }}>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark">Package Name!</label>
                  <input
                    type="text"
                    className="form-control border-1 rounded-3"
                    style={{ backgroundColor: "#efeae4" }}
                    value={packageForm.packageName}
                    onChange={(e) => setPackageForm({ ...packageForm, packageName: e.target.value })}
                    placeholder="e.g. VIP Gold Pass"
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark">Price ($)!</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control border-1 rounded-3"
                    style={{ backgroundColor: "#efeae4" }}
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                    placeholder="19.99"
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark">Billing Cycle!</label>
                  <select
                    className="form-select border-1 rounded-3"
                    style={{ backgroundColor: "#efeae4" }}
                    value={packageForm.billingCycle}
                    onChange={(e) => setPackageForm({ ...packageForm, billingCycle: e.target.value })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark">Duration (Months)!</label>
                  <input
                    type="number"
                    className="form-control border-1 rounded-3"
                    style={{ backgroundColor: "#efeae4" }}
                    value={packageForm.durationMonths}
                    onChange={(e) => setPackageForm({ ...packageForm, durationMonths: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold text-dark">Description!</label>
                  <textarea
                    rows="2"
                    className="form-control border-1 rounded-3"
                    style={{ backgroundColor: "#efeae4" }}
                    value={packageForm.description}
                    onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="col-12 pt-2">
                  <button type="submit" className="btn text-white px-4 py-2 fw-semibold" style={{ backgroundColor: "#73112d" }}>
                    Create Package
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;