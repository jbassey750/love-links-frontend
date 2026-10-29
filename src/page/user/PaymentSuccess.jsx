import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [purchaseType, setPurchaseType] = useState(null);
  const [points, setPoints] = useState(null);
  const [packageName, setPackageName] = useState("");
  const [plan, setPlan] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [duration, setDuration] = useState(null);
  const [durationUnit, setDurationUnit] = useState("");
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const transactionId = searchParams.get("transaction_id");
      const transactionReference = searchParams.get("tx_ref");
      const flutterwaveStatus = searchParams.get("status");

      if (!transactionId || !transactionReference) {
        setStatus("failed");
        setMessage("Missing payment verification details.");
        return;
      }

      if (
        flutterwaveStatus &&
        flutterwaveStatus.toLowerCase() !== "successful"
      ) {
        setStatus("failed");
        setMessage("The payment was not completed.");
        return;
      }

      try {
        const response = await api.post("/payments/return/verify", {
          transaction_id: transactionId,
          tx_ref: transactionReference,
        });

        const data = response.data;

        if (!data?.success) {
          throw new Error(
            data?.message || "Payment verification failed."
          );
        }

        // Save the type of the most recent successfully verified purchase.
if (
  data.purchaseType === "points" ||
  data.purchaseType === "subscription"
) {
  localStorage.setItem(
    "enamoraLastSuccessfulPurchaseType",
    data.purchaseType
  );
}

        setPurchaseType(data.purchaseType || null);
        setPoints(
          data.purchaseType === "points"
            ? Number(data.pointsAdded ?? 0)
            : null
        );

        setPackageName(data.packageName || "");
        setPlan(data.plan || "");
        setSubscriptionStatus(data.subscriptionStatus || data.status || "");
        setDuration(data.duration ?? null);
        setDurationUnit(data.durationUnit || "");
        setEndDate(data.endDate || null);

        // Use purchase-specific messages rather than a generic
        // "Payment already verified" message.
        if (data.purchaseType === "subscription") {
          const formattedPlan =
            data.plan === "elite"
              ? "Elite"
              : data.plan === "premium"
                ? "Premium"
                : data.packageName || "Subscription";

          setMessage(
            `${formattedPlan} is now active. You can enjoy chatting without spending chat points while your subscription remains active.`
          );
        } else if (data.purchaseType === "points") {
          setMessage(
            data.pointsAdded > 0
              ? "Your payment was successful, and your chat points have been added to your account."
              : "Your points purchase has been verified."
          );
        } else {
          // Older backend responses may not include purchaseType yet.
          setMessage(
            data.message ||
              "Your payment has been verified. Check your account for the purchase details."
          );
        }

        setStatus("success");
      } catch (error) {
        console.error(
          "Payment verification error:",
          error.response?.status || error.message
        );

        setStatus("failed");

        setMessage(
          error.response?.data?.message ||
            error.message ||
            "Payment verification failed."
        );
      }
    };

    verifyPayment();
  }, [searchParams]);

  const formatDuration = () => {
    if (!duration || !durationUnit) return "";

    const unit =
      Number(duration) === 1
        ? durationUnit.replace(/s$/, "")
        : durationUnit;

    return `${duration} ${unit}`;
  };

  const formattedEndDate = endDate
    ? new Date(endDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const isSubscription = purchaseType === "subscription";
  const isPointsPurchase = purchaseType === "points";

  const heading =
    isSubscription
      ? "Subscription Activated!"
      : isPointsPurchase
        ? "Payment Successful!"
        : "Payment Verified!";

  const displayPlan =
    plan === "premium"
      ? "Premium"
      : plan === "elite"
        ? "Elite"
        : packageName;

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
            />

            <h4 className="fw-bold text-dark">
              Verifying your payment...
            </h4>

            <p className="text-muted">
              Please don't close this page.
            </p>
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
              <i className="bi bi-check-lg fs-2 text-success" />
            </div>

            <h4 className="fw-bold text-dark">{heading}</h4>

            <p className="text-muted">{message}</p>

            {isPointsPurchase && points !== null && (
              <div className="my-3">
                <p className="fw-bold mb-1" style={{ color: "#73112D" }}>
                  Points Added: {points} {points === 1 ? "Point" : "Points"}
                </p>

                {packageName && (
                  <p className="small text-muted mb-0">
                    Package: {packageName}
                  </p>
                )}
              </div>
            )}

            {isSubscription && (
              <div
                className="rounded-3 p-3 my-3 text-start"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E8D9D2",
                }}
              >
                <p className="mb-2">
                  <strong>Plan:</strong>{" "}
                  {displayPlan || "Subscription"}
                </p>

                <p className="mb-2">
                  <strong>Status:</strong>{" "}
                  {subscriptionStatus || "Active"}
                </p>

                {duration && durationUnit && (
                  <p className="mb-2">
                    <strong>Duration:</strong> {formatDuration()}
                  </p>
                )}

                {formattedEndDate && (
                  <p className="mb-0">
                    <strong>Expires:</strong> {formattedEndDate}
                  </p>
                )}
              </div>
            )}

            <button
              className="btn text-white rounded-pill px-4 py-2 mt-3"
              style={{ backgroundColor: "#73112D" }}
              onClick={() => navigate("/buy-coins")}
            >
              {isSubscription ? "Back to Enamora" : "Back to Chat Points"}
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
              <i className="bi bi-x-lg fs-2 text-danger" />
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