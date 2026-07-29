import React, { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { ChatContext } from "../context/ChatContext"; // Adjust path if needed

// Initial dummy conversations database mapped by chat ID
const INITIAL_CHAT_DATA = {
  1: [
    { id: 1, sender: "them", text: "Hey there! How's your day going?", time: "10:00 AM" }
  ],
  2: [
    { id: 1, sender: "them", text: "Exactly. Do you have a favorite director whose work you always go back to?", time: "4:40 PM" }
  ]
};

const Chat = (props) => {
  const context = useContext(ChatContext);

  // Use props if passed, otherwise fall back to context or default Isabelle object
  const activeChat = props.chat || context?.selectedChat || {
    id: 1,
    name: "Isabelle",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
  };

  const onBack = props.onBack;

  // Master dictionary storing message threads by Chat ID
  const [chatData, setChatData] = useState(INITIAL_CHAT_DATA);

  // Active message list derived from activeChat.id
  const messagesList = chatData[activeChat.id] || [];

  const [message, setMessage] = useState("");
  const [balance, setBalance] = useState(5); // Default coin/credit balance
  const [showZeroBalanceModal, setShowZeroBalanceModal] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showMobileMediaMenu, setShowMobileMediaMenu] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaMenuRef = useRef(null);

  // Auto-scroll to bottom whenever messages update or active chat changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesList, activeChat.id]);

  // Adjust textarea height dynamically based on input content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Close mobile media dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mediaMenuRef.current && !mediaMenuRef.current.contains(event.target)) {
        setShowMobileMediaMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle message send
  const handleSendMessage = (e) => {
    e?.preventDefault();

    if (!message.trim() && !selectedImage) return;

    // Check balance before sending message
    if (balance <= 0) {
      setShowZeroBalanceModal(true);
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text: message,
      image: selectedImage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // Save message under current activeChat.id
    setChatData((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
    }));

    setMessage("");
    setSelectedImage(null);
    setShowMobileMediaMenu(false);
    setBalance((prev) => Math.max(0, prev - 1)); // Deduct 1 coin per message

    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Simulate incoming response after 1.5s for active chat
    setTimeout(() => {
      const replyMessage = {
        id: Date.now() + 1,
        sender: "them",
        text: `That's awesome! Tell me more ✨`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setChatData((prev) => ({
        ...prev,
        [activeChat.id]: [...(prev[activeChat.id] || []), replyMessage]
      }));
    }, 1500);
  };

  // Handle key press (Send on Enter without Shift)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Image Upload Handler
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setShowMobileMediaMenu(false);
    }
  };

  // Trigger modal for disabled media features
  const handleDisabledFeature = () => {
    setShowUnavailableModal(true);
    setShowMobileMediaMenu(false);
  };

  return (
    <div className="min-vh-100 d-flex flex-column position-relative" style={{ backgroundColor: "#fbf6f0" }}>
      
      {/* Top Header Bar */}
      <header className="bg-white border-bottom px-3 px-md-4 py-2.5 d-flex align-items-center justify-content-between sticky-top shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <button onClick={onBack} className="btn p-0 border-0 bg-transparent text-dark">
            <i className="bi bi-chevron-left fs-4"></i>
          </button>
          
          <div className="d-flex align-items-center gap-2">
            <img 
              src={activeChat.image} 
              alt={activeChat.name} 
              className="rounded-circle object-cover" 
              style={{ width: "40px", height: "40px", objectFit: "cover" }}
            />
            <div>
              <h5 className="m-0 fs-6 fw-bold text-dark" style={{ fontFamily: "Georgia, serif" }}>
                {activeChat.name}
              </h5>
              <small className="text-success d-block" style={{ fontSize: "0.7rem", marginTop: "-2px" }}>
                Online now
              </small>
            </div>
          </div>
        </div>

        {/* Balance Badge Container & Branding */}
        <div className="d-flex align-items-center gap-3">
          <Link 
            to="/buy-coins"
            className="d-flex align-items-center gap-1.5 px-3 py-1 rounded-pill shadow-sm border text-decoration-none"
            style={{ backgroundColor: balance === 0 ? "#f8d7da" : "#fff8f0", borderColor: balance === 0 ? "#f5c6cb" : "#f1e3d3" }}
          >
            <span style={{ fontSize: "0.85rem" }}>🪙</span>
            <span className="fw-bold" style={{ fontSize: "0.8rem", color: balance === 0 ? "#721c24" : "#5c1d24" }}>
              {balance} {balance === 1 ? "Coin" : "Coins"}
            </span>
          </Link>

          <div className="text-end d-none d-sm-block">
            <h1 className="m-0 fs-5 fw-bold text-serif" style={{ color: "#5c1d24", fontFamily: "Georgia, serif", opacity: 0.8 }}>
              Amour
            </h1>
            <small className="text-uppercase tracking-wider text-muted fw-bold d-block" style={{ fontSize: "0.5rem", letterSpacing: "0.5px" }}>
              Conversations
            </small>
          </div>
        </div>
      </header>

      {/* Main Messages Container */}
      <main className="flex-grow-1 px-3 px-md-4 py-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
        <div className="mx-auto w-100 d-flex flex-column gap-3" style={{ maxWidth: "800px" }}>
          
          <div className="text-center text-muted opacity-70 my-2" style={{ fontSize: "0.8rem" }}>
            <span>Say hello to {activeChat.name} ✨</span>
          </div>

          {messagesList.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex flex-column ${msg.sender === "me" ? "align-items-end" : "align-items-start"}`}
            >
              <div
                className={`p-3 rounded-4 shadow-sm max-w-75 ${
                  msg.sender === "me" ? "text-white" : "bg-white text-dark"
                }`}
                style={{
                  backgroundColor: msg.sender === "me" ? "#73112d" : "#ffffff",
                  maxWidth: "75%",
                  borderBottomRightRadius: msg.sender === "me" ? "4px" : "16px",
                  borderBottomLeftRadius: msg.sender === "me" ? "16px" : "4px"
                }}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="attachment"
                    className="img-fluid rounded-3 mb-2"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                )}
                {msg.text && <p className="m-0" style={{ fontSize: "0.9rem", lineHeight: "1.4", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.text}</p>}
              </div>
              <small className="text-muted mt-1 px-1" style={{ fontSize: "0.65rem" }}>
                {msg.time}
              </small>
            </div>
          ))}

          {/* Auto-scroll target dummy div */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Footer Chat Input & Media Controls */}
      <footer className="p-3 bg-white border-top sticky-bottom">
        <div className="mx-auto w-100 d-flex flex-column gap-2" style={{ maxWidth: "800px" }}>
          
          {/* Image Preview Box */}
          {selectedImage && (
            <div className="position-relative d-inline-block align-self-start">
              <img
                src={selectedImage}
                alt="Upload preview"
                className="rounded-3 border"
                style={{ width: "60px", height: "60px", objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="btn btn-sm btn-dark rounded-circle position-absolute top-0 start-100 translate-middle p-0 d-flex align-items-center justify-content-center"
                style={{ width: "18px", height: "18px", fontSize: "0.6rem" }}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="d-flex align-items-end gap-2">
            
            {/* Desktop Action Bar: Call, Video, Audio, Image */}
            <div className="d-none d-md-flex align-items-center gap-1 bg-light rounded-pill p-1 border flex-shrink-0 mb-1">
              
              {/* Call Icon (Disabled) */}
              <button
                type="button"
                onClick={handleDisabledFeature}
                className="btn btn-sm p-0 rounded-circle d-flex align-items-center justify-content-center text-muted"
                style={{ width: "32px", height: "32px" }}
                title="Voice Call"
              >
                <i className="bi bi-telephone fs-6"></i>
              </button>

              {/* Video Call Icon (Disabled) */}
              <button
                type="button"
                onClick={handleDisabledFeature}
                className="btn btn-sm p-0 rounded-circle d-flex align-items-center justify-content-center text-muted"
                style={{ width: "32px", height: "32px" }}
                title="Video Call"
              >
                <i className="bi bi-camera-video fs-6"></i>
              </button>

              {/* Audio Note Icon (Disabled) */}
              <button
                type="button"
                onClick={handleDisabledFeature}
                className="btn btn-sm p-0 rounded-circle d-flex align-items-center justify-content-center text-muted"
                style={{ width: "32px", height: "32px" }}
                title="Audio Message"
              >
                <i className="bi bi-mic fs-6"></i>
              </button>

              {/* Image Upload Icon */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-sm p-0 rounded-circle d-flex align-items-center justify-content-center text-dark"
                style={{ width: "32px", height: "32px" }}
                title="Attach Image"
              >
                <i className="bi bi-image fs-6" style={{ color: "#73112d" }}></i>
              </button>
            </div>

            {/* Mobile Collapsible Media Menu */}
            <div className="d-md-none position-relative flex-shrink-0 mb-1" ref={mediaMenuRef}>
              <button
                type="button"
                onClick={() => setShowMobileMediaMenu((prev) => !prev)}
                className="btn btn-sm p-0 rounded-circle d-flex align-items-center justify-content-center border"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: showMobileMediaMenu ? "#73112d" : "#f8f9fa",
                  color: showMobileMediaMenu ? "#ffffff" : "#73112d",
                  transition: "all 0.2s ease"
                }}
                aria-label="Toggle media menu"
              >
                <i className={`bi ${showMobileMediaMenu ? "bi-x-lg" : "bi-plus-lg"} fs-5`}></i>
              </button>

              {showMobileMediaMenu && (
                <div
                  className="position-absolute bottom-100 start-0 mb-2 bg-white rounded-4 shadow-lg border p-2 d-flex flex-column gap-1"
                  style={{ minWidth: "160px", zIndex: 1000 }}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-light btn-sm text-start border-0 d-flex align-items-center gap-2.5 py-2 px-3 rounded-3"
                    style={{ color: "#73112d" }}
                  >
                    <i className="bi bi-image fs-6"></i>
                    <span className="fw-medium" style={{ fontSize: "0.85rem" }}>Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisabledFeature}
                    className="btn btn-light btn-sm text-start border-0 d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 text-muted"
                  >
                    <i className="bi bi-mic fs-6"></i>
                    <span className="fw-medium" style={{ fontSize: "0.85rem" }}>Voice Note</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisabledFeature}
                    className="btn btn-light btn-sm text-start border-0 d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 text-muted"
                  >
                    <i className="bi bi-camera-video fs-6"></i>
                    <span className="fw-medium" style={{ fontSize: "0.85rem" }}>Video Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisabledFeature}
                    className="btn btn-light btn-sm text-start border-0 d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 text-muted"
                  >
                    <i className="bi bi-telephone fs-6"></i>
                    <span className="fw-medium" style={{ fontSize: "0.85rem" }}>Voice Call</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="d-none"
            />

            {/* Auto-expanding Message Textarea */}
            <div className="flex-grow-1 position-relative">
              <textarea
                ref={textareaRef}
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="form-custom-input w-100 border-0 rounded-4 px-4 py-2 shadow-sm"
                style={{
                  backgroundColor: "#efeae4",
                  fontSize: "0.9rem",
                  outline: "none",
                  color: "#495057",
                  resize: "none",
                  maxHeight: "120px",
                  overflowY: "auto",
                  lineHeight: "1.4"
                }}
              />
            </div>

            {/* Send Button */}
            <button 
              type="submit"
              className="btn rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm transition flex-shrink-0 mb-1"
              style={{ 
                width: "42px", 
                height: "42px", 
                backgroundColor: "#73112d",
                color: "#fff",
                border: "none"
              }}
            >
              <i className="bi bi-send-fill fs-6" style={{ transform: "rotate(45deg)", marginLeft: "-2px", marginTop: "-2px" }}></i>
            </button>
          </form>
        </div>
      </footer>

      {/* Modal: Out of Balance Popup */}
      {showZeroBalanceModal && (
        <div className="modal-backdrop fade show d-flex align-items-center justify-content-center p-3" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="card border-0 rounded-4 shadow-lg p-4 bg-white text-center" style={{ maxWidth: "360px" }}>
            <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px", backgroundColor: "#fce8e6", color: "#d9534f" }}>
              <i className="bi bi-wallet2 fs-2"></i>
            </div>
            <h5 className="fw-bold mb-2" style={{ fontFamily: "Georgia, serif" }}>
              Balance Depleted!
            </h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
              You have ran out of coins. Top up your account balance to keep chatting with {activeChat.name}.
            </p>
            <div className="d-flex flex-column gap-2">
              <Link
                to="/buy-coins"
                className="btn text-white rounded-pill py-2 fw-semibold shadow-sm text-decoration-none"
                style={{ backgroundColor: "#73112d", border: "none" }}
              >
                Top Up Coins 🪙
              </Link>
              <button
                onClick={() => setShowZeroBalanceModal(false)}
                className="btn btn-link text-muted text-decoration-none p-0 border-0"
                style={{ fontSize: "0.8rem" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Feature Unavailable Popup */}
      {showUnavailableModal && (
        <div className="modal-backdrop fade show d-flex align-items-center justify-content-center p-3" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="card border-0 rounded-4 shadow-lg p-4 bg-white text-center" style={{ maxWidth: "340px" }}>
            <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: "55px", height: "55px", backgroundColor: "#efeae4", color: "#73112d" }}>
              <i className="bi bi-info-circle fs-3"></i>
            </div>
            <h5 className="fw-bold mb-2" style={{ fontFamily: "Georgia, serif" }}>
              Feature Not Available
            </h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
              Audio, video, and call features are currently not available for now. Stay tuned for future updates!
            </p>
            <button
              onClick={() => setShowUnavailableModal(false)}
              className="btn text-white rounded-pill py-2 fw-semibold shadow-sm w-100"
              style={{ backgroundColor: "#73112d", border: "none" }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Chat;