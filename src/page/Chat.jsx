import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { ChatContext } from "../context/ChatContext"; // Adjust path if needed
import axios from "../api/axios";

const Chat = (props) => {
  const { chatId: routeChatId } = useParams();
  const context = useContext(ChatContext);

  // Derive target chat ID from URL params or props/context fallback
  const currentChatId =
    routeChatId || props.chat?.id || context?.selectedChat?.id;

  // Active chat metadata state
  const [activeChat, setActiveChat] = useState(() => {
    return props.chat || context?.selectedChat || null;
  });

  // State management
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [balance, setBalance] = useState(0); // Default no chat points
  const [showZeroBalanceModal, setShowZeroBalanceModal] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const canChatForFree =
    currentUser?.role === "admin" || currentUser?.role === "premium";
  const displayBalance = canChatForFree
    ? "Unlimited"
    : `${balance} ${balance === 1 ? "Coin" : "Coins"}`;
  const [showApiErrorModal, setShowApiErrorModal] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showMobileMediaMenu, setShowMobileMediaMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileDetails, setProfileDetails] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const restoreScrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaMenuRef = useRef(null);
  const socketRef = useRef(null);
  const userJoinedRef = useRef(false);

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length < 2) return null;

    try {
      const payload = JSON.parse(atob(parts[1]));
      return payload?.id || payload?._id || payload?.userId || null;
    } catch (err) {
      return null;
    }
  };

  const getCurrentUserIdString = () =>
    String(currentUser?.id || currentUser?._id || getCurrentUserId() || "");

  const formatMessage = (msg, currentUserId) => {
    const senderIdentifier = String(
      msg.sender?._id?.toString?.() ||
        msg.senderId?.toString?.() ||
        msg.sender?.toString?.() ||
        "",
    );

    return {
      id: String(msg.id || msg._id || `temp-${Date.now()}`),
      senderId: senderIdentifier,
      isMine: senderIdentifier === currentUserId,
      text: msg.message || msg.text || msg.content || "",
      image: msg.image || msg.mediaUrl || null,
      time: msg.createdAt
        ? new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : msg.time ||
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
    };
  };

  const onBack = props.onBack;
  const navigate = useNavigate();

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await axios.get("/profile/me");
        const user = response.data?.user;
        setCurrentUser(user || null);

        if (typeof user?.points === "number") {
          setBalance(user.points);
        }
      } catch (err) {
        console.error("Failed to load current user:", err);
      }
    };

    loadCurrentUser();
  }, []);

  // 1. Fetch Chat Info & Initial Messages
  useEffect(() => {
    if (!currentChatId) {
      setError("No chat selected or invalid chat ID.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchChatData = async () => {
      try {
        // Fetch chat details (participants, status, etc.)
        const chatRes = await axios.get(`/chats/${currentChatId}`);
        const chatResponse = chatRes.data;
        const chatDetails = chatResponse.chat || chatResponse;
        const otherUser =
          chatResponse.otherUser ||
          (Array.isArray(chatDetails.participants)
            ? chatDetails.participants.find(
                (participant) =>
                  participant._id?.toString() !== chatResponse.currentUserId,
              )
            : null);

        // Check if chat is inactive
        if (
          chatDetails?.status === "inactive" ||
          chatDetails?.isActive === false
        ) {
          if (isMounted) {
            setError("This chat is inactive or has been closed.");
            setLoading(false);
          }
          return;
        }

        // Fetch message history for the chat
        const messagesRes = await axios.get(`/messages/${currentChatId}`);

        if (isMounted) {
          const currentUserId = String(
            chatResponse.currentUserId || getCurrentUserId() || "",
          );

          setActiveChat({
            id: currentChatId,
            name:
              otherUser?.fullName ||
              otherUser?.name ||
              chatDetails.name ||
              "User",
            fullName: otherUser?.fullName || otherUser?.name || "User",
            image:
              otherUser?.photo ||
              otherUser?.profilePhoto ||
              chatDetails.image ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
            badge: otherUser?.badge || chatDetails.badge || "Love & Friends",
            isOnline:
              (otherUser?.status === "online" || otherUser?.isOnline) ?? true,
            status: otherUser?.status || "Offline",
            verified: otherUser?.verified || false,
            bio: otherUser?.bio || chatDetails.bio || "",
            age: otherUser?.age || chatDetails.age || null,
            interests: otherUser?.interests || chatDetails.interests || [],
            otherUserId: otherUser?._id || otherUser?.id || null,
            currentUserId,
            ...chatDetails,
          });

          // Standardize message format
          const rawMessages = Array.isArray(messagesRes.data?.messages)
            ? messagesRes.data.messages
            : [];
          const formattedMessages = rawMessages.map((msg) => {
            const senderIdentifier = String(
              msg.sender?._id?.toString?.() ||
                msg.senderId?.toString?.() ||
                msg.sender?.toString?.() ||
                "",
            );
            const isMine =
              senderIdentifier && senderIdentifier === currentUserId;
            return {
              id: String(msg.id || msg._id || Date.now()),
              senderId: senderIdentifier,
              isMine,
              text: msg.message || msg.text || msg.content || "",
              image: msg.image || msg.mediaUrl || null,
              time: msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : msg.time ||
                  new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
            };
          });

          setMessages(formattedMessages);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading chat data:", err);
          setError("Failed to load chat details or chat not found.");
          setLoading(false);
        }
      }
    };

    fetchChatData();

    return () => {
      isMounted = false;
    };
  }, [currentChatId]);

  // 2. Real-time setup with Socket.IO
  useEffect(() => {
    if (!currentChatId) return;

    // Connect socket instance
    socketRef.current = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        transports: ["websocket"],
      },
    );

    socketRef.current.on("connect", () => {
      const socketUserId = String(
        currentUser?.id || currentUser?._id || getCurrentUserId() || "",
      );

      socketRef.current.emit("join-chat", currentChatId);
      if (socketUserId && !userJoinedRef.current) {
        socketRef.current.emit("join-user", socketUserId);
        userJoinedRef.current = true;
      }
    });

    socketRef.current.on("new-message", (incomingMsg) => {
      if (
        incomingMsg.chat === currentChatId ||
        incomingMsg.chatId === currentChatId
      ) {
        const senderIdentifier =
          incomingMsg.sender?._id?.toString?.() ||
          incomingMsg.senderId?.toString?.() ||
          incomingMsg.sender?.toString?.();
        const currentUserId = String(
          activeChat?.currentUserId ||
            currentUser?.id ||
            currentUser?._id ||
            getCurrentUserId() ||
            "",
        );

        if (
          senderIdentifier &&
          currentUserId &&
          senderIdentifier === currentUserId
        ) {
          return;
        }

        const formattedMsg = {
          id: incomingMsg.id || incomingMsg._id || Date.now().toString(),
          senderId: senderIdentifier,
          isMine: senderIdentifier === currentUserId,
          text:
            incomingMsg.message ||
            incomingMsg.text ||
            incomingMsg.content ||
            "",
          image: incomingMsg.image || incomingMsg.mediaUrl || null,
          time: incomingMsg.createdAt
            ? new Date(incomingMsg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
        };

        setMessages((prev) => {
          if (prev.some((msg) => msg.id === formattedMsg.id)) return prev;
          return [...prev, formattedMsg];
        });
      }
    });

    // Listen for participant online status updates
    socketRef.current.on("user-status-changed", (data) => {
      if (
        data.userId === activeChat?.otherUserId ||
        data.userId === activeChat?.otherUser?.id ||
        data.userId === activeChat?.otherUser?._id
      ) {
        setActiveChat((prev) =>
          prev
            ? {
                ...prev,
                isOnline: data.status === "online",
                status: data.status,
              }
            : prev,
        );
      }

      if (
        profileDetails &&
        (data.userId === profileDetails._id ||
          data.userId === profileDetails.id)
      ) {
        setProfileDetails((prev) =>
          prev ? { ...prev, status: data.status } : prev,
        );
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-chat", currentChatId);
        socketRef.current.disconnect();
      }
    };
  }, [
    currentChatId,
    currentUser,
    activeChat?.currentUserId,
    activeChat?.otherUser?.id,
  ]);

  useEffect(() => {
    const socketUserId = String(
      currentUser?.id || currentUser?._id || getCurrentUserId() || "",
    );

    if (
      socketRef.current?.connected &&
      socketUserId &&
      !userJoinedRef.current
    ) {
      socketRef.current.emit("join-user", socketUserId);
      userJoinedRef.current = true;
    }
  }, [currentUser]);

  // Auto-scroll to bottom whenever messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      if (
        mediaMenuRef.current &&
        !mediaMenuRef.current.contains(event.target)
      ) {
        setShowMobileMediaMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle message send
  const handleSendMessage = async (e) => {
    e?.preventDefault();

    if (!message.trim()) return;

    setError(null);
    setShowApiErrorModal(false);
    setShowPointsModal(false);

    const payload = {
      chatId: currentChatId,
      message: message.trim(),
      messageType: "text",
    };

    console.log("Sending chat message payload", payload);

    try {
      const response = await axios.post("/messages", payload);
      console.log("Chat message API response", response.data);
      const apiPayload = response.data || {};
      const returnedMessage = apiPayload.data || apiPayload;
      const pointCost = apiPayload.pointCost ?? 0;
      const remainingPoints = apiPayload.remainingPoints;

      const currentUserId = String(
        currentUser?.id || currentUser?._id || getCurrentUserId() || "",
      );
      const formattedMsg = {
        id: String(
          returnedMessage._id || returnedMessage.id || `temp-${Date.now()}`,
        ),
        senderId: currentUserId,
        isMine: true,
        text: returnedMessage.message || returnedMessage.text || message.trim(),
        image: returnedMessage.image || returnedMessage.mediaUrl || null,
        time: returnedMessage.createdAt
          ? new Date(returnedMessage.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
      };

      setMessages((prev) => {
        if (prev.some((msg) => msg.id === formattedMsg.id)) return prev;
        return [...prev, formattedMsg];
      });
      setMessage("");
      setSelectedImage(null);
      setShowMobileMediaMenu(false);
      if (typeof remainingPoints === "number") {
        setBalance(remainingPoints);
        if (!canChatForFree) {
          setCurrentUser((prev) =>
            prev ? { ...prev, points: remainingPoints } : prev,
          );
        }
      } else if (pointCost > 0) {
        setBalance((prev) => Math.max(0, prev - pointCost));
        if (!canChatForFree) {
          setCurrentUser((prev) =>
            prev
              ? { ...prev, points: Math.max(0, (prev.points ?? 0) - pointCost) }
              : prev,
          );
        }
      }

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err) {
      const responseMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to send message.";

      if (
        !canChatForFree &&
        err?.response?.data?.message ===
          "You don't have enough chat points. Please purchase more points."
      ) {
        setApiErrorMessage(
          "You don't have enough chat points to send a message.",
        );
        setShowPointsModal(true);
      } else {
        setApiErrorMessage(responseMessage);
        setShowApiErrorModal(true);
      }

      console.error("Message send failed:", err);
    }
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

  const fetchProfileDetails = async (userId) => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const response = await axios.get(`/discover/${userId}`);
      const user = response.data?.user || response.data;
      setProfileDetails(user || null);
    } catch (err) {
      console.error("Failed to fetch profile details:", err);
      setProfileError("Unable to load profile details at the moment.");
    } finally {
      setProfileLoading(false);
    }
  };

  const openProfileModal = async () => {
    const userId = activeChat?.otherUserId;
    if (!userId) return;

    setShowProfileModal(true);
    if (
      profileDetails &&
      (profileDetails._id === userId || profileDetails.id === userId)
    ) {
      return;
    }

    await fetchProfileDetails(userId);
  };

  // Render loading state
  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#fbf6f0" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-danger mb-3"
            role="status"
            style={{ color: "#73112d" }}
          ></div>
          <p className="text-muted fw-semibold" style={{ fontSize: "0.9rem" }}>
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  // Render error / inactive state
  if (error || !activeChat) {
    return (
      <div
        className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 text-center"
        style={{ backgroundColor: "#fbf6f0" }}
      >
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mb-3"
          style={{
            width: "70px",
            height: "70px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
          }}
        >
          <i className="bi bi-exclamation-triangle fs-2"></i>
        </div>
        <h4
          className="fw-bold text-dark mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {error || "Chat Unavailable"}
        </h4>
        <p
          className="text-muted mb-4"
          style={{ maxWidth: "360px", fontSize: "0.9rem" }}
        >
          This conversation may have been archived, deleted, or does not exist.
        </p>
        {onBack ? (
          <button
            onClick={onBack}
            className="btn text-white rounded-pill px-4 py-2"
            style={{ backgroundColor: "#73112d", border: "none" }}
          >
            Go Back
          </button>
        ) : (
          <Link
            to="/chats"
            className="btn text-white rounded-pill px-4 py-2 text-decoration-none"
            style={{ backgroundColor: "#73112d", border: "none" }}
          >
            Back to Conversations
          </Link>
        )}
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column position-relative"
      style={{ backgroundColor: "#fbf6f0" }}
    >
      {/* Top Header Bar */}
      <header className="bg-white border-bottom px-3 px-md-4 py-2.5 d-flex align-items-center justify-content-between sticky-top shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={onBack}
            className="btn p-0 border-0 bg-transparent text-dark"
          >
            <Link
              to="/conversations"
              className="text-dark text-decoration-none"
            >
              <i className="bi bi-chevron-left fs-4"></i>
            </Link>
          </button>

          <button
            type="button"
            onClick={openProfileModal}
            className="d-flex align-items-center gap-2 border-0 bg-transparent p-0"
            style={{ cursor: "pointer" }}
          >
            <img
              src={activeChat.image}
              alt={activeChat.name}
              className="rounded-circle object-cover"
              style={{ width: "40px", height: "40px", objectFit: "cover" }}
            />
            <div className="text-start">
              <div className="d-flex align-items-center gap-2">
                <h5
                  className="m-0 fs-6 fw-bold text-dark"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {activeChat.fullName || activeChat.name}
                </h5>
                {activeChat.verified && (
                  <i
                    className="bi bi-patch-check-fill text-primary"
                    style={{ fontSize: "0.85rem" }}
                    title="Verified"
                  ></i>
                )}
              </div>
              <div className="d-flex gap-2 align-items-center">
                <small
                  className={
                    activeChat.status === "online" || activeChat.isOnline
                      ? "text-success d-block"
                      : "text-muted d-block"
                  }
                  style={{ fontSize: "0.75rem", marginTop: "-2px" }}
                >
                  {activeChat.status === "online" || activeChat.isOnline
                    ? "Online now"
                    : "Offline"}
                </small>
                {activeChat.badge && (
                  <span
                    className="badge rounded-pill"
                    style={{
                      backgroundColor: "#f8f0ff",
                      color: "#5c1d24",
                      fontSize: "0.65rem",
                    }}
                  >
                    {activeChat.badge}
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Balance Badge Container & Branding */}
        <div className="d-flex align-items-center gap-3">
          <Link
            to="/buy-coins"
            className="d-flex align-items-center gap-1.5 px-3 py-1 rounded-pill shadow-sm border text-decoration-none"
            style={{
              backgroundColor: canChatForFree
                ? "#e9f7ef"
                : balance === 0
                  ? "#f8d7da"
                  : "#fff8f0",
              borderColor: canChatForFree
                ? "#d1e7dd"
                : balance === 0
                  ? "#f5c6cb"
                  : "#f1e3d3",
            }}
          >
            <span style={{ fontSize: "0.85rem" }}>🪙</span>
            <span
              className="fw-bold"
              style={{
                fontSize: "0.8rem",
                color: canChatForFree
                  ? "#0f5132"
                  : balance === 0
                    ? "#721c24"
                    : "#5c1d24",
              }}
            >
              {displayBalance}
            </span>
          </Link>

          <div className="text-end d-none d-sm-block">
            <h1
              className="m-0 fs-5 fw-bold text-serif"
              style={{
                color: "#5c1d24",
                fontFamily: "Georgia, serif",
                opacity: 0.8,
              }}
            >
              Amour
            </h1>
            <small
              className="text-uppercase tracking-wider text-muted fw-bold d-block"
              style={{ fontSize: "0.5rem", letterSpacing: "0.5px" }}
            >
              Conversations
            </small>
          </div>
        </div>
      </header>

      {/* Main Messages Container */}
      <main
        className="flex-grow-1 px-3 px-md-4 py-4 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 140px)" }}
      >
        <div
          className="mx-auto w-100 d-flex flex-column gap-3"
          style={{ maxWidth: "800px" }}
        >
          <div
            className="text-center text-muted opacity-70 my-2"
            style={{ fontSize: "0.8rem" }}
          >
            <span>Say hello to {activeChat.name} ✨</span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex flex-column w-100 ${msg.isMine ? "align-items-end" : "align-items-start"}`}
            >
              <div
                className={`p-3 rounded-4 shadow-sm max-w-75 ${
                  msg.isMine ? "text-white" : "bg-white text-dark"
                } ${msg.isMine ? "align-self-end" : "align-self-start"}`}
                style={{
                  backgroundColor: msg.isMine ? "#73112d" : "#f4f5f7",
                  maxWidth: "75%",
                  borderRadius: "18px",
                  borderBottomRightRadius: msg.isMine ? "4px" : "18px",
                  borderBottomLeftRadius: msg.isMine ? "18px" : "4px",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
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
                {msg.text && (
                  <p
                    className="m-0"
                    style={{
                      fontSize: "0.9rem",
                      lineHeight: "1.4",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </p>
                )}
              </div>
              <small
                className="text-muted mt-1 px-1"
                style={{ fontSize: "0.65rem" }}
              >
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
        <div
          className="mx-auto w-100 d-flex flex-column gap-2"
          style={{ maxWidth: "800px" }}
        >
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

          <form
            onSubmit={handleSendMessage}
            className="d-flex align-items-end gap-2"
          >
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
                <i
                  className="bi bi-image fs-6"
                  style={{ color: "#73112d" }}
                ></i>
              </button>
            </div>

            {/* Mobile Collapsible Media Menu */}
            <div
              className="d-md-none position-relative flex-shrink-0 mb-1"
              ref={mediaMenuRef}
            >
              <button
                type="button"
                onClick={() => setShowMobileMediaMenu((prev) => !prev)}
                className="btn btn-sm p-0 rounded-circle d-flex align-items-center justify-content-center border"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: showMobileMediaMenu ? "#73112d" : "#f8f9fa",
                  color: showMobileMediaMenu ? "#ffffff" : "#73112d",
                  transition: "all 0.2s ease",
                }}
                aria-label="Toggle media menu"
              >
                <i
                  className={`bi ${showMobileMediaMenu ? "bi-x-lg" : "bi-plus-lg"} fs-5`}
                ></i>
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
                    <span className="fw-medium" style={{ fontSize: "0.85rem" }}>
                      Photo
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisabledFeature}
                    className="btn btn-light btn-sm text-start border-0 d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 text-muted"
                  >
                    <i className="bi bi-mic fs-6"></i>
                    <span className="fw-medium" style={{ fontSize: "0.85rem" }}>
                      Voice Note
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisabledFeature}
                    className="btn btn-light btn-sm text-start border-0 d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 text-muted"
                  >
                    <i className="bi bi-camera-video fs-6"></i>
                    <span className="fw-medium" style={{ fontSize: "0.85rem" }}>
                      Video Call
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisabledFeature}
                    className="btn btn-light btn-sm text-start border-0 d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 text-muted"
                  >
                    <i className="bi bi-telephone fs-6"></i>
                    <span className="fw-medium" style={{ fontSize: "0.85rem" }}>
                      Voice Call
                    </span>
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
                  lineHeight: "1.4",
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
                border: "none",
              }}
            >
              <i
                className="bi bi-send-fill fs-6"
                style={{
                  transform: "rotate(45deg)",
                  marginLeft: "-2px",
                  marginTop: "-2px",
                }}
              ></i>
            </button>
          </form>
        </div>
      </footer>

      {/* Modal: Out of Balance Popup */}
      {showZeroBalanceModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999 }}
        >
          <div
            className="card border-0 rounded-4 shadow-lg p-4 bg-white text-center"
            style={{ maxWidth: "360px" }}
          >
            <div
              className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#fce8e6",
                color: "#d9534f",
              }}
            >
              <i className="bi bi-wallet2 fs-2"></i>
            </div>
            <h5
              className="fw-bold mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Balance Depleted!
            </h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
              You have ran out of coins. Top up your account balance to keep
              chatting with {activeChat.name}.
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

      {showPointsModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", zIndex: 9999 }}
        >
          <div
            className="card border-0 rounded-4 shadow-lg p-4 bg-white text-center"
            style={{ maxWidth: "380px" }}
          >
            <div
              className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{
                width: "68px",
                height: "68px",
                backgroundColor: "#f9e6e9",
                color: "#c82333",
              }}
            >
              <i className="bi bi-exclamation-octagon fs-1"></i>
            </div>
            <h5
              className="fw-bold mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Not Enough Chat Points
            </h5>
            <p
              className="text-muted mb-4"
              style={{ fontSize: "0.92rem", lineHeight: "1.6" }}
            >
              {apiErrorMessage ||
                "You need more chat points to continue this conversation."}
            </p>
            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPointsModal(false);
                  navigate("/buy-coins");
                }}
                className="btn text-white rounded-pill py-2 fw-semibold shadow-sm"
                style={{ backgroundColor: "#c82333", border: "none" }}
              >
                Buy Points
              </button>
              <button
                type="button"
                onClick={() => setShowPointsModal(false)}
                className="btn btn-link text-muted text-decoration-none p-0 border-0"
                style={{ fontSize: "0.85rem" }}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {showApiErrorModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 9999,
          }}
        >
          <div
            className="card border-0 rounded-4 shadow-lg p-4 bg-white text-center"
            style={{ maxWidth: "360px" }}
          >
            <div
              className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#fff3cd",
                color: "#856404",
              }}
            >
              <i className="bi bi-info-circle fs-2"></i>
            </div>
            <h5
              className="fw-bold mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Message Failed
            </h5>
            <p
              className="text-muted mb-4"
              style={{ fontSize: "0.9rem", lineHeight: "1.5" }}
            >
              {apiErrorMessage}
            </p>
            <button
              type="button"
              onClick={() => setShowApiErrorModal(false)}
              className="btn text-white rounded-pill py-2 fw-semibold shadow-sm"
              style={{ backgroundColor: "#856404", border: "none" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal: Feature Unavailable Popup */}
      {showUnavailableModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 9999,
          }}
        >
          <div
            className="card border-0 rounded-4 shadow-lg p-4 bg-white text-center"
            style={{ maxWidth: "340px", width: "100%" }}
          >
            <div
              className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{
                width: "55px",
                height: "55px",
                backgroundColor: "#efeae4",
                color: "#73112d",
              }}
            >
              <i className="bi bi-info-circle fs-3"></i>
            </div>
            <h5
              className="fw-bold mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Feature Not Available
            </h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
              Audio, video, and call features are currently not available for
              now. Stay tuned for future updates!
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

      {showProfileModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            zIndex: 9999,
          }}
        >
          <div
            className="card border-0 rounded-4 shadow-lg p-4 bg-white w-100"
            style={{
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className="d-flex align-items-start justify-content-between mb-3">
              <div>
                <h5
                  className="fw-bold text-dark mb-1"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {profileDetails?.fullName ||
                    activeChat.fullName ||
                    activeChat.name}
                </h5>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span
                    className="badge rounded-pill"
                    style={{
                      backgroundColor: "#f8f0ff",
                      color: "#5c1d24",
                      fontSize: "0.75rem",
                    }}
                  >
                    {profileDetails?.badge ||
                      activeChat.badge ||
                      "Love & Friends"}
                  </span>
                  <span
                    className={
                      profileDetails?.status === "online" || activeChat.isOnline
                        ? "text-success"
                        : "text-muted"
                    }
                    style={{ fontSize: "0.75rem" }}
                  >
                    {profileDetails?.status === "online" || activeChat.isOnline
                      ? "Online"
                      : "Offline"}
                  </span>
                  {profileDetails?.verified || activeChat.verified ? (
                    <span
                      className="text-primary"
                      style={{ fontSize: "0.75rem" }}
                    >
                      <i className="bi bi-patch-check-fill"></i> Verified
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="btn btn-sm btn-light rounded-circle border-0"
                style={{ width: "36px", height: "36px" }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="d-flex flex-column flex-md-row gap-3">
              <div className="flex-shrink-0 text-center">
                <img
                  src={profileDetails?.photo || activeChat.image}
                  alt={profileDetails?.fullName || activeChat.name}
                  className="rounded-4"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div className="flex-grow-1">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                    Age: {profileDetails?.age || activeChat.age || "—"}
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                    Status:{" "}
                    {profileDetails?.status || activeChat.status || "Unknown"}
                  </div>
                </div>

                <p
                  className="text-muted"
                  style={{ fontSize: "0.92rem", lineHeight: "1.6" }}
                >
                  {profileDetails?.bio ||
                    activeChat.bio ||
                    "No bio available yet."}
                </p>

                <div className="mt-3">
                  <h6
                    className="fw-semibold mb-2"
                    style={{ fontSize: "0.95rem" }}
                  >
                    Interests
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {(profileDetails?.interests || activeChat.interests || [])
                      .length > 0 ? (
                      (
                        profileDetails?.interests ||
                        activeChat.interests ||
                        []
                      ).map((interest) => (
                        <span
                          key={interest}
                          className="badge rounded-pill"
                          style={{
                            backgroundColor: "#efeae4",
                            color: "#5c1d24",
                            fontSize: "0.78rem",
                          }}
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span
                        className="text-muted"
                        style={{ fontSize: "0.85rem" }}
                      >
                        No interests added yet.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {profileError && (
              <div className="alert alert-danger mt-3" role="alert">
                {profileError}
              </div>
            )}

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="btn text-muted btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
