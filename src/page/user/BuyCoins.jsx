import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import ContentLoader from "../../components/ContentLoader";
import OrderSummaryModal from "../../components/OrderSummaryModal";
import PaymentResultModal from "../../components/PaymentResultModal";
import api from "../../api/axios";

const BuyCoins = () => {
  const [userBalance, setUserBalance] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [showSubscription, setShowSubscription] = useState(
  () =>
    localStorage.getItem("enamoraLastSuccessfulPurchaseType") ===
    "subscription"
);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Packages from backend
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packageError, setPackageError] = useState("");

  const [selectedPkg, setSelectedPkg] = useState(null);

  // Modal Visibility States
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [resultModalState, setResultModalState] = useState({
    isOpen: false,
    isSuccess: true,
  });

  // ============================================================
  // FETCH PACKAGES
  // ============================================================
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoadingPackages(true);
        setPackageError("");

        const response = await api.get("packages");

        /*
          Your backend may return:

          {
            success: true,
            packages: [...]
          }

          or

          {
            success: true,
            data: [...]
          }

          We handle both formats.
        */

        const fetchedPackages =
          response.data?.packages || response.data?.data || [];

        setPackages(Array.isArray(fetchedPackages) ? fetchedPackages : []);
      } catch (error) {
        console.error(
          "Failed to fetch packages:",
          error.response?.status || error.message,
        );

        setPackageError(
          error.response?.data?.message ||
            "Unable to load packages. Please try again.",
        );

        setPackages([]);
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  // FETCH USER'S CURRENT POINTS BALANCE
  // FETCH USER'S CURRENT POINTS BALANCE

  useEffect(() => {
    let isMounted = true;

    const fetchBalance = async () => {
      try {
        setLoadingBalance(true);

        const response = await api.get("/profile/me");

        const profileUser =
          response.data?.user ||
          response.data?.data?.user ||
          response.data?.data ||
          response.data;

        if (isMounted && profileUser) {
          const balance = Number(profileUser.points);

          if (
            profileUser.points !== undefined &&
            profileUser.points !== null &&
            Number.isFinite(balance)
          ) {
            setUserBalance(balance);
          } else {
            console.error("Invalid points balance:", profileUser.points);
          }

          setSubscription(profileUser.subscription || null);
        }
      } catch (error) {
        console.error(
          "Failed to fetch profile:",
          error.response?.data || error.message,
        );
      } finally {
        if (isMounted) {
          setLoadingBalance(false);
        }
      }
    };

    fetchBalance();

    return () => {
      isMounted = false;
    };
  }, []);

  // ============================================================
  // OPEN CHECKOUT
  // ============================================================
  const handleOpenCheckout = (pkg) => {
    setSelectedPkg(pkg);
    setShowSummaryModal(true);
  };

  // ============================================================
  // CONFIRM PURCHASE
  // ============================================================
  // ============================================================
  // CONFIRM PURCHASE
  // ============================================================
  const handleConfirmPurchase = async (paymentMethod) => {
    setIsProcessing(true);

    try {
      const response = await api.post("/payments/checkout", {
        packageId: selectedPkg._id,
      });

      if (response.data.checkoutUrl) {
        // Redirect to Flutterwave's hosted payment page
        window.location.href = response.data.checkoutUrl;
      } else {
        setIsProcessing(false);
        setShowSummaryModal(false);
        setResultModalState({ isOpen: true, isSuccess: false });
      }
    } catch (error) {
      console.error(
        "Checkout initialization failed:",
        error.response?.status || error.message,
      );
      setIsProcessing(false);
      setShowSummaryModal(false);
      setResultModalState({ isOpen: true, isSuccess: false });
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loadingPackages) {
    return (
      <div
        className="min-vh-100 d-flex flex-column"
        style={{
          backgroundColor: "#FAF6F0",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <header className="px-3 px-md-4 py-3 bg-white border-bottom sticky-top shadow-sm z-3">
          <div
            className="mx-auto w-100 d-flex align-items-center justify-content-between"
            style={{ maxWidth: "1000px" }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "38px",
                  height: "38px",
                  backgroundColor: "#FFF0F3",
                }}
              >
                <i className="bi bi-heart-fill text-danger fs-5"></i>
              </div>

              <h1
                className="m-0 fs-4 fw-bold text-dark"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Get Chat Points
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-grow-1">
          <ContentLoader message="Loading available packages..." />
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        backgroundColor: "#FAF6F0",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}

      <header
        className="sticky-top bg-white border-bottom shadow-sm"
        style={{ zIndex: 1030 }}
      >
        <div
          className="container-fluid px-3 px-md-4 py-3"
          style={{ maxWidth: "1100px" }}
        >
          <div className="d-flex align-items-center justify-content-between gap-2 gap-md-3">
            {/* Back Button */}
            <Link
              to="/profile/me"
              className="d-inline-flex align-items-center justify-content-center rounded-circle text-dark text-decoration-none flex-shrink-0"
              aria-label="Back to profile"
              style={{
                width: "42px",
                height: "42px",
                backgroundColor: "#F8F8F8",
                border: "1px solid #EEEEEE",
                transition: "background-color 0.2s ease",
              }}
            >
              <i className="bi bi-arrow-left fs-5"></i>
            </Link>

            {/* Page Title */}
            <div className="d-flex align-items-center gap-2 gap-md-3 flex-grow-1 min-w-0">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{
                  width: "42px",
                  height: "42px",
                  backgroundColor: "#FFF0F3",
                }}
              >
                <i className="bi bi-heart-fill text-danger fs-5"></i>
              </div>

              <div className="min-w-0">
                <h1
                  className="m-0 fw-bold text-dark"
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "clamp(1rem, 3.5vw, 1.5rem)",
                    lineHeight: 1.25,
                  }}
                >
                  Get Chat Points
                </h1>

                <p
                  className="d-none d-sm-block mb-0 mt-1 text-secondary"
                  style={{ fontSize: "0.78rem" }}
                >
                  Keep the conversation going
                </p>
              </div>
            </div>

            {/* Toggle Points Balance / Subscription */}
            <div
              className="d-flex align-items-center gap-2 rounded-pill flex-shrink-0"
              style={{
                backgroundColor: "#FFF8F9",
                border: "1px solid #F5D0D8",
                padding: "9px 12px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(115, 17, 45, 0.05)",
              }}
              title="Click to switch between points and subscription"
            >
              <i
                className={`bi ${
                  showSubscription ? "bi-patch-check-fill" : "bi-coin"
                }`}
                style={{
                  color: showSubscription ? "#15803D" : "#D97706",
                  fontSize: "1.1rem",
                }}
              />

              <div className="d-flex flex-column" style={{ lineHeight: 1.2 }}>
                <span
                  className="text-secondary d-none d-sm-block"
                  style={{ fontSize: "0.68rem" }}
                >
                  {showSubscription ? "Subscription" : "Your balance"}
                </span>

                <span
                  className="fw-bold text-nowrap"
                  style={{
                    color: showSubscription ? "#166534" : "#73112D",
                    fontSize: "clamp(0.7rem, 2.5vw, 0.9rem)",
                  }}
                >
                  {loadingBalance
                    ? "Checking..."
                    : showSubscription
                      ? subscription?.status === "active"
                        ? "Subscribed"
                        : "Not Subscribed"
                      : `${userBalance} Points`}
                </span>

                {!loadingBalance &&
                  showSubscription &&
                  subscription?.status === "active" && (
                    <span
                      className="text-secondary text-capitalize"
                      style={{ fontSize: "0.68rem" }}
                    >
                      {subscription.plan || "Premium"}
                    </span>
                  )}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main
        className="flex-grow-1 px-3 px-sm-4 py-4 py-md-5 mx-auto w-100"
        style={{ maxWidth: "1000px" }}
      >
        <div className="text-center mb-4 mb-md-5">
          <span
            className="badge rounded-pill text-uppercase mb-2 px-3 py-2 fw-semibold"
            style={{
              backgroundColor: "#FFF0F3",
              color: "#73112D",
              letterSpacing: "0.5px",
              fontSize: "0.75rem",
            }}
          >
            Refill Your Balance
          </span>

          <h2
            className="fs-2 fw-bold text-dark mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Top Up Your Account
          </h2>

          <p
            className="text-muted mx-auto m-0"
            style={{
              fontSize: "0.95rem",
              maxWidth: "520px",
            }}
          >
            Choose a package to continue direct messaging your matches instantly
            without interruptions.
          </p>
        </div>

        {/* Error */}
        {packageError && (
          <div
            className="alert alert-danger rounded-3 border-0 shadow-sm"
            role="alert"
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-circle-fill"></i>

              <span>{packageError}</span>
            </div>
          </div>
        )}

        {/* No Packages */}
        {!packageError && packages.length === 0 && (
          <div className="text-center py-5">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#FFF0F3",
              }}
            >
              <i
                className="bi bi-box-seam fs-4"
                style={{ color: "#73112D" }}
              ></i>
            </div>

            <h5 className="fw-bold text-dark">No packages available</h5>

            <p className="text-muted mb-0">
              Please check back later for available packages.
            </p>
          </div>
        )}

        {/* Package Grid */}
        {packages.length > 0 && (
          <div className="row g-4">
            {packages
              .filter((pkg) => pkg.isActive === true)
              .map((pkg, idx) => (
                <div key={pkg._id || idx} className="col-12 col-md-6">
                  <div
                    className={`card rounded-4 p-4 h-100 position-relative bg-white border-0 transition-all ${
                      pkg.popular ? "shadow-lg" : "shadow-sm"
                    }`}
                    style={{
                      outline: pkg.popular
                        ? "2px solid #73112D"
                        : "1px solid #EFEAE4",
                      outlineOffset: "-1px",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    {/* Popular Badge */}
                    {pkg.popular && (
                      <span
                        className="position-absolute top-0 end-0 translate-middle-y me-4 badge rounded-pill text-white fw-bold shadow-sm d-flex align-items-center gap-1"
                        style={{
                          backgroundColor: "#73112D",
                          fontSize: "0.72rem",
                          padding: "0.5em 0.9em",
                          letterSpacing: "0.3px",
                        }}
                      >
                        <i className="bi bi-star-fill text-warning"></i>
                        Most Popular
                      </span>
                    )}

                    <div className="d-flex flex-column h-100 justify-content-between">
                      <div>
                        {/* Name + Price */}
                        <div className="d-flex justify-content-between align-items-baseline mb-2">
                          <h5 className="fw-bold text-dark m-0 fs-5">
                            {pkg.name}
                          </h5>

                          <div className="text-end">
                            <span
                              className="fw-bold fs-3"
                              style={{ color: "#73112D" }}
                            >
                              ${Number(pkg.price).toFixed(2)}
                            </span>

                            <span className="fs-6 text-muted ms-1 fw-normal">
                              {pkg.currency || "USD"}
                            </span>
                          </div>
                        </div>

                        {/* Package Type / Points */}
                        <div className="d-flex align-items-center gap-2 mb-3 bg-light rounded-3 p-2 border">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "32px",
                              height: "32px",
                              backgroundColor: "#FEF3C7",
                            }}
                          >
                            <i
                              className={
                                pkg.type === "subscription"
                                  ? "bi bi-calendar-heart fs-6"
                                  : "bi bi-coin fs-6"
                              }
                              style={{ color: "#D97706" }}
                            ></i>
                          </div>

                          <span
                            className="fw-bold text-dark"
                            style={{ fontSize: "1.1rem" }}
                          >
                            {pkg.type === "points" ? (
                              <>
                                {pkg.points}{" "}
                                <span className="fw-normal text-muted fs-6">
                                  Points
                                </span>
                              </>
                            ) : (
                              <>
                                {pkg.duration}{" "}
                                <span className="fw-normal text-muted fs-6">
                                  {pkg.durationUnit || "days"}
                                </span>{" "}
                                Free Chat
                              </>
                            )}
                          </span>
                        </div>

                        {/* Description */}
                        <p
                          className="text-muted mb-4"
                          style={{
                            fontSize: "0.875rem",
                            lineHeight: "1.5",
                          }}
                        >
                          {pkg.description}
                        </p>
                      </div>

                      {/* Select Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenCheckout(pkg)}
                        className="btn w-100 rounded-pill fw-bold text-white shadow-sm py-2.5 d-flex align-items-center justify-content-center gap-2"
                        style={{
                          backgroundColor: pkg.popular ? "#73112D" : "#1E293B",
                          fontSize: "0.9rem",
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        <span>Select Package</span>

                        <i className="bi bi-arrow-right fs-6"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <OrderSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        packageData={selectedPkg}
        onConfirm={handleConfirmPurchase}
        isProcessing={isProcessing}
      />

      <PaymentResultModal
        isOpen={resultModalState.isOpen}
        onClose={() =>
          setResultModalState((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
        isSuccess={resultModalState.isSuccess}
        packageData={selectedPkg}
      />
    </div>
  );
};

export default BuyCoins;
