import React, { useEffect } from "react";

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      className="position-fixed bottom-0 end-0 p-3 z-3"
      style={{ zIndex: 1090 }}
    >
      <div
        className={`toast show border-0 rounded-4 shadow-lg text-white p-3 d-flex align-items-center gap-3 ${
          toast.type === "error" ? "bg-danger" : toast.type === "info" ? "bg-primary" : "bg-dark"
        }`}
        style={{ backgroundColor: toast.type === "success" ? "#5c1d24" : undefined }}
      >
        <i
          className={`bi ${
            toast.type === "error"
              ? "bi-x-circle-fill"
              : toast.type === "info"
              ? "bi-info-circle-fill"
              : "bi-check-circle-fill"
          } fs-5`}
        ></i>
        <div className="flex-grow-1 fw-medium">{toast.message}</div>
        <button
          type="button"
          className="btn-close btn-close-white ms-auto shadow-none"
          onClick={onClose}
        ></button>
      </div>
    </div>
  );
};

export default Toast;