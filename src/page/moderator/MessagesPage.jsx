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

  const socketRef = useRef(null);
  const assignmentRef = useRef(null);

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
      console.log("=================================");
      console.log("LOADING COMPLETE CHAT HISTORY");
      console.log("Chat ID:", chatId);
      console.log("=================================");

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

      console.log(
        "Complete chat history loaded:",
        formattedMessages.length,
        "messages",
      );

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
      /*
       * If there are no messages yet, allow the moderator
       * to respond.
       */
      return false;
    }

    const lastMessage = chatMessages[chatMessages.length - 1];

    /*
     * If the latest message belongs to the fake account,
     * the moderator has already replied.
     *
     * Therefore the moderator must wait for the real user.
     */
    if (lastMessage.senderType === "fake") {
      return true;
    }

    /*
     * Latest message is from the real/premium user.
     * Moderator can respond.
     */
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
      console.log("=================================");
      console.log("ACTIVATING MODERATOR ASSIGNMENT");
      console.log("Assignment ID:", incomingAssignment.assignmentId);
      console.log("Chat ID:", chatId);
      console.log("=================================");

      /*
       * Set assignment first so the UI knows which
       * conversation is currently active.
       */
      setAssignment({
        ...incomingAssignment,
        chatId,
      });

      assignmentRef.current = {
        ...incomingAssignment,
        chatId,
      };

      /*
       * Always fetch the complete conversation.
       *
       * We do NOT simply append the incoming socket message.
       */
      const history = await loadChatHistory(chatId, incomingAssignment);

      setMessages(history);

      /*
       * Decide whether moderator can reply based on
       * the LAST message in the complete conversation.
       */
      const shouldWait = determineWaitingState(history);

      setIsWaitingForReply(shouldWait);

      console.log("Moderator waiting:", shouldWait);
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
          console.log("=================================");
          console.log("MODERATOR SOCKET CONNECTED");
          console.log("Socket ID:", socket.id);
          console.log("Moderator ID:", moderator._id);
          console.log("=================================");

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

          console.log("=================================");
          console.log("🔥 NEW MESSAGE FOR MODERATOR");
          console.log("Assignment:", data.assignmentId);
          console.log("Chat:", data.chatId);
          console.log("Real User:", data.realUser);
          console.log("Fake User:", data.fakeUser);
          console.log("Message:", data.message);
          console.log("=================================");

          try {
            /*
             * Build the new assignment from the socket event.
             */
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

            /*
             * IMPORTANT:
             *
             * Do not append only data.message.
             *
             * Fetch the complete conversation so the
             * moderator always sees the full chat.
             */
            await activateAssignment(incomingAssignment);

            /*
             * A real user has just sent a new message.
             * Therefore moderator can respond.
             */
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

          /*
           * Ignore messages from other conversations.
           */
          if (
            !messageChatId ||
            !currentChatId ||
            messageChatId.toString() !== currentChatId.toString()
          ) {
            return;
          }

          console.log("📨 New message for current moderator chat:", message);

          try {
            /*
             * Reload the complete history instead of
             * adding only this one message.
             */
            const history = await loadChatHistory(
              currentChatId,
              currentAssignment,
            );

            setMessages(history);

            /*
             * Determine state from the actual latest
             * message in the database.
             */
            const shouldWait = determineWaitingState(history);

            setIsWaitingForReply(shouldWait);
          } catch (error) {
            console.error("Unable to reload chat history:", error);
          }
        };

        socket.on("new-message", handleNewMessage);

        // =====================================================
        // LOAD EXISTING MODERATOR ASSIGNMENTS
        // =====================================================

        const assignmentsResponse = await api.get("/moderator/assignments");

        console.log("Moderator assignments:", assignmentsResponse.data);

        if (!mounted) return;

        if (!assignmentsResponse.data?.success) {
          throw new Error(
            assignmentsResponse.data?.message || "Unable to load assignments.",
          );
        }

        const assignedChats = assignmentsResponse.data.chats || [];

        /*
         * There is an active assignment.
         */
        if (assignedChats.length > 0) {
          const firstAssignment = assignedChats[0];

          console.log("Existing moderator assignment:", firstAssignment);

          /*
           * IMPORTANT:
           *
           * activateAssignment() loads the ENTIRE
           * conversation and determines whether the
           * moderator should be waiting.
           *
           * This fixes the reload problem.
           */
          await activateAssignment(firstAssignment);
        } else {
          /*
           * No active assignment.
           */
          setAssignment(null);
          assignmentRef.current = null;

          setMessages([]);

          /*
           * No assignment means moderator waits.
           */
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
        console.log("Disconnecting moderator socket...");

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

      console.log("=================================");
      console.log("MODERATOR SENDING MESSAGE");
      console.log("Assignment ID:", assignment.assignmentId);
      console.log("Chat ID:", assignment.chatId);
      console.log("Message:", text);
      console.log("=================================");

      const response = await api.post("/moderator/reply", {
        assignmentId: assignment.assignmentId,
        message: text.trim(),
        messageType: "text",
      });

      console.log("Moderator reply response:", response.data);

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
            senderType: "fake",
            createdAt: sentMessage?.createdAt || new Date().toISOString(),
          },
        ];
      });

      /*
       * IMPORTANT:
       *
       * The moderator has now replied.
       *
       * Lock the composer.
       */
      setIsWaitingForReply(true);

      /*
       * Keep the assignment reference internally,
       * but the UI will show WaitingOverlay instead
       * of the conversation.
       */
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
  //
  // This is important.
  //
  // After moderator replies, the chat disappears and
  // WaitingOverlay remains until a NEW user message arrives.
  // =========================================================

  if (!assignment || isWaitingForReply) {
    return (
      <div className="container-fluid py-4">
        <WaitingOverlay />
      </div>
    );
  }

  // =========================================================
  // MAIN CHAT UI
  // =========================================================

  return (
    <div className="container-fluid py-4">
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

            return (
              <React.Fragment key={msg._id || `message-${index}`}>
                {/* -----------------------------------------
                    Conversation break
                ----------------------------------------- */}

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

                    <small
                      className={isFakeMessage ? "text-light" : "text-muted"}
                    >
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </small>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
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
