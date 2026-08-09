import React, { useState, useRef, useEffect } from "react";
import { useModerator } from "../hooks/useModerator";
import WaitingScreen from "./WaitingScreen";

const ChatWindow = () => {
  const { activeChat, messages, sendMessage, isWaitingForReply, isTyping, actionLoading } =
    useModerator();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isWaitingForReply, isTyping]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim() || isWaitingForReply || actionLoading) return;
    sendMessage(text.trim());
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleTextareaInput = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  if (!activeChat) return null;

  return (
    <div className="d-flex flex-column h-100 bg-light">
      {/* WhatsApp-style Header */}
      <div className="p-3 bg-white border-bottom shadow-sm d-flex justify-content-between align-items-center z-2">
        <div className="d-flex align-items-center gap-3">
          <img
            src={
              activeChat.fakeAccount.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
            }
            alt={activeChat.fakeAccount.name}
            className="rounded-circle object-fit-cover shadow-sm"
            width="44"
            height="44"
          />
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-dark">{activeChat.fakeAccount.name}</span>
              <i className="bi bi-arrow-right text-muted fs-6"></i>
              <span className="fw-semibold text-primary">{activeChat.realUser.name}</span>
            </div>
            <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.75rem" }}>
              <span
                className={`badge rounded-pill ${
                  activeChat.realUser.isOnline
                    ? "bg-success-subtle text-success"
                    : "bg-secondary-subtle text-secondary"
                }`}
              >
                {activeChat.realUser.isOnline ? "User Online" : "User Offline"}
              </span>
              <span className="text-muted">•</span>
              <span className="text-muted">Assigned to you</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-grow-1 overflow-auto p-4 position-relative">
        {messages.map((msg) => {
          const isFakeAccount = msg.senderType === "fake"; // Sent by moderator
          return (
            <div
              key={msg.id}
              className={`d-flex mb-3 ${isFakeAccount ? "justify-content-end" : "justify-content-start"}`}
            >
              <div
                className={`p-3 rounded-4 shadow-sm position-relative ${
                  isFakeAccount ? "text-white" : "bg-white text-dark"
                }`}
                style={{
                  maxWidth: "70%",
                  backgroundColor: isFakeAccount ? "#5c1d24" : "#ffffff",
                  borderBottomRightRadius: isFakeAccount ? "4px" : "16px",
                  borderBottomLeftRadius: isFakeAccount ? "16px" : "4px",
                }}
              >
                {/* Text Payload */}
                {msg.text && <p className="mb-1 text-break" style={{ fontSize: "0.95rem" }}>{msg.text}</p>}

                {/* Media Payloads */}
                {msg.mediaType === "image" && (
                  <img
                    src={msg.mediaUrl}
                    alt="Attachment"
                    className="img-fluid rounded-3 mb-1 mt-1"
                  />
                )}
                {msg.mediaType === "audio" && (
                  <audio controls src={msg.mediaUrl} className="w-100 my-1"></audio>
                )}
                {msg.mediaType === "video" && (
                  <video controls src={msg.mediaUrl} className="w-100 rounded-3 my-1"></video>
                )}

                {/* Status & Timestamp */}
                <div
                  className={`d-flex align-items-center justify-content-end gap-1 mt-1 ${
                    isFakeAccount ? "text-white-50" : "text-muted"
                  }`}
                  style={{ fontSize: "0.7rem" }}
                >
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {isFakeAccount && (
                    <i
                      className={`bi ${
                        msg.status === "seen"
                          ? "bi-check2-all text-info"
                          : msg.status === "delivered"
                          ? "bi-check2-all"
                          : "bi-check2"
                      }`}
                    ></i>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Real User Typing Indicator */}
        {isTyping && (
          <div className="d-flex align-items-center gap-2 text-muted mb-3" style={{ fontSize: "0.85rem" }}>
            <div className="spinner-grow spinner-grow-sm text-secondary" role="status"></div>
            <span>{activeChat.realUser.name} is typing...</span>
          </div>
        )}

        {/* Centered Waiting Overlay Banner when input is locked */}
        {isWaitingForReply && <WaitingScreen />}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Footer */}
      <div className="p-3 bg-white border-top">
        <div className="d-flex align-items-end gap-2">
          <textarea
            ref={textareaRef}
            rows="1"
            className="form-control border-0 bg-light shadow-none resize-none"
            placeholder={
              isWaitingForReply
                ? "Locked: Waiting for real user response..."
                : "Type your reply (Enter to send, Shift+Enter for new line)..."
            }
            disabled={isWaitingForReply || actionLoading}
            value={text}
            onInput={handleTextareaInput}
            onKeyDown={handleKeyDown}
            style={{ maxHeight: "140px", borderRadius: "12px" }}
          />

          <button
            onClick={handleSend}
            disabled={!text.trim() || isWaitingForReply || actionLoading}
            className="btn text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
            style={{
              width: "44px",
              height: "44px",
              backgroundColor: "#5c1d24",
              opacity: !text.trim() || isWaitingForReply || actionLoading ? 0.6 : 1,
            }}
          >
            {actionLoading ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <i className="bi bi-send-fill fs-6"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;