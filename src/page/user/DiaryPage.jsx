import React, { useState, useEffect } from "react";
import axios from "../../api/axios";

const DiaryPage = () => {
  const [entries, setEntries] = useState([]);

  const [activeModal, setActiveModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // GET DIARY ENTRIES
  // GET /api/diary
  // =====================================================
  const fetchDiaryEntries = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/diary");

      console.log("Diary entries response:", response.data);

      const diaryEntries =
        response.data?.entries ||
        response.data?.diaries ||
        response.data?.data ||
        [];

      setEntries(Array.isArray(diaryEntries) ? diaryEntries : []);
    } catch (error) {
      console.error("Failed to fetch diary entries:", error);

      setEntries([]);

      console.error("Diary error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DIARY WHEN PAGE OPENS
  // =====================================================
  useEffect(() => {
    fetchDiaryEntries();
  }, []);

  // =====================================================
  // OPEN CREATE MODAL
  // =====================================================
  const handleOpenCreate = () => {
    setEditingEntry(null);
    setTitle("");
    setContent("");
    setActiveModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================
  const handleOpenEdit = async (entry) => {
    try {
      setEditingEntry(entry);
      setTitle(entry.title || "");
      setContent(entry.content || "");
      setActiveModal(true);
    } catch (error) {
      console.error("Failed to open diary entry:", error);
    }
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================
  const handleCloseModal = () => {
    if (saving) return;

    setActiveModal(false);
    setEditingEntry(null);
    setTitle("");
    setContent("");
  };

  // =====================================================
  // CREATE / UPDATE DIARY ENTRY
  // =====================================================
  const handleSave = async () => {
    if (!content.trim()) return;

    try {
      setSaving(true);

      // ==========================================
      // UPDATE EXISTING ENTRY
      // PUT /api/diary/:id
      // ==========================================
      if (editingEntry) {
        const response = await axios.put(
          `/diary/${editingEntry._id || editingEntry.id}`,
          {
            title: title.trim() || "Untitled Note",
            content: content.trim(),
          },
        );

        console.log("Updated diary response:", response.data);

        setActiveModal(false);
        setEditingEntry(null);
        setTitle("");
        setContent("");

        await fetchDiaryEntries();

        return;
      }

      // ==========================================
      // CREATE NEW ENTRY
      // POST /api/diary
      // ==========================================
      const response = await axios.post("/diary", {
        title: title.trim() || "Untitled Note",
        content: content.trim(),
      });

      console.log("Created diary response:", response.data);

      setActiveModal(false);
      setEditingEntry(null);
      setTitle("");
      setContent("");

      await fetchDiaryEntries();
    } catch (error) {
      console.error("Failed to save diary entry:", error);

      console.error("Save diary error:", error.response?.data || error.message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE DIARY ENTRY
  // DELETE /api/diary/:id
  // =====================================================
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);

      await axios.delete(`/diary/${id}`);

      // Remove immediately from UI
      setEntries((prev) => prev.filter((item) => (item._id || item.id) !== id));
    } catch (error) {
      console.error("Failed to delete diary entry:", error);

      console.error(
        "Delete diary error:",
        error.response?.data || error.message,
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================
  const formatDate = (entry) => {
    const value = entry.createdAt || entry.updatedAt || entry.date;

    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return entry.date || "";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================
  const formatTime = (entry) => {
    const value = entry.createdAt || entry.updatedAt;

    if (!value) {
      return entry.time || "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return entry.time || "";
    }

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // GET ENTRY COLOR
  // =====================================================
  const getEntryColor = (entry, index) => {
    if (entry.color) {
      return entry.color;
    }

    const colors = ["#fff0f0", "#f0f7ff", "#fff8e7", "#f3f0ff", "#f0fff5"];

    return colors[index % colors.length];
  };

  return (
    <div
      className="min-vh-100 position-relative pb-5"
      style={{ backgroundColor: "#fbf6f0" }}
    >
      <main className="px-3 px-md-4 py-3 mx-auto" style={{ maxWidth: "900px" }}>
        {/* Diary Card Grid */}
        <div className="row g-3">
          {/* Loading */}
          {loading ? (
            <div className="text-center py-5 text-muted col-12">
              <div
                className="spinner-border"
                role="status"
                style={{ color: "#5c1d24" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>

              <p className="mt-3 mb-0">Loading your diary...</p>
            </div>
          ) : entries.length === 0 ? (
            /* Empty Diary */
            <div className="text-center py-5 text-muted col-12">
              <i className="bi bi-journal-bookmark fs-1 d-block mb-2 opacity-50"></i>

              <p>
                Your diary is empty. Tap the + button to write your first entry.
              </p>
            </div>
          ) : (
            /* Diary Entries */
            entries.map((entry, index) => {
              const entryId = entry._id || entry.id;

              return (
                <div key={entryId} className="col-12 col-md-6">
                  <div
                    onClick={() => handleOpenEdit(entry)}
                    className="card border-0 rounded-4 shadow-sm p-3 h-100 d-flex flex-column justify-content-between"
                    style={{
                      backgroundColor: getEntryColor(entry, index),
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6
                          className="fw-bold m-0 text-dark"
                          style={{
                            fontFamily: "Georgia, serif",
                          }}
                        >
                          {entry.title || "Untitled Note"}
                        </h6>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            if (deletingId !== entryId) {
                              handleDelete(entryId);
                            }
                          }}
                          className="btn btn-sm text-danger p-0 border-0 ms-2"
                          title="Delete note"
                          disabled={deletingId === entryId}
                        >
                          {deletingId === entryId ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                            ></span>
                          ) : (
                            <i className="bi bi-trash fs-6"></i>
                          )}
                        </button>
                      </div>

                      <p
                        className="text-secondary text-break"
                        style={{
                          fontSize: "0.85rem",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {entry.content}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-top border-light d-flex justify-content-between align-items-center">
                      <small
                        className="text-muted"
                        style={{
                          fontSize: "0.7rem",
                        }}
                      >
                        {formatDate(entry)} • {formatTime(entry)}
                      </small>

                      <i
                        className="bi bi-pencil-fill text-muted"
                        style={{
                          fontSize: "0.75rem",
                        }}
                      ></i>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Floating Action Plus Button */}
      {/* Floating Action Plus Button */}
      <button
        onClick={handleOpenCreate}
        className="btn btn-danger rounded-circle shadow-lg position-fixed end-0 m-4 d-flex align-items-center justify-content-center z-3"
        style={{
          width: "56px",
          height: "56px",
          bottom: "70px",
          backgroundColor: "#5c1d24",
          borderColor: "#5c1d24",
        }}
        title="Add New Entry"
      >
        <i className="bi bi-plus-lg fs-3"></i>
      </button>

      {/* Entry Modal */}
      {activeModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3 px-3"
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <div
            className="bg-white rounded-4 p-4 shadow-lg w-100"
            style={{ maxWidth: "500px" }}
          >
            <h5
              className="fw-bold mb-3"
              style={{
                color: "#5c1d24",
                fontFamily: "Georgia, serif",
              }}
            >
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
              style={{
                fontSize: "0.875rem",
                resize: "none",
              }}
            ></textarea>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-light rounded-3"
                onClick={handleCloseModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger rounded-3"
                style={{
                  backgroundColor: "#5c1d24",
                  borderColor: "#5c1d24",
                }}
                onClick={handleSave}
                disabled={saving || !content.trim()}
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
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryPage;
