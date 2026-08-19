import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const MATCHES = [
  {
    id: "66b123456789abcdef123456",
    name: "Isabelle",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
  },
  {
    id: "66b987654321abcdef654321",
    name: "Nora",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
  },
];

const DatePlannerPage = () => {
  const [plans, setPlans] = useState([]);

  const [activeTab, setActiveTab] = useState("upcoming");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedMatch, setSelectedMatch] = useState(
    MATCHES[0]?.id || ""
  );

  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // =====================================================
  // GET UPCOMING DATES
  // GET /api/date-plans/upcoming
  // =====================================================
  const fetchUpcomingDates = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/date-plans/upcoming");

      console.log("Upcoming dates:", response.data);

      const dates =
        response.data?.dates ||
        response.data?.data ||
        response.data?.datePlans ||
        [];

      setPlans(Array.isArray(dates) ? dates : []);
    } catch (error) {
      console.error(
        "Failed to fetch upcoming dates:",
        error.response?.data || error.message
      );

      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET PAST DATES
  // GET /api/date-plans/past
  // =====================================================
  const fetchPastDates = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/date-plans/past");

      console.log("Past dates:", response.data);

      const dates =
        response.data?.dates ||
        response.data?.data ||
        response.data?.datePlans ||
        [];

      setPlans(Array.isArray(dates) ? dates : []);
    } catch (error) {
      console.error(
        "Failed to fetch past dates:",
        error.response?.data || error.message
      );

      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DATES WHEN TAB CHANGES
  // =====================================================
  useEffect(() => {
    if (activeTab === "upcoming") {
      fetchUpcomingDates();
    } else {
      fetchPastDates();
    }
  }, [activeTab]);

  // =====================================================
  // CREATE DATE PLAN
  // POST /api/date-plans
  // =====================================================
  const handleCreatePlan = async (e) => {
    e.preventDefault();

    if (!selectedMatch || !title.trim() || !dateTime || !location.trim()) {
      return;
    }

    try {
      setSaving(true);

      const response = await axios.post("/date-plans", {
        partner: selectedMatch,
        title: title.trim(),
        description: notes.trim(),
        dateTime,
        location: location.trim(),
        reminderEnabled: true,
        reminderMinutesBefore: 60,
      });

      console.log("Created date plan:", response.data);

      // Close modal
      setShowModal(false);

      // Reset form
      setTitle("");
      setDateTime("");
      setLocation("");
      setNotes("");

      // Reload upcoming dates
      setActiveTab("upcoming");
      await fetchUpcomingDates();
    } catch (error) {
      console.error(
        "Failed to create date plan:",
        error.response?.data || error.message
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL DATE
  // PATCH /api/date-plans/:id/cancel
  // =====================================================
  const cancelPlan = async (id) => {
    try {
      setCancellingId(id);

      await axios.patch(`/date-plans/${id}/cancel`);

      // Remove immediately from current upcoming list
      setPlans((prev) =>
        prev.filter((plan) => (plan._id || plan.id) !== id)
      );

      // Reload to make sure frontend matches backend
      await fetchUpcomingDates();
    } catch (error) {
      console.error(
        "Failed to cancel date:",
        error.response?.data || error.message
      );
    } finally {
      setCancellingId(null);
    }
  };

  // =====================================================
  // GET PARTNER INFORMATION
  // =====================================================
  const getPartner = (plan) => {
    if (plan.partner && typeof plan.partner === "object") {
      return {
        name:
          plan.partner.fullName ||
          plan.partner.username ||
          "Partner",
        image:
          plan.partner.photo ||
          "https://via.placeholder.com/150",
      };
    }

    const match = MATCHES.find(
      (m) => m.id === plan.partner
    );

    return {
      name: match?.name || "Partner",
      image:
        match?.image ||
        "https://via.placeholder.com/150",
    };
  };

  return (
    <div
      className="min-vh-100 position-relative pb-5"
      style={{ backgroundColor: "#fbf6f0" }}
    >
      <main
        className="px-3 px-md-4 py-3 mx-auto"
        style={{ maxWidth: "800px" }}
      >
        {/* Top Control Bar */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="btn-group bg-white rounded-pill p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`btn btn-sm rounded-pill px-3 border-0 ${
                activeTab === "upcoming"
                  ? "btn-danger fw-bold"
                  : "text-muted"
              }`}
              style={
                activeTab === "upcoming"
                  ? { backgroundColor: "#5c1d24" }
                  : {}
              }
            >
              Upcoming
            </button>

            <button
              onClick={() => setActiveTab("past")}
              className={`btn btn-sm rounded-pill px-3 border-0 ${
                activeTab === "past"
                  ? "btn-danger fw-bold"
                  : "text-muted"
              }`}
              style={
                activeTab === "past"
                  ? { backgroundColor: "#5c1d24" }
                  : {}
              }
            >
              Past Dates
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn btn-sm text-white rounded-pill px-3 py-2 shadow-sm d-flex align-items-center gap-1"
            style={{ backgroundColor: "#5c1d24" }}
          >
            <i className="bi bi-calendar-plus"></i>
            <span>Plan a Date</span>
          </button>
        </div>

        {/* Date Plans Cards */}
        <div className="d-flex flex-column gap-3">
          {loading ? (
            <div className="text-center py-5 text-muted">
              <div
                className="spinner-border"
                style={{ color: "#5c1d24" }}
                role="status"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>

              <p className="mt-3">
                Loading {activeTab} dates...
              </p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar-event fs-1 d-block mb-2 opacity-50"></i>

              <p>
                No {activeTab} date plans found.
              </p>
            </div>
          ) : (
            plans.map((plan) => {
              const planId = plan._id || plan.id;

              const partner = getPartner(plan);

              return (
                <div
                  key={planId}
                  className="card border-0 rounded-4 shadow-sm p-3 bg-white"
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={partner.image}
                        alt=""
                        className="rounded-circle"
                        style={{
                          width: "44px",
                          height: "44px",
                          objectFit: "cover",
                        }}
                      />

                      <div>
                        <h6
                          className="m-0 fw-bold text-dark"
                          style={{
                            fontFamily:
                              "Georgia, serif",
                          }}
                        >
                          {plan.title ||
                            `Date with ${partner.name}`}
                        </h6>

                        <small
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <i className="bi bi-person me-1"></i>
                          {partner.name}
                        </small>

                        <br />

                        <small
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <i className="bi bi-clock me-1"></i>

                          {new Date(
                            plan.dateTime
                          ).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </small>
                      </div>
                    </div>

                    {activeTab === "upcoming" && (
                      <button
                        onClick={() =>
                          cancelPlan(planId)
                        }
                        className="btn btn-sm text-danger border-0"
                        title="Cancel Date"
                        disabled={
                          cancellingId === planId
                        }
                      >
                        {cancellingId === planId ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          ></span>
                        ) : (
                          <i className="bi bi-x-circle fs-5"></i>
                        )}
                      </button>
                    )}
                  </div>

                  <div
                    className="bg-light p-2.5 rounded-3 mb-2"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <div className="d-flex align-items-center gap-2 text-dark mb-1">
                      <i className="bi bi-geo-alt-fill text-danger"></i>

                      <strong>
                        {plan.location ||
                          "Location not specified"}
                      </strong>
                    </div>

                    {plan.description && (
                      <p className="m-0 text-muted mt-1">
                        {plan.description}
                      </p>
                    )}

                    {/* Status */}
                    <div className="mt-2">
                      <span
                        className={`badge rounded-pill ${
                          plan.status === "accepted"
                            ? "bg-success"
                            : plan.status ===
                              "declined"
                            ? "bg-secondary"
                            : plan.status ===
                              "cancelled"
                            ? "bg-danger"
                            : plan.status ===
                              "completed"
                            ? "bg-dark"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Plan Creation Modal */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3 px-3"
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <div
            className="bg-white rounded-4 p-4 shadow-lg w-100"
            style={{ maxWidth: "450px" }}
          >
            <h5
              className="fw-bold mb-3"
              style={{
                color: "#5c1d24",
                fontFamily: "Georgia, serif",
              }}
            >
              Plan a Date
            </h5>

            <form
              onSubmit={handleCreatePlan}
              className="d-flex flex-column gap-3"
            >
              {/* Match */}
              <div>
                <label
                  className="form-label text-muted fw-semibold"
                  style={{ fontSize: "0.8rem" }}
                >
                  Select Match
                </label>

                <select
                  className="form-select border-0 bg-light rounded-3"
                  value={selectedMatch}
                  onChange={(e) =>
                    setSelectedMatch(e.target.value)
                  }
                  required
                >
                  {MATCHES.map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                    >
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label
                  className="form-label text-muted fw-semibold"
                  style={{ fontSize: "0.8rem" }}
                >
                  Date Title
                </label>

                <input
                  type="text"
                  required
                  maxLength={150}
                  placeholder="Coffee Date"
                  className="form-control border-0 bg-light rounded-3"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                />
              </div>

              {/* Date & Time */}
              <div>
                <label
                  className="form-label text-muted fw-semibold"
                  style={{ fontSize: "0.8rem" }}
                >
                  Date & Time
                </label>

                <input
                  type="datetime-local"
                  required
                  className="form-control border-0 bg-light rounded-3"
                  value={dateTime}
                  onChange={(e) =>
                    setDateTime(e.target.value)
                  }
                />
              </div>

              {/* Location */}
              <div>
                <label
                  className="form-label text-muted fw-semibold"
                  style={{ fontSize: "0.8rem" }}
                >
                  Location
                </label>

                <input
                  type="text"
                  required
                  maxLength={300}
                  placeholder="Restaurant, park, or venue name"
                  className="form-control border-0 bg-light rounded-3"
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  className="form-label text-muted fw-semibold"
                  style={{ fontSize: "0.8rem" }}
                >
                  Notes
                </label>

                <textarea
                  className="form-control border-0 bg-light rounded-3"
                  rows="3"
                  maxLength={1000}
                  placeholder="Details, reservation info, or reminders..."
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  style={{ resize: "none" }}
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-light rounded-3"
                  onClick={() =>
                    setShowModal(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-danger rounded-3"
                  style={{
                    backgroundColor: "#5c1d24",
                    borderColor: "#5c1d24",
                  }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    "Save Date Plan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePlannerPage;