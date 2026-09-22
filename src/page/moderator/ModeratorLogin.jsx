import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ModeratorLogin = () => {
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

    console.debug("[Moderator Login] Login submit", { email });

    try {
      const response = await api.post("/auth/moderator-login", {
        email,
        password,
      });

      console.debug(
        "[Moderator Login] Login response",
        response.data
      );

      // Make sure a token exists
      if (!response.data.token) {
        setError("Login failed. No authentication token was returned.");
        return;
      }

      // Make sure this account is actually a moderator
      const user = response.data.user;

      if (user?.role !== "moderator") {
        setError("This login page is for moderators only.");
        return;
      }

      // Store moderator token
      localStorage.setItem("token", response.data.token);

      // Go directly to moderator workspace
      navigate("/moderator/workspace", { replace: true });
    } catch (err) {
      const backendMessage = err.response?.data?.message;

      console.error("[Moderator Login] Login error", {
        status: err.response?.status,
        message: err.message,
        response: err.response?.data,
        url: err.config?.url,
        baseURL: err.config?.baseURL,
      });

      setError(
        backendMessage ||
          `Login failed${
            err.response?.status
              ? ` (${err.response.status})`
              : ""
          }: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        backgroundColor: "#fbf6f0",
      }}
    >
      {/* Top Banner */}
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
        {/* Dark Overlay */}
        <div
          className="position-absolute start-0 top-0 w-100 h-100"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.65))",
          }}
        />

        {/* Branding */}
        <div className="text-center text-white position-relative z-3">
          <h1
            className="m-0 fs-2 fw-bold d-flex align-items-center justify-content-center gap-2"
            style={{
              fontFamily: "Georgia, serif",
            }}
          >
            <i className="bi bi-heart-fill fs-4 text-white"></i>
            Enamora
          </h1>

          <p
            className="text-uppercase tracking-widest m-0 mt-1 fw-bold"
            style={{
              fontSize: "0.55rem",
              letterSpacing: "2.5px",
            }}
          >
            Moderator Portal
          </p>
        </div>
      </div>

      {/* Form Area */}
      <main
        className="flex-grow-1 container px-4 py-4 d-flex flex-column justify-content-between mx-auto"
        style={{
          maxWidth: "680px",
        }}
      >
        <form onSubmit={handleSubmit} className="w-100">
          {/* Header */}
          <div className="mb-4">
            <h2
              className="fs-3 fw-bold text-dark m-0"
              style={{
                fontFamily: "Georgia, serif",
              }}
            >
              Moderator Sign In
            </h2>

            <p
              className="text-muted m-0 mt-1"
              style={{
                fontSize: "0.85rem",
              }}
            >
              Sign in to access the moderator workspace.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="alert alert-danger py-2 px-3 mb-3 rounded-3"
              style={{
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-3">
            <label
              className="text-uppercase text-muted fw-bold mb-1.5 d-block"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
              }}
            >
              Email
            </label>

            <input
              type="email"
              className="form-control border-0 px-3 py-2.5 rounded-3"
              placeholder="moderator@example.com"
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

          {/* Password */}
          <div className="mb-4">
            <label
              className="text-uppercase text-muted fw-bold mb-1.5 d-block"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
              }}
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
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="btn position-absolute end-0 top-50 translate-middle-y text-muted border-0 p-0 me-3 bg-transparent"
                style={{
                  outline: "none",
                }}
              >
                <i
                  className={`bi bi-${
                    showPassword
                      ? "eye-slash-fill"
                      : "eye-fill"
                  }`}
                  style={{
                    fontSize: "0.95rem",
                  }}
                ></i>
              </button>
            </div>
          </div>

          {/* Sign In */}
          <button
            type="submit"
            disabled={loading}
            className="btn w-100 py-2.5 rounded-3 border-0 text-white fw-semibold mb-3 shadow-sm"
            style={{
              backgroundColor: "#78142c",
              fontSize: "0.85rem",
            }}
          >
            {loading
              ? "Signing in..."
              : "Sign in as Moderator"}
          </button>

          {/* Moderator Notice */}
          <div
            className="rounded-3 p-3 text-center"
            style={{
              backgroundColor: "#efeae4",
              fontSize: "0.75rem",
            }}
          >
            <i className="bi bi-shield-check me-1"></i>
            This portal is restricted to authorized moderators.
          </div>
        </form>

        {/* Footer */}
        <footer
          className="text-center text-muted mt-5"
          style={{
            fontSize: "0.65rem",
          }}
        >
          Authorized moderator access only.
        </footer>
      </main>
    </div>
  );
};

export default ModeratorLogin;