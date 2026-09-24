import React, { useState, useRef, useEffect, useContext } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { ChatContext } from "../context/ChatContext";
import axios from "../api/axios";

const Chat = (props) => {
  const { chatId: routeChatId } = useParams();
  const context = useContext(ChatContext);
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // Chat ID
  // ---------------------------------------------------------
  const currentChatId =
    routeChatId || props.chat?.id || context?.selectedChat?.id;

  // ---------------------------------------------------------
  // Active chat
  // ---------------------------------------------------------
  const [activeChat, setActiveChat] = useState(() => {
    return props.chat || context?.selectedChat || null;
  });

  // ---------------------------------------------------------
  // Messages / loading
  // ---------------------------------------------------------
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------------------------------------------
  // Message input
  // ---------------------------------------------------------
  const [message, setMessage] = useState("");

  // ---------------------------------------------------------
  // Current user
  // ---------------------------------------------------------
  const [currentUser, setCurrentUser] = useState(null);

  // ---------------------------------------------------------
  // Coins
  // ---------------------------------------------------------
  const [balance, setBalance] = useState(0);

  const [showZeroBalanceModal, setShowZeroBalanceModal] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);

  const canChatForFree =
    currentUser?.role === "admin" || currentUser?.role === "premium";

  const displayBalance = canChatForFree
    ? "Unlimited"
    : `${balance} ${balance === 1 ? "Coin" : "Coins"}`;

  // ---------------------------------------------------------
  // API error
  // ---------------------------------------------------------
  const [showApiErrorModal, setShowApiErrorModal] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("");

  // ---------------------------------------------------------
  // Media
  // ---------------------------------------------------------
  const [selectedImage, setSelectedImage] = useState(null);
  const [showMobileMediaMenu, setShowMobileMediaMenu] = useState(false);

  // ---------------------------------------------------------
  // Profile modal
  // ---------------------------------------------------------
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileDetails, setProfileDetails] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // ---------------------------------------------------------
  // Refs
  // ---------------------------------------------------------
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const restoreScrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaMenuRef = useRef(null);
  const socketRef = useRef(null);
  const userJoinedRef = useRef(false);

  // ---------------------------------------------------------
  // Get current user ID from JWT
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Format message
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Load current user
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Fetch chat information and messages
  // ---------------------------------------------------------
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

        // Fetch messages
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
              otherUser?.status === "online" || otherUser?.isOnline || false,

            status: otherUser?.status || "offline",

            verified: otherUser?.verified || false,

            bio: otherUser?.bio || chatDetails.bio || "",

            age: otherUser?.age || chatDetails.age || null,

            interests: otherUser?.interests || chatDetails.interests || [],

            otherUserId: otherUser?._id || otherUser?.id || null,

            currentUserId,

            ...chatDetails,
          });

          const rawMessages = Array.isArray(messagesRes.data?.messages)
            ? messagesRes.data.messages
            : [];

          const formattedMessages = rawMessages.map((msg) =>
            formatMessage(msg, currentUserId),
          );

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

  // ---------------------------------------------------------
  // Socket.IO
  // ---------------------------------------------------------
  useEffect(() => {
    if (!currentChatId) return;

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
      const incomingChatId =
        incomingMsg.chat?._id ||
        incomingMsg.chat?.toString?.() ||
        incomingMsg.chatId?.toString?.();

      if (incomingChatId !== currentChatId?.toString()) {
        return;
      }

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

      // Do not duplicate the message that
      // was already added after POST /messages.
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
          incomingMsg.message || incomingMsg.text || incomingMsg.content || "",

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
        if (prev.some((msg) => msg.id === formattedMsg.id)) {
          return prev;
        }

        return [...prev, formattedMsg];
      });
    });

    // Participant online status
    socketRef.current.on("user-status-changed", (data) => {
      const changedUserId = data.userId?.toString?.();

      if (
        changedUserId === activeChat?.otherUserId?.toString?.() ||
        changedUserId === activeChat?.otherUser?.id?.toString?.() ||
        changedUserId === activeChat?.otherUser?._id?.toString?.()
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
        (changedUserId === profileDetails?._id?.toString?.() ||
          changedUserId === profileDetails?.id?.toString?.())
      ) {
        setProfileDetails((prev) =>
          prev
            ? {
                ...prev,
                status: data.status,
              }
            : prev,
        );
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-chat", currentChatId);

        socketRef.current.disconnect();
      }

      userJoinedRef.current = false;
    };
  }, [
    currentChatId,
    currentUser,
    activeChat?.currentUserId,
    activeChat?.otherUserId,
  ]);

  // ---------------------------------------------------------
  // Join user room once current user is loaded
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Scroll to bottom
  // ---------------------------------------------------------
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ---------------------------------------------------------
  // Textarea auto height
  // ---------------------------------------------------------
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";

      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120,
      )}px`;
    }
  }, [message]);

  // ---------------------------------------------------------
  // Close mobile menu outside click
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Send message
  // ---------------------------------------------------------

  const handleSendMessage = async (e) => {
    e?.preventDefault();

    // Prevent multiple messages from being sent while
    // the previous request is still processing.
    if (!message.trim() || isSending) return;

    setIsSending(true);
    setError(null);
    setShowApiErrorModal(false);
    setShowPointsModal(false);

    const messageToSend = message.trim();

    const payload = {
      chatId: currentChatId,
      message: messageToSend,
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
        text: returnedMessage.message || returnedMessage.text || messageToSend,
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
        if (prev.some((msg) => msg.id === formattedMsg.id)) {
          return prev;
        }

        return [...prev, formattedMsg];
      });

      // Clear the input only after the server
      // confirms that the message was successfully sent.
      setMessage("");

      setSelectedImage(null);
      setShowMobileMediaMenu(false);

      if (typeof remainingPoints === "number") {
        setBalance(remainingPoints);

        if (!canChatForFree) {
          setCurrentUser((prev) =>
            prev
              ? {
                  ...prev,
                  points: remainingPoints,
                }
              : prev,
          );
        }
      } else if (pointCost > 0) {
        setBalance((prev) => Math.max(0, prev - pointCost));

        if (!canChatForFree) {
          setCurrentUser((prev) =>
            prev
              ? {
                  ...prev,
                  points: Math.max(0, (prev.points ?? 0) - pointCost),
                }
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
    } finally {
      // Re-enable the send button only after the request
      // has completely finished.
      setIsSending(false);
    }
  };

  // ---------------------------------------------------------
  // Enter to new line
  // ---------------------------------------------------------
  const handleKeyDown = (e) => {
  if (isSending) return;
};

  // ---------------------------------------------------------
  // Image selection
  // ---------------------------------------------------------
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);

      setSelectedImage(imageUrl);
      setShowMobileMediaMenu(false);
    }
  };

  // ---------------------------------------------------------
  // Disabled media feature
  // ---------------------------------------------------------
  const handleDisabledFeature = () => {
    setShowUnavailableModal(true);
    setShowMobileMediaMenu(false);
  };

  // ---------------------------------------------------------
  // Fetch profile
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Open profile modal
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Back navigation
  // ---------------------------------------------------------
  const handleBackNavigation = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate("/conversations");
  };

  // ---------------------------------------------------------
  // Loading screen
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center px-4"
        style={{
          backgroundColor: "#fbf6f0",
        }}
      >
        <div
          className="text-center"
          style={{
            maxWidth: "300px",
          }}
        >
          <div
            className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle shadow-sm"
            style={{
              width: "72px",
              height: "72px",
              backgroundColor: "#fff",
              border: "1px solid #eee2d8",
            }}
          >
            <div
              className="spinner-border"
              role="status"
              style={{
                width: "28px",
                height: "28px",
                color: "#73112d",
              }}
            />
          </div>

          <h5
            className="fw-bold mb-2"
            style={{
              color: "#5c1d24",
              fontFamily: "Georgia, serif",
            }}
          >
            Opening conversation
          </h5>

          <p
            className="text-muted mb-0"
            style={{
              fontSize: "0.85rem",
            }}
          >
            Please wait while we load your conversation...
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Error screen
  // ---------------------------------------------------------
  if (error || !activeChat) {
    return (
      <div
        className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 text-center"
        style={{
          backgroundColor: "#fbf6f0",
        }}
      >
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mb-4 shadow-sm"
          style={{
            width: "78px",
            height: "78px",
            backgroundColor: "#fff",
            color: "#73112d",
            border: "1px solid #ead9d5",
          }}
        >
          <i className="bi bi-chat-square-heart fs-2" />
        </div>

        <h4
          className="fw-bold text-dark mb-2"
          style={{
            fontFamily: "Georgia, serif",
          }}
        >
          {error || "Chat Unavailable"}
        </h4>

        <p
          className="text-muted mb-4"
          style={{
            maxWidth: "390px",
            fontSize: "0.9rem",
            lineHeight: "1.6",
          }}
        >
          This conversation may have been archived, deleted, or does not exist.
        </p>

        <button
          type="button"
          onClick={handleBackNavigation}
          className="btn text-white rounded-pill px-4 py-2 fw-semibold shadow-sm"
          style={{
            backgroundColor: "#73112d",
            border: "none",
          }}
        >
          <i className="bi bi-arrow-left me-2" />
          Go Back
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Main chat
  // ---------------------------------------------------------
  return (
    <div
      className="min-vh-100 d-flex flex-column position-relative"
      style={{
        backgroundColor: "#fbf6f0",
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header
        className="bg-white border-bottom sticky-top shadow-sm"
        style={{
          zIndex: 100,
          borderColor: "#eee4dc",
        }}
      >
        <div
          className="px-3 px-md-4 py-2"
          style={{
            minHeight: "68px",
          }}
        >
          <div className="d-flex align-items-center justify-content-between gap-3 h-100">
            {/* Left side */}
            <div className="d-flex align-items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={handleBackNavigation}
                className="btn rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: "40px",
                  height: "40px",
                  color: "#5c1d24",
                  backgroundColor: "#fbf6f0",
                  border: "1px solid #eee2d8",
                }}
                aria-label="Go back"
              >
                <i className="bi bi-chevron-left fs-5" />
              </button>

              <button
                type="button"
                onClick={openProfileModal}
                className="d-flex align-items-center gap-2 border-0 bg-transparent p-0 text-start min-w-0"
                style={{
                  cursor: "pointer",
                }}
              >
                {/* Avatar */}
                <div
                  className="position-relative flex-shrink-0"
                  style={{
                    width: "44px",
                    height: "44px",
                  }}
                >
                  <img
                    src={activeChat.image}
                    alt={activeChat.name}
                    className="rounded-circle w-100 h-100"
                    style={{
                      objectFit: "cover",
                      border: "2px solid #fff",
                      boxShadow: "0 0 0 2px #ead8d4",
                    }}
                  />

                  <span
                    className="position-absolute"
                    style={{
                      width: "11px",
                      height: "11px",
                      borderRadius: "50%",
                      backgroundColor:
                        activeChat.status === "online" || activeChat.isOnline
                          ? "#198754"
                          : "#adb5bd",
                      border: "2px solid #fff",
                      right: "0",
                      bottom: "0",
                    }}
                  />
                </div>

                {/* User information */}
                <div className="min-w-0">
                  <div className="d-flex align-items-center gap-2">
                    <h5
                      className="m-0 fw-bold text-dark text-truncate"
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: "0.98rem",
                        maxWidth: "180px",
                      }}
                    >
                      {activeChat.fullName || activeChat.name}
                    </h5>

                    {activeChat.verified && (
                      <i
                        className="bi bi-patch-check-fill text-primary flex-shrink-0"
                        style={{
                          fontSize: "0.82rem",
                        }}
                        title="Verified"
                      />
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2 mt-1">
                    <small
                      className={
                        activeChat.status === "online" || activeChat.isOnline
                          ? "text-success fw-semibold"
                          : "text-muted"
                      }
                      style={{
                        fontSize: "0.7rem",
                      }}
                    >
                      <span className="me-1">•</span>

                      {activeChat.status === "online" || activeChat.isOnline
                        ? "Online now"
                        : "Offline"}
                    </small>

                    {activeChat.badge && (
                      <span
                        className="badge rounded-pill d-none d-sm-inline-flex"
                        style={{
                          backgroundColor: "#f8f0ff",
                          color: "#5c1d24",
                          fontSize: "0.62rem",
                          fontWeight: 600,
                          padding: "4px 8px",
                        }}
                      >
                        {activeChat.badge}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Right side */}
            <div className="d-flex align-items-center gap-2">
              {/* Coin balance */}
              <Link
                to="/buy-coins"
                className="d-flex align-items-center gap-2 rounded-pill px-2 px-sm-3 py-2 text-decoration-none shadow-sm"
                style={{
                  backgroundColor: canChatForFree
                    ? "#e9f7ef"
                    : balance === 0
                      ? "#f8d7da"
                      : "#fff8f0",

                  border: "1px solid",

                  borderColor: canChatForFree
                    ? "#d1e7dd"
                    : balance === 0
                      ? "#f5c6cb"
                      : "#f1e3d3",

                  transition: "all 0.2s ease",
                }}
              >
                <span
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "26px",
                    height: "26px",
                    backgroundColor: canChatForFree ? "#d1e7dd" : "#f1e3d3",
                    fontSize: "0.78rem",
                  }}
                >
                  <i className="bi bi-coin" />
                </span>

                <span
                  className="fw-bold"
                  style={{
                    fontSize: "0.76rem",
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

              {/* Branding */}
              <div className="text-end d-none d-md-block ps-2">
                <h1
                  className="m-0 fw-bold"
                  style={{
                    color: "#5c1d24",
                    fontFamily: "Georgia, serif",
                    fontSize: "1.1rem",
                    lineHeight: 1,
                    opacity: 0.88,
                  }}
                >
                  Amour
                </h1>

                <small
                  className="text-uppercase text-muted fw-bold"
                  style={{
                    fontSize: "0.46rem",
                    letterSpacing: "1px",
                  }}
                >
                  Conversations
                </small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MESSAGE AREA
      ====================================================== */}
      <main
        ref={messagesContainerRef}
        className="flex-grow-1 overflow-auto"
        style={{
          height: "calc(100vh - 140px)",
          maxHeight: "calc(100vh - 140px)",
        }}
      >
        <div
          className="mx-auto w-100 px-3 px-md-4 py-4 py-md-5"
          style={{
            maxWidth: "880px",
          }}
        >
          {/* Conversation introduction */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
              style={{
                backgroundColor: "rgba(255,255,255,0.75)",
                border: "1px solid #eee2d8",
                color: "#8b7773",
                fontSize: "0.72rem",
              }}
            >
              <i
                className="bi bi-heart-fill"
                style={{
                  color: "#73112d",
                  fontSize: "0.62rem",
                }}
              />

              <span>
                Say hello to{" "}
                <strong
                  style={{
                    color: "#5c1d24",
                  }}
                >
                  {activeChat.name}
                </strong>
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="d-flex flex-column gap-3">
            {messages.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "62px",
                    height: "62px",
                    backgroundColor: "#fff",
                    color: "#73112d",
                    border: "1px solid #eee2d8",
                  }}
                >
                  <i className="bi bi-chat-heart fs-4" />
                </div>

                <h6
                  className="fw-bold mb-1"
                  style={{
                    color: "#5c1d24",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  Start the conversation
                </h6>

                <p
                  className="text-muted mb-0"
                  style={{
                    fontSize: "0.8rem",
                  }}
                >
                  Send a message and start getting to know each other.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`d-flex flex-column w-100 ${
                    msg.isMine ? "align-items-end" : "align-items-start"
                  }`}
                >
                  <div
                    className={`d-flex align-items-end gap-2 ${
                      msg.isMine ? "flex-row-reverse" : ""
                    }`}
                    style={{
                      maxWidth: "100%",
                    }}
                  >
                    {/* Received avatar */}
                    {!msg.isMine && (
                      <img
                        src={activeChat.image}
                        alt=""
                        className="rounded-circle d-none d-sm-block flex-shrink-0"
                        style={{
                          width: "30px",
                          height: "30px",
                          objectFit: "cover",
                          border: "1px solid #ead8d4",
                        }}
                      />
                    )}

                    {/* Bubble */}
                    <div
                      className="position-relative"
                      style={{
                        maxWidth: "min(76%, 620px)",
                      }}
                    >
                      <div
                        className="p-3"
                        style={{
                          backgroundColor: msg.isMine ? "#73112d" : "#ffffff",

                          color: msg.isMine ? "#ffffff" : "#343a40",

                          borderRadius: "20px",

                          borderBottomRightRadius: msg.isMine ? "5px" : "20px",

                          borderBottomLeftRadius: msg.isMine ? "20px" : "5px",

                          border: msg.isMine ? "none" : "1px solid #eee7e1",

                          boxShadow: msg.isMine
                            ? "0 5px 16px rgba(115,17,45,0.14)"
                            : "0 4px 14px rgba(0,0,0,0.045)",
                        }}
                      >
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="attachment"
                            className="img-fluid rounded-4 mb-2"
                            style={{
                              maxHeight: "260px",
                              maxWidth: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        )}

                        {msg.text && (
                          <p
                            className="m-0"
                            style={{
                              fontSize: "0.9rem",
                              lineHeight: "1.55",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {msg.text}
                          </p>
                        )}
                      </div>

                      {/* Time */}
                      <div
                        className={`d-flex align-items-center gap-1 mt-1 px-1 ${
                          msg.isMine
                            ? "justify-content-end"
                            : "justify-content-start"
                        }`}
                      >
                        <small
                          className="text-muted"
                          style={{
                            fontSize: "0.62rem",
                          }}
                        >
                          {msg.time}
                        </small>

                        {msg.isMine && (
                          <i
                            className="bi bi-check2"
                            style={{
                              color: "#8c7777",
                              fontSize: "0.65rem",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* =====================================================
          COMPOSER
      ====================================================== */}
      <footer
        className="bg-white border-top"
        style={{
          borderColor: "#eee4dc",
          boxShadow: "0 -4px 18px rgba(0,0,0,0.035)",
        }}
      >
        <div
          className="mx-auto w-100 px-3 py-3"
          style={{
            maxWidth: "880px",
          }}
        >
          {/* Image preview */}
          {selectedImage && (
            <div className="mb-2">
              <div className="position-relative d-inline-block">
                <img
                  src={selectedImage}
                  alt="Upload preview"
                  className="rounded-4"
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                    border: "2px solid #fff",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.12)",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="btn rounded-circle position-absolute d-flex align-items-center justify-content-center p-0"
                  style={{
                    width: "22px",
                    height: "22px",
                    top: "-7px",
                    right: "-7px",
                    backgroundColor: "#5c1d24",
                    color: "#fff",
                    border: "2px solid #fff",
                    fontSize: "0.65rem",
                  }}
                >
                  <i className="bi bi-x" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSendMessage}>
            <div
              className="d-flex align-items-end gap-2 p-1 rounded-4"
              style={{
                backgroundColor: "#fff",
              }}
            >
              {/* Desktop media controls */}
              <div className="d-none d-md-flex align-items-center gap-1 flex-shrink-0 mb-1">
                <button
                  type="button"
                  onClick={handleDisabledFeature}
                  className="btn rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "38px",
                    height: "38px",
                    backgroundColor: "#f8f5f2",
                    color: "#8c7b78",
                    border: "1px solid #eee5df",
                  }}
                  title="Voice Call"
                >
                  <i className="bi bi-telephone" />
                </button>

                <button
                  type="button"
                  onClick={handleDisabledFeature}
                  className="btn rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "38px",
                    height: "38px",
                    backgroundColor: "#f8f5f2",
                    color: "#8c7b78",
                    border: "1px solid #eee5df",
                  }}
                  title="Video Call"
                >
                  <i className="bi bi-camera-video" />
                </button>

                <button
                  type="button"
                  onClick={handleDisabledFeature}
                  className="btn rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "38px",
                    height: "38px",
                    backgroundColor: "#f8f5f2",
                    color: "#8c7b78",
                    border: "1px solid #eee5df",
                  }}
                  title="Audio Message"
                >
                  <i className="bi bi-mic" />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "38px",
                    height: "38px",
                    backgroundColor: "#fbf1f3",
                    color: "#73112d",
                    border: "1px solid #ead8d4",
                  }}
                  title="Attach Image"
                >
                  <i className="bi bi-image" />
                </button>
              </div>

              {/* Mobile media menu */}
              <div
                className="d-md-none position-relative flex-shrink-0 mb-1"
                ref={mediaMenuRef}
              >
                <button
                  type="button"
                  onClick={() => setShowMobileMediaMenu((prev) => !prev)}
                  className="btn rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: showMobileMediaMenu
                      ? "#73112d"
                      : "#f8f5f2",
                    color: showMobileMediaMenu ? "#fff" : "#73112d",
                    border: "1px solid #eadfd8",
                  }}
                  aria-label="Toggle media menu"
                >
                  <i
                    className={`bi ${
                      showMobileMediaMenu ? "bi-x-lg" : "bi-plus-lg"
                    }`}
                  />
                </button>

                {showMobileMediaMenu && (
                  <div
                    className="position-absolute bottom-100 start-0 mb-2 bg-white rounded-4 shadow-lg border p-2"
                    style={{
                      minWidth: "180px",
                      zIndex: 1000,
                      borderColor: "#eee2d8",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-light btn-sm border-0 w-100 text-start d-flex align-items-center gap-3 py-2 px-3 rounded-3"
                      style={{
                        color: "#73112d",
                      }}
                    >
                      <span
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#fbf1f3",
                        }}
                      >
                        <i className="bi bi-image" />
                      </span>

                      <span
                        className="fw-semibold"
                        style={{
                          fontSize: "0.82rem",
                        }}
                      >
                        Photo
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDisabledFeature}
                      className="btn btn-light btn-sm border-0 w-100 text-start d-flex align-items-center gap-3 py-2 px-3 rounded-3 text-muted"
                    >
                      <span
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        <i className="bi bi-mic" />
                      </span>

                      <span
                        className="fw-semibold"
                        style={{
                          fontSize: "0.82rem",
                        }}
                      >
                        Voice Note
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDisabledFeature}
                      className="btn btn-light btn-sm border-0 w-100 text-start d-flex align-items-center gap-3 py-2 px-3 rounded-3 text-muted"
                    >
                      <span
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        <i className="bi bi-camera-video" />
                      </span>

                      <span
                        className="fw-semibold"
                        style={{
                          fontSize: "0.82rem",
                        }}
                      >
                        Video Call
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDisabledFeature}
                      className="btn btn-light btn-sm border-0 w-100 text-start d-flex align-items-center gap-3 py-2 px-3 rounded-3 text-muted"
                    >
                      <span
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        <i className="bi bi-telephone" />
                      </span>

                      <span
                        className="fw-semibold"
                        style={{
                          fontSize: "0.82rem",
                        }}
                      >
                        Voice Call
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Hidden image input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="d-none"
              />

              {/* Textarea */}
              <div className="flex-grow-1">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  // onKeyDown={handleKeyDown}
                  placeholder="Write a message..."
                  className="w-100 border-0 rounded-4 shadow-none"
                  style={{
                    backgroundColor: "#efeae4",
                    fontSize: "0.9rem",
                    outline: "none",
                    color: "#495057",
                    resize: "none",
                    maxHeight: "120px",
                    overflowY: "auto",
                    lineHeight: "1.5",
                    padding: "11px 16px",
                    minHeight: "42px",
                  }}
                />
              </div>

              {/* Send */}
              <button
                type="submit"
                disabled={!message.trim()}
                className="btn rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0 mb-1"
                style={{
                  width: "44px",
                  height: "44px",
                  backgroundColor: "#73112d",
                  color: "#fff",
                  border: "none",
                  opacity: message.trim() ? 1 : 0.5,
                  transition: "all 0.2s ease",
                }}
                aria-label="Send message"
              >
                <i
                  className="bi bi-send-fill"
                  style={{
                    fontSize: "0.9rem",
                    transform: "rotate(45deg)",
                    marginLeft: "-2px",
                    marginTop: "-2px",
                  }}
                />
              </button>
            </div>
          </form>

          {/* Small helper */}
          <div className="text-center mt-2 d-none d-sm-block">
            <small
              className="text-muted"
              style={{
                fontSize: "0.62rem",
              }}
            >
              {/* Press Enter to send · Shift + Enter for a new line */}
            </small>
          </div>
        </div>
      </footer>

      {/* =====================================================
          ZERO BALANCE MODAL
      ====================================================== */}
      {showZeroBalanceModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 9999,
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4 text-center w-100"
            style={{
              maxWidth: "380px",
            }}
          >
            <div
              className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "68px",
                height: "68px",
                backgroundColor: "#fce8e6",
                color: "#73112d",
              }}
            >
              <i className="bi bi-wallet2 fs-2" />
            </div>

            <h5
              className="fw-bold mb-2"
              style={{
                fontFamily: "Georgia, serif",
                color: "#5c1d24",
              }}
            >
              Balance Depleted
            </h5>

            <p
              className="text-muted mb-4"
              style={{
                fontSize: "0.85rem",
                lineHeight: "1.6",
              }}
            >
              You have run out of coins. Top up your account balance to keep
              chatting with <strong>{activeChat.name}</strong>.
            </p>

            <div className="d-flex flex-column gap-2">
              <Link
                to="/buy-coins"
                className="btn text-white rounded-pill py-2 fw-semibold shadow-sm text-decoration-none"
                style={{
                  backgroundColor: "#73112d",
                  border: "none",
                }}
              >
                <i className="bi bi-coin me-2" />
                Top Up Coins
              </Link>

              <button
                type="button"
                onClick={() => setShowZeroBalanceModal(false)}
                className="btn btn-link text-muted text-decoration-none"
                style={{
                  fontSize: "0.8rem",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          POINTS MODAL
      ====================================================== */}
      {showPointsModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: "rgba(0,0,0,0.75)",
            zIndex: 9999,
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4 text-center w-100"
            style={{
              maxWidth: "390px",
            }}
          >
            <div
              className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "70px",
                height: "70px",
                backgroundColor: "#f9e6e9",
                color: "#c82333",
              }}
            >
              <i className="bi bi-exclamation-octagon fs-1" />
            </div>

            <h5
              className="fw-bold mb-2"
              style={{
                fontFamily: "Georgia, serif",
                color: "#5c1d24",
              }}
            >
              Not Enough Chat Points
            </h5>

            <p
              className="text-muted mb-4"
              style={{
                fontSize: "0.9rem",
                lineHeight: "1.6",
              }}
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
                style={{
                  backgroundColor: "#c82333",
                  border: "none",
                }}
              >
                <i className="bi bi-coin me-2" />
                Buy Points
              </button>

              <button
                type="button"
                onClick={() => setShowPointsModal(false)}
                className="btn btn-link text-muted text-decoration-none"
                style={{
                  fontSize: "0.85rem",
                }}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          API ERROR MODAL
      ====================================================== */}
      {showApiErrorModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 9999,
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4 text-center w-100"
            style={{
              maxWidth: "380px",
            }}
          >
            <div
              className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#fff3cd",
                color: "#856404",
              }}
            >
              <i className="bi bi-info-circle fs-2" />
            </div>

            <h5
              className="fw-bold mb-2"
              style={{
                fontFamily: "Georgia, serif",
                color: "#5c1d24",
              }}
            >
              Message Failed
            </h5>

            <p
              className="text-muted mb-4"
              style={{
                fontSize: "0.9rem",
                lineHeight: "1.6",
              }}
            >
              {apiErrorMessage}
            </p>

            <button
              type="button"
              onClick={() => setShowApiErrorModal(false)}
              className="btn text-white rounded-pill py-2 fw-semibold shadow-sm px-4"
              style={{
                backgroundColor: "#856404",
                border: "none",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          FEATURE UNAVAILABLE MODAL
      ====================================================== */}
      {showUnavailableModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: "rgba(0,0,0,0.75)",
            zIndex: 9999,
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4 text-center w-100"
            style={{
              maxWidth: "360px",
            }}
          >
            <div
              className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#efeae4",
                color: "#73112d",
              }}
            >
              <i className="bi bi-info-circle fs-2" />
            </div>

            <h5
              className="fw-bold mb-2"
              style={{
                fontFamily: "Georgia, serif",
                color: "#5c1d24",
              }}
            >
              Feature Not Available
            </h5>

            <p
              className="text-muted mb-4"
              style={{
                fontSize: "0.85rem",
                lineHeight: "1.6",
              }}
            >
              Audio, video, and call features are currently not available for
              now. Stay tuned for future updates!
            </p>

            <button
              type="button"
              onClick={() => setShowUnavailableModal(false)}
              className="btn text-white rounded-pill py-2 fw-semibold shadow-sm w-100"
              style={{
                backgroundColor: "#73112d",
                border: "none",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          PROFILE MODAL
      ====================================================== */}
      {showProfileModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{
            backgroundColor: "rgba(0,0,0,0.65)",
            zIndex: 9999,
            backdropFilter: "blur(3px)",
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg w-100 overflow-hidden"
            style={{
              maxWidth: "540px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Profile top */}
            <div
              className="position-relative"
              style={{
                backgroundColor: "#fbf6f0",
                padding: "28px 24px 24px",
                borderBottom: "1px solid #eee2d8",
              }}
            >
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="btn rounded-circle position-absolute top-0 end-0 mt-3 me-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#fff",
                  border: "1px solid #eadfd8",
                  color: "#5c1d24",
                }}
              >
                <i className="bi bi-x-lg" />
              </button>

              <div className="d-flex flex-column align-items-center text-center">
                <div
                  className="position-relative mb-3"
                  style={{
                    width: "108px",
                    height: "108px",
                  }}
                >
                  <img
                    src={profileDetails?.photo || activeChat.image}
                    alt={profileDetails?.fullName || activeChat.name}
                    className="rounded-circle w-100 h-100"
                    style={{
                      objectFit: "cover",
                      border: "4px solid #fff",
                      boxShadow: "0 4px 18px rgba(92,29,36,0.16)",
                    }}
                  />

                  <span
                    className="position-absolute"
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      right: "4px",
                      bottom: "8px",
                      backgroundColor:
                        profileDetails?.status === "online" ||
                        activeChat.isOnline
                          ? "#198754"
                          : "#adb5bd",
                      border: "3px solid #fff",
                    }}
                  />
                </div>

                <h4
                  className="fw-bold mb-1"
                  style={{
                    color: "#5c1d24",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {profileDetails?.fullName ||
                    activeChat.fullName ||
                    activeChat.name}
                </h4>

                <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 mt-2">
                  <span
                    className="badge rounded-pill"
                    style={{
                      backgroundColor: "#f8f0ff",
                      color: "#5c1d24",
                      fontSize: "0.7rem",
                      padding: "6px 10px",
                    }}
                  >
                    {profileDetails?.badge ||
                      activeChat.badge ||
                      "Love & Friends"}
                  </span>

                  {(profileDetails?.verified || activeChat.verified) && (
                    <span
                      className="badge rounded-pill"
                      style={{
                        backgroundColor: "#e7f1ff",
                        color: "#0d6efd",
                        fontSize: "0.7rem",
                        padding: "6px 10px",
                      }}
                    >
                      <i className="bi bi-patch-check-fill me-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile body */}
            <div className="p-4">
              {profileLoading ? (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm mb-3"
                    role="status"
                    style={{
                      color: "#73112d",
                    }}
                  />

                  <p
                    className="text-muted mb-0"
                    style={{
                      fontSize: "0.8rem",
                    }}
                  >
                    Loading profile...
                  </p>
                </div>
              ) : (
                <>
                  {/* Quick details */}
                  <div className="row g-2 mb-4">
                    <div className="col-6">
                      <div
                        className="rounded-4 p-3 h-100"
                        style={{
                          backgroundColor: "#fbf6f0",
                          border: "1px solid #eee2d8",
                        }}
                      >
                        <small
                          className="text-muted d-block mb-1"
                          style={{
                            fontSize: "0.68rem",
                          }}
                        >
                          Age
                        </small>

                        <span
                          className="fw-semibold"
                          style={{
                            color: "#5c1d24",
                            fontSize: "0.88rem",
                          }}
                        >
                          {profileDetails?.age || activeChat.age || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="col-6">
                      <div
                        className="rounded-4 p-3 h-100"
                        style={{
                          backgroundColor: "#fbf6f0",
                          border: "1px solid #eee2d8",
                        }}
                      >
                        <small
                          className="text-muted d-block mb-1"
                          style={{
                            fontSize: "0.68rem",
                          }}
                        >
                          Status
                        </small>

                        <span
                          className={`fw-semibold ${
                            profileDetails?.status === "online" ||
                            activeChat.isOnline
                              ? "text-success"
                              : "text-muted"
                          }`}
                          style={{
                            fontSize: "0.88rem",
                          }}
                        >
                          {profileDetails?.status === "online" ||
                          activeChat.isOnline
                            ? "Online"
                            : "Offline"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: "30px",
                          height: "30px",
                          backgroundColor: "#f8f0ff",
                          color: "#73112d",
                        }}
                      >
                        <i className="bi bi-person" />
                      </span>

                      <h6
                        className="fw-bold mb-0"
                        style={{
                          color: "#5c1d24",
                        }}
                      >
                        About
                      </h6>
                    </div>

                    <p
                      className="text-muted mb-0"
                      style={{
                        fontSize: "0.88rem",
                        lineHeight: "1.65",
                      }}
                    >
                      {profileDetails?.bio ||
                        activeChat.bio ||
                        "No bio available yet."}
                    </p>
                  </div>

                  {/* Interests */}
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: "30px",
                          height: "30px",
                          backgroundColor: "#f8f0ff",
                          color: "#73112d",
                        }}
                      >
                        <i className="bi bi-stars" />
                      </span>

                      <h6
                        className="fw-bold mb-0"
                        style={{
                          color: "#5c1d24",
                        }}
                      >
                        Interests
                      </h6>
                    </div>

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
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              padding: "7px 11px",
                            }}
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span
                          className="text-muted"
                          style={{
                            fontSize: "0.82rem",
                          }}
                        >
                          No interests added yet.
                        </span>
                      )}
                    </div>
                  </div>

                  {profileError && (
                    <div
                      className="alert alert-danger mt-4 mb-0 rounded-3 border-0"
                      role="alert"
                      style={{
                        fontSize: "0.82rem",
                      }}
                    >
                      <i className="bi bi-exclamation-circle me-2" />
                      {profileError}
                    </div>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="btn text-white rounded-pill py-2 fw-semibold shadow-sm w-100 mt-4"
                style={{
                  backgroundColor: "#73112d",
                  border: "none",
                }}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
