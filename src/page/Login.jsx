import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import updateUserLocation from "../utils/updateUserLocation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });

      // Save access token
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      await updateUserLocation();

      // Redirect based on user role
      const user = response.data.user;

      if (user?.role === "moderator") {
        navigate("/moderator/workspace"); 
      } else if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user?.accountType === "fake") {
        navigate("/admin/fake-accounts/dashboard"); 
      } else {
        navigate("/discover");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ backgroundColor: "#fbf6f0" }}
    >
      {/* Top Banner with Background Image & Blur */}
      <div
        className="w-100 position-relative d-flex align-items-center justify-content-center"
        style={{
          height: "280px",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        {/* Subtle dark gradient overlay to ensure text stands out */}
        <div
          className="position-absolute start-0 top-0 w-100 h-100"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.65))",
          }}
        />

        {/* Branding Logo & Tagline */}
        <div className="text-center text-white position-relative z-3">
          <h1
            className="m-0 fs-2 fw-bold d-flex align-items-center justify-content-center gap-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <i className="bi bi-heart-fill fs-4 text-white"></i> Enamora
          </h1>
          <p
            className="text-uppercase tracking-widest m-0 mt-1 fw-bold"
            style={{ fontSize: "0.55rem", letterSpacing: "2.5px" }}
          >
            Find Your Person
          </p>
        </div>
      </div>

      {/* Form Area */}
      <main
        className="flex-grow-1 container px-4 py-4 d-flex flex-column justify-content-between mx-auto"
        style={{ maxWidth: "680px" }}
      >
        <form onSubmit={handleSubmit} className="w-100">
          {/* Header Title */}
          <div className="mb-4">
            <h2
              className="fs-3 fw-bold text-dark m-0"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Welcome back
            </h2>
            <p className="text-muted m-0 mt-1" style={{ fontSize: "0.85rem" }}>
              Sign in to continue your journey.
            </p>
          </div>

          {/* Feedback Display */}
          {error && (
            <div
              className="alert alert-danger py-2 px-3 mb-3 rounded-3"
              style={{ fontSize: "0.85rem" }}
            >
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="mb-3">
            <label
              className="text-uppercase text-muted fw-bold mb-1.5 d-block"
              style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
            >
              Email
            </label>
            <input
              type="email"
              className="form-control border-0 px-3 py-2.5 rounded-3"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                backgroundColor: "#efeae4",
                fontSize: "0.85rem",
                outline: "none",
              }}
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label
              className="text-uppercase text-muted fw-bold mb-1.5 d-block"
              style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
            >
              Password
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control border-0 px-3 py-2.5 rounded-3 pe-5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  backgroundColor: "#efeae4",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn position-absolute end-0 top-50 translate-middle-y text-muted border-0 p-0 me-3 bg-transparent"
                style={{ outline: "none" }}
              >
                <i
                  className={`bi bi-${showPassword ? "eye-slash-fill" : "eye-fill"}`}
                  style={{ fontSize: "0.95rem" }}
                ></i>
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn w-100 py-2.5 rounded-3 border-0 text-white fw-semibold mb-3 shadow-sm"
            style={{ backgroundColor: "#78142c", fontSize: "0.85rem" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* Divider line "or" */}
          <div className="position-relative text-center my-4">
            <hr className="text-muted opacity-25 m-0" />
            <span
              className="position-absolute start-50 translate-middle px-3 text-muted"
              style={{
                backgroundColor: "#fbf6f0",
                fontSize: "0.75rem",
                top: "50%",
              }}
            >
              or
            </span>
          </div>

          {/* Create an Account Button */}
          <Link
            to="/register"
            className="btn w-100 py-2.5 rounded-3 bg-white border text-dark fw-semibold shadow-sm text-decoration-none d-block text-center"
            style={{ fontSize: "0.85rem", borderColor: "rgba(0,0,0,0.08)" }}
          >
            Create an account
          </Link>
        </form>

        {/* Footer legal text */}
        <footer
          className="text-center text-muted mt-5"
          style={{ fontSize: "0.65rem" }}
        >
          By continuing you agree to our{" "}
          <a href="/terms" className="text-decoration-underline text-muted">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-decoration-underline text-muted">
            Privacy Policy
          </a>
          .
        </footer>
      </main>
    </div>
  );
};

export default Login;
