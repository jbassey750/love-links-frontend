
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Form, Alert, Spinner } from "react-bootstrap";
import api from "../../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setMessage(
        response.data.message ||
          "If an account exists with that email, a password-reset link will be sent shortly."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again."
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
            Forgot your password?
          </h2>

          <p className="text-secondary mb-0" style={{ lineHeight: 1.7 }}>
            Don't worry. Enter the email address associated with your
            Enamora account, and we'll send you a link to reset your password.
          </p>
        </div>

        {message && (
          <Alert variant="success" role="status">
            {message}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" role="alert">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4" controlId="forgotPasswordEmail">
            <Form.Label className="fw-semibold">
              Email address
            </Form.Label>

            <Form.Control
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
              className="py-3"
              style={{
                borderRadius: "10px",
                borderColor: "#e6dcd5",
                boxShadow: "none",
              }}
            />
          </Form.Group>

          <Button
            type="submit"
            disabled={loading}
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
                Sending reset link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <Link
            to="/"
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

export default ForgotPassword;
