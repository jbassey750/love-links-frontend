import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const AdminChat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // Admin start conversation states
  // =========================================================

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState("");

  const messagesEndRef = useRef(null);

  // =========================================================
  // Load full chat history
  // =========================================================

  const loadChat = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading admin chat:", chatId);

      const response = await api.get(`/admin/chats/${chatId}`);

      console.log("========== ADMIN CHAT ==========");
      console.log(response.data);
      console.log("================================");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load conversation."
        );
      }

      setChat(response.data.chat || null);
      setMessages(response.data.messages || []);

      // -------------------------------------------------------
      // Debug match ID
      // -------------------------------------------------------

      console.log(
        "Match ID:",
        response.data.chat?.matchId || response.data.matchId
      );
    } catch (err) {
      console.error("Load admin chat error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load conversation."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!chatId) {
      setError("Chat ID is missing.");
      setLoading(false);
      return;
    }

    loadChat();
  }, [chatId]);

  // =========================================================
  // Scroll to latest message
  // =========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =========================================================
  // Get sender information
  // =========================================================

  const getSender = (message) => {
    if (!message?.sender) {
      return null;
    }

    if (typeof message.sender === "object") {
      return message.sender;
    }

    return null;
  };

  // =========================================================
  // Determine message side
  // =========================================================

  const isFakeAccount = (message) => {
    const sender = getSender(message);

    return sender?.accountType === "fake";
  };

  // =========================================================
  // Format message time
  // =========================================================

  const formatTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // Get match ID
  // =========================================================

  const getMatchId = () => {
    return (
      chat?.matchId?._id ||
      chat?.matchId ||
      chat?.match?._id ||
      chat?.match?.id ||
      null
    );
  };

  // =========================================================
  // Start conversation as admin
  // =========================================================

  const handleStartConversation = async () => {
    const message = newMessage.trim();

    if (!message) {
      setError("Please enter a message.");
      return;
    }

    const matchId = getMatchId();

    if (!matchId) {
      setError(
        "Match ID is missing. The chat response must include the match ID."
      );
      return;
    }

    try {
      setIsSending(true);
      setError("");
      setSendSuccess("");

      console.log("=================================");
      console.log("ADMIN STARTING CONVERSATION");
      console.log("Match ID:", matchId);
      console.log("Chat ID:", chatId);
      console.log("Message:", message);
      console.log("=================================");

      const response = await api.post(
        `/admin/matches/${matchId}/start-conversation`,
        {
          message,
        }
      );

      console.log("Start conversation response:", response.data);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to start conversation."
        );
      }

      const sentMessage = response.data?.data?.message;

      // -------------------------------------------------------
      // Add the newly created message to the chat immediately
      // -------------------------------------------------------

      if (sentMessage) {
        setMessages((prev) => {
          const alreadyExists = prev.some(
            (item) =>
              item?._id?.toString() === sentMessage?._id?.toString()
          );

          if (alreadyExists) {
            return prev;
          }

          return [...prev, sentMessage];
        });
      }

      // -------------------------------------------------------
      // Clear input
      // -------------------------------------------------------

      setNewMessage("");

      setSendSuccess("Conversation started successfully.");

      // -------------------------------------------------------
      // Reload chat so the admin has the complete latest history
      // -------------------------------------------------------

      await loadChat();

      // -------------------------------------------------------
      // Return to read-only mode after successful message
      // -------------------------------------------------------

      setTimeout(() => {
        setSendSuccess("");
      }, 4000);
    } catch (err) {
      console.error("Start admin conversation error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start conversation."
      );
    } finally {
      setIsSending(false);
    }
  };

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "70vh" }}
        >
          <div className="text-center">
            <div
              className="spinner-border mb-3"
              role="status"
              aria-hidden="true"
            ></div>

            <div className="text-muted">Loading conversation...</div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // Error
  // =========================================================

  if (error && !chat) {
    return (
      <div className="container-fluid py-4">
        <button
          type="button"
          className="btn btn-outline-secondary mb-3"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="alert alert-danger">{error}</div>
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

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm mb-2"
            onClick={() => navigate(-1)}
          >
            ← Back to Matches
          </button>

          <h3 className="mb-1">Conversation</h3>

          <p className="text-muted mb-0">
            Admin view of the complete conversation.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadChat}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {sendSuccess && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {sendSuccess}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSendSuccess("")}
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
          CHAT PARTICIPANTS
      ===================================================== */}

      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body">
          <div className="row align-items-center">
            {(chat?.participants || []).map((user, index) => (
              <React.Fragment key={user?._id || index}>
                {index > 0 && (
                  <div className="col-md-1 text-center">
                    <span style={{ fontSize: "24px" }}>❤️</span>
                  </div>
                )}

                <div className="col-md">
                  <div className="d-flex align-items-center">
                    {user?.photo ? (
                      <img
                        src={user.photo}
                        alt={user.fullName || "User"}
                        className="rounded-circle me-3"
                        style={{
                          width: "55px",
                          height: "55px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: "55px",
                          height: "55px",
                          fontSize: "20px",
                          fontWeight: "600",
                        }}
                      >
                        {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}

                    <div>
                      <h6 className="mb-1">
                        {user?.fullName || "Unknown User"}
                      </h6>

                      <div className="text-muted small">
                        @{user?.username || "unknown"}
                      </div>

                      {user?.accountType === "fake" && (
                        <span className="badge bg-secondary mt-1">
                          Fake Account
                        </span>
                      )}

                      {user?.role === "premium" && (
                        <span className="badge bg-warning text-dark mt-1">
                          Premium
                        </span>
                      )}

                      {user?.accountType === "real" &&
                        user?.role !== "premium" && (
                          <span className="badge bg-primary mt-1">
                            Real User
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          CHAT
      ===================================================== */}

      <div
        className="card shadow-sm border-0"
        style={{
          height: "70vh",
        }}
      >
        <div
          className="card-body overflow-auto"
          style={{
            background: "#f7f7f7",
          }}
        >
          {messages.length === 0 ? (
            <div className="text-center text-muted py-5">
              <div style={{ fontSize: "40px" }}>💬</div>

              <h5 className="mt-3">No messages yet</h5>

              <p className="mb-0">
                This conversation has not received any messages.
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const sender = getSender(message);
              const fakeMessage = isFakeAccount(message);

              return (
                <div
                  key={message?._id || index}
                  className={`d-flex mb-3 ${
                    fakeMessage
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                    }}
                  >
                    <div
                      className={`small text-muted mb-1 ${
                        fakeMessage ? "text-end" : "text-start"
                      }`}
                    >
                      {sender?.fullName || "Unknown User"}
                    </div>

                    <div
                      className={`p-3 rounded shadow-sm ${
                        fakeMessage ? "bg-dark text-white" : "bg-white"
                      }`}
                    >
                      <div>{message?.message || ""}</div>

                      <small
                        className={
                          fakeMessage ? "text-light" : "text-muted"
                        }
                      >
                        {formatTime(message?.createdAt)}
                      </small>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ===================================================
            ADMIN START CONVERSATION / READ ONLY
        =================================================== */}

        {messages.length === 0 ? (
          <div className="card-footer bg-white">
            <div className="mb-2">
              <small className="text-muted">
                Start the conversation with a custom message.
              </small>
            </div>

            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();

                    if (!isSending) {
                      handleStartConversation();
                    }
                  }
                }}
                disabled={isSending}
              />

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartConversation}
                disabled={isSending || !newMessage.trim()}
              >
                {isSending ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-1"></i>
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="card-footer bg-white">
            <div className="text-center text-muted small">
              <i className="bi bi-eye me-1"></i>
              Admin view — messages are read-only.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
