import React from "react";

const WaitingOverlay = () => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center h-100"
      style={{
        minHeight: "calc(100vh - 80px)",
        background: "#f8f9fa",
      }}
    >
      <div
        className="card border-0 shadow-lg text-center p-5"
        style={{
          maxWidth: "500px",
          width: "100%",
          borderRadius: "20px",
        }}
      >
        <div
          className="spinner-border mb-4"
          style={{
            width: "4rem",
            height: "4rem",
            color: "#5c1d24",
          }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>

        <h3 className="fw-bold mb-3">
          Waiting for a New Conversation
        </h3>

        <p className="text-muted mb-4">
          Your last reply has been sent successfully.
          <br />
          The system is waiting for the next user message.
        </p>

        <div
          className="alert border-0 mb-0"
          style={{
            backgroundColor: "#f4ecec",
            color: "#5c1d24",
          }}
        >
          The next available conversation will appear automatically.
          You do not need to refresh this page.
        </div>
      </div>
    </div>
  );
};

export default WaitingOverlay;