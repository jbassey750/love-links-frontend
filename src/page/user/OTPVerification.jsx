import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Pulled from login page redirect: navigate("/otp-verification", { state: { userId, email } })
  const { userId, email } = location.state || {};

  // Redirect back to login if someone lands here without going through login first
  useEffect(() => {
    if (!userId) {
      navigate("/");
    }
  }, [userId, navigate]);

  // Resend Countdown Timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-focus next input field on typing
  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace navigation between inputs
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle Paste event for full 6-digit OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasteData)) return;

    const digits = pasteData.slice(0, 6).split("");
    const newOtp = ["", "", "", "", "", ""];
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);

    if (digits.length > 0) {
      const focusIndex = Math.min(digits.length, 5);
      inputRefs.current[focusIndex].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) return;

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const response = await api.post("/otp/verify", {
        userId,
        otp: fullOtp,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      setSuccessMessage("Verification successful!");

      // Redirect based on user role, same logic as login
      const user = response.data.user;
      setTimeout(() => {
        if (user?.role === "moderator") {
          navigate("/moderator/workspace");
        } else if (user?.role === "admin") {
          navigate("/admin/dashboard");
        } else if (user?.accountType === "fake") {
          navigate("/admin/fake-accounts/dashboard");
        } else {
          navigate("/discover");
        }
      }, 800);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Invalid or expired code. Please try again."
      );
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      // Re-triggers OTP generation on the backend (adjust endpoint if you have a dedicated one)
      await api.post("/otp/send", { userId });
      setSuccessMessage("A new code has been sent.");
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Couldn't resend code. Try again shortly."
      );
    }

    setOtp(["", "", "", "", "", ""]);
    setTimer(30);
    setCanResend(false);
    inputRefs.current[0].focus();
  };

  return (
    <div className="vw-100 vh-100 m-0 p-0 overflow-hidden bg-white">
      <div className="row g-0 h-100 w-100">
        
        {/* Left Side: Full-Height Lovers Image Banner */}
        <div className="col-12 col-lg-6 position-relative d-none d-lg-block h-100">
          <img
            src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&auto=format&fit=crop"
            alt="Two Lovers"
            className="w-100 h-100 object-fit-cover"
          />
          <div
            className="position-absolute bottom-0 start-0 end-0 p-5 text-white"
            style={{
              background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
            }}
          >
            <h2 className="fw-bold mb-2 text-white">Connect Heart to Heart</h2>
            <p className="lead text-white-50 mb-0 fs-6">
              Verify your security code to continue discovering meaningful connections and instant matches.
            </p>
          </div>
        </div>

        {/* Right Side: Full-Screen OTP Form Container */}
        <div className="col-12 col-lg-6 h-100 d-flex flex-column justify-content-center align-items-center bg-white p-4 p-md-5">
          <div className="w-100" style={{ maxWidth: "460px" }}>
            
            {/* Header Icon & Text */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm"
                style={{
                  width: "72px",
                  height: "72px",
                  backgroundColor: "#fdf2f4",
                  color: "#5c1d24",
                }}
              >
                <i className="bi bi-shield-lock-fill fs-2"></i>
              </div>
              <h3 className="fw-bold text-dark mb-2">Verification Code</h3>
              <p className="text-muted small mb-0 px-2">
                Please enter the 6-digit security PIN sent to{" "}
                {email ? <strong>{email}</strong> : "your email address"}.
              </p>
            </div>

            {/* Success Alert */}
            {successMessage && (
              <div className="alert alert-success border-0 text-center small rounded-3 py-2.5 mb-4 shadow-sm">
                <i className="bi bi-check-circle-fill me-1"></i>
                {successMessage}
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <div className="alert alert-danger border-0 text-center small rounded-3 py-2.5 mb-4 shadow-sm">
                <i className="bi bi-exclamation-circle-fill me-1"></i>
                {errorMessage}
              </div>
            )}

            {/* 6-Digit OTP Form */}
            <form onSubmit={handleVerify}>
              <div
                className="d-flex justify-content-between gap-1 gap-sm-2 mb-4"
                onPaste={handlePaste}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="form-control text-center fw-bold fs-4 rounded-3 shadow-none p-0"
                    style={{
                      width: "14%",
                      height: "62px",
                      borderColor: digit ? "#5c1d24" : "#dee2e6",
                      backgroundColor: digit ? "#fdf2f4" : "#ffffff",
                    }}
                  />
                ))}
              </div>

              {/* Submit / Verify Button */}
              <button
                type="submit"
                disabled={otp.join("").length < 6 || isVerifying}
                className="btn text-white w-100 py-3 rounded-pill fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-4"
                style={{ backgroundColor: "#5c1d24", fontSize: "0.95rem" }}
              >
                {isVerifying ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm text-light"
                      role="status"
                    ></div>
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>
            </form>

            {/* Resend OTP Controls */}
            <div className="text-center">
              <p className="text-muted small mb-0">
                Didn't receive the code?{" "}
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="btn btn-link text-decoration-none p-0 fw-bold border-0 align-baseline"
                    style={{ color: "#5c1d24", fontSize: "0.875rem" }}
                  >
                    Resend Code
                  </button>
                ) : (
                  <span className="fw-semibold text-dark">
                    Resend in <span style={{ color: "#5c1d24" }}>{timer}s</span>
                  </span>
                )}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default OTPVerification;