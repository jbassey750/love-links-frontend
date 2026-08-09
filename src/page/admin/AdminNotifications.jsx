import React, { useState } from "react";
import AdminNavbar from "./adminHearder";

// Mock API Call for handling notifications and like interactions
const processNotificationAction = async (notificationId, action) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, notificationId, action });
    }, 400);
  });
};

const AdminNotifications = () => {
  // Mock state for incoming user likes aimed at system personas
  const [notifications, setNotifications] = useState([
    {
      id: "notif-201",
      timestamp: "3 mins ago",
      type: "incoming_like",
      realUser: {
        id: "usr-201",
        name: "Michael Chen",
        age: 28,
        location: "San Francisco, CA",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500",
      },
      fakeAccount: {
        id: "fake-101",
        name: "Jessica Miller",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
      },
    },
    {
      id: "notif-202",
      timestamp: "18 mins ago",
      type: "incoming_like",
      realUser: {
        id: "usr-202",
        name: "Sarah Jenkins",
        age: 25,
        location: "Austin, TX",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500",
      },
      fakeAccount: {
        id: "fake-102",
        name: "Alex Vance",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
      },
    },
    {
      id: "notif-203",
      timestamp: "1 hour ago",
      type: "incoming_like",
      realUser: {
        id: "usr-203",
        name: "Daniel Smith",
        age: 30,
        location: "Chicago, IL",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500",
      },
      fakeAccount: {
        id: "fake-101",
        name: "Jessica Miller",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
      },
    },
  ]);

  const [processingId, setProcessingId] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  // Single function for actions: match, reject, pending, delete
  const handleAction = async (id, action) => {
    setProcessingId(id);
    try {
      await processNotificationAction(id, action);

      let statusText = "";

      if (action === "pending") {
        statusText = "Notification set to pending.";
      } else if (action === "match") {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
        statusText = "You liked back! Match created.";
      } else if (action === "reject") {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
        statusText = "Like request rejected.";
      } else if (action === "delete") {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
        statusText = "Notification deleted.";
      }

      setAlertMessage(statusText);
      setTimeout(() => setAlertMessage(null), 2500);
    } catch (err) {
      console.error("Action execution failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />

      {/* Floating Action Alert */}
      {alertMessage && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4 z-3" style={{ minWidth: "280px" }}>
          <div className="alert alert-dark shadow-lg border-0 d-flex align-items-center justify-content-center gap-2 mb-0 rounded-pill py-2.5 px-4 text-white">
            <i className="bi bi-info-circle-fill text-info fs-5"></i>
            <span className="fw-semibold small">{alertMessage}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-grow-1 container-md py-4 d-flex justify-content-center align-items-start">
        <div className="w-100" style={{ maxWidth: "600px" }}>
          
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3 px-1">
            <h6 className="fw-bold text-uppercase text-muted mb-0 small tracking-wide">
              Incoming Like Notifications
            </h6>
            <span className="badge bg-secondary rounded-pill px-2.5 py-1.5">
              {notifications.length} Unprocessed
            </span>
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {notifications.map((item) => (
                <div key={item.id} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                  <div className="card-body p-3">
                    
                    {/* Top Row: User details & Delete Button */}
                    <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                      <div className="d-flex align-items-center gap-3">
                        {/* Real User Avatar */}
                        <div className="position-relative">
                          <img
                            src={item.realUser.avatar}
                            alt={item.realUser.name}
                            className="rounded-circle object-fit-cover border"
                            style={{ width: "48px", height: "48px" }}
                          />
                          <span
                            className="position-absolute bottom-0 end-0 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center border border-white"
                            style={{ width: "18px", height: "18px", fontSize: "0.6rem" }}
                          >
                            <i className="bi bi-heart-fill"></i>
                          </span>
                        </div>

                        {/* Text Message */}
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-0.5">
                            <span className="fw-bold text-dark fs-6">
                              {item.realUser.name}, {item.realUser.age}
                            </span>
                            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                              • {item.timestamp}
                            </small>
                          </div>
                          
                          <p className="mb-0 text-secondary small">
                            Sent a like to <span className="fw-semibold text-dark">{item.fakeAccount.name}</span>.
                          </p>
                        </div>
                      </div>

                      {/* Delete Single Notification Button */}
                      <button
                        onClick={() => handleAction(item.id, "delete")}
                        disabled={processingId === item.id}
                        className="btn btn-outline-secondary btn-sm border-0 rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0"
                        style={{ width: "32px", height: "32px" }}
                        title="Delete notification"
                      >
                        {processingId === item.id ? (
                          <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                        ) : (
                          <i className="bi bi-x-lg fs-6 text-muted"></i>
                        )}
                      </button>
                    </div>

                    {/* Action Buttons: Reject / Pending / Like Back */}
                    <div className="d-flex gap-2 pt-2 border-top">
                      {/* Reject Button */}
                      <button
                        onClick={() => handleAction(item.id, "reject")}
                        disabled={processingId === item.id}
                        className="btn btn-outline-danger flex-grow-1 rounded-pill py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-1"
                        style={{ fontSize: "0.825rem" }}
                      >
                        <i className="bi bi-hand-thumbs-down"></i>
                        Reject
                      </button>

                      {/* Pending Button */}
                      <button
                        onClick={() => handleAction(item.id, "pending")}
                        disabled={processingId === item.id}
                        className="btn btn-outline-warning text-dark flex-grow-1 rounded-pill py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-1"
                        style={{ fontSize: "0.825rem" }}
                      >
                        <i className="bi bi-clock-history"></i>
                        Pending
                      </button>

                      {/* Like Back Button */}
                      <button
                        onClick={() => handleAction(item.id, "match")}
                        disabled={processingId === item.id}
                        className="btn text-white flex-grow-1 rounded-pill py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-1"
                        style={{ backgroundColor: "#5c1d24", fontSize: "0.825rem" }}
                      >
                        {processingId === item.id ? (
                          <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                        ) : (
                          <>
                            <i className="bi bi-heart-fill text-danger"></i>
                            Like Back
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty Queue State */
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <div className="mb-3">
                <i className="bi bi-bell-slash fs-1 text-muted opacity-50"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">No Incoming Likes</h5>
              <p className="text-muted small mb-0">
                There are no new user likes awaiting review right now.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminNotifications;