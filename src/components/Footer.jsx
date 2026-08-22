import React from "react";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <footer
      className="bg-white border-top py-2 px-4 shadow-sm position-fixed bottom-0 start-0 end-0"
      style={{ zIndex: 1030 }}
    >
      <div
        className="d-flex justify-content-around align-items-center mx-auto"
        style={{ maxWidth: "600px" }}
      >
        {/* Discover */}
        <Link
          to="/discover"
          className={`btn d-flex flex-column align-items-center gap-1 fw-bold text-decoration-none ${
            isActive("/discover") ? "text-danger" : "text-muted"
          }`}
          style={{ fontSize: "0.7rem" }}
        >
          <i className="bi bi-globe fs-4"></i>
          {/* <span className="text-uppercase">Discover</span> */}
        </Link>

        {/* People */}
        <Link
          to="/more/people"
          className={`btn d-flex flex-column align-items-center gap-1 fw-bold text-decoration-none ${
            isActive("/more/people") ? "text-danger" : "text-muted"
          }`}
          style={{ fontSize: "0.7rem" }}
        >
          <i className="bi bi-people fs-4"></i>
          {/* <span className="text-uppercase">Discover</span> */}
        </Link>

        {/* Messages */}
        <Link
          to="/conversations"
          className={`btn d-flex flex-column align-items-center gap-1 text-decoration-none ${
            isActive("/conversations") ? "text-danger" : "text-muted"
          }`}
          style={{ fontSize: "0.7rem" }}
        >
          <i className="bi bi-chat-dots fs-4"></i>
          {/* <span className="text-uppercase fw-semibold">Messages</span> */}
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          className={`btn d-flex flex-column align-items-center gap-1 text-decoration-none ${
            isActive("/profile") ? "text-danger" : "text-muted"
          }`}
          style={{ fontSize: "0.7rem" }}
        >
          <i className="bi bi-person fs-4"></i>
          {/* <span className="text-uppercase fw-semibold">Profile</span> */}
        </Link>
      </div>
    </footer>
  );
};

export default Footer;