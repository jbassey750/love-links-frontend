import { useState, useRef, useEffect }  from "react";
import api from "../../api/axios";

const INTEREST_PRESETS = [
  "Coffee",
  "Bouldering",
  "Cooking",
  "Philosophy",
  "Wine",
  "Astronomy",
  "Hiking",
  "Jazz",
  "Architecture",
  "Travel",
  "Cycling",
  "Poetry",
  "Music",
  "Books",
  "Film",
  "Marine Biology",
  "Diving",
  "Trivia",
  "Cocktails",
  "Dogs",
  "Running",
  "Yoga",
  "Art",
  "Gaming",
  "Photography",
  "Dancing",
  "Theatre",
  "Meditation",
  "Surfing",
];

const BADGE_OPTIONS = ["Romance", "Friends", "Love & Friends"];

const EditProfileModal = ({
  isOpen,
  onClose,
  initialData,
  onSaveSuccess,
}) => {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    age: initialData?.age || "",
    state: initialData?.state || "",
    region: initialData?.region || "",
    location: initialData?.location?.city || initialData?.location || "",
    bio: initialData?.bio || "",
    badge: initialData?.badge || "Love & Friends",
    interests: initialData?.interests || [],
    photo: null,
    photoPreview:
      initialData?.photoUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  });

  const [customInterest, setCustomInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        age: initialData.age || "",
        state: initialData.state || "",
        region: initialData.region || "",
        location: initialData.location?.city || initialData.location || "",
        bio: initialData.bio || "",
        badge: initialData.badge || "Love & Friends",
        interests: initialData.interests || [],
        photo: null,
        photoPreview:
          initialData.photoUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      });

      setError("");
      setCustomInterest("");
    }
  }, [initialData, isOpen]);

  // Prevent the page behind the modal from scrolling.
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!validTypes.includes(file.type)) {
        setError("Please upload a JPG, PNG, or WEBP image.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Profile photo must be 5MB or smaller.");
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photo: file,
          photoPreview: reader.result,
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);

      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const handleAddCustomInterest = (e) => {
    e.preventDefault();

    const clean = customInterest.trim();

    if (clean && !formData.interests.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, clean],
      }));

      setCustomInterest("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    if (!formData.fullName.trim()) {
      setError("Full name cannot be empty.");
      setLoading(false);
      return;
    }

    const parsedAge = Number(formData.age);

    if (
      !Number.isInteger(parsedAge) ||
      parsedAge < 18 ||
      parsedAge > 99
    ) {
      setError("Age must be an integer between 18 and 99.");
      setLoading(false);
      return;
    }

    if (formData.bio.length < 20 || formData.bio.length > 300) {
      setError("Bio must be between 20 and 300 characters.");
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();

      payload.append("fullName", formData.fullName.trim());
      payload.append("age", parsedAge);
      if (formData.state.trim()) payload.append("state", formData.state.trim());
      if (formData.region.trim()) payload.append("region", formData.region.trim());
      if (formData.location.trim()) payload.append("location", formData.location.trim());
      payload.append("bio", formData.bio);
      payload.append("badge", formData.badge);
      payload.append("interests", JSON.stringify(formData.interests));

      if (formData.photo) {
        payload.append("photo", formData.photo);
      }

      const response = await api.put("/profile/me", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (onSaveSuccess) {
        onSaveSuccess(response.data.user);
      }

      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 99999,
        padding: "20px 12px",
        overflowY: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg d-flex flex-column position-relative"
        style={{
          width: "100%",
          maxWidth: "460px",
          maxHeight: "calc(100vh - 40px)",
          minHeight: 0,
          backgroundColor: "#fcfaf7",
          overflow: "hidden",
          zIndex: 100000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="d-flex align-items-center justify-content-between px-4 pt-4 pb-2 flex-shrink-0"
          style={{
            backgroundColor: "#fcfaf7",
            position: "relative",
            zIndex: 2,
          }}
        >
          <h3
            className="m-0 fs-4 fw-bold text-dark"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Edit profile
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="btn rounded-circle d-flex align-items-center justify-content-center p-0 border-0"
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "rgba(0, 0, 0, 0.08)",
              color: "#333",
              flexShrink: 0,
            }}
          >
            <i className="bi bi-x fs-5"></i>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div
          className="flex-grow-1 px-4 py-3"
          style={{
            backgroundColor: "#fcfaf7",
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {error && (
            <div
              className="alert alert-danger py-2 px-3 mb-3 rounded-3"
              style={{ fontSize: "0.85rem" }}
            >
              {error}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="d-flex flex-column align-items-center mb-4">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              className="d-none"
            />

            <div
              className="rounded-4 overflow-hidden mb-2 shadow-sm"
              style={{
                width: "96px",
                height: "96px",
                flexShrink: 0,
              }}
            >
              <img
                src={formData.photoPreview}
                alt="Profile"
                className="w-100 h-100"
                style={{
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-link p-0 text-decoration-underline fw-semibold border-0"
              style={{
                color: "#78142c",
                fontSize: "0.82rem",
              }}
            >
              Change photo
            </button>
          </div>

          {/* Full Name */}
          <div className="mb-3">
            <label
              className="text-uppercase fw-bold mb-1 d-block"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                color: "#8a817c",
              }}
            >
              Full Name
            </label>

            <input
              type="text"
              className="form-control border-0 px-3 rounded-4 shadow-none"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fullName: e.target.value,
                })
              }
              style={{
                backgroundColor: "#efeae4",
                fontSize: "0.88rem",
                color: "#333",
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
            />
          </div>

          {/* Age */}
          <div className="mb-3">
            <label
              className="text-uppercase fw-bold mb-1 d-block"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                color: "#8a817c",
              }}
            >
              Age
            </label>

            <input
              type="number"
              className="form-control border-0 px-3 rounded-4 shadow-none"
              value={formData.age}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  age: e.target.value,
                })
              }
              style={{
                backgroundColor: "#efeae4",
                fontSize: "0.88rem",
                color: "#333",
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
            />
          </div>

          {/* State */}
          <div className="mb-3">
            <label
              className="text-uppercase fw-bold mb-1 d-block"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                color: "#8a817c",
              }}
            >
              State
            </label>

            <input
              type="text"
              className="form-control border-0 px-3 rounded-4 shadow-none"
              value={formData.state}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  state: e.target.value,
                })
              }
              style={{
                backgroundColor: "#efeae4",
                fontSize: "0.88rem",
                color: "#333",
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
            />
          </div>

          {/* Region */}
          <div className="mb-3">
            <label
              className="text-uppercase fw-bold mb-1 d-block"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                color: "#8a817c",
              }}
            >
              Region
            </label>

            <input
              type="text"
              className="form-control border-0 px-3 rounded-4 shadow-none"
              value={formData.region}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  region: e.target.value,
                })
              }
              style={{
                backgroundColor: "#efeae4",
                fontSize: "0.88rem",
                color: "#333",
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
            />
          </div>

          {/* Location */}
          <div className="mb-3">
            <label
              className="text-uppercase fw-bold mb-1 d-block"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                color: "#8a817c",
              }}
            >
              City / Location
            </label>

            <input
              type="text"
              className="form-control border-0 px-3 rounded-4 shadow-none"
              value={formData.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: e.target.value,
                })
              }
              style={{
                backgroundColor: "#efeae4",
                fontSize: "0.88rem",
                color: "#333",
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
            />
          </div>

          {/* About Me */}
          <div className="mb-4">
            <label
              className="text-uppercase fw-bold mb-1 d-block"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                color: "#8a817c",
              }}
            >
              About Me
            </label>

            <textarea
              rows="3"
              className="form-control border-0 px-3 rounded-4 shadow-none"
              value={formData.bio}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bio: e.target.value,
                })
              }
              style={{
                backgroundColor: "#efeae4",
                fontSize: "0.88rem",
                color: "#333",
                resize: "none",
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
            />
          </div>

          {/* Badge Selection */}
          <div className="mb-4">
            <label
              className="text-uppercase fw-bold mb-2 d-block"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                color: "#8a817c",
              }}
            >
              Badge
            </label>

            <div className="d-flex flex-wrap gap-2">
              {BADGE_OPTIONS.map((badge) => {
                const active = formData.badge === badge;

                return (
                  <button
                    key={badge}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        badge,
                      })
                    }
                    className="btn rounded-pill px-3 fw-semibold shadow-none"
                    style={{
                      fontSize: "0.8rem",
                      paddingTop: "6px",
                      paddingBottom: "6px",
                      backgroundColor: active
                        ? "#78142c"
                        : "transparent",
                      color: active ? "#fff" : "#4a4a4a",
                      border: active
                        ? "1px solid #78142c"
                        : "1px solid #d4ceb8",
                    }}
                  >
                    {badge}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests Section */}
          <div className="mb-3">
            <label
              className="text-uppercase fw-bold mb-2 d-block"
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                color: "#8a817c",
              }}
            >
              Interests
            </label>

            <div className="d-flex flex-wrap gap-2 mb-3">
              {INTEREST_PRESETS.map((interest) => {
                const active = formData.interests.includes(interest);

                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className="btn rounded-pill px-3 py-1 fw-medium shadow-none"
                    style={{
                      fontSize: "0.78rem",
                      backgroundColor: active
                        ? "#78142c"
                        : "transparent",
                      color: active ? "#fff" : "#4a4a4a",
                      border: active
                        ? "1px solid #78142c"
                        : "1px solid #d4ceb8",
                    }}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>

            {/* Custom Interest Input */}
            <form
              onSubmit={handleAddCustomInterest}
              className="d-flex gap-2 align-items-center"
            >
              <input
                type="text"
                placeholder="Add your own..."
                className="form-control border-0 px-3 py-2 rounded-pill flex-grow-1 shadow-none"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                style={{
                  backgroundColor: "#efeae4",
                  fontSize: "0.85rem",
                  minWidth: 0,
                }}
              />

              <button
                type="submit"
                className="btn rounded-circle text-white p-0 d-flex align-items-center justify-content-center shadow-none"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#78142c",
                  flexShrink: 0,
                }}
              >
                <i className="bi bi-plus-lg fs-6"></i>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Action */}
        <div
          className="p-3 border-top border-light-subtle flex-shrink-0"
          style={{
            backgroundColor: "#fcfaf7",
            position: "relative",
            zIndex: 2,
          }}
        >
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn w-100 rounded-pill border-0 text-white fw-semibold shadow-sm"
            style={{
              backgroundColor: "#78142c",
              fontSize: "0.9rem",
              paddingTop: "10px",
              paddingBottom: "10px",
            }}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;