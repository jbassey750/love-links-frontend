import React from "react";
// import Footer from "./Footer";

const MOCK_USER = {
  name: "Alex",
  age: 30,
  location: "Amsterdam",
  badge: "Love & Friends",
  avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
  stats: {
    matches: 14,
    chats: 3,
    btcSpent: "0.000141",
    points: 120
  },
  about: "Software engineer, amateur baker, chronic overthinker. Here to meet real people.",
  interests: ["Coffee", "Bouldering", "Cooking", "Philosophy"],
  bitcoinActivity: [
    { id: 1, action: "Nora unlocked", amount: "-0.000047 BTC", date: "Jun 24" },
    { id: 2, action: "Isabelle unlocked", amount: "-0.000047 BTC", date: "Jun 20" },
    { id: 3, action: "Remy unlocked", amount: "-0.000047 BTC", date: "Jun 18" }
  ]
};

const Profile = () => {
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#fbf6f0" }}>
      
      {/* Top Profile Branding Navbar */}

      {/* Main Single Profile Page View Content Panel Wrapper */}
      <main className="flex-grow-1 px-4 pb-5 mx-auto w-100" style={{ maxWidth: "1200px" }}>
        
        {/* Hero Cover Top Header Banner Strip Layer */}
        <div 
          className="w-100 rounded-top-4 position-relative" 
          style={{ 
            height: "220px", 
            background: "linear-gradient(to right, #801931 0%, #ba7252 60%, #cca37a 100%)" 
          }}
        >
          {/* Absolute Center Floating Profile User Thumbnail Avatar Frame Profile Photo */}
          <div 
            className="position-absolute start-50 translate-middle"
            style={{ top: "100%", zIndex: 5 }}
          >
            <img 
              src={MOCK_USER.avatar} 
              alt={MOCK_USER.name} 
              className="rounded-4 border border-4 border-white shadow-sm bg-white"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Identity Headings Stack Title Label Frame */}
        <div className="text-center pt-5 mt-3 mb-4">
          <h2 className="m-0 fs-4 fw-bold text-dark" style={{ fontFamily: "Georgia, serif" }}>
            {MOCK_USER.name}, {MOCK_USER.age}
          </h2>
          <div className="text-muted d-flex align-items-center justify-content-center gap-1 my-1" style={{ fontSize: "0.85rem" }}>
            <i className="bi bi-geo-alt-fill"></i>
            <span>{MOCK_USER.location}</span>
          </div>
          <span 
            className="badge rounded-pill fw-semibold mt-1"
            style={{ 
              color: "#b55fe6", 
              backgroundColor: "rgba(181, 95, 230, 0.1)", 
              fontSize: "0.75rem",
              padding: "5px 12px"
            }}
          >
            {MOCK_USER.badge}
          </span>
        </div>

        {/* Top 3 Columns Metric Stats Counters Dashboard Dashboard Strip Layout Block */}
        <div className="row g-3 mb-4">
          <div className="col-4">
            <div className="card border-0 rounded-3 shadow-sm bg-white text-center py-3">
              <span className="fs-5 fw-bold text-dark d-block" style={{ fontFamily: "Georgia, serif" }}>{MOCK_USER.stats.matches}</span>
              <small className="text-uppercase text-muted tracking-wide fw-bold" style={{ fontSize: "0.55rem" }}>Matches</small>
            </div>
          </div>
          <div className="col-4">
            <div className="card border-0 rounded-3 shadow-sm bg-white text-center py-3">
              <span className="fs-5 fw-bold text-dark d-block" style={{ fontFamily: "Georgia, serif" }}>{MOCK_USER.stats.chats}</span>
              <small className="text-uppercase text-muted tracking-wide fw-bold" style={{ fontSize: "0.55rem" }}>Chats</small>
            </div>
          </div>
          <div className="col-4">
            <div className="card border-0 rounded-3 shadow-sm bg-white text-center py-3">
              <span className="fs-5 fw-bold text-dark d-block" style={{ fontFamily: "Georgia, serif" }}>{MOCK_USER.stats.points}</span>
              <small className="text-uppercase text-muted tracking-wide fw-bold" style={{ fontSize: "0.55rem" }}>points</small>
            </div>
          </div>
        </div>

        {/* Informational Cards Panels Layout Section Wrapper Container */}
        <div className="d-flex flex-column gap-3 mb-4">
          
          {/* About Section Card */}
          <div className="card border-0 rounded-3 shadow-sm bg-white p-3">
            <h6 className="text-uppercase text-muted fw-bold mb-2.5" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>About</h6>
            <p className="m-0 text-dark fw-normal opacity-90" style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
              {MOCK_USER.about}
            </p>
          </div>

          {/* Interests Section Card Component Layer */}
          <div className="card border-0 rounded-3 shadow-sm bg-white p-3">
            <h6 className="text-uppercase text-muted fw-bold mb-2.5" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Interests</h6>
            <div className="d-flex flex-wrap gap-2">
              {MOCK_USER.interests.map((interest, idx) => (
                <span 
                  key={idx} 
                  className="badge text-dark rounded-pill border px-3 py-1.5 fw-normal"
                  style={{ 
                    backgroundColor: "#efeae4", 
                    borderColor: "rgba(0,0,0,0.05)",
                    fontSize: "0.75rem"
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Bitcoin Activity Ledger Activity Transaction Records Panel Grid */}

          {/* Secondary Interface Action Footer Sign out Command Control Link Button Row Block */}
          <button 
            className="btn btn-outline-danger w-100 rounded-3 py-2.5 mt-2 bg-white border border-danger border-opacity-20 text-danger fw-semibold"
            style={{ fontSize: "0.85rem", backgroundColor: "rgba(220, 53, 69, 0.02)" }}
          >
            Sign out
          </button>

        </div>
      </main>

      {/* App Nav Controller standard application core footer layer bar template */}
      {/* <Footer /> */}
    </div>
  );
};

export default Profile;