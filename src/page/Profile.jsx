import React, { useState, useEffect } from "react";
import api from "../api/axios";
import EditProfileModal from "./user/EditProfileModal";

const getProfilePhotoUrl = (photo) => {
  if (!photo) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
  return `${baseUrl}/uploads/${photo}`;
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/profile/me");
      setUser(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveSuccess = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fbf6f0" }}>
        <div className="text-center text-muted">Loading your profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fbf6f0" }}>
        <div className="text-center text-danger">{error || "Profile not found."}</div>
      </div>
    );
  }

  const profilePhoto = getProfilePhotoUrl(user.photo);

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#fbf6f0" }}>
      <main className="flex-grow-1 px-4 pb-5 mx-auto w-100" style={{ maxWidth: "1200px" }}>
        <div
          className="w-100 rounded-top-4 position-relative"
          style={{
            height: "220px",
            background: "linear-gradient(to right, #801931 0%, #ba7252 60%, #cca37a 100%)",
          }}
        >
          <div className="position-absolute start-50 translate-middle" style={{ top: "100%", zIndex: 5 }}>
            <img
              src={profilePhoto}
              alt={user.fullName}
              className="rounded-4 border border-4 border-white shadow-sm bg-white"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
          </div>
        </div>

        <div className="text-center pt-5 mt-3 mb-4">
          <h2 className="m-0 fs-4 fw-bold text-dark" style={{ fontFamily: "Georgia, serif" }}>
            {user.fullName} {user.age ? `, ${user.age}` : ""}
          </h2>
          <div className="text-muted d-flex align-items-center justify-content-center gap-1 my-1" style={{ fontSize: "0.85rem" }}>
            <i className="bi bi-geo-alt-fill"></i>
            <span>{user.location || "Unknown"}</span>
          </div>
          <span
            className="badge rounded-pill fw-semibold mt-1"
            style={{
              color: "#b55fe6",
              backgroundColor: "rgba(181, 95, 230, 0.1)",
              fontSize: "0.75rem",
              padding: "5px 12px",
            }}
          >
            {user.badge || "Love & Friends"}
          </span>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-4">
            <div className="card border-0 rounded-3 shadow-sm bg-white text-center py-3">
              <span className="fs-5 fw-bold text-dark d-block" style={{ fontFamily: "Georgia, serif" }}>{user.points ?? 0}</span>
              <small className="text-uppercase text-muted tracking-wide fw-bold" style={{ fontSize: "0.55rem" }}>Points</small>
            </div>
          </div>
          <div className="col-4">
            <div className="card border-0 rounded-3 shadow-sm bg-white text-center py-3">
              <span className="fs-5 fw-bold text-dark d-block" style={{ fontFamily: "Georgia, serif" }}>{user.interests?.length || 0}</span>
              <small className="text-uppercase text-muted tracking-wide fw-bold" style={{ fontSize: "0.55rem" }}>Interests</small>
            </div>
          </div>
          <div className="col-4">
            <div className="card border-0 rounded-3 shadow-sm bg-white text-center py-3">
              <span className="fs-5 fw-bold text-dark d-block" style={{ fontFamily: "Georgia, serif" }}>{user.likes?.length || 0}</span>
              <small className="text-uppercase text-muted tracking-wide fw-bold" style={{ fontSize: "0.55rem" }}>Likes</small>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-3 mb-4">
          <div className="card border-0 rounded-3 shadow-sm bg-white p-3 position-relative">
            <div className="d-flex align-items-center justify-content-between mb-2.5">
              <h6 className="text-uppercase text-muted fw-bold m-0" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>About</h6>
              <button
                type="button"
                onClick={handleOpenModal}
                className="btn rounded-circle d-flex align-items-center justify-content-center p-0 border-0 shadow-none"
                style={{ width: "28px", height: "28px", backgroundColor: "#efeae4", color: "#333" }}
              >
                <i className="bi bi-pencil-fill" style={{ fontSize: "0.7rem" }}></i>
              </button>
            </div>
            <p className="m-0 text-dark fw-normal opacity-90" style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
              {user.bio || "No bio added yet."}
            </p>
          </div>

          <div className="card border-0 rounded-3 shadow-sm bg-white p-3 position-relative">
            <div className="d-flex align-items-center justify-content-between mb-2.5">
              <h6 className="text-uppercase text-muted fw-bold m-0" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Interests</h6>
              <button
                type="button"
                onClick={handleOpenModal}
                className="btn rounded-circle d-flex align-items-center justify-content-center p-0 border-0 shadow-none"
                style={{ width: "28px", height: "28px", backgroundColor: "#efeae4", color: "#333" }}
              >
                <i className="bi bi-pencil-fill" style={{ fontSize: "0.7rem" }}></i>
              </button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {(user.interests || []).length > 0 ? (
                user.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="badge text-dark rounded-pill border px-3 py-1.5 fw-normal"
                    style={{
                      backgroundColor: "#efeae4",
                      borderColor: "rgba(0,0,0,0.05)",
                      fontSize: "0.75rem",
                    }}
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>No interests added yet.</span>
              )}
            </div>
          </div>

          <button
            className="btn btn-outline-danger w-100 rounded-3 py-2.5 mt-2 bg-white border border-danger border-opacity-20 text-danger fw-semibold"
            style={{ fontSize: "0.85rem", backgroundColor: "rgba(220, 53, 69, 0.02)" }}
          >
            Sign out
          </button>
        </div>
      </main>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={{
          fullName: user.fullName,
          age: user.age,
          location: user.location,
          bio: user.bio,
          badge: user.badge,
          interests: user.interests,
          photoUrl: profilePhoto,
        }}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
};

export default Profile;
