import React, { useState } from "react";
import AdminNavbar from "./adminHearder";
import api from "../../api/axios";

const AdminCreateData = () => {
  const [activeTab, setActiveTab] = useState("premium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // ==============================
  // USER FORM
  // ==============================
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    gender: "",
    age: "",
    bio: "",
    badge: "Love & Friends",
    relationshipStatus: "",
    state: "",
    region: "",
    interests: "",
    lookingFor: "",
    photo: null,
  });

  const [photoPreview, setPhotoPreview] = useState("");

  // ==============================
  // PACKAGE FORM
  // ==============================
  const [packageForm, setPackageForm] = useState({
    name: "",
    type: "points",
    price: "",
    currency: "USD",
    points: "",
    duration: "",
    durationUnit: "days",
    description: "",
    isActive: true,
  });

  // ==============================
  // USER INPUT
  // ==============================
  const handleUserChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo" && files?.[0]) {
      const file = files[0];

      setUserForm((prev) => ({
        ...prev,
        photo: file,
      }));

      setPhotoPreview(URL.createObjectURL(file));
      return;
    }

    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // PACKAGE INPUT
  // ==============================
  const handlePackageChange = (e) => {
    const { name, value } = e.target;

    setPackageForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // USER SUBMIT
  // ==============================
  const handleUserSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    const endpointByTab = {
      premium: "/admin/create-premium-user",
      fake: "/admin/fake-accounts",
      moderator: "/admin/moderators",
    };

    const payload = {
      ...userForm,
      interests: userForm.interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      lookingFor: userForm.lookingFor
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    delete payload.photo;

    try {
      const response = await api.post(endpointByTab[activeTab], payload);
      setFeedback({
        type: "success",
        message: response.data?.message || "Account created successfully.",
      });
      resetUserForm();
    } catch (error) {
      setFeedback({
        type: "danger",
        message:
          error.response?.data?.message ||
          "Unable to create this account. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==============================
  // PACKAGE SUBMIT
  // ==============================
  const handlePackageSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    const payload = {
      name: packageForm.name,
      type: packageForm.type,
      price: Number(packageForm.price),
      currency: packageForm.currency,
      description: packageForm.description,
      isActive: packageForm.isActive,
    };

    if (packageForm.type === "points") {
      payload.points = Number(packageForm.points);
    } else {
      payload.duration = Number(packageForm.duration);
      payload.durationUnit = packageForm.durationUnit;
    }

    try {
      const response = await api.post("/admin/packages", payload);
      setFeedback({
        type: "success",
        message: response.data?.message || "Package created successfully.",
      });
      resetPackageForm();
    } catch (error) {
      setFeedback({
        type: "danger",
        message:
          error.response?.data?.message ||
          "Unable to create this package. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==============================
  // RESET USER
  // ==============================
  const resetUserForm = () => {
    setUserForm({
      username: "",
      email: "",
      password: "",
      fullName: "",
      phone: "",
      gender: "",
      age: "",
      bio: "",
      badge: "Love & Friends",
      relationshipStatus: "",
      state: "",
      region: "",
      interests: "",
      lookingFor: "",
      photo: null,
    });

    setPhotoPreview("");
  };

  // ==============================
  // RESET PACKAGE
  // ==============================
  const resetPackageForm = () => {
    setPackageForm({
      name: "",
      type: "points",
      price: "",
      currency: "USD",
      points: "",
      duration: "",
      durationUnit: "days",
      description: "",
      isActive: true,
    });
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="">

        {/* ==========================================
            HEADER
        ========================================== */}

        <AdminNavbar />

        {feedback.message && (
          <div className={`alert alert-${feedback.type} mt-3`} role="alert">
            {feedback.message}
          </div>
        )}


        {/* ==========================================
            TABS
        ========================================== */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-2">
            <div className="row g-2">

              {/* PREMIUM TAB */}
              <div className="col-12 col-md-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("premium")}
                  className={`btn w-100 rounded-3 py-3 border-0 ${
                    activeTab === "premium"
                      ? "bg-danger text-white shadow-sm"
                      : "bg-light text-dark"
                  }`}
                >
                  <div className="fs-4 mb-1">👑</div>

                  <div className="fw-bold">
                    Premium User
                  </div>

                  <small
                    className={
                      activeTab === "premium"
                        ? "text-white-50"
                        : "text-secondary"
                    }
                  >
                    Create premium account
                  </small>
                </button>
              </div>

              {/* MODERATOR TAB */}
              <div className="col-12 col-md-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("moderator")}
                  className={`btn w-100 rounded-3 py-3 border-0 ${
                    activeTab === "moderator"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-light text-dark"
                  }`}
                >
                  <div className="fs-4 mb-1">🛡️</div>

                  <div className="fw-bold">
                    Moderator
                  </div>

                  <small
                    className={
                      activeTab === "moderator"
                        ? "text-white-50"
                        : "text-secondary"
                    }
                  >
                    Create moderator account
                  </small>
                </button>
              </div>

              {/* FAKE ACCOUNT TAB */}
              <div className="col-12 col-md-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("fake")}
                  className={`btn w-100 rounded-3 py-3 border-0 ${
                    activeTab === "fake"
                      ? "bg-dark text-white shadow-sm"
                      : "bg-light text-dark"
                  }`}
                >
                  <div className="fs-4 mb-1">🎭</div>
                  <div className="fw-bold">Fake Account</div>
                  <small
                    className={
                      activeTab === "fake"
                        ? "text-white-50"
                        : "text-secondary"
                    }
                  >
                    Create managed account
                  </small>
                </button>
              </div>

              {/* PACKAGE TAB */}
              <div className="col-12 col-md-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("package")}
                  className={`btn w-100 rounded-3 py-3 border-0 ${
                    activeTab === "package"
                      ? "bg-danger text-white shadow-sm"
                      : "bg-light text-dark"
                  }`}
                >
                  <div className="fs-4 mb-1">🎁</div>

                  <div className="fw-bold">
                    Package
                  </div>

                  <small
                    className={
                      activeTab === "package"
                        ? "text-white-50"
                        : "text-secondary"
                    }
                  >
                    Create payment package
                  </small>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* =====================================================
            PREMIUM USER / MODERATOR
        ===================================================== */}
        {(activeTab === "premium" ||
          activeTab === "moderator" ||
          activeTab === "fake") && (
          <div className="row g-4">

            {/* FORM */}
            <div className="col-xl-8">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 p-lg-5">

                  {/* FORM HEADER */}
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div
                      className={`rounded-3 d-flex align-items-center justify-content-center ${
                        activeTab === "premium"
                          ? "bg-warning bg-opacity-10"
                          : "bg-primary bg-opacity-10"
                      }`}
                      style={{
                        width: "55px",
                        height: "55px",
                        fontSize: "25px",
                      }}
                    >
                      {activeTab === "premium"
                        ? "👑"
                        : "🛡️"}
                    </div>

                    <div>
                      <h4 className="fw-bold mb-1">
                        {activeTab === "premium"
                          ? "Create Premium User"
                          : activeTab === "fake"
                            ? "Create Fake Account"
                            : "Create Moderator"}
                      </h4>

                      <p className="text-secondary mb-0">
                        Add complete profile information below.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUserSubmit}>

                    {/* ACCOUNT */}
                    <div className="mb-4">
                      <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                        Account Information
                      </h6>

                      <div className="row g-3">

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            Username
                          </label>

                          <input
                            type="text"
                            name="username"
                            className="form-control form-control-lg rounded-3"
                            placeholder="Enter username"
                            value={userForm.username}
                            onChange={handleUserChange}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            Email Address
                          </label>

                          <input
                            type="email"
                            name="email"
                            className="form-control form-control-lg rounded-3"
                            placeholder="example@email.com"
                            value={userForm.email}
                            onChange={handleUserChange}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            Password
                          </label>

                          <input
                            type="password"
                            name="password"
                            className="form-control form-control-lg rounded-3"
                            placeholder="Create password"
                            value={userForm.password}
                            onChange={handleUserChange}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            Full Name
                          </label>

                          <input
                            type="text"
                            name="fullName"
                            className="form-control form-control-lg rounded-3"
                            placeholder="Enter full name"
                            value={userForm.fullName}
                            onChange={handleUserChange}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            Phone Number
                          </label>

                          <input
                            type="tel"
                            name="phone"
                            className="form-control form-control-lg rounded-3"
                            placeholder="+234..."
                            value={userForm.phone}
                            onChange={handleUserChange}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label fw-semibold">
                            Gender
                          </label>

                          <select
                            name="gender"
                            className="form-select form-select-lg rounded-3"
                            value={userForm.gender}
                            onChange={handleUserChange}
                            required
                          >
                            <option value="">
                              Select
                            </option>
                            <option value="male">
                              Male
                            </option>
                            <option value="female">
                              Female
                            </option>
                          </select>
                        </div>

                        <div className="col-md-3">
                          <label className="form-label fw-semibold">
                            Age
                          </label>

                          <input
                            type="number"
                            name="age"
                            min="18"
                            className="form-control form-control-lg rounded-3"
                            placeholder="18+"
                            value={userForm.age}
                            onChange={handleUserChange}
                            required
                          />
                        </div>

                      </div>
                    </div>

                    {/* PROFILE */}
                    <div className="mb-4">
                      <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                        Profile Information
                      </h6>

                      <div className="row g-3">

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            Badge
                          </label>

                          <select
                            name="badge"
                            className="form-select form-select-lg rounded-3"
                            value={userForm.badge}
                            onChange={handleUserChange}
                          >
                            <option value="Romance">
                              Romance
                            </option>

                            <option value="Friends">
                              Friends
                            </option>

                            <option value="Love & Friends">
                              Love & Friends
                            </option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            Relationship Status
                          </label>

                          <select
                            name="relationshipStatus"
                            className="form-select form-select-lg rounded-3"
                            value={
                              userForm.relationshipStatus
                            }
                            onChange={handleUserChange}
                          >
                            <option value="">
                              Select status
                            </option>

                            <option value="Single">
                              Single
                            </option>

                            <option value="In a relationship">
                              In a relationship
                            </option>

                            <option value="Married">
                              Married
                            </option>

                            <option value="Divorced">
                              Divorced
                            </option>

                            <option value="Widowed">
                              Widowed
                            </option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            State
                          </label>

                          <input
                            type="text"
                            name="state"
                            className="form-control form-control-lg rounded-3"
                            placeholder="Enter state"
                            value={userForm.state}
                            onChange={handleUserChange}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            Region
                          </label>

                          <input
                            type="text"
                            name="region"
                            className="form-control form-control-lg rounded-3"
                            placeholder="Enter region"
                            value={userForm.region}
                            onChange={handleUserChange}
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-semibold">
                            Bio
                          </label>

                          <textarea
                            name="bio"
                            rows="4"
                            maxLength="300"
                            className="form-control rounded-3"
                            placeholder="Write a short profile description..."
                            value={userForm.bio}
                            onChange={handleUserChange}
                          />

                          <div className="text-end mt-1">
                            <small className="text-secondary">
                              {userForm.bio.length}/300
                            </small>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            Interests
                          </label>

                          <input
                            type="text"
                            name="interests"
                            className="form-control form-control-lg rounded-3"
                            placeholder="Music, Travel, Movies"
                            value={userForm.interests}
                            onChange={handleUserChange}
                          />

                          <small className="text-secondary">
                            Separate interests with commas.
                          </small>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            Looking For
                          </label>

                          <input
                            type="text"
                            name="lookingFor"
                            className="form-control form-control-lg rounded-3"
                            placeholder="Friendship, Love..."
                            value={userForm.lookingFor}
                            onChange={handleUserChange}
                          />
                        </div>

                      </div>
                    </div>

                    {/* PHOTO */}
                    <div className="mb-4">
                      <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                        Profile Photo
                      </h6>

                      <div className="row align-items-center g-3">

                        <div className="col-md-4 text-center">
                          <div
                            className="mx-auto rounded-circle overflow-hidden bg-light border"
                            style={{
                              width: "130px",
                              height: "130px",
                            }}
                          >
                            {photoPreview ? (
                              <img
                                src={photoPreview}
                                alt="Preview"
                                className="w-100 h-100"
                                style={{
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary">
                                <span
                                  style={{
                                    fontSize: "40px",
                                  }}
                                >
                                  👤
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-8">
                          <label className="form-label fw-semibold">
                            Upload Photo
                          </label>

                          <input
                            type="file"
                            name="photo"
                            accept="image/jpeg,image/png,image/jpg"
                            className="form-control form-control-lg rounded-3"
                            onChange={handleUserChange}
                          />

                          <small className="text-secondary">
                            Recommended: JPG or PNG image.
                          </small>
                        </div>

                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-3 border-top">

                      <button
                        type="button"
                        onClick={resetUserForm}
                        className="btn btn-light border rounded-3 px-4 py-2"
                      >
                        Clear Form
                      </button>

                      <button
                        type="submit"
                        className={`btn rounded-3 px-4 py-2 fw-semibold ${
                          activeTab === "premium"
                            ? "btn-warning"
                            : "btn-primary"
                        }`}
                      >
                        {activeTab === "premium"
                          ? "👑 Create Premium User"
                          : "🛡️ Create Moderator"}
                      </button>

                    </div>

                  </form>
                </div>
              </div>
            </div>

            {/* SIDE INFO */}
            <div className="col-xl-4">

              <div
                className={`card border-0 shadow-sm rounded-4 overflow-hidden ${
                  activeTab === "premium"
                    ? "bg-warning bg-opacity-10"
                    : "bg-primary bg-opacity-10"
                }`}
              >
                <div className="card-body p-4">

                  <div className="fs-1 mb-3">
                    {activeTab === "premium"
                      ? "👑"
                      : "🛡️"}
                  </div>

                  <h4 className="fw-bold">
                    {activeTab === "premium"
                      ? "Premium Account"
                      : "Moderator Account"}
                  </h4>

                  <p className="text-secondary">
                    {activeTab === "premium"
                      ? "Create a premium account with a complete LoveLink profile. This account can access premium platform features."
                      : "Create a moderator account for managing conversations, fake accounts and other moderation activities."}
                  </p>

                  <hr />

                  <div className="d-flex gap-2 mb-3">
                    <span>✓</span>
                    <span>Complete profile</span>
                  </div>

                  <div className="d-flex gap-2 mb-3">
                    <span>✓</span>
                    <span>Profile photo</span>
                  </div>

                  <div className="d-flex gap-2">
                    <span>✓</span>
                    <span>Secure account credentials</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* =====================================================
            PACKAGE
        ===================================================== */}
        {activeTab === "package" && (
          <div className="row g-4">

            {/* PACKAGE FORM */}
            <div className="col-xl-8">

              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 p-lg-5">

                  {/* HEADER */}
                  <div className="d-flex align-items-center gap-3 mb-4">

                    <div
                      className="rounded-3 bg-danger bg-opacity-10 d-flex align-items-center justify-content-center"
                      style={{
                        width: "55px",
                        height: "55px",
                        fontSize: "25px",
                      }}
                    >
                      🎁
                    </div>

                    <div>
                      <h4 className="fw-bold mb-1">
                        Create Package
                      </h4>

                      <p className="text-secondary mb-0">
                        Create a point package or free-chat subscription.
                      </p>
                    </div>

                  </div>

                  <form onSubmit={handlePackageSubmit}>

                    {/* BASIC */}
                    <div className="mb-4">

                      <h6 className="fw-bold border-bottom pb-2 mb-3">
                        Package Information
                      </h6>

                      <div className="row g-3">

                        <div className="col-md-8">
                          <label className="form-label fw-semibold">
                            Package Name
                          </label>

                          <input
                            type="text"
                            name="name"
                            className="form-control form-control-lg rounded-3"
                            placeholder="e.g. Starter Points"
                            value={packageForm.name}
                            onChange={handlePackageChange}
                            required
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label fw-semibold">
                            Package Type
                          </label>

                          <select
                            name="type"
                            className="form-select form-select-lg rounded-3"
                            value={packageForm.type}
                            onChange={handlePackageChange}
                          >
                            <option value="points">
                              Points
                            </option>

                            <option value="subscription">
                              Subscription
                            </option>
                          </select>
                        </div>

                      </div>
                    </div>

                    {/* PRICING */}
                    <div className="mb-4">

                      <h6 className="fw-bold border-bottom pb-2 mb-3">
                        Pricing
                      </h6>

                      <div className="row g-3">

                        <div className="col-md-8">
                          <label className="form-label fw-semibold">
                            Price
                          </label>

                          <div className="input-group input-group-lg">
                            <span className="input-group-text bg-white">
                              $
                            </span>

                            <input
                              type="number"
                              name="price"
                              min="0"
                              step="0.01"
                              className="form-control rounded-end-3"
                              placeholder="5.00"
                              value={packageForm.price}
                              onChange={handlePackageChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-4">
                          <label className="form-label fw-semibold">
                            Currency
                          </label>

                          <select
                            name="currency"
                            className="form-select form-select-lg rounded-3"
                            value={packageForm.currency}
                            onChange={handlePackageChange}
                          >
                            <option value="USD">
                              USD ($)
                            </option>
                          </select>
                        </div>

                      </div>
                    </div>

                    {/* BENEFITS */}
                    <div className="mb-4">

                      <h6 className="fw-bold border-bottom pb-2 mb-3">
                        Package Benefits
                      </h6>

                      {packageForm.type === "points" ? (
                        <div>

                          <label className="form-label fw-semibold">
                            Points to Give
                          </label>

                          <div className="input-group input-group-lg">
                            <span className="input-group-text bg-white">
                              💰
                            </span>

                            <input
                              type="number"
                              name="points"
                              min="1"
                              className="form-control rounded-end-3"
                              placeholder="e.g. 10"
                              value={packageForm.points}
                              onChange={handlePackageChange}
                              required
                            />
                          </div>

                          <div className="alert alert-info border-0 rounded-3 mt-3 mb-0">
                            <small>
                              These points will be added to the user's
                              account after a successful payment.
                            </small>
                          </div>

                        </div>
                      ) : (
                        <div className="row g-3">

                          <div className="col-md-6">

                            <label className="form-label fw-semibold">
                              Duration
                            </label>

                            <input
                              type="number"
                              name="duration"
                              min="0.1"
                              step="0.1"
                              className="form-control form-control-lg rounded-3"
                              placeholder="17.5"
                              value={packageForm.duration}
                              onChange={handlePackageChange}
                              required
                            />

                          </div>

                          <div className="col-md-6">

                            <label className="form-label fw-semibold">
                              Duration Unit
                            </label>

                            <select
                              name="durationUnit"
                              className="form-select form-select-lg rounded-3"
                              value={packageForm.durationUnit}
                              onChange={handlePackageChange}
                            >
                              <option value="days">
                                Days
                              </option>

                              <option value="months">
                                Months
                              </option>
                            </select>

                          </div>

                          <div className="col-12">
                            <div className="alert alert-danger bg-danger bg-opacity-10 border-0 rounded-3">
                              <strong>Example:</strong>{" "}
                              2.5 weeks = 17.5 days
                            </div>
                          </div>

                        </div>
                      )}

                    </div>

                    {/* DESCRIPTION */}
                    <div className="mb-4">

                      <h6 className="fw-bold border-bottom pb-2 mb-3">
                        Description
                      </h6>

                      <textarea
                        name="description"
                        rows="4"
                        maxLength="500"
                        className="form-control rounded-3"
                        placeholder="Describe what this package offers..."
                        value={packageForm.description}
                        onChange={handlePackageChange}
                      />

                      <div className="text-end mt-1">
                        <small className="text-secondary">
                          {packageForm.description.length}/500
                        </small>
                      </div>

                    </div>

                    {/* STATUS */}
                    <div className="card bg-light border-0 rounded-3 mb-4">
                      <div className="card-body">

                        <div className="d-flex justify-content-between align-items-center">

                          <div>
                            <h6 className="fw-bold mb-1">
                              Package Status
                            </h6>

                            <small className="text-secondary">
                              Make this package available for users.
                            </small>
                          </div>

                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={packageForm.isActive}
                              onChange={(e) =>
                                setPackageForm((prev) => ({
                                  ...prev,
                                  isActive:
                                    e.target.checked,
                                }))
                              }
                            />

                            <label className="form-check-label fw-semibold">
                              {packageForm.isActive
                                ? "Active"
                                : "Inactive"}
                            </label>
                          </div>

                        </div>

                      </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 border-top pt-4">

                      <button
                        type="button"
                        className="btn btn-light border rounded-3 px-4"
                        onClick={resetPackageForm}
                      >
                        Clear
                      </button>

                      <button
                        type="submit"
                        className="btn btn-danger rounded-3 px-4 fw-semibold"
                      >
                        🎁 Create Package
                      </button>

                    </div>

                  </form>

                </div>
              </div>

            </div>

            {/* PACKAGE PREVIEW */}
            <div className="col-xl-4">

              <div className="card border-0 shadow-sm rounded-4 overflow-hidden sticky-xl-top"
                style={{ top: "20px" }}
              >

                <div className="bg-danger text-white p-3">
                  <small className="fw-bold">
                    PACKAGE PREVIEW
                  </small>
                </div>

                <div className="card-body p-4 text-center">

                  <div
                    className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{
                      width: "75px",
                      height: "75px",
                      fontSize: "30px",
                    }}
                  >
                    🎁
                  </div>

                  <h4 className="fw-bold">
                    {packageForm.name ||
                      "Your Package Name"}
                  </h4>

                  <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 mb-3">
                    {packageForm.type === "points"
                      ? "POINTS PACKAGE"
                      : "SUBSCRIPTION"}
                  </span>

                  <div className="display-5 fw-bold text-dark mb-4">
                    $
                    {packageForm.price
                      ? Number(
                          packageForm.price
                        ).toFixed(2)
                      : "0.00"}

                    <small className="fs-6 text-secondary">
                      {" "}
                      USD
                    </small>
                  </div>

                  <div className="card bg-light border-0 rounded-3">
                    <div className="card-body">

                      {packageForm.type === "points" ? (
                        <>
                          <small className="text-secondary fw-semibold">
                            YOU WILL RECEIVE
                          </small>

                          <h3 className="fw-bold text-danger my-2">
                            {packageForm.points ||
                              "0"}{" "}
                            Points
                          </h3>

                          <p className="text-secondary small mb-0">
                            Use points to start conversations
                            with other users.
                          </p>
                        </>
                      ) : (
                        <>
                          <small className="text-secondary fw-semibold">
                            FREE CHAT ACCESS
                          </small>

                          <h3 className="fw-bold text-danger my-2">
                            {packageForm.duration ||
                              "0"}{" "}
                            {packageForm.durationUnit}
                          </h3>

                          <p className="text-secondary small mb-0">
                            Enjoy free chat access during this
                            subscription period.
                          </p>
                        </>
                      )}

                    </div>
                  </div>

                  <div className="mt-4">

                    <span
                      className={`badge rounded-pill px-3 py-2 ${
                        packageForm.isActive
                          ? "bg-success bg-opacity-10 text-success"
                          : "bg-secondary bg-opacity-10 text-secondary"
                      }`}
                    >
                      {packageForm.isActive
                        ? "● Active"
                        : "● Inactive"}
                    </span>

                  </div>

                  {packageForm.description && (
                    <div className="text-start mt-4 pt-3 border-top">

                      <small className="text-secondary fw-semibold">
                        DESCRIPTION
                      </small>

                      <p className="text-secondary small mt-2 mb-0">
                        {packageForm.description}
                      </p>

                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminCreateData;