import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

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

const BADGE_OPTIONS = [
  {
    id: "Romance",
    label: "Romance",
    description: "Looking for a relationship",
    icon: "bi-heart",
    color: "#dc3545",
    bg: "rgba(220, 53, 69, 0.05)",
  },
  {
    id: "Friends",
    label: "Friends",
    description: "Here to make new friends",
    icon: "bi-stars",
    color: "#0d6efd",
    bg: "rgba(13, 110, 253, 0.05)",
  },
  {
    id: "Love & Friends",
    label: "Love & Friends",
    description: "Open to both",
    icon: "bi-patch-check",
    color: "#b55fe6",
    bg: "rgba(181, 95, 230, 0.05)",
  },
];

const GENDER_OPTIONS = [
  "female",
  "male",
  "non-binary",
  "agender",
  "bigender",
  "genderfluid",
  "genderqueer",
  "transgender",
  "prefer not to say",
  "other",
];

const RELATIONSHIP_STATUS_OPTIONS = [
  "single",
  "in a relationship",
  "married",
  "divorced",
  "widowed",
  "separated",
  "it's complicated",
  "prefer not to say",
];

const LOOKING_FOR_OPTIONS = [
  "female",
  "male",
  "non-binary",
  "agender",
  "bigender",
  "genderfluid",
  "genderqueer",
  "transgender",
  "prefer not to say",
  "other",
];

