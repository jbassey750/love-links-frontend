import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TRACKS = [
  {
    id: 1,
    title: "Lover's Theme",
    artist: "Chamber Ensemble",
    album: "Acoustic Serenade",
    duration: "3:15",
    cover:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300",
    isFavorite: true,
  },
  {
    id: 2,
    title: "Midnight Walk",
    artist: "Luna & The Stars",
    album: "Nightfall",
    duration: "4:02",
    cover:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300",
    isFavorite: false,
  },
  {
    id: 3,
    title: "Amsterdam Rain",
    artist: "Jazz Quartet",
    album: "Late Night Sessions",
    duration: "2:45",
    cover:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300",
    isFavorite: true,
  },
  {
    id: 4,
    title: "Golden Hour Duo",
    artist: "Acoustic Sunset",
    album: "Warm Memories",
    duration: "3:40",
    cover:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=300",
    isFavorite: false,
  },
];

const MATCHES = [
  {
    id: 101,
    name: "Isabelle",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
  },
  {
    id: 102,
    name: "Nora",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
  },
];

const MusicPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [tracks, setTracks] = useState(TRACKS);
  const [currentTrack, setCurrentTrack] = useState(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'favorites'
  const [shareTrack, setShareTrack] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const filteredTracks = tracks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.album.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "favorites") return matchesSearch && t.isFavorite;
    return matchesSearch;
  });

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t)),
    );
  };

  const handleShare = (matchName) => {
    setShareTrack(null);
    setToastMessage(`Shared "${shareTrack?.title}" with ${matchName}!`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div
      className="min-vh-100 pb-5 position-relative"
      style={{ backgroundColor: "#fbf6f0" }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="position-fixed top-0 end-0 m-3 z-3 bg-dark text-white px-3 py-2 rounded-3 shadow d-flex align-items-center gap-2">
          <i className="bi bi-check-circle-fill text-success"></i>
          <span style={{ fontSize: "0.875rem" }}>{toastMessage}</span>
        </div>
      )}

      <main
        className="px-3 px-md-4 py-3 mx-auto"
        style={{
          maxWidth: "800px",
          paddingBottom: "180px",
        }}
      >
        {/* Search Bar */}
        <div className="position-relative mb-3">
          <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
          <input
            type="text"
            className="form-control rounded-pill ps-5 border-0 shadow-sm"
            placeholder="Search songs, artists, albums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: "0.9rem", height: "45px" }}
          />
        </div>

        {/* Tab Filters */}
        <div className="d-flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`btn btn-sm rounded-pill px-3 ${activeTab === "all" ? "btn-dark" : "btn-white bg-white border-0 shadow-sm text-muted"}`}
            style={{ fontSize: "0.8rem" }}
          >
            All Tracks
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`btn btn-sm rounded-pill px-3 ${activeTab === "favorites" ? "btn-dark" : "btn-white bg-white border-0 shadow-sm text-muted"}`}
            style={{ fontSize: "0.8rem" }}
          >
            Favorites ❤️
          </button>
        </div>

        {/* Track List */}
        <div
          className="d-flex flex-column gap-2 mb-5"
          style={{
            maxHeight: "calc(100vh - 240px)",
            overflowY: "auto",
            paddingBottom: "180px",
            scrollbarWidth: "thin",
          }}
        >
          {filteredTracks.length === 0 ? (
            <p
              className="text-muted text-center py-4"
              style={{ fontSize: "0.9rem" }}
            >
              No music found.
            </p>
          ) : (
            filteredTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => {
                  setCurrentTrack(track);
                  setIsPlaying(true);
                }}
                className={`card border-0 rounded-4 p-2.5 shadow-sm d-flex flex-row align-items-center justify-content-between cursor-pointer ${
                  currentTrack?.id === track.id
                    ? "border border-danger border-2"
                    : ""
                }`}
                style={{ cursor: "pointer", transition: "all 0.2s" }}
              >
                <div className="d-flex align-items-center gap-3 min-w-0">
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="rounded-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                  <div className="min-w-0">
                    <h6
                      className="m-0 fw-bold text-dark text-truncate"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {track.title}
                    </h6>
                    <small
                      className="text-muted text-truncate d-block"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {track.artist} • {track.album}
                    </small>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    onClick={(e) => toggleFavorite(e, track.id)}
                    className="btn btn-sm text-danger p-1 border-0"
                  >
                    <i
                      className={`bi ${track.isFavorite ? "bi-heart-fill" : "bi-heart"}`}
                    ></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareTrack(track);
                    }}
                    className="btn btn-sm text-secondary p-1 border-0"
                    title="Share with match"
                  >
                    <i className="bi bi-send-fill"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Floating Audio Player Widget */}
      {/* Floating Audio Player Widget */}
      {currentTrack && (
        <div
          className="position-fixed start-50 translate-middle-x w-100 px-3"
          style={{
            bottom: "70px", // keeps player above your footer
            maxWidth: "630px",
            zIndex: 1040,
          }}
        >
          <div
            className="bg-dark text-white rounded-4 p-3 shadow-lg d-flex flex-column gap-2"
            style={{
              marginBottom: "0",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3 min-w-0">
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="rounded-3 flex-shrink-0"
                  style={{
                    width: "42px",
                    height: "42px",
                    objectFit: "cover",
                  }}
                />

                <div className="min-w-0">
                  <p
                    className="m-0 fw-bold text-white text-truncate"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {currentTrack.title}
                  </p>

                  <small
                    className="text-white-50 text-truncate d-block"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {currentTrack.artist}
                  </small>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-link text-white p-0 border-0"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <i
                    className={`bi ${
                      isPlaying ? "bi-pause-circle-fill" : "bi-play-circle-fill"
                    } fs-2 text-danger`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Playback Progress Bar */}
            <div className="d-flex align-items-center gap-2">
              <small className="text-white-50" style={{ fontSize: "0.65rem" }}>
                1:20
              </small>

              <div
                className="progress flex-grow-1"
                style={{
                  height: "4px",
                  backgroundColor: "#444",
                }}
              >
                <div
                  className="progress-bar bg-danger"
                  style={{ width: "40%" }}
                ></div>
              </div>

              <small className="text-white-50" style={{ fontSize: "0.65rem" }}>
                {currentTrack.duration}
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareTrack && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3 px-3"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="bg-white rounded-4 p-4 shadow-lg w-100"
            style={{ maxWidth: "380px" }}
          >
            <h6
              className="fw-bold mb-3"
              style={{ color: "#5c1d24", fontFamily: "Georgia, serif" }}
            >
              Share Track with a Match
            </h6>
            <div className="d-flex align-items-center gap-3 bg-light p-2 rounded-3 mb-3">
              <img
                src={shareTrack.cover}
                alt=""
                className="rounded-2"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
              <div>
                <strong
                  className="d-block text-dark"
                  style={{ fontSize: "0.85rem" }}
                >
                  {shareTrack.title}
                </strong>
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  {shareTrack.artist}
                </small>
              </div>
            </div>
            <p className="text-muted mb-2" style={{ fontSize: "0.8rem" }}>
              Select a match to send this song to:
            </p>
            <div className="d-flex flex-column gap-2 mb-3">
              {MATCHES.map((match) => (
                <button
                  key={match.id}
                  onClick={() => handleShare(match.name)}
                  className="btn btn-outline-light text-dark d-flex align-items-center gap-3 p-2 rounded-3 text-start border"
                >
                  <img
                    src={match.image}
                    alt={match.name}
                    className="rounded-circle"
                    style={{
                      width: "32px",
                      height: "32px",
                      objectFit: "cover",
                    }}
                  />
                  <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                    {match.name}
                  </span>
                </button>
              ))}
            </div>
            <button
              className="btn btn-light w-100 rounded-3"
              onClick={() => setShareTrack(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPage;
