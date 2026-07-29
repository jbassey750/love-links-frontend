import React from "react";
// import Footer from "./Footer";

const MOCK_MATCHES = [
  {
    id: 1,
    name: "Isabelle",
    age: 28,
    badge: "Romance",
    badgeClass: "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-10",
    timeAgo: "2 days ago",
    distance: "2.1 km away",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    isLocked: true,
    verified: true
  },
  {
    id: 2,
    name: "Nora",
    age: 26,
    badge: "Friends",
    badgeClass: "bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10",
    timeAgo: "5 hours ago",
    distance: "1.4 km away",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
    isLocked: false,
    verified: false
  },
  {
    id: 3,
    name: "Remy",
    age: 34,
    badge: "Romance",
    badgeClass: "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-10",
    timeAgo: "Yesterday",
    distance: "6.2 km away",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150",
    isLocked: true,
    verified: true
  }
];

const Matches = () => {
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#fbf6f0" }}>
      
      {/* Custom Matches Sub-Navbar Header */}
      {/* Main Container Wrapper */}
      <main className="flex-grow-1 px-4 py-2 mx-auto w-100" style={{ maxWidth: "1200px" }}>
        <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
          {MOCK_MATCHES.length} Matches
        </h6>

        {/* Rows stack container loops */}
        <div className="d-flex flex-column gap-3">
          {MOCK_MATCHES.map((match) => (
            <div 
              key={match.id} 
              className="card border-0 rounded-4 shadow-sm bg-white p-3 d-flex flex-row align-items-center justify-content-between"
              style={{ border: "1px solid rgba(0,0,0,0.03)" }}
            >
              {/* Profile identity group info wrapper structure */}
              <div className="d-flex align-items-center gap-3">
                <div className="position-relative">
                  <img 
                    src={match.image} 
                    alt={match.name} 
                    className="rounded-3 object-cover" 
                    style={{ width: "56px", height: "56px", objectFit: "cover" }}
                  />
                  {match.verified && (
                    <span className="position-absolute bottom-0 end-0 translate-middle-x bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "16px", height: "16px", bottom: "-2px", right: "-6px" }}>
                      <i className="bi bi-patch-check-fill text-primary" style={{ fontSize: "0.75rem" }}></i>
                    </span>
                  )}
                </div>

                <div>
                  <div className="d-flex align-items-center gap-2 mb-0.5">
                    <h5 className="m-0 fs-6 fw-bold text-dark" style={{ fontFamily: "Georgia, serif" }}>
                      {match.name}, {match.age}
                    </h5>
                    <span className={`badge rounded-pill px-2 py-0.5 fw-semibold`} style={{ fontSize: "0.65rem", ...parseBadgeStyles(match.badge) }}>
                      {match.badge}
                    </span>
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                    <span>{match.timeAgo}</span>
                    <span className="mx-1.5">•</span>
                    <span>{match.distance}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic contextual Action Control button interaction setups */}
              <div>
                {match.isLocked ? (
                  <button className="btn bg-light rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5 border" style={{ fontSize: "0.8rem", fontWeight: "600" }}>
                    <i className="bi bi-lock-fill text-dark fs-6 opacity-75"></i>
                    <span className="text-warning">₿</span>
                    <span className="text-dark">Unlock</span>
                  </button>
                ) : (
                  <button className="btn rounded-pill px-4 py-1.5 d-flex align-items-center gap-1.5 text-white" style={{ backgroundColor: "#5c1d24", fontSize: "0.8rem", fontWeight: "600" }}>
                    <i className="bi bi-chat-left-text fs-6"></i>
                    <span>Chat</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      </main>

      {/* Persistent global app layout navigation tab section */}
      {/* <Footer /> */}
    </div>
  );
};

// Simple helper fallback injector map configurations
const parseBadgeStyles = (type) => {
  if (type === "Romance") {
    return { color: "#dc3545", backgroundColor: "rgba(220, 53, 69, 0.1)", borderColor: "rgba(220, 53, 69, 0.2)" };
  }
  return { color: "#0d6efd", backgroundColor: "rgba(13, 110, 253, 0.1)", borderColor: "rgba(13, 110, 253, 0.2)" };
};

export default Matches;