const SignUpFlow = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);

  // Form States
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    gender: "",
    age: "",
    state: "",
    region: "",
    photo: null,
    photoPreview: null,
    bio: "",
    interests: [],
    badge: "Love & Friends",
    lookingFor: "",
    relationshipStatus: "",
  });

  const [customInterest, setCustomInterest] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Navigation validation
  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.username.trim())
        newErrors.username = "Username is required!";
      if (!formData.email) newErrors.email = "Email is required!";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Invalid email format!";
      if (!formData.password) newErrors.password = "Password is required!";
      else if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters!";
    } else if (step === 2) {
      if (!formData.fullName.trim())
        newErrors.fullName = "Full name is required!";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required!";
      if (!formData.gender)
        newErrors.gender = "Please select a gender identity!";
      if (!formData.age) newErrors.age = "Age is required!";
      else if (Number(formData.age) < 18 || Number(formData.age) > 99)
        newErrors.age = "Age must be between 18 and 99!";
      if (!formData.state.trim()) newErrors.state = "State is required!";
      if (!formData.region.trim()) newErrors.region = "Region is required!";
    } else if (step === 3) {
      if (formData.bio.length < 20)
        newErrors.bio = "Bio must be at least 20 characters!";
    } else if (step === 6) {
      if (!formData.lookingFor)
        newErrors.lookingFor = "Please select who you are looking for!";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitSignUp = async () => {
    setLoading(true);
    setApiError("");

    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("fullName", formData.fullName);
      data.append("phone", formData.phone);
      data.append("gender", formData.gender);
      data.append("age", formData.age);
      data.append("bio", formData.bio);
      data.append("badge", formData.badge);
      data.append("lookingFor", formData.lookingFor);
      data.append("state", formData.state);
      data.append("region", formData.region);
      data.append("interests", JSON.stringify(formData.interests));
      data.append("lookingFor", formData.lookingFor);

      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      const response = await api.post("/auth/signup", data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      setSuccessMessage("Account created successfully.");
      setApiError("");

      if (onComplete) {
        onComplete(response.data);
      }

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setApiError(
        err.response?.data?.message || "An error occurred during signup!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 6) {
        setStep(step + 1);
      } else {
        submitSignUp();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Step state mutators
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
      const isSelected = prev.interests.includes(interest);
      const updated = isSelected
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: updated };
    });
  };

  const addCustomInterest = (e) => {
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

  const getStepHeaderTitle = () => {
    switch (step) {
      case 1:
        return "Account";
      case 2:
        return "Identity";
      case 3:
        return "Photo & Bio";
      case 4:
        return "Interests";
      case 5:
        return "Badge";
      case 6:
        return "Looking For";
      default:
        return "";
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-between"
      style={{
        backgroundColor: "#fbf6f0",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Step Header Block */}
      <div>
        <header
          className="px-4 py-3 d-flex align-items-center justify-content-between border-bottom border-light"
          style={{ backgroundColor: "#fbf6f0" }}
        >
          <div className="d-flex align-items-center gap-3">
            {step === 1 ? (
              <Link
                to="/"
                className="btn p-0 border-0 bg-transparent text-dark d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: "28px", height: "28px" }}
              >
                <i
                  className="bi bi-chevron-left"
                  style={{ fontSize: "0.9rem" }}
                ></i>
              </Link>
            ) : (
              <button
                onClick={handleBack}
                disabled={loading}
                className="btn p-0 border-0 bg-transparent text-dark d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: "rgba(0,0,0,0.04)",
                }}
              >
                <i
                  className="bi bi-chevron-left"
                  style={{ fontSize: "0.9rem" }}
                ></i>
              </button>
            )}
            <span
              className="text-uppercase tracking-wider fw-bold text-danger"
              style={{
                fontSize: "0.65rem",
                color: "#73112d",
                letterSpacing: "1px",
              }}
            >
              Step {step} of 6
            </span>
          </div>
          <span className="text-muted" style={{ fontSize: "0.8rem" }}>
            {getStepHeaderTitle()}
          </span>
        </header>

        {/* Global Progress Line Bar */}
        <div className="w-100 bg-black bg-opacity-5" style={{ height: "4px" }}>
          <div
            className="h-100 transition-all duration-300"
            style={{
              width: `${(step / 6) * 100}%`,
              backgroundColor: "#73112d",
              transition: "width 0.3s ease-in-out",
            }}
          ></div>
        </div>
      </div>

      {/* Primary Wizard Workspace */}
      <main
        className="flex-grow-1 px-4 py-5 mx-auto w-100"
        style={{ maxWidth: "1000px" }}
      >
        {successMessage && (
          <div className="alert alert-success text-center mb-4" role="alert">
            {successMessage}
          </div>
        )}
        {apiError && (
          <div className="alert alert-danger text-center mb-4" role="alert">
            {apiError}
          </div>
        )}

        {/* STEP 1: Account credentials */}
        {step === 1 && (
          <div>
            <h2
              className="fs-3 fw-bold mb-1 text-dark"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Create your account
            </h2>
            <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
              Your credentials stay private.
            </p>

            <div className="d-flex flex-column gap-3">
              <div>
                <label
                  className="text-uppercase text-muted fw-bold d-block mb-2"
                  style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  placeholder="alexchen"
                  className={`form-control border-0 rounded-3 px-3 py-2.5 shadow-none ${errors.username ? "is-invalid" : ""}`}
                  style={{ backgroundColor: "#efeae4", fontSize: "0.9rem" }}
                />
                {errors.username && (
                  <div className="invalid-feedback">{errors.username}</div>
                )}
              </div>

              <div>
                <label
                  className="text-uppercase text-muted fw-bold d-block mb-2"
                  style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                  className={`form-control border-0 rounded-3 px-3 py-2.5 shadow-none ${errors.email ? "is-invalid" : ""}`}
                  style={{ backgroundColor: "#efeae4", fontSize: "0.9rem" }}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div>
                <label
                  className="text-uppercase text-muted fw-bold d-block mb-2"
                  style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                >
                  Password
                </label>
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Min. 6 characters"
                    className={`form-control border-0 rounded-3 px-3 py-2.5 pe-5 shadow-none ${errors.password ? "is-invalid" : ""}`}
                    style={{ backgroundColor: "#efeae4", fontSize: "0.9rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent text-muted px-3"
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                    ></i>
                  </button>
                </div>
                {errors.password && (
                  <div
                    className="text-danger mt-1"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {errors.password}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Identity information */}
        {step === 2 && (
          <div>
            <h2
              className="fs-3 fw-bold mb-1 text-dark"
              style={{ fontFamily: "Georgia, serif" }}
            >
              About you
            </h2>
            <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
              This appears on your public profile.
            </p>

            <div className="d-flex flex-column gap-3">
              <div>
                <label
                  className="text-uppercase text-muted fw-bold d-block mb-2"
                  style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Alex Chen"
                  className={`form-control border-0 rounded-3 px-3 py-2.5 shadow-none ${errors.fullName ? "is-invalid" : ""}`}
                  style={{ backgroundColor: "#efeae4", fontSize: "0.9rem" }}
                />
                {errors.fullName && (
                  <div className="invalid-feedback">{errors.fullName}</div>
                )}
              </div>

              <div>
                <label
                  className="text-uppercase text-muted fw-bold d-block mb-2"
                  style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={`form-control border-0 rounded-3 px-3 py-2.5 shadow-none ${errors.phone ? "is-invalid" : ""}`}
                  style={{ backgroundColor: "#efeae4", fontSize: "0.9rem" }}
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>

              <div>
                <label
                  className="text-uppercase text-muted fw-bold d-block mb-2"
                  style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                >
                  Gender Identity
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className={`form-select border-0 rounded-3 px-3 py-2.5 shadow-none ${errors.gender ? "is-invalid" : ""}`}
                  style={{
                    backgroundColor: "#efeae4",
                    fontSize: "0.9rem",
                    color: formData.gender ? "#212529" : "#6c757d",
                  }}
                >
                  <option value="" disabled>
                    Select gender identity
                  </option>
                  {GENDER_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      style={{ color: "#212529" }}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <div className="invalid-feedback">{errors.gender}</div>
                )}
              </div>

              <div>
                <label
                  className="text-uppercase text-muted fw-bold d-block mb-2"
                  style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                >
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  placeholder="30"
                  className={`form-control border-0 rounded-3 px-3 py-2.5 shadow-none ${errors.age ? "is-invalid" : ""}`}
                  style={{ backgroundColor: "#efeae4", fontSize: "0.9rem" }}
                />
                {errors.age && (
                  <div className="invalid-feedback">{errors.age}</div>
                )}
              </div>

              <div>
                <label
                  className="text-uppercase text-muted fw-bold d-block mb-2"
                  style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                >
                  Relationship Status
                </label>

                <select
                  value={formData.relationshipStatus}
                  onChange={(e) =>
                    updateField("relationshipStatus", e.target.value)
                  }
                  className="form-select border-0 rounded-3 px-3 py-2.5 shadow-none"
                  style={{
                    backgroundColor: "#efeae4",
                    fontSize: "0.9rem",
                    color: formData.relationshipStatus ? "#212529" : "#6c757d",
                  }}
                >
                  <option value="" disabled>
                    Select relationship status
                  </option>

                  {RELATIONSHIP_STATUS_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                      style={{ color: "#212529" }}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="text-uppercase text-muted fw-bold d-block mb-2"
                  style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                >
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  placeholder="California"
                  className={`form-control border-0 rounded-3 px-3 py-2.5 shadow-none ${errors.state ? "is-invalid" : ""}`}
                  style={{ backgroundColor: "#efeae4", fontSize: "0.9rem" }}
                />
                {errors.state && (
                  <div className="invalid-feedback">{errors.state}</div>
                )}
              </div>

              <div>
                <label
                  className="text-uppercase text-muted fw-bold d-block mb-2"
                  style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                >
                  Region
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => updateField("region", e.target.value)}
                  placeholder="Bay Area"
                  className={`form-control border-0 rounded-3 px-3 py-2.5 shadow-none ${errors.region ? "is-invalid" : ""}`}
                  style={{ backgroundColor: "#efeae4", fontSize: "0.9rem" }}
                />
                {errors.region && (
                  <div className="invalid-feedback">{errors.region}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Upload Profile Picture & Bio content */}
        {step === 3 && (
          <div>
            <h2
              className="fs-3 fw-bold mb-1 text-dark"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Your photo & bio
            </h2>
            <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
              First impressions matter. Make yours count.
            </p>

            <div className="d-flex flex-column align-items-center gap-4">
              {/* Photo Upload Box with Camera Icon Hover Overlays */}
              <div className="position-relative">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="d-none"
                />
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="rounded-4 d-flex flex-column align-items-center justify-content-center border border-dashed overflow-hidden position-relative"
                  style={{
                    width: "120px",
                    height: "120px",
                    backgroundColor: "#efeae4",
                    borderColor: "rgba(0,0,0,0.15)",
                    cursor: "pointer",
                  }}
                >
                  {formData.photoPreview ? (
                    <>
                      <img
                        src={formData.photoPreview}
                        alt="Preview"
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                      <div
                        className="position-absolute w-100 h-100 bg-black bg-opacity-40 d-flex align-items-center justify-content-center opacity-0 hover-opacity-100 transition-opacity"
                        style={{ top: 0, left: 0 }}
                      >
                        <i className="bi bi-camera text-white fs-4"></i>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted">
                      <i className="bi bi-camera fs-3"></i>
                      <div style={{ fontSize: "0.65rem", marginTop: "4px" }}>
                        Upload photo
                      </div>
                    </div>
                  )}
                </div>
                {formData.photoPreview && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        photo: null,
                        photoPreview: null,
                      }))
                    }
                    className="btn btn-sm bg-danger rounded-circle text-white position-absolute shadow-sm d-flex align-items-center justify-content-center"
                    style={{
                      top: "-6px",
                      right: "-6px",
                      width: "20px",
                      height: "20px",
                      padding: 0,
                    }}
                  >
                    <i className="bi bi-x" style={{ fontSize: "0.8rem" }}></i>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="btn btn-link text-decoration-underline p-0 border-0"
                style={{
                  fontSize: "0.8rem",
                  color: "#73112d",
                  fontWeight: "500",
                }}
              >
                Choose a photo
              </button>

              {/* Bio Field Input */}
              <div className="w-100">
                <label
                  className="text-uppercase text-muted fw-bold d-block mb-2"
                  style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                >
                  About Me
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    updateField("bio", e.target.value.slice(0, 300))
                  }
                  placeholder="Software engineer, amateur baker, chronic overthinker. Here to meet real people."
                  className={`form-control border-0 rounded-3 px-3 py-2.5 shadow-none ${errors.bio ? "is-invalid" : ""}`}
                  rows="4"
                  style={{
                    backgroundColor: "#efeae4",
                    fontSize: "0.9rem",
                    resize: "none",
                  }}
                ></textarea>
                <div className="d-flex justify-content-between mt-1">
                  <span className="text-danger" style={{ fontSize: "0.75rem" }}>
                    {errors.bio}
                  </span>
                  <span
                    className="text-muted ms-auto"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {formData.bio.length}/300
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Choose tags / interests dynamic grid */}
        {step === 4 && (
          <div>
            <h2
              className="fs-3 fw-bold mb-1 text-dark"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Your interests
            </h2>
            <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
              Pick what you love. You can always add more later.
            </p>

            {/* Scrolling grid */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {INTEREST_PRESETS.map((interest) => {
                const isSelected = formData.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className="btn px-3 py-1.5 rounded-pill border fw-normal transition-all"
                    style={{
                      fontSize: "0.8rem",
                      backgroundColor: isSelected ? "#73112d" : "#efeae4",
                      color: isSelected ? "#fff" : "#495057",
                      borderColor: isSelected ? "#73112d" : "rgba(0,0,0,0.05)",
                    }}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>

            {/* Custom Interest Entry */}
            <form
              onSubmit={addCustomInterest}
              className="d-flex align-items-center gap-2"
            >
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                placeholder="Add your own..."
                className="form-control border-0 rounded-pill px-4 py-2.5 shadow-none"
                style={{ backgroundColor: "#efeae4", fontSize: "0.9rem" }}
              />
              <button
                type="submit"
                className="btn rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm"
                style={{
                  width: "42px",
                  height: "42px",
                  backgroundColor: "#73112d",
                  color: "#fff",
                  border: "none",
                }}
              >
                <i className="bi bi-plus-lg fs-5"></i>
              </button>
            </form>
          </div>
        )}

        {/* STEP 5: Romance / Friends badge layout selection */}
        {step === 5 && (
          <div>
            <h2
              className="fs-3 fw-bold mb-1 text-dark"
              style={{ fontFamily: "Georgia, serif" }}
            >
              What are you here for?
            </h2>
            <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
              Your badge helps others understand your intentions.
            </p>

            <div className="d-flex flex-column gap-3">
              {BADGE_OPTIONS.map((option) => {
                const isSelected = formData.badge === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => updateField("badge", option.id)}
                    className="card border-0 rounded-4 shadow-sm bg-white p-3 d-flex flex-row align-items-center justify-content-between"
                    style={{
                      cursor: "pointer",
                      border: isSelected
                        ? "1.5px solid #73112d"
                        : "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "42px",
                          height: "42px",
                          backgroundColor: option.bg,
                          color: option.color,
                        }}
                      >
                        <i className={`bi ${option.icon} fs-5`}></i>
                      </div>
                      <div>
                        <h5 className="m-0 fs-6 fw-bold text-dark">
                          {option.label}
                        </h5>
                        <p
                          className="m-0 text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {option.description}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <i
                        className="bi bi-check-lg text-danger fs-5"
                        style={{ color: "#73112d" }}
                      ></i>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Looking For Options (Single box selection) */}
        {step === 6 && (
          <div>
            <h2
              className="fs-3 fw-bold mb-1 text-dark"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Who are you looking for?
            </h2>
            <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
              Select the option that best describes who you'd like to connect
              with.
            </p>

            <div className="d-flex flex-wrap gap-2 mb-3">
              {LOOKING_FOR_OPTIONS.map((option) => {
                const isSelected = formData.lookingFor === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField("lookingFor", option)}
                    className="btn px-3 py-2 rounded-pill border fw-normal transition-all"
                    style={{
                      fontSize: "0.85rem",
                      backgroundColor: isSelected ? "#73112d" : "#efeae4",
                      color: isSelected ? "#fff" : "#495057",
                      borderColor: isSelected ? "#73112d" : "rgba(0,0,0,0.05)",
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {errors.lookingFor && (
              <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>
                {errors.lookingFor}
              </div>
            )}
          </div>
        )}

        {/* Bottom Navigation Control Bar */}
        <div className="d-flex justify-content-end mt-4">
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="btn rounded-pill px-4 py-2 text-white fw-medium shadow-sm d-flex align-items-center gap-2"
            style={{
              backgroundColor: "#73112d",
              border: "none",
              fontSize: "0.9rem",
            }}
          >
            {loading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              <>
                <span>{step === 6 ? "Complete Sign Up" : "Continue"}</span>
                <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default SignUpFlow;
