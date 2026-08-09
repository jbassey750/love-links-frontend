import React from "react";

const WaitingScreen = () => {
  return (
    <div className="my-4 d-flex justify-content-center">
      <div
        className="card border-0 shadow-sm px-4 py-3 rounded-pill d-flex flex-row align-items-center gap-3 bg-white"
        style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(255, 255, 255, 0.95)" }}
      >
        <div className="spinner-border text-danger spinner-border-sm" style={{ color: "#5c1d24" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="fw-medium text-dark" style={{ fontSize: "0.9rem" }}>
          Waiting for a new message to arrive...
        </span>
      </div>
    </div>
  );
};

export default WaitingScreen;