import React, { useState, useEffect } from "react";

import OrderSummaryModal from "../../components/OrderSummaryModal";
import PaymentResultModal from "../../components/PaymentResultModal";
import api from "../../api/axios";

const BuyCoins = () => {
  const [userBalance, setUserBalance] = useState(12);

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

        const response = await api.get(
          "packages"
        );

        console.log("Packages response:", response.data);

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
          response.data?.packages ||
          response.data?.data ||
          [];

        setPackages(Array.isArray(fetchedPackages) ? fetchedPackages : []);

      } catch (error) {
        console.error("Failed to fetch packages:", error);

        setPackageError(
          error.response?.data?.message ||
          "Unable to load packages. Please try again."
        );

        setPackages([]);
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
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
  const handleConfirmPurchase = (paymentMethod) => {
    setIsProcessing(true);

    // Simulated API response
    setTimeout(() => {
      setIsProcessing(false);
      setShowSummaryModal(false);

      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        /*
          Only add points when the package actually
          contains points.
        */
        if (selectedPkg?.points) {
          setUserBalance(
            (prev) => prev + Number(selectedPkg.points)
          );
        }

        setResultModalState({
          isOpen: true,
          isSuccess: true,
        });
      } else {
        setResultModalState({
          isOpen: true,
          isSuccess: false,
        });
      }
    }, 1500);
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

        <main className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div
              className="spinner-border"
              style={{ color: "#73112D" }}
              role="status"
            ></div>

            <p className="text-muted mt-3 mb-0">
              Loading available packages...
            </p>
          </div>
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

          {/* Dynamic Balance Display */}
          <div
            className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill shadow-sm"
            style={{
              backgroundColor: "#FFF8F9",
              border: "1px solid #F5D0D8",
            }}
          >
            <i
              className="bi bi-coin"
              style={{ color: "#D97706" }}
            ></i>

            <span
              className="fw-bold text-dark"
              style={{ fontSize: "0.85rem" }}
            >
              Balance:{" "}
              <span
                style={{
                  color: "#73112D",
                  fontWeight: "800",
                }}
              >
                {userBalance} Points
              </span>
            </span>
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
            Choose a package to continue direct messaging
            your matches instantly without interruptions.
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

            <h5 className="fw-bold text-dark">
              No packages available
            </h5>

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
                <div
                  key={pkg._id || idx}
                  className="col-12 col-md-6"
                >
                  <div
                    className={`card rounded-4 p-4 h-100 position-relative bg-white border-0 transition-all ${
                      pkg.popular
                        ? "shadow-lg"
                        : "shadow-sm"
                    }`}
                    style={{
                      outline:
                        pkg.popular
                          ? "2px solid #73112D"
                          : "1px solid #EFEAE4",
                      outlineOffset: "-1px",
                      transition:
                        "transform 0.2s ease, box-shadow 0.2s ease",
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
                        <div
                          className="d-flex align-items-center gap-2 mb-3 bg-light rounded-3 p-2 border"
                        >
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
                                </span>
                                {" "}Free Chat
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
                        onClick={() =>
                          handleOpenCheckout(pkg)
                        }
                        className="btn w-100 rounded-pill fw-bold text-white shadow-sm py-2.5 d-flex align-items-center justify-content-center gap-2"
                        style={{
                          backgroundColor:
                            pkg.popular
                              ? "#73112D"
                              : "#1E293B",
                          fontSize: "0.9rem",
                          transition:
                            "opacity 0.2s ease",
                        }}
                      >
                        <span>
                          Select Package
                        </span>

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
        onClose={() =>
          setShowSummaryModal(false)
        }
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
