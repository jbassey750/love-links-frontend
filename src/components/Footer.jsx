import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-top py-2 px-4 shadow-sm position-fixed bottom-0 start-0 end-0" style={{ zIndex: 1030 }}>
      <div className="d-flex justify-content-around align-items-center mx-auto" style={{ maxWidth: "600px" }}>
        
        <Link to="/discover" className="btn d-flex flex-column align-items-center gap-1 text-danger fw-bold text-decoration-none" style={{ fontSize: "0.7rem" }}>
          <i className="bi bi-globe fs-4"></i>
          {/* <span className="text-uppercase">Discover</span> */}
        </Link>
        
        <Link to="/matches" className="btn d-flex flex-column align-items-center gap-1 text-muted position-relative text-decoration-none" style={{ fontSize: "0.7rem" }}>
          <i className="bi bi-heart-fill fs-4"></i>
          <span className="position-absolute top-1 start-50 translate-middle-x badge rounded-circle bg-warning text-dark fw-bold px-1" style={{ fontSize: "0.6rem", marginLeft: "10px" }}>2</span>
          {/* <span className="text-uppercase fw-semibold">Matches</span> */}
        </Link>
        
        <Link to="/conversations" className="btn d-flex flex-column align-items-center gap-1 text-muted text-decoration-none" style={{ fontSize: "0.7rem" }}>
          <i className="bi bi-chat-dots fs-4"></i>
          {/* <span className="text-uppercase fw-semibold">Messages</span> */}
        </Link>
        
        <Link to="/profile" className="btn d-flex flex-column align-items-center gap-1 text-muted text-decoration-none" style={{ fontSize: "0.7rem" }}>
          <i className="bi bi-person fs-4"></i>
          {/* <span className="text-uppercase fw-semibold">Profile</span>  */}
        </Link>

      </div>
    </footer>
  );
};

export default Footer;