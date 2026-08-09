import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../context/ChatContext";
import Loader from "../components/Loader";
import axios from "../api/axios";

// Helper to safely slice text for mobile preview layouts
const truncateText = (text, maxLength = 60) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const ConversationsList = () => {
  const navigate = useNavigate();
  const { setSelectedChat } = useContext(ChatContext);

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);

  // State for tracking deletion confirmation & notification messages
  const [chatToDelete, setChatToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Fetch dynamic matches from database
  useEffect(() => {
    let isMounted = true;

    const fetchMatches = async () => {
      try {
        setError(null);
        const response = await axios.get("/matches");

        if (isMounted) {
          // Extracts array from standard response structures (Array or nested key e.g. { data: [...] } or { matches: [...] })
          const responseData = response.data;
          const rawMatches = Array.isArray(responseData)
            ? responseData
            : responseData.matches || responseData.data || [];

          // Map database payload directly into component format
          const formattedConversations = rawMatches.map((match) => {
            // Accommodate nested user schemas (e.g., match.user.name or match.name)
            const matchUser = match.user || match.matchedUser || match;

            return {
              id: match._id, // Match ID
              chatId: match.chatId, // Chat ID
              name: matchUser.fullName || "User",
              lastMessage: match.lastMessage || "No messages yet",
              isLastMessageUser: Boolean(match.isLastMessageUser),
              timestamp: match.lastMessageAt || "",
              unreadCount: match.unreadCount || 0,
              isRead: match.isRead !== undefined ? match.isRead : true,
              isOnline: matchUser.status === "online",
              image:
                matchUser.photo ||
                matchUser.image ||
                matchUser.avatar ||
                matchUser.profilePicture ||
                "",
              raw: match,
            };
          });

          setConversations(formattedConversations);
        }
      } catch (err) {
        console.error("Failed to fetch matches from server:", err);
        if (isMounted) {
          setError("Failed to load conversations. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMatches();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-dismiss success toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    navigate(`/chat/${chat.chatId}`, { state: { chat } });
  };

  // Toggle Read / Unread State
  const handleToggleRead = (e, id) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((chat) => {
        if (chat.id === id) {
          const nextIsRead = !chat.isRead;
          return {
            ...chat,
            isRead: nextIsRead,
            unreadCount: nextIsRead ? 0 : 1,
          };
        }
        return chat;
      }),
    );
  };

  // Trigger modal confirmation dialog
  const promptDeleteChat = (e, chat) => {
    e.stopPropagation();
    setChatToDelete(chat);
  };

  // Execute deletion upon confirmation inside the popup
  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;

    try {
      // Optimistically remove from state
      const targetId = chatToDelete.id;
      setConversations((prev) => prev.filter((chat) => chat.id !== targetId));
      setChatToDelete(null);
      setToastMessage("Chat deleted successfully.");

      // Backend API call to permanently delete or archive match
      await axios.delete(`/matches/${targetId}`);
    } catch (err) {
      console.error("Error deleting chat on server:", err);
    }
  };

  if (loading) {
    return <Loader message="Loading conversations..." fullScreen={true} />;
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column position-relative"
      style={{ backgroundColor: "#fbf6f0" }}
    >
      {/* Dynamic Toast Banner */}
      {toastMessage && (
        <div
          className="position-fixed top-0 end-0 m-3 z-3 bg-dark text-white px-3 py-2 rounded-3 shadow d-flex align-items-center gap-2"
          style={{ transition: "all 0.3s ease-in-out" }}
        >
          <i className="bi bi-check-circle-fill text-success"></i>
          <span style={{ fontSize: "0.875rem" }}>{toastMessage}</span>
        </div>
      )}

      <main
        className="flex-grow-1 px-3 px-md-4 py-2 mx-auto w-100 overflow-hidden"
        style={{ maxWidth: "1200px" }}
      >
        {/* Error Notification banner */}
        {error && (
          <div
            className="alert alert-danger rounded-3 mb-3 text-center fs-6"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="d-flex flex-column gap-3">
          {conversations.length === 0 && !error ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-chat-dots fs-1 d-block mb-2 opacity-50"></i>
              <p className="m-0" style={{ fontSize: "0.9rem" }}>
                No matches or conversations found.
              </p>
            </div>
          ) : (
            conversations.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className="card border-0 rounded-4 shadow-sm bg-white p-3 d-flex flex-row align-items-center justify-content-between row-clickable overflow-hidden position-relative"
                style={{
                  border: "1px solid rgba(0,0,0,0.03)",
                  cursor: "pointer",
                }}
              >
                {/* Left Area: Avatar & Message Details */}
                <div
                  className="d-flex align-items-center gap-2 gap-sm-3 flex-grow-1 min-w-0 me-2"
                  style={{ minWidth: 0 }}
                >
                  {/* Dynamic Avatar with online status visual marker */}
                  <div className="position-relative flex-shrink-0">
                    <img
                      src={chat.image}
                      alt={chat.name}
                      className="rounded-3 object-cover d-block"
                      style={{
                        width: "48px",
                        height: "48px",
                        objectFit: "cover",
                      }}
                    />
                    <span
                      className="position-absolute bottom-0 end-0 rounded-circle border border-2 border-white"
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: chat.isOnline ? "#198754" : "#6c757d",
                        transform: "translate(25%, 25%)",
                      }}
                      title={chat.isOnline ? "Online" : "Offline"}
                    ></span>
                  </div>

                  {/* Text Container with dynamic names & message text preview */}
                  <div className="min-w-0 flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2">
                      <h5
                        className="m-0 fs-6 fw-bold text-dark text-truncate"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {chat.name}
                      </h5>
                      {!chat.isRead && (
                        <span
                          className="p-1 bg-danger border border-light rounded-circle flex-shrink-0"
                          title="Unread"
                        ></span>
                      )}
                    </div>

                    <p
                      className={`m-0 text-truncate d-block ${!chat.isRead ? "fw-bold text-dark" : "text-muted"}`}
                      style={{ fontSize: "0.825rem" }}
                    >
                      {chat.isLastMessageUser
                        ? `You: ${truncateText(chat.lastMessage, 50)}`
                        : truncateText(chat.lastMessage, 55)}
                    </p>
                  </div>
                </div>

                {/* Right Area: Timestamps & Interactive Action Buttons */}
                <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
                  <div className="d-flex flex-column align-items-end me-1">
                    {chat.timestamp && (
                      <span
                        className="text-muted"
                        style={{ fontSize: "0.7rem", whiteSpace: "nowrap" }}
                      >
                        {chat.timestamp}
                      </span>
                    )}

                    {/* Unread Message Counter Badge */}
                    {chat.unreadCount > 0 && (
                      <span
                        className="badge rounded-pill bg-danger mt-1 d-inline-flex align-items-center justify-content-center"
                        style={{
                          fontSize: "0.65rem",
                          minWidth: "18px",
                          height: "18px",
                        }}
                        title={`${chat.unreadCount} unread messages`}
                      >
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex align-items-center gap-1 flex-shrink-0">
                    {/* Mark as Read / Unread Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleRead(e, chat.id)}
                      className="btn btn-sm p-1 rounded-circle border-0 d-flex align-items-center justify-content-center text-secondary flex-shrink-0"
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: "#f8f9fa",
                      }}
                      title={chat.isRead ? "Mark as Unread" : "Mark as Read"}
                    >
                      <i
                        className={`bi ${chat.isRead ? "bi-envelope" : "bi-envelope-open"} fs-6`}
                      ></i>
                    </button>

                    {/* Delete Chat Button */}
                    <button
                      type="button"
                      onClick={(e) => promptDeleteChat(e, chat)}
                      className="btn btn-sm p-1 rounded-circle border-0 d-flex align-items-center justify-content-center text-danger flex-shrink-0"
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: "#fce8e6",
                      }}
                      title="Delete Conversation"
                    >
                      <i className="bi bi-trash fs-6"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Confirmation Modal Overlay */}
      {chatToDelete && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3 px-3"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setChatToDelete(null)}
        >
          <div
            className="bg-white rounded-4 p-4 shadow-lg w-100"
            style={{ maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5
              className="fw-bold mb-2"
              style={{ fontFamily: "Georgia, serif", color: "#5c1d24" }}
            >
              Delete Conversation?
            </h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.875rem" }}>
              Are you sure you want to delete your conversation with{" "}
              <strong>{chatToDelete.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light rounded-3 px-3 border-0"
                style={{ fontSize: "0.875rem" }}
                onClick={() => setChatToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger rounded-3 px-3"
                style={{ fontSize: "0.875rem" }}
                onClick={confirmDeleteChat}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationsList;
