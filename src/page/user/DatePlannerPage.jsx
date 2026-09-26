import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

const defaultAvatar = "https://via.placeholder.com/150";

const DatePlannerPage = () => {
  const [plans, setPlans] = useState([]);
  const [matchOptions, setMatchOptions] = useState([]);

  const [activeTab, setActiveTab] = useState("upcoming");
  const [showModal, setShowModal] = useState(false);

  const [selectedMatch, setSelectedMatch] = useState("");
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchError, setMatchError] = useState("");

  const formatPartner = (user) => ({
    name: user?.fullName || user?.username || "Partner",
    image: user?.photo || defaultAvatar,
  });

  const getPartner = (plan) => {
    if (plan?.partner && typeof plan.partner === "object") {
      return formatPartner(plan.partner);
    }

    if (plan?.creator && typeof plan.creator === "object" && plan.partner) {
      const partnerUser =
        plan.creator._id?.toString() === plan.partner?._id?.toString()
          ? plan.creator
          : plan.partner;

      if (typeof partnerUser === "object") {
        return formatPartner(partnerUser);
      }
    }

    if (typeof plan?.partner === "string") {
      const match = matchOptions.find(
        (item) => item.id.toString() === plan.partner.toString(),
      );

      if (match) {
        return {
          name: match.name,
          image: match.image,
        };
      }
    }

    return {
      name: "Matched partner",
      image: defaultAvatar,
    };
  };

  const fetchMatches = async () => {
    try {
      setMatchesLoading(true);
      setMatchError("");

      const response = await axios.get("/matches");
      const matches = response.data?.matches || response.data?.data || [];

      const formattedMatches = matches
        .map((match) => {
          const currentUser = match?.user || match?.otherUser;

          if (!currentUser) {
            return null;
          }

          const id = currentUser?._id || match?.userId || match?.id;

          if (!id) {
            return null;
          }

          return {
            id: String(id),
            name: currentUser.fullName || currentUser.username || "Matched user",
            image: currentUser.photo || defaultAvatar,
          };
        })
        .filter(Boolean);

      setMatchOptions(formattedMatches);

      if (formattedMatches.length > 0) {
        setSelectedMatch((current) => {
          if (current && formattedMatches.some((item) => item.id === current)) {
            return current;
          }

          return formattedMatches[0].id;
        });
      } else {
        setSelectedMatch("");
      }
    } catch (error) {
      console.error(
        "Failed to fetch matches:",
        error.response?.data || error.message,
      );
      setMatchOptions([]);
      setSelectedMatch("");
      setMatchError("You do not have any active matches yet.");
    } finally {
      setMatchesLoading(false);
    }
  };

  const fetchUpcomingDates = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/date-plans/upcoming");
      const dates =
        response.data?.dates || response.data?.data || response.data?.datePlans || [];

      setPlans(Array.isArray(dates) ? dates : []);
    } catch (error) {
      console.error(
        "Failed to fetch upcoming dates:",
        error.response?.data || error.message,
      );
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastDates = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/date-plans/past");
      const dates =
        response.data?.dates || response.data?.data || response.data?.datePlans || [];

      setPlans(Array.isArray(dates) ? dates : []);
    } catch (error) {
      console.error(
        "Failed to fetch past dates:",
        error.response?.data || error.message,
      );
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (activeTab === "upcoming") {
      fetchUpcomingDates();
    } else {
      fetchPastDates();
    }
  }, [activeTab]);

  const handleCreatePlan = async (e) => {
    e.preventDefault();

    if (!selectedMatch || !title.trim() || !dateTime || !location.trim()) {
      return;
    }

    try {
      setSaving(true);

      await axios.post("/date-plans", {
        partner: selectedMatch,
        title: title.trim(),
        description: notes.trim(),
        dateTime,
        location: location.trim(),
        reminderEnabled: true,
        reminderMinutesBefore: 60,
      });

      setShowModal(false);
      setTitle("");
      setDateTime("");
      setLocation("");
      setNotes("");
      setActiveTab("upcoming");
      await fetchMatches();
      await fetchUpcomingDates();
    } catch (error) {
      console.error(
        "Failed to create date plan:",
        error.response?.data || error.message,
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelPlan = async (id) => {
    try {
      setCancellingId(id);

      await axios.patch(`/date-plans/${id}/cancel`);
      setPlans((prev) => prev.filter((plan) => (plan._id || plan.id) !== id));
      await fetchUpcomingDates();
    } catch (error) {
      console.error(
        "Failed to cancel date:",
        error.response?.data || error.message,
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div
      className="min-vh-100 position-relative pb-5"
      style={{ backgroundColor: "#fbf6f0" }}
    >
      <main className="px-3 px-md-4 py-3 mx-auto" style={{ maxWidth: "800px" }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="btn-group bg-white rounded-pill p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`btn btn-sm rounded-pill px-3 border-0 ${
                activeTab === "upcoming" ? "btn-danger fw-bold" : "text-muted"
              }`}
              style={
                activeTab === "upcoming" ? { backgroundColor: "#5c1d24" } : {}
              }
            >
              Upcoming
            </button>

            <button
              onClick={() => setActiveTab("past")}
              className={`btn btn-sm rounded-pill px-3 border-0 ${
                activeTab === "past" ? "btn-danger fw-bold" : "text-muted"
              }`}
              style={activeTab === "past" ? { backgroundColor: "#5c1d24" } : {}}
            >
              Past Dates
            </button>
          </div>

          <button
            onClick={async () => {
              await fetchMatches();
              setShowModal(true);
            }}
            className="btn btn-sm text-white rounded-pill px-3 py-2 shadow-sm d-flex align-items-center gap-1"
            style={{ backgroundColor: "#5c1d24" }}
            disabled={matchesLoading}
          >
            <i className="bi bi-calendar-plus"></i>
            <span>{matchesLoading ? "Loading matches..." : "Plan a Date"}</span>
          </button>
        </div>

        {matchError && (
          <div className="alert alert-warning rounded-4 border-0 mb-3">
            {matchError}
          </div>
        )}

        <div className="d-flex flex-column gap-3">
          {loading ? (
            <div className="text-center py-5 text-muted">
              <div
                className="spinner-border"
                style={{ color: "#5c1d24" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>

              <p className="mt-3">Loading {activeTab} dates...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar-event fs-1 d-block mb-2 opacity-50"></i>
              <p>No {activeTab} date plans found.</p>
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
                            fontFamily: "Georgia, serif",
                          }}
                        >
                          {plan.title || `Date with ${partner.name}`}
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
                          {new Date(plan.dateTime).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </small>
                      </div>
                    </div>

                    {activeTab === "upcoming" && (
                      <button
                        onClick={() => cancelPlan(planId)}
                        className="btn btn-sm text-danger border-0"
                        title="Cancel Date"
                        disabled={cancellingId === planId}
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
                      <strong>{plan.location || "Location not specified"}</strong>
                    </div>

                    {plan.description && (
                      <p className="m-0 text-muted mt-1">{plan.description}</p>
                    )}

                    <div className="mt-2">
                      <span
                        className={`badge rounded-pill ${
                          plan.status === "accepted"
                            ? "bg-success"
                            : plan.status === "declined"
                              ? "bg-secondary"
                              : plan.status === "cancelled"
                                ? "bg-danger"
                                : plan.status === "completed"
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

      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1055,
            overflowY: "auto",
            paddingTop: "70px",
            paddingBottom: "80px",
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg w-100"
            style={{
              maxWidth: "480px",
              maxHeight: "calc(100vh - 140px)",
              overflow: "hidden",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom"
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#fff",
                zIndex: 2,
              }}
            >
              <div>
                <h5
                  className="fw-bold mb-1"
                  style={{
                    color: "#5c1d24",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  Plan a Date
                </h5>

                <small className="text-muted">Create something special together</small>
              </div>

              <button
                type="button"
                className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "36px",
                  height: "36px",
                }}
                onClick={() => setShowModal(false)}
                disabled={saving}
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div
              className="px-4 py-3"
              style={{
                overflowY: "auto",
                maxHeight: "calc(100vh - 220px)",
              }}
            >
              <form
                onSubmit={handleCreatePlan}
                className="d-flex flex-column gap-3"
              >
                <div>
                  <label
                    className="form-label text-muted fw-semibold mb-2"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Select Match
                  </label>

                  <div className="position-relative">
                    <i
                      className="bi bi-heart position-absolute"
                      style={{
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#5c1d24",
                        zIndex: 1,
                      }}
                    ></i>

                    <select
                      className="form-select border-0 bg-light rounded-3 ps-5"
                      value={selectedMatch}
                      onChange={(e) => setSelectedMatch(e.target.value)}
                      required
                      disabled={matchesLoading || matchOptions.length === 0}
                      style={{ minHeight: "46px" }}
                    >
                      <option value="">{matchOptions.length ? "Choose a match" : "No matches available"}</option>
                      {matchOptions.map((match) => (
                        <option key={match.id} value={match.id}>
                          {match.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!matchOptions.length && !matchesLoading && (
                    <small className="text-muted d-block mt-2">
                      You need an active match before planning a date.
                    </small>
                  )}
                </div>

                <div>
                  <label
                    className="form-label text-muted fw-semibold mb-2"
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
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ minHeight: "46px" }}
                  />
                </div>

                <div>
                  <label
                    className="form-label text-muted fw-semibold mb-2"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    required
                    className="form-control border-0 bg-light rounded-3"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    style={{ minHeight: "46px" }}
                  />
                </div>

                <div>
                  <label
                    className="form-label text-muted fw-semibold mb-2"
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
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ minHeight: "46px" }}
                  />
                </div>

                <div>
                  <label
                    className="form-label text-muted fw-semibold mb-2"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Notes
                  </label>

                  <textarea
                    className="form-control border-0 bg-light rounded-3"
                    rows="4"
                    maxLength={1000}
                    placeholder="Details, reservation info, or reminders..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ resize: "none" }}
                  ></textarea>

                  <div className="text-end mt-1">
                    <small className="text-muted">{notes.length}/1000</small>
                  </div>
                </div>

                <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-2 pb-1">
                  <button
                    type="button"
                    className="btn btn-light rounded-3 py-2 px-4"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn text-white rounded-3 py-2 px-4"
                    style={{
                      backgroundColor: "#5c1d24",
                      borderColor: "#5c1d24",
                    }}
                    disabled={saving || matchOptions.length === 0}
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
                      <>
                        <i className="bi bi-calendar-check me-2"></i>
                        Save Date Plan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePlannerPage;
