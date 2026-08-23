import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const DEFAULT_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500";

const getProfilePhotoUrl = (photo) => {
  if (!photo) return DEFAULT_PROFILE_IMAGE;

  // If backend already returns a complete URL
  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }

  const baseUrl =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

  return `${baseUrl}/uploads/${photo}`;
};

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError("User profile not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/profile/${userId}`);

        if (response.data?.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          setError(
            response.data?.message || "Unable to load this profile."
          );
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load this profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleStartConversation = () => {
    if (!user?._id && !user?.id) return;

    const targetUserId = user.id || user._id;

    // Adjust this route if your chat creation flow uses another route.
    navigate(`/chat/${targetUserId}`);
  };

  const handleBackToDiscover = () => {
    navigate("/discover");
  };

  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#fbf6f0" }}
      >
        <div className="text-center">
          <div
            className="spinner-border mb-3"
            role="status"
            style={{ color: "#73112d" }}
          ></div>

          <p
            className="text-muted fw-semibold mb-0"
            style={{ fontSize: "0.9rem" }}
          >
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center p-4"
        style={{ backgroundColor: "#fbf6f0" }}
      >
        <div
          className="card border-0 rounded-4 shadow-sm bg-white p-4 text-center"
          style={{ maxWidth: "420px", width: "100%" }}
        >
          <div
            className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
            style={{
              width: "70px",
              height: "70px",
              backgroundColor: "#f8d7da",
              color: "#73112d",
            }}
          >
            <i className="bi bi-person-x fs-2"></i>
          </div>

          <h5
            className="fw-bold text-dark mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Profile Unavailable
          </h5>

          <p
            className="text-muted mb-4"
            style={{ fontSize: "0.88rem" }}
          >
            {error || "This user profile could not be found."}
          </p>

          <button
            type="button"
            onClick={handleBackToDiscover}
            className="btn text-white rounded-pill py-2 fw-semibold w-100"
            style={{
              backgroundColor: "#73112d",
              border: "none",
            }}
          >
            <i className="bi bi-compass me-2"></i>
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  const profilePhoto = getProfilePhotoUrl(user.photo);

  const targetUserId = user.id || user._id;

  const isOnline =
    user.status === "online" ||
    user.status === "Online" ||
    user.isOnline === true;

  return (
    <div
      className="min-vh-100"
      style={{ backgroundColor: "#fbf6f0" }}
    >
      <main
        className="px-3 px-md-4 py-4 mx-auto"
        style={{
          maxWidth: "900px",
        }}
      >
        {/* Back Button */}
        <div className="mb-3">
          <button
            type="button"
            onClick={handleBackToDiscover}
            className="btn btn-light rounded-pill shadow-sm border-0 px-3"
            style={{
              fontSize: "0.82rem",
              color: "#5c1d24",
            }}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Discover
          </button>
        </div>

        {/* Profile Card */}
        <div
          className="card border-0 rounded-4 shadow-sm overflow-hidden"
          style={{ backgroundColor: "#ffffff" }}
        >
          {/* Cover */}
          <div
            className="position-relative"
            style={{
              height: "230px",
              background:
                "linear-gradient(135deg, #73112d 0%, #a84c57 45%, #d4a17c 100%)",
            }}
          >
            {/* Decorative circles */}
            <div
              className="position-absolute rounded-circle"
              style={{
                width: "180px",
                height: "180px",
                right: "-50px",
                top: "-60px",
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            ></div>

            <div
              className="position-absolute rounded-circle"
              style={{
                width: "120px",
                height: "120px",
                left: "-40px",
                bottom: "-50px",
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            ></div>

            {/* Online Status */}
            <div className="position-absolute top-0 end-0 m-3">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  backgroundColor: "rgba(255,255,255,0.92)",
                  color: isOnline ? "#198754" : "#6c757d",
                  fontSize: "0.72rem",
                }}
              >
                <span
                  className="d-inline-block rounded-circle me-1"
                  style={{
                    width: "7px",
                    height: "7px",
                    backgroundColor: isOnline
                      ? "#198754"
                      : "#adb5bd",
                  }}
                ></span>

                {isOnline ? "Online now" : "Offline"}
              </span>
            </div>

            {/* Profile Image */}
            <div
              className="position-absolute start-50 translate-middle"
              style={{
                top: "100%",
                zIndex: 5,
              }}
            >
              <img
                src={profilePhoto}
                alt={user.fullName || "Profile"}
                className="rounded-4 border border-4 border-white shadow"
                style={{
                  width: "125px",
                  height: "125px",
                  objectFit: "cover",
                  backgroundColor: "#fff",
                }}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                }}
              />
            </div>
          </div>

          {/* Profile Header */}
          <div className="text-center pt-5 mt-4 px-3">
            <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
              <h2
                className="m-0 fw-bold text-dark"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "1.65rem",
                }}
              >
                {user.fullName || user.username || "User"}

                {user.age ? `, ${user.age}` : ""}
              </h2>

              {user.verified && (
                <i
                  className="bi bi-patch-check-fill text-primary"
                  style={{ fontSize: "1.15rem" }}
                  title="Verified"
                ></i>
              )}
            </div>

            {user.username && (
              <p
                className="text-muted mb-2"
                style={{ fontSize: "0.82rem" }}
              >
                @{user.username}
              </p>
            )}

            <div
              className="d-flex align-items-center justify-content-center gap-2 flex-wrap text-muted"
              style={{ fontSize: "0.82rem" }}
            >
              {(user.state || user.region) && (
                <>
                  <span>
                    <i className="bi bi-geo-alt-fill me-1"></i>
                    {[user.state, user.region]
                      .filter(Boolean)
                      .join(", ")}
                  </span>

                  <span>•</span>
                </>
              )}

              {user.gender && (
                <>
                  <span>
                    <i className="bi bi-person me-1"></i>
                    {user.gender}
                  </span>

                  <span>•</span>
                </>
              )}

              <span
                style={{
                  color: "#73112d",
                  fontWeight: "600",
                }}
              >
                {user.badge || "Love & Friends"}
              </span>
            </div>

            {/* Relationship Status */}
            {user.relationshipStatus && (
              <div className="mt-3">
                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{
                    backgroundColor: "#f9e9ed",
                    color: "#73112d",
                    fontSize: "0.75rem",
                  }}
                >
                  <i className="bi bi-heart-fill me-1"></i>
                  {user.relationshipStatus}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-3 px-md-5 mt-4">
            <div className="row g-2">
              <div className="col-12 col-sm-6">
                <button
                  type="button"
                  onClick={handleStartConversation}
                  className="btn w-100 rounded-pill py-2.5 fw-semibold shadow-sm"
                  style={{
                    backgroundColor: "#73112d",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "0.88rem",
                  }}
                >
                  <i className="bi bi-chat-heart-fill me-2"></i>
                  Start Conversation
                </button>
              </div>

              <div className="col-12 col-sm-6">
                <button
                  type="button"
                  onClick={handleBackToDiscover}
                  className="btn w-100 rounded-pill py-2.5 fw-semibold"
                  style={{
                    backgroundColor: "#efeae4",
                    color: "#5c1d24",
                    border: "none",
                    fontSize: "0.88rem",
                  }}
                >
                  <i className="bi bi-compass me-2"></i>
                  Back to Discover
                </button>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-3 p-md-5">
            {/* About */}
            <div className="card border-0 rounded-4 shadow-sm bg-light mb-3">
              <div className="p-3 p-md-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "34px",
                      height: "34px",
                      backgroundColor: "#f9e9ed",
                      color: "#73112d",
                    }}
                  >
                    <i className="bi bi-person-heart"></i>
                  </div>

                  <h6
                    className="fw-bold m-0"
                    style={{
                      color: "#5c1d24",
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    About {user.fullName?.split(" ")[0] || "this person"}
                  </h6>
                </div>

                <p
                  className="text-dark mb-0"
                  style={{
                    fontSize: "0.9rem",
                    lineHeight: "1.7",
                  }}
                >
                  {user.bio || "This user hasn't added a bio yet."}
                </p>
              </div>
            </div>

            {/* Looking For */}
            {user.lookingFor && (
              <div className="card border-0 rounded-4 shadow-sm bg-white mb-3">
                <div className="p-3 p-md-4">
                  <h6
                    className="text-uppercase text-muted fw-bold mb-3"
                    style={{
                      fontSize: "0.68rem",
                      letterSpacing: "0.7px",
                    }}
                  >
                    Looking For
                  </h6>

                  <div
                    className="d-flex align-items-center gap-2"
                    style={{
                      fontSize: "0.88rem",
                      color: "#333",
                    }}
                  >
                    <i
                      className="bi bi-search-heart"
                      style={{ color: "#73112d" }}
                    ></i>

                    <span>
                      {Array.isArray(user.lookingFor)
                        ? user.lookingFor.join(", ")
                        : user.lookingFor}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Interests */}
            <div className="card border-0 rounded-4 shadow-sm bg-white">
              <div className="p-3 p-md-4">
                <h6
                  className="text-uppercase text-muted fw-bold mb-3"
                  style={{
                    fontSize: "0.68rem",
                    letterSpacing: "0.7px",
                  }}
                >
                  Interests
                </h6>

                {Array.isArray(user.interests) &&
                user.interests.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {user.interests.map((interest, index) => (
                      <span
                        key={`${interest}-${index}`}
                        className="badge rounded-pill fw-normal px-3 py-2"
                        style={{
                          backgroundColor: "#efeae4",
                          color: "#5c1d24",
                          fontSize: "0.76rem",
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.85rem" }}
                  >
                    No interests added yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div
            className="px-3 px-md-5 pb-4 text-center"
            style={{ marginTop: "-15px" }}
          >
            <small
              className="text-muted"
              style={{ fontSize: "0.72rem" }}
            >
              <i className="bi bi-shield-check me-1"></i>
              Connect respectfully and make a genuine connection.
            </small>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;