import React from "react";

const PaymentResultModal = ({ isOpen, onClose, isSuccess, packageData }) => {
  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: "rgba(17, 24, 39, 0.65)",
        backdropFilter: "blur(6px)",
        zIndex: 1100,
      }}
    >
      <div
        className="bg-white rounded-5 p-4 text-center shadow-lg w-100"
        style={{ maxWidth: "360px" }}
      >
        <div
          className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
          style={{
            width: "60px",
            height: "60px",
            backgroundColor: isSuccess ? "#E6F4EA" : "#FCE8E6",
            color: isSuccess ? "#137333" : "#C5221F",
            fontSize: "1.8rem",
          }}
        >
          {isSuccess ? "💖" : "❌"}
        </div>

        <h4 className="fw-bold text-dark mb-1 fs-5">
          {isSuccess ? "Payment Successful!" : "Payment Failed"}
        </h4>

        <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
          {isSuccess
            ? `You've successfully added ${packageData?.points} Chat Points to your account.`
            : "Your transaction could not be completed. Please check your payment details and try again."}
        </p>

        <button
          type="button"
          onClick={onClose}
          className={`btn w-100 rounded-pill py-2.5 fw-bold ${
            isSuccess ? "btn-dark" : "btn-outline-secondary"
          }`}
          style={{ fontSize: "0.85rem" }}
        >
          {isSuccess ? "Continue Chatting" : "Try Again"}
        </button>
      </div>
    </div>
  );
};

export default PaymentResultModal;