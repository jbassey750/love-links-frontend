import React, { useState } from "react";

const OrderSummaryModal = ({ isOpen, onClose, packageData, onConfirm, isProcessing }) => {
  const [paymentMethod, setPaymentMethod] = useState("card");

  if (!isOpen || !packageData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(paymentMethod);
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

          {/* Payment Method Switcher */}
          <div className="mb-3">
            <label
              className="form-label text-muted fw-semibold mb-1"
              style={{ fontSize: "0.75rem" }}
            >
              PAYMENT METHOD
            </label>
            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`btn btn-sm flex-fill py-2 rounded-3 fw-medium border ${
                  paymentMethod === "card"
                    ? "border-dark bg-dark text-white"
                    : "bg-light text-muted"
                }`}
                style={{ fontSize: "0.8rem" }}
              >
                💳 Credit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("stripe")}
                className={`btn btn-sm flex-fill py-2 rounded-3 fw-medium border ${
                  paymentMethod === "stripe"
                    ? "border-dark bg-dark text-white"
                    : "bg-light text-muted"
                }`}
                style={{ fontSize: "0.8rem" }}
              >
                📲 Stripe Checkout
              </button>
            </div>
          </div>

          {/* Form / Actions */}
          <form onSubmit={handleSubmit}>
            {paymentMethod === "card" && (
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Card Number"
                  className="form-control form-control-sm rounded-3 py-2 px-3 mb-2 shadow-none border"
                  style={{ backgroundColor: "#FAFAF8", fontSize: "0.85rem" }}
                  required
                />
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      className="form-control form-control-sm rounded-3 py-2 px-3 shadow-none border"
                      style={{ backgroundColor: "#FAFAF8", fontSize: "0.85rem" }}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      placeholder="CVC"
                      className="form-control form-control-sm rounded-3 py-2 px-3 shadow-none border"
                      style={{ backgroundColor: "#FAFAF8", fontSize: "0.85rem" }}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
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
                  Processing...
                </span>
              ) : (
                `Pay $${packageData.price} ${packageData.currency}`
              )}
            </button>
          </form>

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