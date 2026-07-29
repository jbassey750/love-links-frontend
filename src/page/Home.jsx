import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Loader from "../components/Loader"; // Ensure Loader.jsx is in the same directory
// import Navbar from "./Navbar";
// import Footer from "./Footer";

// Mock Profile Data representing your new home layout
const MOCK_PROFILES = [
  {
    id: 1,
    name: "Mateo",
    age: 31,
    distance: "4.7 km away",
    badge: "Love & Friends",
    badgeColor: "text-purple border-purple bg-purple-light", 
    bio: "Architect who builds things and breaks routines. Let's get coffee and get lost in a new neighborhood.",
    tags: ["Architecture", "Coffee", "Travel"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 2,
    name: "Isabelle",
    age: 28,
    distance: "2.1 km away",
    badge: "Romance",
    badgeColor: "text-danger border-danger bg-danger-light",
    bio: "Sommelier by day, stargazer by night. Looking for someone who appreciates slow evenings and good conversation.",
    tags: ["Wine", "Astronomy", "Hiking"],
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000"
  }
];

const Discover = ({ location = "Amsterdam" }) => {
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProfile = MOCK_PROFILES[currentIndex]; 

  // Simulate data fetching on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Displays loader for 1.5s

    return () => clearTimeout(timer);
  }, []);

  const handleNextProfile = () => {
    if (currentIndex < MOCK_PROFILES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Cycle back to start
    }
  };

  // Helper to dynamically set custom colors based on profile badges
  const getBadgeStyles = (badge) => {
    if (badge === "Love & Friends") {
      return {
        color: "#b55fe6",
        borderColor: "rgba(181, 95, 230, 0.3)",
        backgroundColor: "rgba(181, 95, 230, 0.15)"
      };
    }
    return {
      color: "#dc3545",
      borderColor: "rgba(220, 53, 69, 0.3)",
      backgroundColor: "rgba(220, 53, 69, 0.15)"
    };
  };

  // Show Loader while data is loading
  if (loading) {
    return <Loader message="Finding profiles near you" fullScreen={true} />;
  }

  return (
    <div className="d-flex flex-column" style={{ backgroundColor: "#fbf6f0", minHeight: "100%" }}>
      <Helmet>
        <title>Amour - Find Your Person</title>
        <meta name="description" content="Discover real connections near you." />
      </Helmet>

      {/* Top Navbar */}
      {/* <Navbar location="Amsterdam" /> */}

      {/* Profile Card Viewport Workspace - Edge to edge layout */}
      <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-start p-0 px-md-3 position-relative" style={{ minHeight: "100%" }}>
        {currentProfile ? (
          <div className="w-100 h-100 position-relative d-flex flex-column" style={{ maxWidth: "1000px", minHeight: "100%" }}>
            
            {/* Main Full-Bleed Profile Banner Card */}
            <div 
              className="card border-0 rounded-0 rounded-md-4 overflow-hidden text-white shadow-sm position-relative mb-0 mb-md-3 flex-grow-1"
              style={{ 
                minHeight: "calc(100vh - 136px)",
                backgroundImage: `url(${currentProfile.image})`,
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundColor: "#2c2c2c"
              }}
            >
              {/* Dark Gradient Overlay for legible baseline text */}
              <div 
                className="position-absolute w-100 h-100" 
                style={{ 
                  background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.15) 100%)",
                  top: 0, left: 0 
                }}
              ></div>

              {/* Information Overlay */}
              <div className="position-absolute bottom-0 start-0 end-0 p-4 pb-5 pb-md-4 z-3">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h2 className="m-0 fs-2 fs-md-3 fw-bold" style={{ fontFamily: "Georgia, serif" }}>
                    {currentProfile.name}, {currentProfile.age}
                  </h2>
                  <i className="bi bi-patch-check-fill text-primary fs-5"></i>
                </div>

                <div className="d-flex align-items-center gap-2 mb-3" style={{ fontSize: "0.85rem" }}>
                  <span className="opacity-75">
                    <i className="bi bi-geo-alt-fill me-1"></i>{currentProfile.distance}
                  </span>
                  
                  {/* Context Badge */}
                  <span 
                    className="badge rounded-pill border py-1 px-2.5 fw-semibold"
                    style={getBadgeStyles(currentProfile.badge)}
                  >
                    {currentProfile.badge}
                  </span>
                </div>

                <p className="card-text mb-3 opacity-90 fw-light" style={{ maxWidth: "750px", fontSize: "0.95rem", lineHeight: "1.4" }}>
                  {currentProfile.bio}
                </p>

                {/* Profile Pill Metadata Tags */}
                <div className="d-flex flex-wrap gap-2">
                  {currentProfile.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="badge bg-white bg-opacity-10 rounded-pill px-3 py-1.5 fw-normal text-white border border-light border-opacity-10" 
                      style={{ fontSize: "0.75rem", backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Swiper Layout Control Panel Buttons Floating Above Footer */}
            <div className="d-flex justify-content-center align-items-center gap-2 position-absolute start-50 translate-middle-x" style={{ zIndex: 10, bottom: "20px" }}>
              <button onClick={handleNextProfile} className="btn bg-white rounded-circle shadow border d-flex align-items-center justify-content-center" style={{ width: "44px", height: "44px" }}>
                <i className="bi bi-x-lg text-danger fs-5"></i>
              </button>
              
              <button className="btn bg-white rounded-circle shadow border d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px" }}>
                <i className="bi bi-star text-warning fs-6"></i>
              </button>
              
              <button onClick={handleNextProfile} className="btn rounded-circle shadow d-flex align-items-center justify-content-center" style={{ width: "56px", height: "56px", backgroundColor: "#5c1d24" }}>
                <i className="bi bi-heart-fill text-white fs-4"></i>
              </button>
              
              <button className="btn bg-white rounded-circle shadow border d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px" }}>
                <i className="bi bi-lightning-charge text-warning fs-6"></i>
              </button>
            </div>

          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-people fs-1 text-muted"></i>
            <p className="mt-2 text-muted fw-medium">Looking for new people...</p>
          </div>
        )}
      </main>

      {/* App Tab Control footer */}
      {/* <Footer /> */}
    </div>
  );
};

export default Discover;