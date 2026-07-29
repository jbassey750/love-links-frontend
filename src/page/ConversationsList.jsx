import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../context/ChatContext";
import Loader from "../components/Loader";

const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    name: "Isabelle",
    lastMessage: "Say hello!",
    isLastMessageUser: false,
    timestamp: "10:15 AM",
    unreadCount: 3,
    isRead: false,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: 2,
    name: "Nora",
    lastMessage: "Exactly. Do you have a favorite director whose work you always go back to?",
    isLastMessageUser: true,
    timestamp: "4:40 PM",
    unreadCount: 0,
    isRead: true,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150"
  },
  {
  id: 3,
  name: "jude",
  lastMessage: "If we're mapping the data, Nora's message content is pushing the buttons out of view on mobile devices. Please fix this by limiting the preview text to a certain number of characters so it doesn't stretch the layout. The buttons should always remain visible.",
  isLastMessageUser: true,
  timestamp: "12:43 PM",
  unreadCount: 0,
  isRead: true,
  image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150"
}
];

// Helper to safely slice text for mobile preview layouts
const truncateText = (text, maxLength = 60) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const ConversationsList = () => {
  const navigate = useNavigate();
  const { setSelectedChat } = useContext(ChatContext);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  
  // State for tracking deletion confirmation & notification messages
  const [chatToDelete, setChatToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Simulate loading state on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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
    navigate("/chat");
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
            unreadCount: nextIsRead ? 0 : 1
          };
        }
        return chat;
      })
    );
  };

  // Trigger modal confirmation dialog
  const promptDeleteChat = (e, chat) => {
    e.stopPropagation();
    setChatToDelete(chat);
  };

  // Execute deletion upon confirmation inside the popup
  const confirmDeleteChat = () => {
    if (!chatToDelete) return;
    setConversations((prev) => prev.filter((chat) => chat.id !== chatToDelete.id));
    setChatToDelete(null);
    setToastMessage("Chat deleted successfully.");
  };

  if (loading) {
    return <Loader message="Loading conversations..." fullScreen={true} />;
  }

  return (
    <div className="min-vh-100 d-flex flex-column position-relative" style={{ backgroundColor: "#fbf6f0" }}>
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


      <main className="flex-grow-1 px-3 px-md-4 py-2 mx-auto w-100 overflow-hidden" style={{ maxWidth: "1200px" }}>

        <div className="d-flex flex-column gap-3">
          {conversations.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-chat-dots fs-1 d-block mb-2 opacity-50"></i>
              <p className="m-0" style={{ fontSize: "0.9rem" }}>No active conversations left.</p>
            </div>
          ) : (
            conversations.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => handleSelectChat(chat)}
                className="card border-0 rounded-4 shadow-sm bg-white p-3 d-flex flex-row align-items-center justify-content-between row-clickable overflow-hidden position-relative"
                style={{ border: "1px solid rgba(0,0,0,0.03)", cursor: "pointer" }}
              >
                {/* Left Area: Avatar & Message Details */}
                <div className="d-flex align-items-center gap-2 gap-sm-3 flex-grow-1 min-w-0 me-2" style={{ minWidth: 0 }}>
                  <img 
                    src={chat.image} 
                    alt={chat.name} 
                    className="rounded-3 object-cover flex-shrink-0" 
                    style={{ width: "48px", height: "48px", objectFit: "cover" }}
                  />
                  
                  {/* Text Container with character limits & dynamic truncation */}
                  <div className="min-w-0 flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="m-0 fs-6 fw-bold text-dark text-truncate" style={{ fontFamily: "Georgia, serif" }}>
                        {chat.name}
                      </h5>
                      {!chat.isRead && (
                        <span className="p-1 bg-danger border border-light rounded-circle flex-shrink-0" title="Unread"></span>
                      )}
                    </div>

                    <p className={`m-0 text-truncate d-block ${!chat.isRead ? "fw-bold text-dark" : "text-muted"}`} style={{ fontSize: "0.825rem" }}>
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
                      <span className="text-muted" style={{ fontSize: "0.7rem", whiteSpace: "nowrap" }}>
                        {chat.timestamp}
                      </span>
                    )}

                    {/* Message Counter Badge */}
                    {chat.unreadCount > 0 && (
                      <span 
                        className="badge rounded-pill bg-danger mt-1 d-inline-flex align-items-center justify-content-center"
                        style={{ fontSize: "0.65rem", minWidth: "18px", height: "18px" }}
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
                      style={{ width: "30px", height: "30px", backgroundColor: "#f8f9fa" }}
                      title={chat.isRead ? "Mark as Unread" : "Mark as Read"}
                    >
                      <i className={`bi ${chat.isRead ? "bi-envelope" : "bi-envelope-open"} fs-6`}></i>
                    </button>

                    {/* Delete Chat Button */}
                    <button
                      type="button"
                      onClick={(e) => promptDeleteChat(e, chat)}
                      className="btn btn-sm p-1 rounded-circle border-0 d-flex align-items-center justify-content-center text-danger flex-shrink-0"
                      style={{ width: "30px", height: "30px", backgroundColor: "#fce8e6" }}
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
            <h5 className="fw-bold mb-2" style={{ fontFamily: "Georgia, serif", color: "#5c1d24" }}>
              Delete Conversation?
            </h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.875rem" }}>
              Are you sure you want to delete your conversation with <strong>{chatToDelete.name}</strong>? This action cannot be undone.
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