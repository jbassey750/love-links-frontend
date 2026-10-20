
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Form, Alert, Spinner } from "react-bootstrap";
import api from "../../api/axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("This password-reset link is invalid.");
      return;
    }

    if (password.length < 6) {
      setError("Your password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        `/auth/reset-password/${encodeURIComponent(token)}`,
        { password, confirmPassword }
      );

      setSuccess(
        response.data.message ||
          "Your password has been reset successfully."
      );

      setPassword("");
      setConfirmPassword("");

      // Give the user a moment to read the success message.
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset your password. Please request a new link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-5"
      style={{ backgroundColor: "#fbf6f0" }}
    >
      <div
        className="bg-white w-100 p-4 p-md-5"
        style={{
          maxWidth: "460px",
          borderRadius: "20px",
          boxShadow: "0 8px 35px rgba(0,0,0,0.07)",
        }}
      >
        <div className="text-center mb-4">
          <h1
            className="mb-2"
            style={{
              fontFamily: "Georgia, serif",
              color: "#801931",
              fontSize: "2.3rem",
            }}
          >
            Enamora
          </h1>

          <div
            className="mx-auto mb-4"
            style={{
              width: "55px",
              height: "3px",
              backgroundColor: "#ba7252",
              borderRadius: "5px",
            }}
          />

          <h2
            className="mb-3"
            style={{
              fontFamily: "Georgia, serif",
              color: "#333333",
              fontSize: "1.7rem",
            }}
          >
            Create a New Password
          </h2>

          <p className="text-secondary" style={{ lineHeight: 1.7 }}>
            Choose a new password for your Enamora account. Make sure
            you can remember it.
          </p>
        </div>

        {error && (
          <Alert variant="danger" role="alert">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" role="status">
            {success}
            <div className="small mt-1">
              Redirecting you to login...
            </div>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="newPassword">
            <Form.Label className="fw-semibold">
              New password
            </Form.Label>

            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
              disabled={loading || Boolean(success)}
              className="py-3"
              style={{
                borderRadius: "10px",
                borderColor: "#e6dcd5",
                boxShadow: "none",
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="confirmNewPassword">
            <Form.Label className="fw-semibold">
              Confirm new password
            </Form.Label>

            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
              disabled={loading || Boolean(success)}
              className="py-3"
              style={{
                borderRadius: "10px",
                borderColor: "#e6dcd5",
                boxShadow: "none",
              }}
            />
          </Form.Group>

          <Form.Check
            type="checkbox"
            id="showResetPassword"
            label="Show passwords"
            className="mb-4"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            disabled={loading || Boolean(success)}
          />

          <Button
            type="submit"
            disabled={loading || Boolean(success)}
            className="w-100 py-3 border-0 fw-semibold"
            style={{
              backgroundColor: "#801931",
              borderRadius: "10px",
            }}
          >
            {loading ? (
              <>
                <Spinner
                  size="sm"
                  animation="border"
                  className="me-2"
                />
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="text-decoration-none fw-semibold"
            style={{ color: "#801931" }}
          >
            ← Back to Login
          </Link>
        </div>

        <p className="text-center text-secondary small mt-4 mb-0">
          Where meaningful connections begin ❤️
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
