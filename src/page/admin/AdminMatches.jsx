import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import AdminNavbar from "./adminHearder";

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
        throw new Error(
          response.data?.message || "Unable to load matches.",
        );
      }

      setMatches(response.data.matches || []);
    } catch (err) {
      console.error("Load admin matches error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load matches.",
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

      const response = await api.post(
        `/admin/matches/${matchId}/poke`,
      );

      console.log("Poke response:", response.data);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to send reminder.",
        );
      }

      setSuccessMessage("Match reminder sent successfully.");

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
      return (
        <span className="badge rounded-pill bg-secondary-subtle text-secondary px-3 py-2">
          <i className="bi bi-shield-check me-1"></i>
          Fake Account
        </span>
      );
    }

    if (user.role === "premium") {
      return (
        <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2">
          <i className="bi bi-star-fill me-1"></i>
          Premium
        </span>
      );
    }

    return (
      <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
        <i className="bi bi-person-check me-1"></i>
        Real User
      </span>
    );
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
  // Avatar helper
  // =========================================================
  const getAvatarUrl = (photo) => {
    if (!photo) return null;

    if (
      photo.startsWith("http://") ||
      photo.startsWith("https://")
    ) {
      return photo;
    }

    return `https://love-links.miinify.com/uploads/${photo}`;
  };

  // =========================================================
  // User Card
  // =========================================================
  const UserCard = ({ user }) => {
    const avatar = getAvatarUrl(user?.photo);

    return (
      <div className="d-flex align-items-center w-100">
        {avatar ? (
          <img
            src={avatar}
            alt={user?.fullName || "User"}
            className="rounded-circle shadow-sm flex-shrink-0"
            style={{
              width: "68px",
              height: "68px",
              objectFit: "cover",
              border: "3px solid #f1f1f1",
            }}
          />
        ) : (
          <div
            className="rounded-circle bg-light text-secondary d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
            style={{
              width: "68px",
              height: "68px",
              fontSize: "23px",
              fontWeight: "600",
              border: "3px solid #f1f1f1",
            }}
          >
            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}

        <div className="ms-3 overflow-hidden">
          <h5
            className="mb-1 fw-semibold text-dark text-truncate"
            style={{ maxWidth: "230px" }}
          >
            {user?.fullName || "Unknown User"}
          </h5>

          <div className="text-muted small mb-2 text-truncate">
            @{user?.username || "unknown"}
          </div>

          {getAccountBadge(user)}
        </div>
      </div>
    );
  };

  // =========================================================
  // Loading
  // =========================================================
  if (loading) {
    return (
      <>
        <AdminNavbar />

        <div
          className="container-fluid py-5"
          style={{
            backgroundColor: "#f8f9fa",
            minHeight: "100vh",
          }}
        >
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="text-center">
              <div
                className="spinner-border"
                style={{ color: "#73112d" }}
                role="status"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>

              <p className="text-muted mt-3 mb-0">
                Loading active matches...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // =========================================================
  // Main UI
  // =========================================================
  return (
    <>
      <AdminNavbar />

      <div
        className="container-fluid py-4"
        style={{
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <div className="container-fluid px-2 px-md-4">
          {/* =====================================================
              HEADER
          ===================================================== */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div className="d-flex align-items-center">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 me-3"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#f1e7ea",
                  color: "#73112d",
                }}
              >
                <i
                  className="bi bi-heart-fill"
                  style={{ fontSize: "20px" }}
                ></i>
              </div>

              <div>
                <h3 className="mb-1 fw-bold">Matches</h3>

                <p className="text-muted mb-0">
                  Manage active matches and conversation activity.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-light border shadow-sm px-4"
              onClick={loadMatches}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </button>
          </div>

          {/* =====================================================
              ALERTS
          ===================================================== */}
          {successMessage && (
            <div
              className="alert alert-success border-0 shadow-sm d-flex align-items-center justify-content-between"
              role="alert"
            >
              <div>
                <i className="bi bi-check-circle-fill me-2"></i>
                {successMessage}
              </div>

              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessMessage("")}
              ></button>
            </div>
          )}

          {error && (
            <div
              className="alert alert-danger border-0 shadow-sm d-flex align-items-center justify-content-between"
              role="alert"
            >
              <div>
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                {error}
              </div>

              <button
                type="button"
                className="btn-close"
                onClick={() => setError("")}
              ></button>
            </div>
          )}

          {/* =====================================================
              STAT CARD
          ===================================================== */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <small className="text-muted fw-medium">
                        ACTIVE MATCHES
                      </small>

                      <h2 className="fw-bold mb-1 mt-2">
                        {matches.length}
                      </h2>

                      <small className="text-muted">
                        Currently active
                      </small>
                    </div>

                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: "46px",
                        height: "46px",
                        backgroundColor: "#f1e7ea",
                        color: "#73112d",
                      }}
                    >
                      <i className="bi bi-heart-fill"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              SECTION HEADER
          ===================================================== */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
            <div>
              <h5 className="fw-bold mb-1">Active Matches</h5>

              <p className="text-muted small mb-0">
                View matched users, chat activity and available actions.
              </p>
            </div>

            <span className="badge bg-dark rounded-pill px-3 py-2 align-self-start align-self-sm-center">
              {matches.length} Match
              {matches.length !== 1 ? "es" : ""}
            </span>
          </div>

          {/* =====================================================
              NO MATCHES
          ===================================================== */}
          {matches.length === 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: "70px",
                    height: "70px",
                  }}
                >
                  <i
                    className="bi bi-heart text-muted"
                    style={{ fontSize: "28px" }}
                  ></i>
                </div>

                <h5 className="fw-semibold">
                  No active matches
                </h5>

                <p
                  className="text-muted mb-0 mx-auto"
                  style={{ maxWidth: "420px" }}
                >
                  Active matches will appear here when users match.
                </p>
              </div>
            </div>
          ) : (
            /* ===================================================
               MATCH LIST
            =================================================== */
            <div className="d-flex flex-column gap-4">
              {matches.map((match) => {
                const users = match.users || [];
                const userOne = users[0];
                const userTwo = users[1];

                return (
                  <div className="card border-0 shadow-sm" key={match._id}>
                    {/* =================================================
                        MATCH HEADER
                    ================================================= */}
                    <div className="card-header bg-white border-bottom px-3 px-md-4 py-3">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                          <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2">
                            <i className="bi bi-circle-fill me-1"></i>
                            Active Match
                          </span>

                          {match.createdAt && (
                            <small className="text-muted">
                              Matched {formatDate(match.createdAt)}
                            </small>
                          )}
                        </div>

                        <div className="text-muted small text-truncate">
                          <span className="fw-medium">
                            Match ID:
                          </span>{" "}
                          {match._id}
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        MATCH BODY
                    ================================================= */}
                    <div className="card-body px-3 px-md-4 py-4">
                      {/* =================================================
                          USERS ROW
                      ================================================= */}
                      <div className="row align-items-center g-3">
                        {/* USER ONE */}
                        <div className="col-12 col-md-5">
                          <div
                            className="border rounded-3 p-3 h-100"
                            style={{
                              backgroundColor: "#fafafa",
                            }}
                          >
                            <UserCard user={userOne} />
                          </div>
                        </div>

                        {/* MATCH ICON */}
                        <div className="col-12 col-md-2">
                          <div className="d-flex justify-content-center align-items-center">
                            <div className="text-center">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                style={{
                                  width: "52px",
                                  height: "52px",
                                  backgroundColor: "#f1e7ea",
                                  color: "#73112d",
                                }}
                              >
                                <i
                                  className="bi bi-heart-fill"
                                  style={{ fontSize: "20px" }}
                                ></i>
                              </div>

                              <small className="text-muted fw-medium d-block mt-2">
                                MATCHED
                              </small>
                            </div>
                          </div>
                        </div>

                        {/* USER TWO */}
                        <div className="col-12 col-md-5">
                          <div
                            className="border rounded-3 p-3 h-100"
                            style={{
                              backgroundColor: "#fafafa",
                            }}
                          >
                            <UserCard user={userTwo} />
                          </div>
                        </div>
                      </div>

                      {/* =================================================
                          INFORMATION ROW
                      ================================================= */}
                      <div className="row g-3 mt-4">
                        {/* CHAT ID */}
                        <div className="col-12 col-md-4">
                          <div className="border rounded-3 p-3 h-100">
                            <div className="d-flex align-items-center mb-2">
                              <div
                                className="rounded-2 d-flex align-items-center justify-content-center me-2"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  backgroundColor: "#f1e7ea",
                                  color: "#73112d",
                                }}
                              >
                                <i className="bi bi-chat-square-text"></i>
                              </div>

                              <small className="text-muted fw-semibold">
                                CHAT ID
                              </small>
                            </div>

                            <div
                              className="small text-dark text-truncate"
                              title={
                                match.chatId?._id ||
                                match.chatId ||
                                ""
                              }
                            >
                              {match.chatId?._id ||
                                match.chatId ||
                                "No chat"}
                            </div>
                          </div>
                        </div>

                        {/* LAST MESSAGE */}
                        <div className="col-12 col-md-4">
                          <div className="border rounded-3 p-3 h-100">
                            <div className="d-flex align-items-center mb-2">
                              <div
                                className="rounded-2 d-flex align-items-center justify-content-center me-2"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  backgroundColor: "#f1e7ea",
                                  color: "#73112d",
                                }}
                              >
                                <i className="bi bi-chat-left-text"></i>
                              </div>

                              <small className="text-muted fw-semibold">
                                LAST MESSAGE
                              </small>
                            </div>

                            <div
                              className="small text-dark text-truncate"
                              title={
                                typeof match.lastMessage ===
                                "object"
                                  ? match.lastMessage?.message ||
                                    "No messages yet"
                                  : match.lastMessage ||
                                    "No messages yet"
                              }
                            >
                              {typeof match.lastMessage ===
                              "object"
                                ? match.lastMessage?.message ||
                                  "No messages yet"
                                : match.lastMessage ||
                                  "No messages yet"}
                            </div>
                          </div>
                        </div>

                        {/* LAST ACTIVITY */}
                        <div className="col-12 col-md-4">
                          <div className="border rounded-3 p-3 h-100">
                            <div className="d-flex align-items-center mb-2">
                              <div
                                className="rounded-2 d-flex align-items-center justify-content-center me-2"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  backgroundColor: "#f1e7ea",
                                  color: "#73112d",
                                }}
                              >
                                <i className="bi bi-clock-history"></i>
                              </div>

                              <small className="text-muted fw-semibold">
                                LAST ACTIVITY
                              </small>
                            </div>

                            <div className="small text-dark text-truncate">
                              {formatDate(match.lastMessageAt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* =================================================
                          ACTION ROW
                      ================================================= */}
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 border-top mt-4 pt-3">
                        <div className="small text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Manage this match conversation.
                        </div>

                        <div className="d-flex flex-column flex-sm-row gap-2">
                          <button
                            type="button"
                            className="btn btn-light border px-4"
                            disabled={!match.chatId}
                            onClick={() =>
                              handleOpenChat(
                                match.chatId?._id ||
                                  match.chatId,
                              )
                            }
                          >
                            <i className="bi bi-chat-dots me-2"></i>
                            Open Chat
                          </button>

                          <button
                            type="button"
                            className="btn px-4 text-white"
                            style={{
                              backgroundColor: "#73112d",
                            }}
                            disabled={
                              pokingMatchId === match._id
                            }
                            onClick={() =>
                              handlePoke(match._id)
                            }
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
                                <i className="bi bi-bell me-2"></i>
                                Send Reminder
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
      </div>
    </>
  );
};

export default AdminMatches;