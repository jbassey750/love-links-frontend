import React, { useState } from "react";

const AssignmentCard = ({ assignment }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [noteData, setNoteData] = useState({
    category: "",
    gender: "",
    note: "",
  });

  if (!assignment) return null;

  const {
    fakeUser,
    realUser,
    assignedAt,
    status,
  } = assignment;

  // =========================================================
  // OPEN PROFILE DETAILS
  // =========================================================

  const handleProfileClick = (user, type) => {
    if (!user) return;

    setSelectedUser({
      ...user,
      profileType: type,
    });
  };

  // =========================================================
  // CLOSE PROFILE MODAL
  // =========================================================

  const closeProfileModal = () => {
    setSelectedUser(null);
  };

  // =========================================================
  // OPEN NOTE MODAL
  // =========================================================

  const handleOpenNote = () => {
    setNoteData({
      category: "",
      gender: "",
      note: "",
    });

    setShowNoteModal(true);
  };

  // =========================================================
  // CLOSE NOTE MODAL
  // =========================================================

  const handleCloseNote = () => {
    setShowNoteModal(false);
  };

  // =========================================================
  // HANDLE NOTE INPUT
  // =========================================================

  const handleNoteChange = (event) => {
    const { name, value } = event.target;

    setNoteData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // SAVE NOTE
  // =========================================================

  const handleSaveNote = () => {
    console.log("Note:", {
      userId: selectedUser?._id,
      user: selectedUser?.fullName,
      ...noteData,
    });

    /*
     * We are only collecting the note here for now.
     *
     * When your backend Note endpoint is ready,
     * we can replace this with:
     *
     * await api.post("/notes", {...})
     */

    setShowNoteModal(false);
  };

  return (
    <>
      {/* =====================================================
          EXISTING ASSIGNMENT CARD
      ===================================================== */}

      <div
        className="card border-0 shadow-sm mb-3"
        style={{
          borderRadius: "18px",
        }}
      >
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center flex-wrap">

            {/* =================================================
                LEFT - FAKE USER
            ================================================= */}

            <div
              className="d-flex align-items-center"
              onClick={() =>
                handleProfileClick(
                  fakeUser,
                  "fake"
                )
              }
              style={{
                cursor: "pointer",
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  handleProfileClick(
                    fakeUser,
                    "fake"
                  );
                }
              }}
            >

              <img
                src={
                  fakeUser?.photo ||
                  "https://via.placeholder.com/70x70.png?text=User"
                }
                alt={
                  fakeUser?.fullName ||
                  "Fake User"
                }
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

                <span className="badge rounded-pill bg-success-subtle text-success">
                  Fake Profile
                </span>

              </div>

            </div>

            {/* =================================================
                CENTER
            ================================================= */}

            <div className="text-center my-3 my-md-0">
              <i
                className="bi bi-arrow-left-right fs-3"
                style={{
                  color: "#5c1d24",
                }}
              ></i>
            </div>

            {/* =================================================
                RIGHT - REAL USER
            ================================================= */}

            <div
              className="d-flex align-items-center"
              onClick={() =>
                handleProfileClick(
                  realUser,
                  "real"
                )
              }
              style={{
                cursor: "pointer",
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  handleProfileClick(
                    realUser,
                    "real"
                  );
                }
              }}
            >

              <img
                src={
                  realUser?.photo ||
                  "https://via.placeholder.com/70x70.png?text=User"
                }
                alt={
                  realUser?.fullName ||
                  "Real User"
                }
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
                  {realUser?.status ||
                    "Offline"}
                </span>

              </div>

            </div>

          </div>

          <hr />

          {/* ===================================================
              ASSIGNMENT INFORMATION
          =================================================== */}

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
                  ? new Date(
                      assignedAt
                    ).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "--"}
              </strong>

            </div>

            <div className="col-md-4">

              <small className="text-muted d-block">
                Moderator Mode
              </small>

              <strong
                style={{
                  color: "#5c1d24",
                }}
              >
                Single Assignment
              </strong>

            </div>

          </div>

        </div>
      </div>

      {/* =====================================================
          USER DETAILS MODAL
      ===================================================== */}

      {selectedUser && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.5)",
          }}
          onClick={closeProfileModal}
        >

          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-content border-0 shadow">

              {/* Header */}

              <div className="modal-header">

                <h5 className="modal-title fw-bold">
                  User Details
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={
                    closeProfileModal
                  }
                ></button>

              </div>

              {/* Body */}

              <div className="modal-body">

                <div className="text-center mb-4">

                  <img
                    src={
                      selectedUser.photo ||
                      "https://via.placeholder.com/120x120.png?text=User"
                    }
                    alt={
                      selectedUser.fullName ||
                      "User"
                    }
                    className="rounded-circle border shadow-sm"
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: "cover",
                    }}
                  />

                  <h4 className="fw-bold mt-3 mb-1">
                    {selectedUser.fullName ||
                      "Unknown User"}
                  </h4>

                  <span className="badge rounded-pill bg-secondary">
                    {selectedUser.profileType ===
                    "fake"
                      ? "Fake Profile"
                      : "Real User"}
                  </span>

                </div>

                <div className="row g-3">

                  {selectedUser.username && (
                    <div className="col-md-6">
                      <small className="text-muted d-block">
                        Username
                      </small>
                      <strong>
                        {selectedUser.username}
                      </strong>
                    </div>
                  )}

                  {selectedUser.email && (
                    <div className="col-md-6">
                      <small className="text-muted d-block">
                        Email
                      </small>
                      <strong>
                        {selectedUser.email}
                      </strong>
                    </div>
                  )}

                  {selectedUser.gender && (
                    <div className="col-md-6">
                      <small className="text-muted d-block">
                        Gender
                      </small>
                      <strong>
                        {selectedUser.gender}
                      </strong>
                    </div>
                  )}

                  {selectedUser.age && (
                    <div className="col-md-6">
                      <small className="text-muted d-block">
                        Age
                      </small>
                      <strong>
                        {selectedUser.age}
                      </strong>
                    </div>
                  )}

                  {selectedUser.state && (
                    <div className="col-md-6">
                      <small className="text-muted d-block">
                        State
                      </small>
                      <strong>
                        {selectedUser.state}
                      </strong>
                    </div>
                  )}

                  {selectedUser.region && (
                    <div className="col-md-6">
                      <small className="text-muted d-block">
                        Region
                      </small>
                      <strong>
                        {selectedUser.region}
                      </strong>
                    </div>
                  )}

                  {selectedUser.relationshipStatus && (
                    <div className="col-md-6">
                      <small className="text-muted d-block">
                        Relationship Status
                      </small>
                      <strong>
                        {
                          selectedUser.relationshipStatus
                        }
                      </strong>
                    </div>
                  )}

                  {selectedUser.badge && (
                    <div className="col-md-6">
                      <small className="text-muted d-block">
                        Badge
                      </small>
                      <strong>
                        {selectedUser.badge}
                      </strong>
                    </div>
                  )}

                  {selectedUser.bio && (
                    <div className="col-12">
                      <small className="text-muted d-block">
                        Bio
                      </small>
                      <p className="mb-0">
                        {selectedUser.bio}
                      </p>
                    </div>
                  )}

                  {selectedUser.interests &&
                    selectedUser.interests.length >
                      0 && (
                      <div className="col-12">
                        <small className="text-muted d-block mb-1">
                          Interests
                        </small>

                        <div className="d-flex flex-wrap gap-2">
                          {selectedUser.interests.map(
                            (
                              interest,
                              index
                            ) => (
                              <span
                                key={index}
                                className="badge bg-light text-dark border"
                              >
                                {interest}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                </div>

              </div>

              {/* Footer */}

              <div className="modal-footer justify-content-between">

                {/* LEFT SIDE NOTE BUTTON */}

                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor:
                      "#5c1d24",
                    color: "#fff",
                  }}
                  onClick={
                    handleOpenNote
                  }
                >
                  <i className="bi bi-journal-text me-2"></i>
                  Note
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    closeProfileModal
                  }
                >
                  Close
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          NOTE MODAL
      ===================================================== */}

      {showNoteModal && selectedUser && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.6)",
            zIndex: 1060,
          }}
        >

          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
          >

            <div className="modal-content border-0 shadow">

              <div className="modal-header">

                <h5 className="modal-title fw-bold">
                  Add Note
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={
                    handleCloseNote
                  }
                ></button>

              </div>

              <div className="modal-body">

                {/* =================================
                    CATEGORY
                ================================= */}

                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Category
                  </label>

                  <select
                    className="form-select"
                    name="category"
                    value={
                      noteData.category
                    }
                    onChange={
                      handleNoteChange
                    }
                  >

                    <option value="">
                      Select category
                    </option>

                    <option value="relationship">
                      Relationship
                    </option>

                    <option value="personality">
                      Personality
                    </option>

                    <option value="interests">
                      Interests
                    </option>

                    <option value="conversation">
                      Conversation
                    </option>

                    <option value="preference">
                      Preference
                    </option>

                    <option value="important">
                      Important
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </div>

                {/* =================================
                    GENDER
                ================================= */}

                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Gender
                  </label>

                  <select
                    className="form-select"
                    name="gender"
                    value={
                      noteData.gender
                    }
                    onChange={
                      handleNoteChange
                    }
                  >

                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                  </select>

                </div>

                {/* =================================
                    NOTE
                ================================= */}

                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Note
                  </label>

                  <textarea
                    className="form-control"
                    name="note"
                    rows="5"
                    placeholder="Enter your note..."
                    value={
                      noteData.note
                    }
                    onChange={
                      handleNoteChange
                    }
                  ></textarea>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    handleCloseNote
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor:
                      "#5c1d24",
                    color: "#fff",
                  }}
                  onClick={
                    handleSaveNote
                  }
                >
                  Save Note
                </button>

              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default AssignmentCard;