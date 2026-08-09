import React, { useState } from "react";
import { useModerator } from "../hooks/useModerator";

const ConversationList = () => {
  const { conversations, activeChat, selectConversation, loading } = useModerator();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filteredConversations = conversations.filter((chat) => {
    const matchesSearch =
      chat.fakeAccount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.realUser.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "Unread") return chat.unreadCount > 0;
    if (activeTab === "Online") return chat.realUser.isOnline;
    if (activeTab === "Waiting") return chat.status === "waiting";
    if (activeTab === "Closed") return chat.status === "closed";
    return true;
  });

  return (
    <div className="d-flex flex-column h-100 bg-white border-end">
      {/* Search Input */}
      <div className="p-3 border-bottom">
        <div className="input-group">
          <span className="input-group-text bg-light border-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control bg-light border-0 shadow-none"
            placeholder="Search fake or real user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-2 pt-2 border-bottom overflow-auto">
        <div className="nav nav-pills flex-nowrap gap-1 pb-2">
          {["All", "Unread", "Online", "Waiting", "Closed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`nav-link px-2.5 py-1 btn-sm rounded-pill whitespace-nowrap ${
                activeTab === tab ? "active" : "text-secondary"
              }`}
              style={{
                backgroundColor: activeTab === tab ? "#5c1d24" : "transparent",
                fontSize: "0.8rem",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List / Skeletons */}
      <div className="flex-grow-1 overflow-auto">
        {loading ? (
          <div className="p-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="d-flex gap-3 mb-3 align-items-center">
                <div
                  className="rounded-circle bg-secondary-subtle placeholder-wave"
                  style={{ width: "48px", height: "48px" }}
                ></div>
                <div className="flex-grow-1">
                  <div className="h6 placeholder col-6 rounded"></div>
                  <div className="small placeholder col-9 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center p-4 text-muted my-auto">
            <i className="bi bi-chat-left-dots fs-2 opacity-50"></i>
            <p className="mt-2 mb-0 fw-medium">No matching conversations found.</p>
          </div>
        ) : (
          filteredConversations.map((chat) => {
            const isSelected = activeChat?.id === chat.id;
            return (
              <div
                key={chat.id}
                onClick={() => selectConversation(chat)}
                className={`p-3 border-bottom cursor-pointer transition-all ${
                  isSelected ? "bg-light" : "hover-bg-light"
                }`}
                style={{
                  borderLeft: isSelected ? "4px solid #5c1d24" : "4px solid transparent",
                  cursor: "pointer",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  {/* Fake User Avatar with Online Indicator */}
                  <div className="position-relative">
                    <img
                      src={
                        chat.fakeAccount.avatar ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                      }
                      alt={chat.fakeAccount.name}
                      className="rounded-circle object-fit-cover shadow-sm"
                      width="48"
                      height="48"
                    />
                    <span
                      className={`position-absolute bottom-0 end-0 rounded-circle border border-white ${
                        chat.realUser.isOnline ? "bg-success" : "bg-secondary"
                      }`}
                      style={{ width: "12px", height: "12px" }}
                    ></span>
                  </div>

                  {/* Metadata */}
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex justify-content-between align-items-baseline mb-1">
                      <h6 className="mb-0 text-truncate fw-bold text-dark fs-6">
                        {chat.fakeAccount.name}
                      </h6>
                      <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                        {chat.lastMessageTime || "Just now"}
                      </small>
                    </div>

                    <div className="d-flex align-items-center gap-1 mb-1">
                      <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                        to <span className="fw-semibold text-dark">{chat.realUser.name}</span>
                      </small>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <p
                        className="mb-0 text-muted text-truncate"
                        style={{ fontSize: "0.8rem", maxWidth: "170px" }}
                      >
                        {chat.lastMessage || "No messages yet"}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span
                          className="badge rounded-pill text-white ms-2"
                          style={{ backgroundColor: "#5c1d24" }}
                        >
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;