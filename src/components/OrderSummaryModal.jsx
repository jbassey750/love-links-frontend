import React from "react";

const OrderSummaryModal = ({ isOpen, onClose, packageData, onConfirm, isProcessing }) => {
  if (!isOpen || !packageData) return null;

  const handleConfirm = () => {
    onConfirm("card"); // Flutterwave's hosted page handles the actual card entry
  };

  return (
    <div
      className="position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: "rgba(17, 24, 39, 0.65)",
        backdropFilter: "blur(6px)",
        zIndex: 1050,
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg w-100 overflow-hidden border-0"
        style={{ maxWidth: "420px" }}
      >
        {/* Modal Header */}
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
          <h5 className="m-0 fw-bold text-dark" style={{ fontSize: "1rem" }}>
            Order Summary
          </h5>
          <button
            type="button"
            className="btn-close shadow-none"
            onClick={onClose}
            disabled={isProcessing}
          />
        </div>

        {/* Modal Body */}
        <div className="p-4">
          {/* Selected Package Details */}
          <div
            className="p-3 rounded-3 mb-3 border"
            style={{ backgroundColor: "#FDF8FA", borderColor: "#F2E8EE" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fw-bold text-dark">{packageData.name}</span>
              <span className="fw-extrabold fs-5" style={{ color: "#73112D" }}>
                ${packageData.price} {packageData.currency}
              </span>
            </div>
            <div className="text-muted" style={{ fontSize: "0.85rem" }}>
              🪙 {packageData.points} Chat Points
            </div>
            <p className="text-muted m-0 mt-1" style={{ fontSize: "0.78rem" }}>
              {packageData.description}
            </p>
          </div>

          {/* Payment Method Note */}
          <div className="mb-3 d-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-light border">
            <span style={{ fontSize: "1.1rem" }}>💳</span>
            <span className="text-muted" style={{ fontSize: "0.82rem" }}>
              You'll securely enter your card details on the next step.
            </span>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="btn btn-lg w-100 rounded-pill fw-bold text-white shadow-sm py-2.5 border-0"
            style={{
              backgroundColor: "#73112D",
              fontSize: "0.95rem",
            }}
          >
            {isProcessing ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" />
                Redirecting...
              </span>
            ) : (
              `Pay $${packageData.price} ${packageData.currency}`
            )}
          </button>

          <div className="text-center mt-3">
            <small className="text-muted" style={{ fontSize: "0.72rem" }}>
              🔒 Guaranteed 256-Bit SSL Encrypted Checkout
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryModal;