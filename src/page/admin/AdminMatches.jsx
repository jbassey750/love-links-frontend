
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import AdminNavbar from "./adminHearder";

const AdminMatches = () => {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pokingMatchId, setPokingMatchId] = useState(null);

  // Load active matches
  const loadMatches = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get("/admin/matches");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load matches."
        );
      }

      setMatches(response.data.matches || []);
    } catch (err) {
      console.error("Load admin matches error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load matches."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Send a match reminder
  const handlePoke = async (match) => {
    if (!match?._id || pokingMatchId) return;

    const users = Array.isArray(match.users) ? match.users : [];
    const realUsers = users.filter(
      (user) => user?.accountType === "real"
    );

    if (realUsers.length === 0) {
      setError(
        "This match has no eligible real user to receive a reminder."
      );
      setSuccessMessage("");
      return;
    }

    const recipientNames = realUsers
      .map((user) => user.fullName || user.username || "Real user")
      .join(", ");

    const confirmed = window.confirm(
      `Send a match reminder to ${recipientNames}?\n\n` +
        "The recipient will receive a notification that their match is waiting."
    );

    if (!confirmed) return;

    try {
      setPokingMatchId(match._id);
      setError("");
      setSuccessMessage("");

      const response = await api.post(
        `/admin/matches/${match._id}/poke`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to send reminder."
        );
      }

      setSuccessMessage(
        response.data?.message || "Match reminder sent successfully."
      );
    } catch (err) {
      console.error("Poke error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to send match reminder."
      );
    } finally {
      setPokingMatchId(null);
    }
  };

  // Open admin chat
  const handleOpenChat = (chatId) => {
    const id =
      typeof chatId === "object" ? chatId?._id : chatId;

    if (!id) {
      setError("This match does not have a chat yet.");
      setSuccessMessage("");
      return;
    }

    navigate(`/admin/chats/${id}`);
  };

  // Account type badge
  const getAccountBadge = (user) => {
    if (!user) return null;

    if (user.accountType === "fake") {
      return (
        <span className="badge rounded-pill bg-secondary-subtle text-secondary px-3 py-2">
          <i className="bi bi-shield-check me-1" />
          Fake Account
        </span>
      );
    }

    if (user.accountType === "real" && user.role === "premium") {
      return (
        <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2">
          <i className="bi bi-star-fill me-1" />
          Premium
        </span>
      );
    }

    if (user.accountType === "real") {
      return (
        <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
          <i className="bi bi-person-check me-1" />
          Real User
        </span>
      );
    }

    return (
      <span className="badge rounded-pill bg-light text-dark px-3 py-2">
        Unknown Account Type
      </span>
    );
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "No activity";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "No activity";
    }

    return parsedDate.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Avatar URL
  const getAvatarUrl = (photo) => {
    if (!photo) return null;

    // Support either a photo URL string or a photo object.
    const photoValue =
      typeof photo === "string"
        ? photo
        : photo.url || photo.path || photo.filename || "";

    if (!photoValue) return null;

    if (
      photoValue.startsWith("http://") ||
      photoValue.startsWith("https://")
    ) {
      return photoValue;
    }

    return `https://love-links.miinify.com/uploads/${photoValue.replace(
      /^\/+/,
      ""
    )}`;
  };

  // User card
  const UserCard = ({ user }) => {
    const avatar = getAvatarUrl(user?.photo);
    const displayName =
      user?.fullName || user?.username || "Unknown User";

    return (
      <div className="d-flex align-items-center w-100">
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="rounded-circle shadow-sm flex-shrink-0"
            style={{
              width: "68px",
              height: "68px",
              objectFit: "cover",
              border: "3px solid #f1f1f1",
            }}
            onError={(event) => {
              event.currentTarget.style.display = "none";
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
            {displayName.charAt(0).toUpperCase() || "U"}
          </div>
        )}

        <div className="ms-3 overflow-hidden">
          <h5
            className="mb-1 fw-semibold text-dark text-truncate"
            style={{ maxWidth: "230px" }}
          >
            {displayName}
          </h5>

          <div className="text-muted small mb-2 text-truncate">
            @{user?.username || "unknown"}
          </div>

          {getAccountBadge(user)}
        </div>
      </div>
    );
  };

  // Loading state
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
                <span className="visually-hidden">Loading...</span>
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

  const totalRealRecipients = matches.reduce((total, match) => {
    const users = Array.isArray(match.users) ? match.users : [];

    return (
      total +
      users.filter((user) => user?.accountType === "real").length
    );
  }, 0);

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
          {/* Page header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div className="d-flex align-items-center">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 me-3 flex-shrink-0"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#f1e7ea",
                  color: "#73112d",
                }}
              >
                <i
                  className="bi bi-bell-fill"
                  style={{ fontSize: "20px" }}
                />
              </div>

              <div>
                <h3 className="mb-1 fw-bold">Match Pokes</h3>
                <p className="text-muted mb-0">
                  Send reminders to real users whose matches are waiting.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-light border shadow-sm px-4"
              onClick={() => loadMatches(false)}
              disabled={refreshing || Boolean(pokingMatchId)}
            >
              {refreshing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-clockwise me-2" />
                  Refresh
                </>
              )}
            </button>
          </div>

          {/* Alerts */}
          {successMessage && (
            <div
              className="alert alert-success border-0 shadow-sm d-flex align-items-center justify-content-between gap-2"
              role="alert"
            >
              <div>
                <i className="bi bi-check-circle-fill me-2" />
                {successMessage}
              </div>

              <button
                type="button"
                className="btn-close flex-shrink-0"
                aria-label="Close success message"
                onClick={() => setSuccessMessage("")}
              />
            </div>
          )}

          {error && (
            <div
              className="alert alert-danger border-0 shadow-sm d-flex align-items-center justify-content-between gap-2"
              role="alert"
            >
              <div>
                <i className="bi bi-exclamation-circle-fill me-2" />
                {error}
              </div>

              <button
                type="button"
                className="btn-close flex-shrink-0"
                aria-label="Close error message"
                onClick={() => setError("")}
              />
            </div>
          )}

          {/* Statistics */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-3">
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
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "46px",
                        height: "46px",
                        backgroundColor: "#f1e7ea",
                        color: "#73112d",
                      }}
                    >
                      <i className="bi bi-heart-fill" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <small className="text-muted fw-medium">
                        ELIGIBLE RECIPIENTS
                      </small>

                      <h2 className="fw-bold mb-1 mt-2">
                        {totalRealRecipients}
                      </h2>

                      <small className="text-muted">
                        Real-user recipients across matches
                      </small>
                    </div>

                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "46px",
                        height: "46px",
                        backgroundColor: "#e5f3e9",
                        color: "#198754",
                      }}
                    >
                      <i className="bi bi-person-check-fill" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Matches section */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
            <div>
              <h5 className="fw-bold mb-1">Active Matches</h5>
              <p className="text-muted small mb-0">
                Review participants and send a reminder when appropriate.
              </p>
            </div>

            <span className="badge bg-dark rounded-pill px-3 py-2 align-self-start align-self-sm-center">
              {matches.length} Match{matches.length !== 1 ? "es" : ""}
            </span>
          </div>

          {/* Empty state */}
          {matches.length === 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: "70px", height: "70px" }}
                >
                  <i
                    className="bi bi-heart text-muted"
                    style={{ fontSize: "28px" }}
                  />
                </div>

                <h5 className="fw-semibold">No active matches</h5>

                <p
                  className="text-muted mb-0 mx-auto"
                  style={{ maxWidth: "420px" }}
                >
                  Active matches will appear here when users match.
                </p>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {matches.map((match) => {
                const users = Array.isArray(match.users)
                  ? match.users
                  : [];

                const realUsers = users.filter(
                  (user) => user?.accountType === "real"
                );

                const hasEligibleRecipient = realUsers.length > 0;
                const chatId =
                  typeof match.chatId === "object"
                    ? match.chatId?._id
                    : match.chatId;

                const lastMessage =
                  match.chatId &&
                  typeof match.chatId === "object"
                    ? match.chatId.lastMessage
                    : match.lastMessage;

                const lastActivity =
                  match.chatId &&
                  typeof match.chatId === "object"
                    ? match.chatId.createdAt
                    : match.lastMessageAt;

                return (
                  <div className="card border-0 shadow-sm" key={match._id}>
                    {/* Match header */}
                    <div className="card-header bg-white border-bottom px-3 px-md-4 py-3">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                          <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2">
                            <i className="bi bi-circle-fill me-1" />
                            Active Match
                          </span>

                          {match.createdAt && (
                            <small className="text-muted">
                              Matched {formatDate(match.createdAt)}
                            </small>
                          )}
                        </div>

                        <div
                          className="text-muted small text-break"
                          style={{ overflowWrap: "anywhere" }}
                        >
                          <span className="fw-medium">Match ID:</span>{" "}
                          {match._id}
                        </div>
                      </div>
                    </div>

                    {/* Match body */}
                    <div className="card-body px-3 px-md-4 py-4">
                      {/* Participants */}
                      <div className="row align-items-center g-3">
                        <div className="col-12 col-md-5">
                          <div
                            className="border rounded-3 p-3 h-100"
                            style={{ backgroundColor: "#fafafa" }}
                          >
                            <UserCard user={users[0]} />
                          </div>
                        </div>

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
                                />
                              </div>

                              <small className="text-muted fw-medium d-block mt-2">
                                MATCHED
                              </small>
                            </div>
                          </div>
                        </div>

                        <div className="col-12 col-md-5">
                          <div
                            className="border rounded-3 p-3 h-100"
                            style={{ backgroundColor: "#fafafa" }}
                          >
                            <UserCard user={users[1]} />
                          </div>
                        </div>
                      </div>

                      {/* Recipient information */}
                      <div className="border rounded-3 p-3 mt-4">
                        <div className="d-flex align-items-start gap-3">
                          <div
                            className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: "36px",
                              height: "36px",
                              backgroundColor: "#f1e7ea",
                              color: "#73112d",
                            }}
                          >
                            <i className="bi bi-bell-fill" />
                          </div>

                          <div className="flex-grow-1">
                            <div className="fw-semibold text-dark mb-1">
                              Reminder recipient
                            </div>

                            {hasEligibleRecipient ? (
                              <>
                                <div className="small text-muted">
                                  {realUsers
                                    .map(
                                      (user) =>
                                        user.fullName ||
                                        user.username ||
                                        "Real user"
                                    )
                                    .join(", ")}
                                </div>

                                <small className="text-muted d-block mt-1">
                                  This notification is sent to the real
                                  user, not from the fake account.
                                </small>
                              </>
                            ) : (
                              <div className="small text-danger">
                                No eligible real user is present in this match.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Match details */}
                      <div className="row g-3 mt-2">
                        <div className="col-12 col-md-4">
                          <div className="border rounded-3 p-3 h-100">
                            <div className="d-flex align-items-center mb-2">
                              <div
                                className="rounded-2 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  backgroundColor: "#f1e7ea",
                                  color: "#73112d",
                                }}
                              >
                                <i className="bi bi-chat-square-text" />
                              </div>

                              <small className="text-muted fw-semibold">
                                CHAT ID
                              </small>
                            </div>

                            <div
                              className="small text-dark text-break"
                              style={{ overflowWrap: "anywhere" }}
                              title={chatId || ""}
                            >
                              {chatId || "No chat"}
                            </div>
                          </div>
                        </div>

                        <div className="col-12 col-md-4">
                          <div className="border rounded-3 p-3 h-100">
                            <div className="d-flex align-items-center mb-2">
                              <div
                                className="rounded-2 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  backgroundColor: "#f1e7ea",
                                  color: "#73112d",
                                }}
                              >
                                <i className="bi bi-chat-left-text" />
                              </div>

                              <small className="text-muted fw-semibold">
                                LAST MESSAGE
                              </small>
                            </div>

                            <div
                              className="small text-dark text-break"
                              style={{ overflowWrap: "anywhere" }}
                              title={
                                typeof lastMessage === "object"
                                  ? lastMessage?.message || "No messages yet"
                                  : lastMessage || "No messages yet"
                              }
                            >
                              {typeof lastMessage === "object"
                                ? lastMessage?.message || "No messages yet"
                                : lastMessage || "No messages yet"}
                            </div>
                          </div>
                        </div>

                        <div className="col-12 col-md-4">
                          <div className="border rounded-3 p-3 h-100">
                            <div className="d-flex align-items-center mb-2">
                              <div
                                className="rounded-2 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  backgroundColor: "#f1e7ea",
                                  color: "#73112d",
                                }}
                              >
                                <i className="bi bi-clock-history" />
                              </div>

                              <small className="text-muted fw-semibold">
                                LAST ACTIVITY
                              </small>
                            </div>

                            <div className="small text-dark">
                              {formatDate(lastActivity)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 border-top mt-4 pt-3">
                        <div className="small text-muted">
                          <i className="bi bi-info-circle me-1" />
                          Send a reminder or manage the conversation.
                        </div>

                        <div className="d-flex flex-column flex-sm-row gap-2">
                          <button
                            type="button"
                            className="btn btn-light border px-4"
                            disabled={!chatId || Boolean(pokingMatchId)}
                            onClick={() => handleOpenChat(chatId)}
                          >
                            <i className="bi bi-chat-dots me-2" />
                            Open Chat
                          </button>

                          <button
                            type="button"
                            className="btn px-4 text-white"
                            style={{
                              backgroundColor: "#73112d",
                              opacity: hasEligibleRecipient ? 1 : 0.65,
                            }}
                            disabled={
                              !hasEligibleRecipient ||
                              Boolean(pokingMatchId)
                            }
                            onClick={() => handlePoke(match)}
                            title={
                              hasEligibleRecipient
                                ? "Send a reminder to the real user"
                                : "No eligible real user in this match"
                            }
                          >
                            {pokingMatchId === match._id ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                />
                                Sending...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-bell me-2" />
                                Send Poke
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
