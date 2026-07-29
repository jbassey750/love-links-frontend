import React, { useState } from "react";

const INITIAL_ENTRIES = [
  {
    id: 1,
    title: "Coffee date with Isabelle",
    content: "We talked about our favorite movies for hours. She loves Quentin Tarantino films just like I do!",
    date: "July 24, 2026",
    time: "4:30 PM",
    color: "#fff0f0"
  },
  {
    id: 2,
    title: "Thoughts on local art museum",
    content: "Visited the modern art section today. The lighting was mesmerizing.",
    date: "July 20, 2026",
    time: "11:15 AM",
    color: "#f0f7ff"
  }
];

const DiaryPage = () => {
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [activeModal, setActiveModal] = useState(false); // true when modal is open
  const [editingEntry, setEditingEntry] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setTitle("");
    setContent("");
    setActiveModal(true);
  };

  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setActiveModal(true);
  };

  const handleSave = () => {
    if (!content.trim()) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    if (editingEntry) {
      setEntries((prev) =>
        prev.map((item) =>
          item.id === editingEntry.id
            ? { ...item, title, content, date: dateStr, time: timeStr }
            : item
        )
      );
    } else {
      const newEntry = {
        id: Date.now(),
        title: title || "Untitled Note",
        content,
        date: dateStr,
        time: timeStr,
        color: "#ffffff"
      };
      setEntries([newEntry, ...entries]);
    }
    setActiveModal(false);
  };

  const handleDelete = (id) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-vh-100 position-relative pb-5" style={{ backgroundColor: "#fbf6f0" }}>
      <main className="px-3 px-md-4 py-3 mx-auto" style={{ maxWidth: "900px" }}>
        {/* Diary Card Grid */}
        <div className="row g-3">
          {entries.length === 0 ? (
            <div className="text-center py-5 text-muted col-12">
              <i className="bi bi-journal-bookmark fs-1 d-block mb-2 opacity-50"></i>
              <p>Your diary is empty. Tap the + button to write your first entry.</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="col-12 col-md-6">
                <div
                  onClick={() => handleOpenEdit(entry)}
                  className="card border-0 rounded-4 shadow-sm p-3 h-100 d-flex flex-column justify-content-between"
                  style={{ backgroundColor: entry.color || "#ffffff", cursor: "pointer", transition: "transform 0.15s ease" }}
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold m-0 text-dark" style={{ fontFamily: "Georgia, serif" }}>
                        {entry.title}
                      </h6>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                        className="btn btn-sm text-danger p-0 border-0 ms-2"
                        title="Delete note"
                      >
                        <i className="bi bi-trash fs-6"></i>
                      </button>
                    </div>
                    <p className="text-secondary text-break" style={{ fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                      {entry.content}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-top border-light d-flex justify-content-between align-items-center">
                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>{entry.date} • {entry.time}</small>
                    <i className="bi bi-pencil-fill text-muted" style={{ fontSize: "0.75rem" }}></i>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Floating Action Plus Button */}
      <button
        onClick={handleOpenCreate}
        className="btn btn-danger rounded-circle shadow-lg position-fixed bottom-0 end-0 m-4 d-flex align-items-center justify-content-center z-3"
        style={{ width: "56px", height: "56px", backgroundColor: "#5c1d24", borderColor: "#5c1d24" }}
        title="Add New Entry"
      >
        <i className="bi bi-plus-lg fs-3"></i>
      </button>

      {/* Entry Modal */}
      {activeModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3 px-3" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-4 p-4 shadow-lg w-100" style={{ maxWidth: "500px" }}>
            <h5 className="fw-bold mb-3" style={{ color: "#5c1d24", fontFamily: "Georgia, serif" }}>
              {editingEntry ? "Edit Entry" : "New Entry"}
            </h5>

            <input
              type="text"
              className="form-control border-0 bg-light rounded-3 mb-3 fw-bold"
              placeholder="Title (Optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ fontSize: "0.95rem" }}
            />

            <textarea
              className="form-control border-0 bg-light rounded-3 mb-3"
              rows="6"
              placeholder="Write your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ fontSize: "0.875rem", resize: "none" }}
            ></textarea>

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-light rounded-3" onClick={() => setActiveModal(false)}>Cancel</button>
              <button className="btn btn-danger rounded-3" style={{ backgroundColor: "#5c1d24", borderColor: "#5c1d24" }} onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryPage;