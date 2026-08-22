import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Loader from "../components/Loader";

const DiscoverUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [likeLoading, setLikeLoading] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");

  // --------------------------------------------------
  // Popup
  // --------------------------------------------------
  const showPopup = (message) => {
    setPopupMessage(message);

    setTimeout(() => {
      setPopupMessage("");
    }, 3000);
  };

  // --------------------------------------------------
  // Fetch users
  // --------------------------------------------------
  const fetchUsers = async (customFilters = filters) => {
    try {
      setSearching(true);

      const params = {};

      Object.entries(customFilters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params[key] = value;
        }
      });

      const response = await axios.get("/discover", {
        params,
      });

      const payload =
        response.data?.users || response.data?.data || response.data || [];

      setUsers(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Failed to fetch discover users:", error);

      showPopup(
        error.response?.data?.message ||
          "Unable to load users. Please try again.",
      );

      setUsers([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // --------------------------------------------------
  // Initial fetch
  // --------------------------------------------------
  useEffect(() => {
    fetchUsers();
  }, []);

  // --------------------------------------------------
  // Handle filters
  // --------------------------------------------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Search
  // --------------------------------------------------
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(filters);
  };

  // --------------------------------------------------
  // Reset
  // --------------------------------------------------
  const handleReset = () => {
    const resetFilters = {
      search: "",
    };

    setFilters(resetFilters);
    fetchUsers(resetFilters);
  };
  // --------------------------------------------------
  // Like user
  // --------------------------------------------------
  const handleLike = async (user, e) => {
    if (e) {
      e.stopPropagation();
    }

    const userId = user._id || user.id;

    if (!userId) {
      showPopup("Unable to identify this user.");
      return;
    }

    try {
      setLikeLoading(userId);

      await axios.post("/matches/like", {
        targetUserId: userId,
      });

      showPopup(
        `You liked ${user.fullName || user.username || "this user"} ❤️`,
      );

      // Optional: remove user after liking
      setUsers((prev) =>
        prev.filter((item) => (item._id || item.id) !== userId),
      );

      if (selectedUser) {
        const selectedId = selectedUser._id || selectedUser.id;

        if (selectedId === userId) {
          setSelectedUser(null);
        }
      }
    } catch (error) {
      console.error("Failed to like user:", error);

      if (error.response?.status === 400) {
        showPopup(
          error.response?.data?.message || "You have already liked this user.",
        );
      } else {
        showPopup("Unable to like this user. Please try again.");
      }
    } finally {
      setLikeLoading(null);
    }
  };

  // --------------------------------------------------
  // Get user photo
  // --------------------------------------------------
  const getUserPhoto = (user) => {
    if (!user?.photo) {
      return null;
    }

    if (user.photo.startsWith("http://") || user.photo.startsWith("https://")) {
      return user.photo;
    }

    return `http://localhost:5000/uploads/${user.photo}`;
  };

  // --------------------------------------------------
  // Get interests
  // --------------------------------------------------
  const getInterests = (user) => {
    if (Array.isArray(user?.interests)) {
      return user.interests;
    }

    if (typeof user?.interests === "string") {
      return user.interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  // --------------------------------------------------
  // Get location
  // --------------------------------------------------
  const getLocation = (user) => {
    const parts = [user?.state, user?.region, user?.location].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Location unavailable";
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  if (loading) {
    return <Loader message="Finding people for you..." fullScreen={true} />;
  }

  return (
    <div
      className="min-vh-100"
      style={{
        backgroundColor: "#fbf6f0",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ------------------------------------------------ */}
      {/* Popup */}
      {/* ------------------------------------------------ */}
      {popupMessage && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-3 z-3 bg-dark text-white px-4 py-2 rounded-pill shadow"
          style={{
            fontSize: "0.85rem",
          }}
        >
          {popupMessage}
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------ */}

      {/* ------------------------------------------------ */}
      {/* Main */}
      {/* ------------------------------------------------ */}
      <main
        className="mx-auto px-3 px-sm-4 py-4"
        style={{ maxWidth: "1200px" }}
      >
        {/* ------------------------------------------------ */}
        {/* Search / Filter Box */}
        {/* ------------------------------------------------ */}
        {/* ------------------------------------------------ */}
        {/* Search / Filter Box */}
        {/* ------------------------------------------------ */}
        <div className="bg-white rounded-4 shadow-sm border-0 p-3 p-md-4 mb-4">
          <form onSubmit={handleSearch}>
            <div className="mb-0">
              <label
                className="form-label fw-semibold text-dark"
                style={{ fontSize: "0.8rem" }}
              >
                Search People
              </label>

              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>

                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="form-control border-start-0"
                  placeholder="Search by username, age, state, region, interest..."
                />
              </div>

              <small
                className="text-muted d-block mt-2"
                style={{ fontSize: "0.72rem" }}
              >
                Search for people by username, name, age, state, region, or
                interest.
              </small>
            </div>

            {/* Buttons */}
            <div className="d-flex flex-wrap gap-2 mt-4">
              <button
                type="submit"
                disabled={searching}
                className="btn text-white rounded-pill px-4 fw-semibold"
                style={{
                  backgroundColor: "#73112d",
                  fontSize: "0.85rem",
                }}
              >
                {searching ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    Search
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="btn btn-light rounded-pill px-4 fw-semibold"
                style={{ fontSize: "0.85rem" }}
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* ------------------------------------------------ */}
        {/* Results Header */}
        {/* ------------------------------------------------ */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold mb-1">People you may like</h5>

            <span className="text-muted" style={{ fontSize: "0.8rem" }}>
              {users.length} {users.length === 1 ? "person" : "people"} found
            </span>
          </div>

          <span
            className="badge rounded-pill"
            style={{
              backgroundColor: "#f3e4e8",
              color: "#73112d",
              fontSize: "0.75rem",
            }}
          >
            <i className="bi bi-heart-fill me-1"></i>
            Find your match
          </span>
        </div>

        {/* ------------------------------------------------ */}
        {/* User Grid */}
        {/* ------------------------------------------------ */}
        {users.length > 0 ? (
          <div className="row g-3">
            {users.map((user) => {
              const userId = user._id || user.id;
              const photo = getUserPhoto(user);
              const interests = getInterests(user);

              return (
                <div key={userId} className="col-12 col-sm-6 col-lg-4">
                  <div
                    className="card border-0 rounded-4 shadow-sm h-100 overflow-hidden"
                    style={{
                      backgroundColor: "#ffffff",
                    }}
                  >
                    {/* Photo */}
                    <div
                      className="position-relative"
                      style={{
                        height: "230px",
                        backgroundColor: "#eee7e1",
                      }}
                    >
                      {photo ? (
                        <img
                          src={photo}
                          alt={user.fullName || "User"}
                          className="w-100 h-100"
                          style={{
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          className="w-100 h-100 d-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor: "#73112d",
                          }}
                        >
                          <i
                            className="bi bi-person-fill text-white"
                            style={{ fontSize: "5rem" }}
                          ></i>
                        </div>
                      )}

                      {/* Online indicator */}
                      {user.status === "online" && (
                        <span
                          className="position-absolute top-0 end-0 m-3 rounded-circle border border-3 border-white"
                          style={{
                            width: "14px",
                            height: "14px",
                            backgroundColor: "#22c55e",
                          }}
                        ></span>
                      )}

                      {/* Verified */}
                      {user.verified && (
                        <span
                          className="position-absolute bottom-0 start-0 m-3 rounded-pill px-2 py-1"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.95)",
                            color: "#73112d",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        >
                          <i className="bi bi-patch-check-fill me-1"></i>
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <h6
                          className="fw-bold mb-1 text-dark text-truncate"
                          style={{ maxWidth: "85%" }}
                        >
                          {user.fullName || user.username || "Unknown User"}
                        </h6>

                        {user.verified && (
                          <i
                            className="bi bi-patch-check-fill"
                            style={{
                              color: "#73112d",
                              fontSize: "0.9rem",
                            }}
                          ></i>
                        )}
                      </div>

                      {user.username && (
                        <div
                          className="text-muted mb-2"
                          style={{ fontSize: "0.75rem" }}
                        >
                          @{user.username}
                        </div>
                      )}

                      <div
                        className="text-muted mb-2"
                        style={{ fontSize: "0.8rem" }}
                      >
                        <i className="bi bi-person me-1"></i>
                        {user.age ? `${user.age} years old` : "Age unavailable"}
                      </div>

                      <div
                        className="text-muted mb-3 text-truncate"
                        style={{ fontSize: "0.8rem" }}
                      >
                        <i className="bi bi-geo-alt me-1"></i>
                        {getLocation(user)}
                      </div>

                      {/* Interests */}
                      {interests.length > 0 && (
                        <div className="d-flex flex-wrap gap-1 mb-3">
                          {interests.slice(0, 4).map((interest, index) => (
                            <span
                              key={`${interest}-${index}`}
                              className="badge rounded-pill"
                              style={{
                                backgroundColor: "#f5ecef",
                                color: "#73112d",
                                fontSize: "0.68rem",
                                fontWeight: 500,
                              }}
                            >
                              {interest}
                            </span>
                          ))}

                          {interests.length > 4 && (
                            <span
                              className="badge rounded-pill bg-light text-muted"
                              style={{ fontSize: "0.68rem" }}
                            >
                              +{interests.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          disabled={likeLoading === userId}
                          onClick={(e) => handleLike(user, e)}
                          className="btn flex-grow-1 rounded-pill text-white fw-semibold"
                          style={{
                            backgroundColor: "#73112d",
                            fontSize: "0.78rem",
                          }}
                        >
                          {likeLoading === userId ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                              ></span>
                              Liking...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-heart-fill me-1"></i>
                              Like
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className="btn flex-grow-1 rounded-pill fw-semibold"
                          style={{
                            color: "#73112d",
                            backgroundColor: "#f5ecef",
                            border: "none",
                            fontSize: "0.78rem",
                          }}
                        >
                          <i className="bi bi-person me-1"></i>
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty */
          <div className="bg-white rounded-4 shadow-sm text-center py-5 px-4">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: "70px",
                height: "70px",
                backgroundColor: "#f3e4e8",
                color: "#73112d",
              }}
            >
              <i className="bi bi-people fs-2"></i>
            </div>

            <h5 className="fw-bold mb-2">No people found</h5>

            <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
              Try changing your search filters to find more people.
            </p>

            <button
              onClick={handleReset}
              className="btn rounded-pill px-4 text-white"
              style={{
                backgroundColor: "#73112d",
                fontSize: "0.8rem",
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* ================================================= */}
      {/* PROFILE MODAL */}
      {/* ================================================= */}
      {selectedUser && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 1050,
            backgroundColor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(7px)",
            padding: "20px",
          }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-4 shadow-lg overflow-hidden"
            style={{
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header / Image */}
            <div
              className="position-relative"
              style={{
                height: "300px",
                backgroundColor: "#eee7e1",
              }}
            >
              {getUserPhoto(selectedUser) ? (
                <img
                  src={getUserPhoto(selectedUser)}
                  alt={selectedUser.fullName || "User"}
                  className="w-100 h-100"
                  style={{
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  className="w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#73112d",
                  }}
                >
                  <i
                    className="bi bi-person-fill text-white"
                    style={{ fontSize: "7rem" }}
                  ></i>
                </div>
              )}

              {/* Close */}
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="btn btn-light rounded-circle position-absolute top-0 end-0 m-3 shadow-sm"
                style={{
                  width: "38px",
                  height: "38px",
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>

              {/* Online */}
              {selectedUser.status === "online" && (
                <span
                  className="position-absolute bottom-0 start-0 m-3 rounded-pill px-3 py-1 bg-white shadow-sm"
                  style={{
                    color: "#198754",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  <span
                    className="d-inline-block rounded-circle me-1"
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#22c55e",
                    }}
                  ></span>
                  Online
                </span>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <div className="d-flex align-items-center gap-2 mb-1">
                <h4 className="fw-bold mb-0">
                  {selectedUser.fullName ||
                    selectedUser.username ||
                    "Unknown User"}
                </h4>

                {selectedUser.verified && (
                  <i
                    className="bi bi-patch-check-fill"
                    style={{
                      color: "#73112d",
                    }}
                  ></i>
                )}
              </div>

              {selectedUser.username && (
                <div className="text-muted mb-3" style={{ fontSize: "0.8rem" }}>
                  @{selectedUser.username}
                </div>
              )}

              {/* Basic Details */}
              <div className="row g-2 mb-4">
                {selectedUser.age && (
                  <div className="col-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted d-block">Age</small>
                      <strong>{selectedUser.age}</strong>
                    </div>
                  </div>
                )}

                {selectedUser.gender && (
                  <div className="col-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted d-block">Gender</small>
                      <strong className="text-capitalize">
                        {selectedUser.gender}
                      </strong>
                    </div>
                  </div>
                )}

                {(selectedUser.state ||
                  selectedUser.region ||
                  selectedUser.location) && (
                  <div className="col-12">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted d-block">Location</small>
                      <strong>
                        <i className="bi bi-geo-alt me-1"></i>
                        {getLocation(selectedUser)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {selectedUser.bio && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">About</h6>

                  <p
                    className="text-muted mb-0"
                    style={{
                      fontSize: "0.85rem",
                      lineHeight: "1.6",
                    }}
                  >
                    {selectedUser.bio}
                  </p>
                </div>
              )}

              {/* Interests */}
              {getInterests(selectedUser).length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">Interests</h6>

                  <div className="d-flex flex-wrap gap-2">
                    {getInterests(selectedUser).map((interest, index) => (
                      <span
                        key={`${interest}-${index}`}
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          backgroundColor: "#f5ecef",
                          color: "#73112d",
                          fontSize: "0.75rem",
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Relationship preference */}
              {selectedUser.relationshipPreference && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">Looking For</h6>

                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {selectedUser.relationshipPreference}
                  </p>
                </div>
              )}

              {/* Other profile fields */}
              {selectedUser.education && (
                <div className="mb-3">
                  <h6 className="fw-bold mb-1">Education</h6>

                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {selectedUser.education}
                  </p>
                </div>
              )}

              {selectedUser.occupation && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-1">Occupation</h6>

                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {selectedUser.occupation}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="d-flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={
                    likeLoading === (selectedUser._id || selectedUser.id)
                  }
                  onClick={(e) => handleLike(selectedUser, e)}
                  className="btn flex-grow-1 rounded-pill text-white py-2 fw-semibold"
                  style={{
                    backgroundColor: "#73112d",
                  }}
                >
                  <i className="bi bi-heart-fill me-2"></i>
                  {likeLoading === (selectedUser._id || selectedUser.id)
                    ? "Liking..."
                    : "Like"}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="btn flex-grow-1 rounded-pill py-2 fw-semibold"
                  style={{
                    backgroundColor: "#f5ecef",
                    color: "#73112d",
                    border: "none",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverUsers;
