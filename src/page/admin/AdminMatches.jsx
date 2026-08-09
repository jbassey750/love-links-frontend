import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const AdminMatches = () => {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pokingMatchId, setPokingMatchId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // =========================================================
  // Load active matches
  // =========================================================

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/matches");

      console.log("========== ADMIN MATCHES ==========");
      console.log(response.data);
      console.log("===================================");

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to load matches.");
      }

      setMatches(response.data.matches || []);
    } catch (err) {
      console.error("Load admin matches error:", err);

      setError(
        err.response?.data?.message || err.message || "Unable to load matches.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  // =========================================================
  // Poke matched user
  // =========================================================

  const handlePoke = async (matchId) => {
    try {
      setPokingMatchId(matchId);
      setError("");
      setSuccessMessage("");

      const response = await api.post(`/admin/matches/${matchId}/poke`);

      console.log("Poke response:", response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to send reminder.");
      }

      setSuccessMessage("Match reminder sent successfully.");

      // Remove message after a few seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err) {
      console.error("Poke error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to send match reminder.",
      );
    } finally {
      setPokingMatchId(null);
    }
  };

  // =========================================================
  // Open chat
  // =========================================================

  const handleOpenChat = (chatId) => {
    if (!chatId) {
      setError("This match does not have a chat yet.");
      return;
    }

    navigate(`/admin/chats/${chatId}`);
  };

  // =========================================================
  // Account type badge
  // =========================================================

  const getAccountBadge = (user) => {
    if (!user) return null;

    if (user.accountType === "fake") {
      return <span className="badge bg-secondary">Fake Account</span>;
    }

    if (user.role === "premium") {
      return <span className="badge bg-warning text-dark">Premium</span>;
    }

    return <span className="badge bg-primary">Real User</span>;
  };

  // =========================================================
  // Format date
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "No activity";

    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // Main UI
  // =========================================================

  return (
    <div className="container-fluid py-4">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Matches</h3>

          <p className="text-muted mb-0">
            Manage active matches and send conversation reminders.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadMatches}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {successMessage}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage("")}
          ></button>
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* =====================================================
          MATCH COUNT
      ===================================================== */}

      <div className="mb-3">
        <span className="text-muted">
          Active matches: <strong>{matches.length}</strong>
        </span>
      </div>

      {/* =====================================================
          NO MATCHES
      ===================================================== */}

      {matches.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <div className="mb-3" style={{ fontSize: "45px" }}>
              ❤️
            </div>

            <h5>No active matches</h5>

            <p className="text-muted mb-0">
              Active matches will appear here when users match.
            </p>
          </div>
        </div>
      ) : (
        /* ===================================================
           MATCH LIST
        =================================================== */

        <div className="row g-4">
          {matches.map((match) => {
            const users = match.users || [];

            const userOne = users[0];
            const userTwo = users[1];

            return (
              <div className="col-12" key={match._id}>
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    {/* =====================================
                        MATCH HEADER
                    ===================================== */}

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <span className="badge bg-success">Active Match</span>

                        {match.createdAt && (
                          <small className="text-muted ms-2">
                            Matched {formatDate(match.createdAt)}
                          </small>
                        )}
                      </div>

                      <div>
                        <small className="text-muted">
                          Match ID: {match._id}
                        </small>
                      </div>
                    </div>

                    {/* =====================================
                        USERS
                    ===================================== */}

                    <div className="row align-items-center">
                      {/* USER ONE */}

                      <div className="col-md-5">
                        <div className="d-flex align-items-center">
                          {userOne?.photo ? (
                            <img
                              src={userOne.photo}
                              alt={userOne.fullName}
                              className="rounded-circle me-3"
                              style={{
                                width: "75px",
                                height: "75px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3"
                              style={{
                                width: "75px",
                                height: "75px",
                                fontSize: "24px",
                                fontWeight: "600",
                              }}
                            >
                              {userOne?.fullName?.charAt(0)?.toUpperCase() ||
                                "U"}
                            </div>
                          )}

                          <div>
                            <h5 className="mb-1">
                              {userOne?.fullName || "Unknown User"}
                            </h5>

                            <div className="mb-1 text-muted">
                              @{userOne?.username || "unknown"}
                            </div>

                            {getAccountBadge(userOne)}
                          </div>
                        </div>
                      </div>

                      {/* HEART */}

                      <div className="col-md-2 text-center my-3 my-md-0">
                        <div style={{ fontSize: "32px" }}>❤️</div>

                        <small className="text-muted">Matched</small>
                      </div>

                      {/* USER TWO */}

                      <div className="col-md-5">
                        <div className="d-flex align-items-center">
                          {userTwo?.photo ? (
                            <img
                              src={userTwo.photo}
                              alt={userTwo.fullName}
                              className="rounded-circle me-3"
                              style={{
                                width: "75px",
                                height: "75px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3"
                              style={{
                                width: "75px",
                                height: "75px",
                                fontSize: "24px",
                                fontWeight: "600",
                              }}
                            >
                              {userTwo?.fullName?.charAt(0)?.toUpperCase() ||
                                "U"}
                            </div>
                          )}

                          <div>
                            <h5 className="mb-1">
                              {userTwo?.fullName || "Unknown User"}
                            </h5>

                            <div className="mb-1 text-muted">
                              @{userTwo?.username || "unknown"}
                            </div>

                            {getAccountBadge(userTwo)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr />

                    {/* =====================================
                        CHAT INFORMATION
                    ===================================== */}

                    <div className="row mb-3">
                      <div className="col-md-4">
                        <small className="text-muted d-block">Chat ID</small>

                        {match.chatId?._id || match.chatId || "No chat"}
                      </div>

                      <div className="col-md-4">
                        <small className="text-muted d-block">
                          Last Message
                        </small>

                        <span>
                          {typeof match.lastMessage === "object"
                            ? match.lastMessage?.message || "No messages yet"
                            : match.lastMessage || "No messages yet"}
                        </span>
                      </div>

                      <div className="col-md-4">
                        <small className="text-muted d-block">
                          Last Activity
                        </small>

                        <span>{formatDate(match.lastMessageAt)}</span>
                      </div>
                    </div>

                    {/* =====================================
                        ACTIONS
                    ===================================== */}

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled={!match.chatId}
                        onClick={() =>
                          handleOpenChat(match.chatId?._id || match.chatId)
                        }
                      >
                        <i className="bi bi-chat-dots me-1"></i>
                        Open Chat
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={pokingMatchId === match._id}
                        onClick={() => handlePoke(match._id)}
                      >
                        {pokingMatchId === match._id ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-bell me-1"></i>
                            Poke
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminMatches;
