import React, { useState } from "react";

const MATCHES = [
  { id: 1, name: "Isabelle", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" },
  { id: 2, name: "Nora", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150" }
];

const INITIAL_DATES = [
  {
    id: 1,
    matchName: "Isabelle",
    matchImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    dateTime: "2026-08-02T19:00",
    location: "Vondelpark Cafe, Amsterdam",
    notes: "Grab outdoor coffee and walk around the park.",
    status: "upcoming"
  }
];

const DatePlannerPage = () => {
  const [plans, setPlans] = useState(INITIAL_DATES);
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' | 'past'
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [selectedMatch, setSelectedMatch] = useState(MATCHES[0].name);
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreatePlan = (e) => {
    e.preventDefault();
    if (!dateTime || !location) return;

    const matchObj = MATCHES.find((m) => m.name === selectedMatch) || MATCHES[0];

    const newPlan = {
      id: Date.now(),
      matchName: matchObj.name,
      matchImage: matchObj.image,
      dateTime,
      location,
      notes,
      status: "upcoming"
    };

    setPlans([newPlan, ...plans]);
    setShowModal(false);
    setDateTime("");
    setLocation("");
    setNotes("");
  };

  const cancelPlan = (id) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredPlans = plans.filter((p) => p.status === activeTab);

  return (
    <div className="min-vh-100 position-relative pb-5" style={{ backgroundColor: "#fbf6f0" }}>
      <main className="px-3 px-md-4 py-3 mx-auto" style={{ maxWidth: "800px" }}>
        
        {/* Top Control Bar */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="btn-group bg-white rounded-pill p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`btn btn-sm rounded-pill px-3 border-0 ${activeTab === "upcoming" ? "btn-danger fw-bold" : "text-muted"}`}
              style={activeTab === "upcoming" ? { backgroundColor: "#5c1d24" } : {}}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`btn btn-sm rounded-pill px-3 border-0 ${activeTab === "past" ? "btn-danger fw-bold" : "text-muted"}`}
              style={activeTab === "past" ? { backgroundColor: "#5c1d24" } : {}}
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
          {filteredPlans.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar-event fs-1 d-block mb-2 opacity-50"></i>
              <p>No {activeTab} date plans found.</p>
            </div>
          ) : (
            filteredPlans.map((plan) => (
              <div key={plan.id} className="card border-0 rounded-4 shadow-sm p-3 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <img src={plan.matchImage} alt="" className="rounded-circle" style={{ width: "44px", height: "44px", objectFit: "cover" }} />
                    <div>
                      <h6 className="m-0 fw-bold text-dark" style={{ fontFamily: "Georgia, serif" }}>Date with {plan.matchName}</h6>
                      <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                        <i className="bi bi-clock me-1"></i>
                        {new Date(plan.dateTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </small>
                    </div>
                  </div>
                  <button onClick={() => cancelPlan(plan.id)} className="btn btn-sm text-danger border-0" title="Cancel Date">
                    <i className="bi bi-x-circle fs-5"></i>
                  </button>
                </div>

                <div className="bg-light p-2.5 rounded-3 mb-2" style={{ fontSize: "0.85rem" }}>
                  <div className="d-flex align-items-center gap-2 text-dark mb-1">
                    <i className="bi bi-geo-alt-fill text-danger"></i>
                    <strong>{plan.location}</strong>
                  </div>
                  {plan.notes && <p className="m-0 text-muted mt-1">{plan.notes}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Plan Creation Modal */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3 px-3" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-4 p-4 shadow-lg w-100" style={{ maxWidth: "450px" }}>
            <h5 className="fw-bold mb-3" style={{ color: "#5c1d24", fontFamily: "Georgia, serif" }}>Plan a Date</h5>
            
            <form onSubmit={handleCreatePlan} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.8rem" }}>Select Match</label>
                <select className="form-select border-0 bg-light rounded-3" value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)}>
                  {MATCHES.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.8rem" }}>Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="form-control border-0 bg-light rounded-3"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.8rem" }}>Location</label>
                <input
                  type="text"
                  required
                  placeholder="Restaurant, park, or venue name"
                  className="form-control border-0 bg-light rounded-3"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.8rem" }}>Notes</label>
                <textarea
                  className="form-control border-0 bg-light rounded-3"
                  rows="3"
                  placeholder="Details, reservation info, or reminders..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ resize: "none" }}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-2">
                <button type="button" className="btn btn-light rounded-3" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger rounded-3" style={{ backgroundColor: "#5c1d24", borderColor: "#5c1d24" }}>
                  Save Date Plan
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