import React from "react";

const AssignmentCard = ({ assignment }) => {
  
  if (!assignment) return null;

  const {
    fakeUser,
    realUser,
    assignedAt,
    status,
  } = assignment;

  return (
    <div
      className="card border-0 shadow-sm mb-3"
      style={{
        borderRadius: "18px",
      }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center flex-wrap">

          {/* Left */}
          <div className="d-flex align-items-center">

            <img
              src={
                fakeUser?.photo ||
                "https://via.placeholder.com/70x70.png?text=User"
              }
              alt={fakeUser?.fullName}
              className="rounded-circle border shadow-sm"
              style={{
                width: 65,
                height: 65,
                objectFit: "cover",
              }}
            />

            <div className="ms-3">

              <small className="text-muted text-uppercase fw-semibold">
                Replying As
              </small>

              <h5 className="mb-1 fw-bold">
                {fakeUser?.fullName}
              </h5>

              <span
                className="badge rounded-pill bg-success-subtle text-success"
              >
                Fake Profile
              </span>

            </div>
          </div>

          <div className="text-center my-3 my-md-0">

            <i
              className="bi bi-arrow-left-right fs-3"
              style={{ color: "#5c1d24" }}
            ></i>

          </div>

          {/* Right */}
          <div className="d-flex align-items-center">

            <img
              src={
                realUser?.photo ||
                "https://via.placeholder.com/70x70.png?text=User"
              }
              alt={realUser?.fullName}
              className="rounded-circle border shadow-sm"
              style={{
                width: 65,
                height: 65,
                objectFit: "cover",
              }}
            />

            <div className="ms-3">

              <small className="text-muted text-uppercase fw-semibold">
                Talking To
              </small>

              <h5 className="mb-1 fw-bold">
                {realUser?.fullName}
              </h5>

              <span
                className={`badge rounded-pill ${
                  realUser?.status === "online"
                    ? "bg-success"
                    : "bg-secondary"
                }`}
              >
                {realUser?.status || "Offline"}
              </span>

            </div>
          </div>

        </div>

        <hr />

        <div className="row text-center">

          <div className="col-md-4 mb-3 mb-md-0">

            <small className="text-muted d-block">
              Assignment Status
            </small>

            <span
              className={`badge rounded-pill ${
                status === "active"
                  ? "bg-success"
                  : "bg-warning text-dark"
              }`}
            >
              {status}
            </span>

          </div>

          <div className="col-md-4 mb-3 mb-md-0">

            <small className="text-muted d-block">
              Assigned At
            </small>

            <strong>
              {assignedAt
                ? new Date(assignedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--"}
            </strong>

          </div>

          <div className="col-md-4">

            <small className="text-muted d-block">
              Moderator Mode
            </small>

            <strong style={{ color: "#5c1d24" }}>
              Single Assignment
            </strong>

          </div>

        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;