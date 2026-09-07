import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import api from "../../api/axios";

import AssignmentCard from "../../components/moderation/AssignmentCard";
import MessageComposer from "../../components/moderation/MessageComposer";
import WaitingOverlay from "../../components/common/WaitingOverlay";

const MessagesPage = () => {
  const [assignment, setAssignment] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);

  const [error, setError] = useState("");
  const [assignmentNotice, setAssignmentNotice] = useState(null);

  const socketRef = useRef(null);
  const assignmentRef = useRef(null);

  // =========================================================
  // AUTO SCROLL REF
  // =========================================================

  const messagesEndRef = useRef(null);

  // =========================================================
  // API + SOCKET URL
  // =========================================================

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

  // =========================================================
  // Keep assignment ref updated
  // =========================================================

  useEffect(() => {
    assignmentRef.current = assignment;
  }, [assignment]);

  // =========================================================
  // AUTO SCROLL TO LATEST MESSAGE
  // =========================================================

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  // =========================================================
  // Get message sender type
  // =========================================================

  const getSenderType = (message, currentAssignment) => {
    if (!message || !currentAssignment) {
      return "real";
    }

    const fakeUserId =
      currentAssignment.fakeUser?._id || currentAssignment.fakeUser;

    const senderId = message.sender?._id || message.sender;

    if (
      fakeUserId &&
      senderId &&
      fakeUserId.toString() === senderId.toString()
    ) {
      return "fake";
    }

    return "real";
  };

  // =========================================================
  // Load complete chat history
  // =========================================================

  const loadChatHistory = async (chatId, currentAssignment) => {
    if (!chatId || !currentAssignment) {
      return [];
    }

    try {
      const response = await api.get(`/messages/${chatId}`);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load chat history.",
        );
      }

      const serverMessages = response.data.messages || [];

      const formattedMessages = serverMessages.map((message) => ({
        ...message,
        senderType: getSenderType(message, currentAssignment),
        createdAt: message.createdAt || new Date().toISOString(),
      }));

      return formattedMessages;
    } catch (error) {
      console.error("Failed to load chat history:", error);
      throw error;
    }
  };

  // =========================================================
  // Determine whether moderator should be waiting
  // =========================================================

  const determineWaitingState = (chatMessages) => {
    if (!chatMessages || chatMessages.length === 0) {
      return false;
    }

    const lastMessage = chatMessages[chatMessages.length - 1];

    if (lastMessage.senderType === "fake") {
      return true;
    }

    return false;
  };

  // =========================================================
  // Display a new assignment
  // =========================================================

  const activateAssignment = async (incomingAssignment) => {
    if (!incomingAssignment) {
      return;
    }

    const chatId = incomingAssignment.chatId?._id || incomingAssignment.chatId;

    if (!chatId) {
      console.error("Assignment does not contain a chat ID.");
      return;
    }

    try {
      const updatedAssignment = {
        ...incomingAssignment,
        chatId,
      };

      setAssignment(updatedAssignment);

      assignmentRef.current = updatedAssignment;

      const history = await loadChatHistory(chatId, updatedAssignment);

      setMessages(history);

      const shouldWait = determineWaitingState(history);

      setIsWaitingForReply(shouldWait);
    } catch (error) {
      console.error("Unable to activate assignment:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load conversation.",
      );
    }
  };

  // =========================================================
  // Load moderator profile + socket + assignments
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const initializeModerator = async () => {
      try {
        setLoading(true);
        setError("");

        // ---------------------------------------------
        // Get logged-in moderator
        // ---------------------------------------------

        const profileResponse = await api.get("/profile/me");

        if (!profileResponse.data?.success) {
          throw new Error("Unable to load moderator profile.");
        }

        const moderator = profileResponse.data.user;

        console.log("========== MODERATOR PROFILE ==========");
        console.log("Moderator:", moderator);
        console.log("Moderator ID:", moderator._id);
        console.log("Moderator Name:", moderator.fullName);
        console.log("Moderator Username:", moderator.username);
        console.log("Role:", moderator.role);
        console.log("======================================");

        if (moderator.role !== "moderator") {
          throw new Error("Moderator access required.");
        }

        if (!mounted) return;

        // ---------------------------------------------
        // Connect Socket.IO
        // ---------------------------------------------

        const socket = io(SOCKET_URL, {
          transports: ["websocket"],
          withCredentials: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("MODERATOR SOCKET CONNECTED");

          socket.emit("join-user", moderator._id.toString());
        });

        socket.on("connect_error", (socketError) => {
          console.error("Moderator Socket connection error:", socketError);
        });

        // =====================================================
        // NEW MESSAGE FROM REAL/PREMIUM USER
        // =====================================================

        const handleFakeAccountMessage = async (data) => {
          if (!data) return;

          try {
            const incomingAssignment = {
              assignmentId: data.assignmentId,
              chatId: data.chatId,
              fakeUser: data.fakeUser,
              realUser: data.realUser,
              status: "active",
              assignedAt: new Date().toISOString(),
              lastMessage: data.message || null,
              lastMessageAt:
                data.message?.createdAt || new Date().toISOString(),
            };

            await activateAssignment(incomingAssignment);

            setIsWaitingForReply(false);
          } catch (error) {
            console.error("Error handling fake-account-message:", error);

            setError(
              error.response?.data?.message ||
                error.message ||
                "Unable to load new conversation.",
            );
          }
        };

        socket.on("fake-account-message", handleFakeAccountMessage);

        // =====================================================
        // NORMAL NEW MESSAGE EVENT
        // =====================================================

        const handleNewMessage = async (message) => {
          if (!message) return;

          const currentAssignment = assignmentRef.current;

          if (!currentAssignment) {
            return;
          }

          const currentChatId =
            currentAssignment.chatId?._id || currentAssignment.chatId;

          const messageChatId = message.chat?._id || message.chat;

          if (
            !messageChatId ||
            !currentChatId ||
            messageChatId.toString() !== currentChatId.toString()
          ) {
            return;
          }

          try {
            const history = await loadChatHistory(
              currentChatId,
              currentAssignment,
            );

            setMessages(history);

            const shouldWait = determineWaitingState(history);

            setIsWaitingForReply(shouldWait);
          } catch (error) {
            console.error("Unable to reload chat history:", error);
          }
        };

        socket.on("new-message", handleNewMessage);

        // =====================================================
        // ASSIGNMENT EXPIRED
        // =====================================================
        const handleAssignmentExpired = (data) => {
          if (!data) return;

          console.log("⏰ Assignment expired:", data);

          const currentAssignment = assignmentRef.current;

          if (
            currentAssignment?.assignmentId &&
            data.assignmentId &&
            currentAssignment.assignmentId.toString() !==
              data.assignmentId.toString()
          ) {
            return;
          }

          setAssignmentNotice({
            type: "expired",
            message:
              data.message ||
              "Your chat session has expired and this conversation has been reassigned.",
          });

          // Remove the expired assignment from this moderator
          setAssignment(null);
          assignmentRef.current = null;
          setMessages([]);
          setIsWaitingForReply(true);
        };

        socket.on("assignment-expired", handleAssignmentExpired);

        // =====================================================
        // ASSIGNMENT TRANSFERRED / REASSIGNED
        // =====================================================
        const handleAssignmentTransferred = async (data) => {
          if (!data) return;

          console.log("🔄 Assignment transferred:", data);

          const incomingAssignment = {
            assignmentId: data.assignmentId,
            chatId: data.chatId?._id || data.chatId,
            fakeUser: data.fakeUser,
            realUser: data.realUser,
            status: "active",
            assignedAt: data.assignedAt,
            expiresAt: data.expiresAt,
          };

          try {
            setAssignmentNotice({
              type: "transferred",
              message:
                "A conversation has been assigned to you. You have 5 minutes to respond.",
            });

            await activateAssignment(incomingAssignment);

            setTimeout(() => {
              setAssignmentNotice(null);
            }, 4000);
          } catch (error) {
            console.error("Error activating transferred assignment:", error);
          }
        };

        socket.on("assignment-transferred", handleAssignmentTransferred);

        // =====================================================
        // LOAD EXISTING MODERATOR ASSIGNMENTS
        // =====================================================

        const assignmentsResponse = await api.get("/moderator/assignments");

        if (!mounted) return;

        if (!assignmentsResponse.data?.success) {
          throw new Error(
            assignmentsResponse.data?.message || "Unable to load assignments.",
          );
        }

        const assignedChats = assignmentsResponse.data.chats || [];

        if (assignedChats.length > 0) {
          await activateAssignment(assignedChats[0]);
        } else {
          setAssignment(null);
          assignmentRef.current = null;

          setMessages([]);

          setIsWaitingForReply(true);
        }
      } catch (err) {
        console.error("Moderator Messages initialization error:", err);

        if (!mounted) return;

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load moderator messages.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeModerator();

    return () => {
      mounted = false;

      if (socketRef.current) {
        console.log("🔌 Cleaning up moderator socket...");

        socketRef.current.off("fake-account-message");
        socketRef.current.off("new-message");
        socketRef.current.off("assignment-transferred");
        socketRef.current.off("assignment-expired");
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");

        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [SOCKET_URL]);

  // =========================================================
  // Send moderator reply
  // =========================================================

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    if (!assignment) {
      console.error("No active assignment.");
      return;
    }

    if (!assignment.assignmentId) {
      console.error("Assignment ID is missing.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await api.post("/moderator/reply", {
        assignmentId: assignment.assignmentId,
        message: text.trim(),
        messageType: "text",
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to send message.");
      }

      const sentMessage = response.data.data;

      // ---------------------------------------------
      // Add moderator's message immediately
      // ---------------------------------------------

      setMessages((prev) => {
        const alreadyExists = prev.some(
          (msg) => msg._id?.toString() === sentMessage?._id?.toString(),
        );

        if (alreadyExists) {
          return prev;
        }

        return [
          ...prev,
          {
            ...sentMessage,

            // Keep this as fake because the moderator
            // is replying AS the fake profile.
            senderType: "fake",

            createdAt: sentMessage?.createdAt || new Date().toISOString(),
          },
        ];
      });

      setIsWaitingForReply(true);
    } catch (err) {
      console.error("Moderator send message error:", err);

      setError(
        err.response?.data?.message || err.message || "Failed to send message.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <WaitingOverlay />
      </div>
    );
  }

  // =========================================================
  // Error
  // =========================================================

  if (error && !assignment) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  // =========================================================
  // WAITING STATE
  // =========================================================

  if (!assignment || isWaitingForReply) {
    return (
      <div className="container-fluid py-4">
        {assignmentNotice && (
          <div
            className="position-fixed top-0 start-50 translate-middle-x mt-4"
            style={{
              zIndex: 9999,
              width: "min(90%, 500px)",
            }}
          >
            <div
              className="card shadow-lg border-0"
              style={{
                background: "#6f42c1",
                color: "#fff",
                borderRadius: "12px",
              }}
            >
              <div className="card-body p-4 text-center">
                <h5 className="fw-bold mb-2">
                  {assignmentNotice.type === "expired"
                    ? "Chat Session Expired"
                    : "New Conversation Assigned"}
                </h5>

                <p className="mb-3">{assignmentNotice.message}</p>

                <button
                  type="button"
                  className="btn btn-light px-4 fw-semibold"
                  onClick={() => setAssignmentNotice(null)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
        <WaitingOverlay />
      </div>
    );
  }

  // =========================================================
  // MAIN CHAT UI
  // =========================================================

  return (
    <div className="container-fluid py-4">
      {assignmentNotice && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-4"
          style={{
            zIndex: 9999,
            width: "min(90%, 500px)",
          }}
        >
          <div
            className="card shadow-lg border-0"
            style={{
              background: "#6f42c1",
              color: "#fff",
              borderRadius: "12px",
            }}
          >
            <div className="card-body p-4 text-center">
              <h5 className="fw-bold mb-2">
                {assignmentNotice.type === "expired"
                  ? "Chat Session Expired"
                  : "New Conversation Assigned"}
              </h5>

              <p className="mb-3">{assignmentNotice.message}</p>

              <button
                type="button"
                className="btn btn-light px-4 fw-semibold"
                onClick={() => setAssignmentNotice(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      <AssignmentCard assignment={assignment} />

      <div
        className="card shadow-sm mt-3"
        style={{
          height: "70vh",
        }}
      >
        {/* ============================================
            CHAT BODY
        ============================================ */}

        <div
          className="card-body overflow-auto"
          style={{
            background: "#f7f7f7",
          }}
        >
          {messages.length === 0 && (
            <div className="text-center text-muted py-5">No messages yet.</div>
          )}

          {messages.map((msg, index) => {
            const isFakeMessage = msg.senderType === "fake";

            /*
             * Try to get the moderator name from
             * whichever sender structure your API returns.
             */
            const moderatorName =
              msg.moderator?.fullName || msg.moderator?.username || "Moderator";

            return (
              <React.Fragment key={msg._id || `message-${index}`}>
                {index === 0 && messages.length > 0 && (
                  <div className="text-center mb-3">
                    <small className="text-muted">Conversation</small>
                  </div>
                )}

                <div
                  className={`d-flex mb-3 ${
                    isFakeMessage
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded shadow-sm ${
                      isFakeMessage ? "bg-dark text-white" : "bg-white"
                    }`}
                    style={{
                      maxWidth: "70%",
                    }}
                  >
                    <div>{msg.message}</div>

                    {/* =================================
                        MODERATOR NAME + TIME
                    ================================= */}

                    <div
                      className={`d-flex justify-content-end align-items-center gap-2 mt-1 ${
                        isFakeMessage ? "text-light" : "text-muted"
                      }`}
                    >
                      {isFakeMessage && (
                        <small className="fw-semibold">{moderatorName}</small>
                      )}

                      <small>
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </small>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* ============================================
              AUTO SCROLL TARGET
          ============================================ */}

          <div ref={messagesEndRef} />
        </div>

        {/* ============================================
            MESSAGE COMPOSER
        ============================================ */}

        <div className="card-footer bg-white">
          <MessageComposer
            onSendMessage={handleSendMessage}
            isSubmitting={isSubmitting}
            isDisabled={isWaitingForReply}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
