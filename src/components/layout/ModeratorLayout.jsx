import React from "react";
import { Outlet } from "react-router-dom";
import ModeratorNavbar from "./ModeratorNavbar";
import Toast from "../moderator/Toast";
import { useModerator } from "../../../hooks/useModerator";

const ModeratorLayout = () => {
  const { isConnected, toast, setToast } = useModerator();

  return (
    <div
      className="d-flex flex-column min-vh-100 bg-light"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Top Console Navigation Bar */}
      <ModeratorNavbar isConnected={isConnected} />

      {/* Main Content Area / Nested Route Outlet */}
      <main className="flex-grow-1 position-relative overflow-hidden">
        <Outlet />
      </main>

      {/* Global Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default ModeratorLayout;