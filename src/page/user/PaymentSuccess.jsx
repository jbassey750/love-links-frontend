import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "failed"
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const transactionId = searchParams.get("transaction_id");

      if (!transactionId) {
        setStatus("failed");
        setMessage("Missing transaction reference.");
        return;
      }

      try {
        const response = await api.get(
          `/payments/verify?transaction_id=${transactionId}`
        );

        setStatus("success");
        setMessage(response.data.message);
        setPoints(response.data.points);
      } catch (error) {
        setStatus("failed");
        setMessage(
          error.response?.data?.message || "Payment verification failed."
        );
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "#FAF6F0" }}
    >
      <div className="text-center p-4" style={{ maxWidth: "420px" }}>
        {status === "verifying" && (
          <>
            <div
              className="spinner-border mb-3"
              style={{ color: "#73112D" }}
              role="status"
            ></div>
            <h4 className="fw-bold text-dark">Verifying your payment...</h4>
            <p className="text-muted">Please don't close this page.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: "70px",
                height: "70px",
                backgroundColor: "#DCFCE7",
              }}
            >
              <i className="bi bi-check-lg fs-2 text-success"></i>
            </div>
            <h4 className="fw-bold text-dark">Payment Successful!</h4>
            <p className="text-muted">{message}</p>
            {points !== null && (
              <p className="fw-bold" style={{ color: "#73112D" }}>
                New balance: {points} Points
              </p>
            )}
            <button
              className="btn text-white rounded-pill px-4 py-2 mt-3"
              style={{ backgroundColor: "#73112D" }}
              onClick={() => navigate("/buy-coins")}
            >
              Back to Chat Points
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: "70px",
                height: "70px",
                backgroundColor: "#FEE2E2",
              }}
            >
              <i className="bi bi-x-lg fs-2 text-danger"></i>
            </div>
            <h4 className="fw-bold text-dark">Payment Failed</h4>
            <p className="text-muted">{message}</p>
            <button
              className="btn text-white rounded-pill px-4 py-2 mt-3"
              style={{ backgroundColor: "#73112D" }}
              onClick={() => navigate("/buy-coins")}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;