import React, { useState, useEffect } from "react";
import AdminNavbar from "../adminHearder"

// Mock Backend API Call (Replace with your actual API endpoint)
const sendLikeRequest = async (targetUserId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Like sent successfully!" });
    }, 300);
  });
};

const FakeDashboard = () => {
  const [activeTab, setActiveTab] = useState("discover"); // 'discover' | 'profile'

  // Fake Account Profile Data (Read-Only)
  const [fakeProfile] = useState({
    name: "Jessica Miller",
    age: 24,
    location: "Miami, FL",
    bio: "Passionate about photography, art galleries, and late-night coffee runs. Looking for genuine connections!",
    interests: ["Photography", "Art", "Travel", "Coffee", "Fitness"],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
    isVerified: true,
    status: "Active",
  });

  // Real Users Pool for Discover Card Deck
  const [realUsers, setRealUsers] = useState([
    {
      id: "usr-101",
      name: "David K.",
      age: 27,
      location: "New York, NY",
      bio: "Software engineer by day, amateur chef by night. Big fan of outdoor hiking and indie music.",
      interests: ["Coding", "Cooking", "Hiking", "Indie Rock"],
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
      isVerified: true,
    },
    {
      id: "usr-102",
      name: "Alex Rivera",
      age: 29,
      location: "Chicago, IL",
      bio: "Architectural designer exploring urban spaces. Always looking for the best espresso in town.",
      interests: ["Architecture", "Espresso", "Design", "Cycling"],
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500",
      isVerified: false,
    },
    {
      id: "usr-103",
      name: "Marcus Vance",
      age: 26,
      location: "Austin, TX",
      bio: "Live music lover, dog father to two rescues, and fitness enthusiast.",
      interests: ["Live Music", "Dogs", "CrossFit", "Tacos"],
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500",
      isVerified: true,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const currentUser = realUsers[currentIndex];

  const handleLike = async () => {
    if (!currentUser || isLiking) return;

    setIsLiking(true);
    try {
      await sendLikeRequest(currentUser.id);
      
      // Show Success Popup
      setShowPopup(true);

      // Auto dismiss popup and advance to next card after 1 second
      setTimeout(() => {
        setShowPopup(false);
        setCurrentIndex((prev) => prev + 1);
        setIsLiking(false);
      }, 1000);
    } catch (error) {
      console.error("Error sending like:", error);
      setIsLiking(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Top Admin Navigation Bar */}
      <AdminNavbar />

      {/* Toast Notification Alert */}
      {showPopup && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-4 z-3"
          style={{ minWidth: "280px" }}
        >
          <div className="alert alert-success shadow-lg border-0 d-flex align-items-center justify-content-center gap-2 mb-0 rounded-pill py-2.5 px-4 text-white" style={{ backgroundColor: "#198754" }}>
            <i className="bi bi-heart-fill fs-5"></i>
            <span className="fw-semibold">Liked successfully!</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-grow-1 container-md py-4 d-flex justify-content-center align-items-center">
        {/* PAGE 1: DISCOVER USERS */}
        {activeTab === "discover" && (
          <div className="w-100" style={{ maxWidth: "440px" }}>
            {currentUser ? (
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden position-relative">
                {/* Image Container with Badges */}
                <div className="position-relative" style={{ height: "380px" }}>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-100 h-100 object-fit-cover"
                  />
                  <div
                    className="position-absolute bottom-0 start-0 end-0 p-3 text-white"
                    style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h3 className="mb-0 fw-bold text-white">
                        {currentUser.name}, {currentUser.age}
                      </h3>
                      {currentUser.isVerified && (
                        <i className="bi bi-patch-check-fill text-info fs-5" title="Verified Account"></i>
                      )}
                    </div>
                    <p className="mb-0 small text-white-50">
                      <i className="bi bi-geo-alt-fill me-1"></i>
                      {currentUser.location}
                    </p>
                  </div>
                </div>

                {/* Profile Details Body */}
                <div className="card-body p-4 bg-white">
                  <div className="mb-3">
                    <h6 className="fw-bold text-muted small text-uppercase tracking-wide mb-1">About</h6>
                    <p className="card-text text-dark" style={{ fontSize: "0.95rem" }}>
                      {currentUser.bio}
                    </p>
                  </div>

                  {/* Interests */}
                  <div className="mb-4">
                    <h6 className="fw-bold text-muted small text-uppercase tracking-wide mb-2">Interests</h6>
                    <div className="d-flex flex-wrap gap-1.5">
                      {currentUser.interests.map((interest, idx) => (
                        <span key={idx} className="badge bg-light text-secondary border rounded-pill px-3 py-1.5 fw-medium">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Single Action: LIKE (❤️) BUTTON */}
                  <div className="d-flex justify-content-center pt-2">
                    <button
                      onClick={handleLike}
                      disabled={isLiking}
                      className="btn rounded-circle d-flex align-items-center justify-content-center shadow-lg transition-all"
                      style={{
                        width: "68px",
                        height: "68px",
                        backgroundColor: "#5c1d24",
                        color: "#ffffff",
                        border: "none",
                      }}
                      aria-label="Like user"
                    >
                      {isLiking ? (
                        <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                      ) : (
                        <i className="bi bi-heart-fill fs-2"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* No More Users Empty State */
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <div className="mb-3">
                  <i className="bi bi-person-check fs-1 text-muted opacity-50"></i>
                </div>
                <h5 className="fw-bold text-dark">No more profiles available</h5>
                <p className="text-muted small mb-0">
                  You've reviewed all available real user profiles for now.
                </p>
              </div>
            )}
          </div>
        )}

        {/* PAGE 2: PROFILE (READ-ONLY) */}
        {activeTab === "profile" && (
          <div className="w-100" style={{ maxWidth: "480px" }}>
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              {/* Profile Header Image */}
              <div className="position-relative" style={{ height: "240px" }}>
                <img
                  src={fakeProfile.avatar}
                  alt={fakeProfile.name}
                  className="w-100 h-100 object-fit-cover"
                />
                <div className="position-absolute top-0 end-0 p-3">
                  <span className="badge bg-success shadow-sm px-3 py-1.5 rounded-pill">
                    ● {fakeProfile.status}
                  </span>
                </div>
              </div>

              {/* Profile Data */}
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h4 className="mb-0 fw-bold text-dark">
                    {fakeProfile.name}, {fakeProfile.age}
                  </h4>
                  {fakeProfile.isVerified && (
                    <i className="bi bi-patch-check-fill text-info fs-5" title="Verified Account"></i>
                  )}
                </div>
                <p className="text-muted small mb-3">
                  <i className="bi bi-geo-alt-fill me-1"></i>
                  {fakeProfile.location}
                </p>

                <hr className="my-3 text-secondary opacity-25" />

                <div className="mb-3">
                  <h6 className="fw-bold text-muted small text-uppercase tracking-wide mb-1">Bio</h6>
                  <p className="text-dark" style={{ fontSize: "0.95rem" }}>
                    {fakeProfile.bio}
                  </p>
                </div>

                <div>
                  <h6 className="fw-bold text-muted small text-uppercase tracking-wide mb-2">Interests</h6>
                  <div className="d-flex flex-wrap gap-1.5">
                    {fakeProfile.interests.map((interest, idx) => (
                      <span key={idx} className="badge bg-light text-dark border rounded-pill px-3 py-1.5 fw-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-top sticky-bottom py-2 shadow-sm">
        <div className="container-md d-flex justify-content-center gap-5">
          {/* Discover Navigation Button */}
          <button
            onClick={() => setActiveTab("discover")}
            className={`btn border-0 d-flex flex-column align-items-center py-1 px-4 rounded-3 ${
              activeTab === "discover" ? "text-dark fw-bold" : "text-muted"
            }`}
          >
            <i className={`bi ${activeTab === "discover" ? "bi-house-door-fill fs-4" : "bi-house-door fs-4"}`} style={{ color: activeTab === "discover" ? "#5c1d24" : "inherit" }}></i>
            <span style={{ fontSize: "0.75rem" }}>Discover</span>
          </button>

          {/* Profile Navigation Button */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`btn border-0 d-flex flex-column align-items-center py-1 px-4 rounded-3 ${
              activeTab === "profile" ? "text-dark fw-bold" : "text-muted"
            }`}
          >
            <i className={`bi ${activeTab === "profile" ? "bi-person-fill fs-4" : "bi-person fs-4"}`} style={{ color: activeTab === "profile" ? "#5c1d24" : "inherit" }}></i>
            <span style={{ fontSize: "0.75rem" }}>Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default FakeDashboard;