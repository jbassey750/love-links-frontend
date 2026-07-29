import React from "react";

const NotFound = () => {
  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-5" 
      style={{ backgroundColor: "#fbf6f0", fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div 
        className="container bg-white rounded-5 border-0 shadow-lg overflow-hidden my-auto" 
        style={{ maxWidth: "1000px" }}
      >
        <div className="row g-0 align-items-center">
          
          {/* Left Column: Illustration / Image */}
          <div className="col-12 col-md-6 p-4 p-lg-5 text-center bg-light-subtle position-relative overflow-hidden">
            <div 
              className="position-absolute top-50 start-50 translate-middle rounded-circle opacity-10"
              style={{ width: "300px", height: "300px", backgroundColor: "#73112d" }}
            ></div>
            <img
              src="https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&q=80&w=800"
              alt="Lost Connection"
              className="img-fluid rounded-4 shadow-sm position-relative z-1 object-cover"
              style={{ maxHeight: "380px", width: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Right Column: Error Text & Action */}
          <div className="col-12 col-md-6 p-4 p-lg-5 d-flex flex-column justify-content-center">
            
            {/* Branding badge */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <span style={{ fontSize: "1.2rem" }}>❤️</span>
              <span className="fw-bold text-uppercase" style={{ color: "#73112d", fontSize: "0.85rem", letterSpacing: "1.5px" }}>
                Amour
              </span>
            </div>

            {/* Error Code & Heading */}
            <h1 
              className="display-1 fw-bold mb-0" 
              style={{ color: "#73112d", fontFamily: "Georgia, serif", lineHeight: "1" }}
            >
              404
            </h1>
            
            <h2 className="fs-3 fw-bold text-dark mt-2 mb-3" style={{ fontFamily: "Georgia, serif" }}>
              Looks like this spark fizzled out!
            </h2>

            {/* Description */}
            <p className="text-muted mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
              The page you are looking for has been moved, removed, or never existed in the first place. Don't worry, your perfect match is still waiting!
            </p>

            {/* Back to Home Button */}
            <div>
              <a
                href="/discover"
                className="btn btn-lg rounded-pill px-4 py-3 fw-semibold shadow-sm text-white d-inline-flex align-items-center gap-2 transition-all"
                style={{ backgroundColor: "#73112d", border: "none", fontSize: "0.95rem" }}
              >
                <i className="bi bi-compass"></i>
                Back to Discover
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default NotFound;