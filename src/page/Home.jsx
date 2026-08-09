import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Loader from "../components/Loader";
import api from "../api/axios";

const Discover = ({ location = "Amsterdam" }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedUser, setMatchedUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null); // Dynamic toast message state
  

  // Auto-dismiss notification after 2.5 seconds
  useEffect(() => {
    let timer;
    if (toastMessage) {
      timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Fetch fresh profiles from backend
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/discover");
      const fetchedData = response.data?.users || response.data || [];

      const formattedProfiles = fetchedData.map((user) => ({
        id: user._id || user.id,
        name: user.fullName || user.username || "Anonymous",
        age: user.age || "N/A",
        distance: user.location ? `${user.location}` : "Nearby",
        badge: user.badge || "Love & Friends",
        bio: user.bio || "No bio provided yet.",
        tags: user.interests || [],
        image:
          user.photoUrl ||
          user.photo ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000",
      }));

      setProfiles(formattedProfiles);
      setCurrentIndex(0); // Reset index for freshly fetched queue
    } catch (err) {
      console.error("Failed to fetch discover profiles:", err);
      setError("Unable to load profiles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const currentProfile = profiles[currentIndex];

  const handleNextProfile = () => {
    if (profiles.length === 0) return;
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      fetchProfiles(); // Fetch fresh list when current queue ends
    }
  };

  // ❤️ Like Handler
  const handleLike = async () => {
    if (!currentProfile || actionLoading) return;

    try {
      setActionLoading(true);
      const response = await api.post("/matches/like", {
        targetUserId: currentProfile.id,
      });

      // Check if mutual match occurred
      if (response.data?.isMatch || response.data?.match) {
        setMatchedUser(currentProfile);
      } else {
        setToastMessage({
          title: "Like Sent Successfully!",
          subtitle: "We'll notify you if it's a match!",
          type: "success",
        });
      }

      // Re-sync with backend to fetch fresh profile list
      await fetchProfiles();
    } catch (err) {
      console.error("Error liking user:", err);
      const errorMessage =
        err.response?.data?.message || err.response?.data?.error || "";

      // Check if user was already liked (400 or 409 status code)
      if (
        err.response?.status === 400 ||
        err.response?.status === 409 ||
        errorMessage.toLowerCase().includes("already")
      ) {
        setToastMessage({
          title: "Already Liked!",
          subtitle: `You have already liked ${currentProfile.name}.`,
          type: "warning",
        });
      } else {
        setToastMessage({
          title: "Action Failed",
          subtitle: "Could not send like. Moving to next profile.",
          type: "error",
        });
      }

      // Sync and advance so user doesn't get stuck on the same profile
      await fetchProfiles();
    } finally {
      setActionLoading(false);
    }
  };

  // ❌ Dislike Handler
  const handleDislike = () => {
    if (!currentProfile || actionLoading) return;
    handleNextProfile();
  };

  // Dynamic colors for profile badges
  const getBadgeStyles = (badge) => {
    if (badge === "Love & Friends") {
      return {
        color: "#b55fe6",
        borderColor: "rgba(181, 95, 230, 0.3)",
        backgroundColor: "rgba(181, 95, 230, 0.15)",
      };
    }
    return {
      color: "#dc3545",
      borderColor: "rgba(220, 53, 69, 0.3)",
      backgroundColor: "rgba(220, 53, 69, 0.15)",
    };
  };

  if (loading) {
    return <Loader message="Finding profiles near you" fullScreen={true} />;
  }

  return (
    <div
      className="d-flex flex-column"
      style={{ backgroundColor: "#fbf6f0", minHeight: "100%" }}
    >
      <Helmet>
        <title>Amour - Find Your Person</title>
        <meta
          name="description"
          content="Discover real connections near you."
        />
        <style>{`
          @keyframes toastSlideIn {
            0% {
              opacity: 0;
              transform: translate(-50%, -20px) scale(0.9);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, 0) scale(1);
            }
          }
          .animate-toast {
            animation: toastSlideIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
        `}</style>
      </Helmet>

      {/* Main Profile Viewport */}
      <main
        className="flex-grow-1 d-flex flex-column align-items-center justify-content-start p-0 px-md-3 position-relative"
        style={{ minHeight: "100%" }}
      >
        {/* Animated Toast Popup */}
        {toastMessage && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start pt-5"
            style={{
              backdropFilter: "blur(4px)",
              backgroundColor: "rgba(0, 0, 0, 0.15)",
              zIndex: 1040,
              pointerEvents: "none",
            }}
          >
            <div
              className="animate-toast d-flex align-items-center gap-3 px-4 py-3 rounded-4 shadow-lg border text-white position-fixed"
              style={{
                top: "40px",
                left: "50%",
                backgroundColor:
                  toastMessage.type === "warning"
                    ? "rgba(180, 83, 9, 0.92)"
                    : toastMessage.type === "error"
                    ? "rgba(185, 28, 28, 0.92)"
                    : "rgba(92, 29, 36, 0.92)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(255, 255, 255, 0.2)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-white"
                style={{ width: "36px", height: "36px" }}
              >
                <i
                  className={`bi ${
                    toastMessage.type === "warning"
                      ? "bi-exclamation-triangle-fill text-warning"
                      : toastMessage.type === "error"
                      ? "bi-x-circle-fill text-danger"
                      : "bi-heart-fill"
                  } fs-6`}
                  style={{
                    color: toastMessage.type === "success" ? "#5c1d24" : undefined,
                  }}
                ></i>
              </div>
              <div className="pe-2">
                <p className="m-0 fw-semibold fs-6">{toastMessage.title}</p>
                <small className="opacity-75" style={{ fontSize: "0.75rem" }}>
                  {toastMessage.subtitle}
                </small>
              </div>
            </div>
          </div>
        )}

        {error ? (
          <div className="text-center py-5 my-auto">
            <i className="bi bi-exclamation-circle fs-1 text-danger"></i>
            <p className="mt-2 text-muted fw-medium">{error}</p>
            <button
              onClick={fetchProfiles}
              className="btn text-white rounded-pill px-4 py-2 mt-2"
              style={{ backgroundColor: "#5c1d24" }}
            >
              Try Again
            </button>
          </div>
        ) : currentProfile ? (
          <div
            className="w-100 h-100 position-relative d-flex flex-column"
            style={{ maxWidth: "1000px", minHeight: "100%" }}
          >
            {/* Banner Card */}
            <div
              className="card border-0 rounded-0 rounded-md-4 overflow-hidden text-white shadow-sm position-relative mb-0 mb-md-3 flex-grow-1"
              style={{
                minHeight: "calc(100vh - 136px)",
                backgroundImage: `url(${currentProfile.image})`,
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundColor: "#2c2c2c",
              }}
            >
              <div
                className="position-absolute w-100 h-100"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.15) 100%)",
                  top: 0,
                  left: 0,
                }}
              ></div>

              <div className="position-absolute bottom-0 start-0 end-0 p-4 pb-5 pb-md-4 z-3">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h2
                    className="m-0 fs-2 fs-md-3 fw-bold"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {currentProfile.name}, {currentProfile.age}
                  </h2>
                  <i className="bi bi-patch-check-fill text-primary fs-5"></i>
                </div>

                <div
                  className="d-flex align-items-center gap-2 mb-3"
                  style={{ fontSize: "0.85rem" }}
                >
                  <span className="opacity-75">
                    <i className="bi bi-geo-alt-fill me-1"></i>
                    {currentProfile.distance}
                  </span>

                  <span
                    className="badge rounded-pill border py-1 px-2.5 fw-semibold"
                    style={getBadgeStyles(currentProfile.badge)}
                  >
                    {currentProfile.badge}
                  </span>
                </div>

                <p
                  className="card-text mb-3 opacity-90 fw-light"
                  style={{
                    maxWidth: "750px",
                    fontSize: "0.95rem",
                    lineHeight: "1.4",
                  }}
                >
                  {currentProfile.bio}
                </p>

                <div className="d-flex flex-wrap gap-2">
                  {currentProfile.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="badge bg-white bg-opacity-10 rounded-pill px-3 py-1.5 fw-normal text-white border border-light border-opacity-10"
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className="d-flex justify-content-center align-items-center gap-2 position-absolute start-50 translate-middle-x"
              style={{ zIndex: 10, bottom: "20px" }}
            >
              <button
                onClick={handleDislike}
                disabled={actionLoading}
                className="btn bg-white rounded-circle shadow border d-flex align-items-center justify-content-center"
                style={{ width: "44px", height: "44px" }}
              >
                <i className="bi bi-x-lg text-danger fs-5"></i>
              </button>

              <button
                disabled={actionLoading}
                className="btn bg-white rounded-circle shadow border d-flex align-items-center justify-content-center"
                style={{ width: "38px", height: "38px" }}
              >
                <i className="bi bi-star text-warning fs-6"></i>
              </button>

              <button
                onClick={handleLike}
                disabled={actionLoading}
                className="btn rounded-circle shadow d-flex align-items-center justify-content-center"
                style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "#5c1d24",
                }}
              >
                <i className="bi bi-heart-fill text-white fs-4"></i>
              </button>

              <button
                disabled={actionLoading}
                className="btn bg-white rounded-circle shadow border d-flex align-items-center justify-content-center"
                style={{ width: "38px", height: "38px" }}
              >
                <i className="bi bi-lightning-charge text-warning fs-6"></i>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-5 my-auto">
            <i className="bi bi-people fs-1 text-muted"></i>
            <p className="mt-2 text-muted fw-medium">
              No more profiles found in your area.
            </p>
            <button
              onClick={fetchProfiles}
              className="btn btn-outline-secondary rounded-pill px-4 py-2 mt-2"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Mutual Match Modal Overlay */}
        {matchedUser && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white p-4"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              zIndex: 1050,
            }}
          >
            <i className="bi bi-heart-fill text-danger display-1 mb-3"></i>
            <h1 className="fw-bold mb-2">It's a Match!</h1>
            <p className="fs-5 text-center mb-4">
              You and {matchedUser.name} liked each other!
            </p>
            <button
              className="btn btn-danger rounded-pill px-5 py-2.5 fw-semibold"
              onClick={() => {
                setMatchedUser(null);
                handleNextProfile();
              }}
            >
              Keep Swiping
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Discover;