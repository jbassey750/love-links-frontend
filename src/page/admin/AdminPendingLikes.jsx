import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./adminHearder";

// Mock API Call for handling admin action
const processLikeResponse = async (likeId, action) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, action });
    }, 400);
  });
};

const AdminPendingLikes = () => {
  // State for incoming pending likes from real users
  const [pendingLikes, setPendingLikes] = useState([
    {
      id: "like-001",
      timestamp: "10 mins ago",
      realUser: {
        id: "usr-201",
        name: "Michael Chen",
        age: 28,
        location: "San Francisco, CA",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500",
        bio: "Product designer into tech, trail running, and pour-over coffee.",
        interests: ["UX Design", "Running", "Coffee", "Photography"],
        isVerified: true,
      },
      fakeAccount: {
        id: "fake-101",
        name: "Jessica Miller",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
      },
    },
    {
      id: "like-002",
      timestamp: "35 mins ago",
      realUser: {
        id: "usr-202",
        name: "Sarah Jenkins",
        age: 25,
        location: "Austin, TX",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500",
        bio: "Software developer, cat mom, and weekend live music traveler.",
        interests: ["Coding", "Cats", "Concerts", "Tacos"],
        isVerified: false,
      },
      fakeAccount: {
        id: "fake-102",
        name: "Alex Vance",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
      },
    },
    {
      id: "like-003",
      timestamp: "2 hours ago",
      realUser: {
        id: "usr-203",
        name: "Daniel Smith",
        age: 30,
        location: "Chicago, IL",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500",
        bio: "Architectural consultant. Passionate about urban photography and tennis.",
        interests: ["Architecture", "Tennis", "Travel"],
        isVerified: true,
      },
      fakeAccount: {
        id: "fake-101",
        name: "Jessica Miller",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
      },
    },
  ]);

  const [activeTab, setActiveTab] = useState("pending");
  const [processingId, setProcessingId] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  const handleAction = async (likeId, action) => {
    setProcessingId(likeId);
    try {
      await processLikeResponse(likeId, action);
      
      let statusText = "";
      
      if (action === "pending") {
        statusText = "Saved for later review";
      } else {
        // Filter out processed items when rejected or matched
        setPendingLikes((prev) => prev.filter((item) => item.id !== likeId));
        statusText = action === "match" ? "Mutual Match Created!" : "Like Rejected";
      }

      setAlertMessage(statusText);
      setTimeout(() => setAlertMessage(null), 2500);
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Header */}
      <AdminNavbar />

      {/* Floating Action Alert */}
      {alertMessage && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4 z-3" style={{ minWidth: "280px" }}>
          <div className="alert alert-dark shadow-lg border-0 d-flex align-items-center justify-content-center gap-2 mb-0 rounded-pill py-2.5 px-4 text-white">
            <i className="bi bi-check-circle-fill text-success fs-5"></i>
            <span className="fw-semibold">{alertMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow-1 container-md py-4 d-flex justify-content-center align-items-start">
        <div className="w-100" style={{ maxWidth: "520px" }}>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <h6 className="fw-bold text-uppercase text-muted mb-0 small tracking-wide">
              Incoming User Likes
            </h6>
            <span className="text-muted small">Showing {pendingLikes.length} requests</span>
          </div>

          {/* Pending Likes Stack */}
          {pendingLikes.length > 0 ? (
            <div className="d-flex flex-column gap-4">
              {pendingLikes.map((item) => (
                <div key={item.id} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                  {/* Persona Target Banner */}
                  <div className="bg-light px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small">Liked Persona:</span>
                      <img
                        src={item.fakeAccount.avatar}
                        alt={item.fakeAccount.name}
                        className="rounded-circle object-fit-cover"
                        style={{ width: "24px", height: "24px" }}
                      />
                      <span className="fw-bold text-dark small">{item.fakeAccount.name}</span>
                    </div>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {item.timestamp}
                    </small>
                  </div>

                  {/* Real User Profile Preview Card */}
                  <div className="position-relative" style={{ height: "320px" }}>
                    <img
                      src={item.realUser.avatar}
                      alt={item.realUser.name}
                      className="w-100 h-100 object-fit-cover"
                    />
                    <div
                      className="position-absolute bottom-0 start-0 end-0 p-3 text-white"
                      style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h4 className="mb-0 fw-bold text-white">
                          {item.realUser.name}, {item.realUser.age}
                        </h4>
                        {item.realUser.isVerified && (
                          <i className="bi bi-patch-check-fill text-info fs-5"></i>
                        )}
                      </div>
                      <p className="mb-0 small text-white-50">
                        <i className="bi bi-geo-alt-fill me-1"></i>
                        {item.realUser.location}
                      </p>
                    </div>
                  </div>

                  {/* User Profile Info */}
                  <div className="card-body p-3">
                    <p className="card-text text-dark mb-3" style={{ fontSize: "0.9rem" }}>
                      {item.realUser.bio}
                    </p>
                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {item.realUser.interests.map((interest, idx) => (
                        <span key={idx} className="badge bg-light text-secondary border rounded-pill px-2.5 py-1">
                          {interest}
                        </span>
                      ))}
                    </div>

                    {/* Action Controls: Reject / Pending / Match */}
                    <div className="d-flex gap-2 pt-2 border-top">
                      {/* Reject Button */}
                      <button
                        onClick={() => handleAction(item.id, "reject")}
                        disabled={processingId === item.id}
                        className="btn btn-outline-danger flex-grow-1 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-1"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <i className="bi bi-x-lg"></i>
                        Reject
                      </button>

                      {/* Pending Button */}
                      <button
                        onClick={() => handleAction(item.id, "pending")}
                        disabled={processingId === item.id}
                        className="btn btn-outline-warning text-dark flex-grow-1 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-1"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <i className="bi bi-clock-history"></i>
                        Pending
                      </button>

                      {/* Match Button */}
                      <button
                        onClick={() => handleAction(item.id, "match")}
                        disabled={processingId === item.id}
                        className="btn text-white flex-grow-1 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-1"
                        style={{ backgroundColor: "#5c1d24", fontSize: "0.85rem" }}
                      >
                        {processingId === item.id ? (
                          <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                        ) : (
                          <>
                            <i className="bi bi-heart-fill text-danger"></i>
                            Match
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty Queue State */
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <div className="mb-3">
                <i className="bi bi-check-all fs-1 text-success opacity-75"></i>
              </div>
              <h5 className="fw-bold text-dark">Queue Cleared</h5>
              <p className="text-muted small mb-0">
                There are no pending likes from real users to review right now.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-top sticky-bottom py-2 shadow-sm">
        <div className="container-md d-flex justify-content-center gap-5">
          <button
            onClick={() => setActiveTab("pending")}
            className={`btn border-0 d-flex flex-column align-items-center py-1 px-4 rounded-3 ${
              activeTab === "pending" ? "text-dark fw-bold" : "text-muted"
            }`}
          >
            <i
              className={`bi ${activeTab === "pending" ? "bi-heart-arrow fs-4" : "bi-heart fs-4"}`}
              style={{ color: activeTab === "pending" ? "#5c1d24" : "inherit" }}
            ></i>
            <span style={{ fontSize: "0.75rem" }}>Pending Likes</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AdminPendingLikes;