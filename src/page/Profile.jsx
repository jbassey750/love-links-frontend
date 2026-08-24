import React, { useEffect, useState } from "react";
import api from "../api/axios";
import EditProfileModal from "./user/EditProfileModal";

const getProfilePhotoUrl = (photo) => {
  if (!photo) {
    return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500";
  }

  // If the backend already returns a complete URL
  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }

  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

  return `${baseUrl}/uploads/${photo}`;
};

const formatValue = (value, fallback = "Not provided") => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
};

const ProfileInfo = ({ icon, label, value }) => {
  return (
    <div className="col-12 col-md-6">
      <div
        className="d-flex align-items-center gap-3 p-3 rounded-3 h-100"
        style={{
          backgroundColor: "#faf7f3",
          border: "1px solid #eee7df",
        }}
      >
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: "42px",
            height: "42px",
            backgroundColor: "rgba(128, 25, 49, 0.08)",
            color: "#801931",
          }}
        >
          <i className={`bi ${icon}`} />
        </div>

        <div className="overflow-hidden">
          <div
            className="text-muted text-uppercase fw-semibold"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.7px",
            }}
          >
            {label}
          </div>

          <div
            className="text-dark fw-semibold text-break"
            style={{ fontSize: "0.9rem" }}
          >
            {formatValue(value)}
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/profile/me");

      console.log("PROFILE RESPONSE:", response);
      console.log("PROFILE DATA:", response.data);

      /*
        Supports both possible backend responses:

        {
          user: {...}
        }

        OR

        {
          ...user
        }
      */
      const profileUser = response.data?.user || response.data;

      console.log("PROFILE USER:", profileUser);

      if (!profileUser || typeof profileUser !== "object") {
        throw new Error("Invalid profile response.");
      }

      setUser(profileUser);
    } catch (err) {
      console.error("PROFILE ERROR:", err);
      console.error("STATUS:", err.response?.status);
      console.error("ERROR DATA:", err.response?.data);

      setError(
        err.response?.data?.message || err.message || "Unable to load profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveSuccess = (updatedUser) => {
    setUser(updatedUser?.user || updatedUser);
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");

      localStorage.removeItem("token");

      // Redirect to login
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);

      // Even if the server logout fails,
      // remove the local token so the user is logged out locally.
      localStorage.removeItem("token");

      window.location.href = "/login";
    }
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
            style={{ color: "#801931" }}
            role="status"
          />

          <div className="text-muted" style={{ fontSize: "0.9rem" }}>
            Loading your profile...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center px-3"
        style={{ backgroundColor: "#fbf6f0" }}
      >
        <div
          className="card border-0 shadow-sm text-center p-4"
          style={{
            maxWidth: "420px",
            width: "100%",
            borderRadius: "20px",
          }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{
              width: "65px",
              height: "65px",
              backgroundColor: "rgba(128, 25, 49, 0.08)",
              color: "#801931",
            }}
          >
            <i className="bi bi-person-x fs-3" />
          </div>

          <h5 className="fw-bold text-dark mb-2">Profile unavailable</h5>

          <p className="text-muted small mb-3">
            {error || "We couldn't load your profile."}
          </p>

          <button
            type="button"
            onClick={fetchProfile}
            className="btn text-white rounded-pill px-4"
            style={{ backgroundColor: "#801931" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const profilePhoto = getProfilePhotoUrl(user.photo);

  const interests = Array.isArray(user.interests) ? user.interests : [];

  const lookingFor = Array.isArray(user.lookingFor)
    ? user.lookingFor
    : user.lookingFor;

  return (
    <div
      className="min-vh-100"
      style={{
        backgroundColor: "#fbf6f0",
        color: "#222",
      }}
    >
      <main
        className="mx-auto px-3 px-md-4 pb-5"
        style={{
          maxWidth: "1150px",
        }}
      >
        {/* =====================================
            PROFILE HERO
        ====================================== */}
        <div
          className="position-relative overflow-hidden"
          style={{
            height: "280px",
            borderRadius: "0 0 28px 28px",
            background:
              "linear-gradient(120deg, #671226 0%, #801931 38%, #ba7252 72%, #d2aa83 100%)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="position-absolute rounded-circle"
            style={{
              width: "260px",
              height: "260px",
              right: "-80px",
              top: "-120px",
              background: "rgba(255,255,255,0.08)",
            }}
          />

          <div
            className="position-absolute rounded-circle"
            style={{
              width: "180px",
              height: "180px",
              left: "-70px",
              bottom: "-100px",
              background: "rgba(255,255,255,0.06)",
            }}
          />

          <div
            className="position-absolute bottom-0 start-0 p-4 p-md-5 text-white"
            style={{ zIndex: 2 }}
          >
            <div
              className="text-uppercase fw-semibold mb-1"
              style={{
                fontSize: "0.7rem",
                letterSpacing: "2px",
                opacity: 0.8,
              }}
            >
              My Profile
            </div>

            <h1
              className="fw-bold mb-1"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
              }}
            >
              {formatValue(user.fullName, "Your Name")}
            </h1>

            {user.username && (
              <div
                style={{
                  fontSize: "0.9rem",
                  opacity: 0.85,
                }}
              >
                @{user.username}
              </div>
            )}
          </div>
        </div>

        {/* =====================================
            PROFILE PHOTO + ACTION
        ====================================== */}
        <div
          className="position-relative"
          style={{
            marginTop: "-65px",
            zIndex: 5,
          }}
        >
          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-end justify-content-between gap-3 px-3 px-md-5">
            <div
              className="rounded-circle bg-white p-2 shadow"
              style={{
                width: "140px",
                height: "140px",
              }}
            >
              <img
                src={profilePhoto}
                alt={user.fullName || "Profile"}
                className="rounded-circle w-100 h-100"
                style={{
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500";
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleOpenModal}
              className="btn d-flex align-items-center gap-2 rounded-pill px-4 py-2 shadow-sm"
              style={{
                backgroundColor: "#801931",
                color: "#fff",
                border: "none",
              }}
            >
              <i className="bi bi-pencil-fill" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* =====================================
            BASIC INFO
        ====================================== */}
        <section className="mt-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
            <div>
              <h2
                className="fw-bold mb-1"
                style={{
                  fontFamily: "Georgia, serif",
                  color: "#2b1a1e",
                }}
              >
                {formatValue(user.fullName, "Your Name")}
              </h2>

              <div className="d-flex flex-wrap align-items-center gap-2">
                {user.username && (
                  <span className="text-muted small">@{user.username}</span>
                )}

                {user.age && (
                  <span className="text-muted small">• {user.age} years</span>
                )}

                {(user.state || user.region) && (
                  <span className="text-muted small">
                    • {[user.state, user.region].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>

            <span
              className="badge rounded-pill align-self-start align-self-md-center px-3 py-2"
              style={{
                color: "#801931",
                backgroundColor: "rgba(128,25,49,0.1)",
              }}
            >
              <i className="bi bi-heart-fill me-1" />
              {formatValue(user.badge, "Love & Friends")}
            </span>
          </div>
        </section>

        {/* =====================================
            STATS
        ====================================== */}
        <div className="row g-3 mt-3 mb-4">
          <div className="col-4">
            <div
              className="bg-white rounded-4 shadow-sm text-center p-3 h-100"
              style={{ border: "1px solid #eee7df" }}
            >
              <div
                className="fw-bold fs-4"
                style={{
                  fontFamily: "Georgia, serif",
                  color: "#801931",
                }}
              >
                {user.points ?? 0}
              </div>

              <div
                className="text-muted text-uppercase fw-semibold"
                style={{ fontSize: "0.62rem" }}
              >
                Points
              </div>
            </div>
          </div>

          <div className="col-4">
            <div
              className="bg-white rounded-4 shadow-sm text-center p-3 h-100"
              style={{ border: "1px solid #eee7df" }}
            >
              <div
                className="fw-bold fs-4"
                style={{
                  fontFamily: "Georgia, serif",
                  color: "#801931",
                }}
              >
                {interests.length}
              </div>

              <div
                className="text-muted text-uppercase fw-semibold"
                style={{ fontSize: "0.62rem" }}
              >
                Interests
              </div>
            </div>
          </div>

          <div className="col-4">
            <div
              className="bg-white rounded-4 shadow-sm text-center p-3 h-100"
              style={{ border: "1px solid #eee7df" }}
            >
              <div
                className="fw-bold fs-4"
                style={{
                  fontFamily: "Georgia, serif",
                  color: "#801931",
                }}
              >
                {Array.isArray(user.likes) ? user.likes.length : 0}
              </div>

              <div
                className="text-muted text-uppercase fw-semibold"
                style={{ fontSize: "0.62rem" }}
              >
                Likes
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* =====================================
              LEFT COLUMN
          ====================================== */}
          <div className="col-12 col-lg-7">
            {/* ABOUT */}
            <section
              className="bg-white rounded-4 shadow-sm p-4 mb-4"
              style={{ border: "1px solid #eee7df" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <div
                    className="text-uppercase fw-bold"
                    style={{
                      color: "#801931",
                      fontSize: "0.68rem",
                      letterSpacing: "1.2px",
                    }}
                  >
                    About Me
                  </div>

                  <h5
                    className="fw-bold mb-0 mt-1"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    My Story
                  </h5>
                </div>

                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="btn rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "38px",
                    height: "38px",
                    backgroundColor: "#f4eee8",
                    color: "#801931",
                    border: "none",
                  }}
                >
                  <i className="bi bi-pencil-fill" />
                </button>
              </div>

              <p
                className="text-muted mb-0"
                style={{
                  fontSize: "0.92rem",
                  lineHeight: "1.7",
                  whiteSpace: "pre-wrap",
                }}
              >
                {formatValue(
                  user.bio,
                  "You haven't added a bio yet. Tell people a little about yourself.",
                )}
              </p>
            </section>

            {/* PERSONAL INFORMATION */}
            <section
              className="bg-white rounded-4 shadow-sm p-4 mb-4"
              style={{ border: "1px solid #eee7df" }}
            >
              <div className="mb-3">
                <div
                  className="text-uppercase fw-bold"
                  style={{
                    color: "#801931",
                    fontSize: "0.68rem",
                    letterSpacing: "1.2px",
                  }}
                >
                  Personal Information
                </div>

                <h5
                  className="fw-bold mb-0 mt-1"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  About Me
                </h5>
              </div>

              <div className="row g-3">
                <ProfileInfo
                  icon="bi-person"
                  label="Username"
                  value={user.username ? `@${user.username}` : null}
                />

                <ProfileInfo
                  icon="bi-person-badge"
                  label="Full Name"
                  value={user.fullName}
                />

                <ProfileInfo
                  icon="bi-envelope"
                  label="Email"
                  value={user.email}
                />

                <ProfileInfo
                  icon="bi-telephone"
                  label="Phone"
                  value={user.phone}
                />

                <ProfileInfo
                  icon="bi-gender-ambiguous"
                  label="Gender"
                  value={user.gender}
                />

                <ProfileInfo
                  icon="bi-calendar3"
                  label="Age"
                  value={user.age ? `${user.age} years` : null}
                />

                <ProfileInfo
                  icon="bi-heart"
                  label="Relationship Status"
                  value={user.relationshipStatus}
                />

                <ProfileInfo
                  icon="bi-geo-alt"
                  label="State"
                  value={user.state || user.location}
                />

                <ProfileInfo icon="bi-map" label="Region" value={user.region} />
              </div>
            </section>

            {/* DATING PREFERENCES */}
            <section
              className="bg-white rounded-4 shadow-sm p-4 mb-4"
              style={{ border: "1px solid #eee7df" }}
            >
              <div className="mb-3">
                <div
                  className="text-uppercase fw-bold"
                  style={{
                    color: "#801931",
                    fontSize: "0.68rem",
                    letterSpacing: "1.2px",
                  }}
                >
                  Dating Preferences
                </div>

                <h5
                  className="fw-bold mb-0 mt-1"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  What I'm Looking For
                </h5>
              </div>

              <div
                className="p-3 rounded-3"
                style={{
                  backgroundColor: "#faf7f3",
                  border: "1px solid #eee7df",
                }}
              >
                <div
                  className="d-flex align-items-center gap-2 mb-2"
                  style={{ color: "#801931" }}
                >
                  <i className="bi bi-search-heart fs-5" />

                  <span className="fw-semibold">Looking For</span>
                </div>

                <div className="text-dark">{formatValue(lookingFor)}</div>
              </div>
            </section>
          </div>

          {/* =====================================
              RIGHT COLUMN
          ====================================== */}
          <div className="col-12 col-lg-5">
            {/* INTERESTS */}
            <section
              className="bg-white rounded-4 shadow-sm p-4 mb-4"
              style={{ border: "1px solid #eee7df" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <div
                    className="text-uppercase fw-bold"
                    style={{
                      color: "#801931",
                      fontSize: "0.68rem",
                      letterSpacing: "1.2px",
                    }}
                  >
                    Interests
                  </div>

                  <h5
                    className="fw-bold mb-0 mt-1"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Things I Love
                  </h5>
                </div>

                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="btn rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "38px",
                    height: "38px",
                    backgroundColor: "#f4eee8",
                    color: "#801931",
                    border: "none",
                  }}
                >
                  <i className="bi bi-pencil-fill" />
                </button>
              </div>

              {interests.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {interests.map((interest, index) => (
                    <span
                      key={`${interest}-${index}`}
                      className="px-3 py-2 rounded-pill"
                      style={{
                        backgroundColor: "#f4eee8",
                        color: "#5c2834",
                        fontSize: "0.78rem",
                        border: "1px solid #eaded5",
                      }}
                    >
                      <i className="bi bi-heart me-1" />
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <div
                  className="text-muted text-center py-3"
                  style={{ fontSize: "0.85rem" }}
                >
                  No interests added yet.
                </div>
              )}
            </section>

            {/* ACCOUNT */}
            <section
              className="bg-white rounded-4 shadow-sm p-4 mb-4"
              style={{ border: "1px solid #eee7df" }}
            >
              <div className="mb-3">
                <div
                  className="text-uppercase fw-bold"
                  style={{
                    color: "#801931",
                    fontSize: "0.68rem",
                    letterSpacing: "1.2px",
                  }}
                >
                  Account
                </div>

                <h5
                  className="fw-bold mb-0 mt-1"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Account Security
                </h5>
              </div>

              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3"
                style={{
                  backgroundColor: "#faf7f3",
                  border: "1px solid #eee7df",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "42px",
                      height: "42px",
                      backgroundColor: "rgba(128,25,49,0.08)",
                      color: "#801931",
                    }}
                  >
                    <i className="bi bi-shield-lock" />
                  </div>

                  <div>
                    <div className="fw-semibold">Password</div>

                    <small className="text-muted">
                      Your password is securely protected
                    </small>
                  </div>
                </div>

                <i className="bi bi-check-circle-fill text-success" />
              </div>
            </section>

            {/* PROFILE SUMMARY */}
            <section
              className="rounded-4 shadow-sm p-4 mb-4 text-white"
              style={{
                background:
                  "linear-gradient(135deg, #671226, #801931, #ba7252)",
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "45px",
                    height: "45px",
                    backgroundColor: "rgba(255,255,255,0.14)",
                  }}
                >
                  <i className="bi bi-heart-fill" />
                </div>

                <div>
                  <h6 className="fw-bold mb-1">Your Enamora Profile</h6>

                  <p
                    className="mb-0"
                    style={{
                      fontSize: "0.8rem",
                      lineHeight: "1.6",
                      opacity: 0.85,
                    }}
                  >
                    Keep your profile updated so people can learn more about you
                    and discover meaningful connections.
                  </p>
                </div>
              </div>
            </section>

            {/* SIGN OUT */}
            <button
              type="button"
              onClick={handleLogout}
              className="btn w-100 rounded-4 py-3 bg-white fw-semibold"
              style={{
                color: "#dc3545",
                border: "1px solid rgba(220,53,69,0.25)",
              }}
            >
              <i className="bi bi-box-arrow-right me-2" />
              Sign Out
            </button>
          </div>
        </div>
      </main>

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={{
          fullName: user.fullName,
          age: user.age,
          location: user.location,
          state: user.state,
          region: user.region,
          bio: user.bio,
          badge: user.badge,
          relationshipStatus: user.relationshipStatus,
          gender: user.gender,
          phone: user.phone,
          interests: user.interests || [],
          lookingFor: user.lookingFor,
          photoUrl: profilePhoto,
        }}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
};

export default Profile;
