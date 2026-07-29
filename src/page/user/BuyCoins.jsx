import React, { useState } from "react";
import OrderSummaryModal from "../../components/OrderSummaryModal";
import PaymentResultModal from "../../components/PaymentResultModal";

const COIN_PACKAGES = [
  {
    name: "Starter Points",
    points: 50,
    price: 5,
    currency: "USD",
    stripePriceId: "price_starter_50",
    description: "50 chat points — Great for starting new matches",
    popular: false,
    active: true,
  },
  {
    name: "Popular Pack",
    points: 150,
    price: 10,
    currency: "USD",
    stripePriceId: "price_popular_150",
    description: "150 chat points — Save 25% on messaging",
    popular: true,
    active: true,
  },
  {
    name: "Pro Connect",
    points: 400,
    price: 20,
    currency: "USD",
    stripePriceId: "price_pro_400",
    description: "400 chat points — Best value for active daters",
    popular: false,
    active: true,
  },
  {
    name: "VIP Unlimited",
    points: 1000,
    price: 40,
    currency: "USD",
    stripePriceId: "price_vip_1000",
    description: "1000 chat points — Extended conversations & priority",
    popular: false,
    active: true,
  },
];

const BuyCoins = () => {
  const [userBalance, setUserBalance] = useState(12);
  const [selectedPkg, setSelectedPkg] = useState(null);
  
  // Modal Visibility States
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [resultModalState, setResultModalState] = useState({
    isOpen: false,
    isSuccess: true,
  });

  const handleOpenCheckout = (pkg) => {
    setSelectedPkg(pkg);
    setShowSummaryModal(true);
  };

  const handleConfirmPurchase = (paymentMethod) => {
    setIsProcessing(true);

    // Simulated API response (Simulates success or failure)
    setTimeout(() => {
      setIsProcessing(false);
      setShowSummaryModal(false);

      const isSuccess = Math.random() > 0.1; // 90% success rate simulation

      if (isSuccess) {
        setUserBalance((prev) => prev + selectedPkg.points);
        setResultModalState({ isOpen: true, isSuccess: true });
      } else {
        setResultModalState({ isOpen: true, isSuccess: false });
      }
    }, 1500);
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ backgroundColor: "#FAF6F0", fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Header */}
      <header className="px-4 py-3 bg-white border-bottom sticky-top shadow-sm">
        <div
          className="mx-auto w-100 d-flex align-items-center justify-content-between"
          style={{ maxWidth: "1000px" }}
        >
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: "1.2rem" }}>❤️</span>
            <h1 className="m-0 fs-4 fw-bold text-dark" style={{ fontFamily: "Georgia, serif" }}>
              Get Chat Points
            </h1>
          </div>

          {/* Dynamic Balance Display */}
          <div className="d-flex align-items-center gap-2 bg-light px-3 py-1.5 rounded-pill border">
            <span style={{ fontSize: "0.9rem" }}>🪙</span>
            <span className="fw-bold text-dark" style={{ fontSize: "0.85rem" }}>
              Balance: <span style={{ color: "#73112D" }}>{userBalance} Points</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow-1 px-3 px-sm-4 py-4 mx-auto w-100" style={{ maxWidth: "1000px" }}>
        <div className="text-center mb-4">
          <h2 className="fs-3 fw-bold text-dark mb-1" style={{ fontFamily: "Georgia, serif" }}>
            Top Up Your Account
          </h2>
          <p className="text-muted m-0" style={{ fontSize: "0.9rem" }}>
            Choose a package to continue direct messaging your matches instantly.
          </p>
        </div>

        {/* Package Grid */}
        <div className="row g-3">
          {COIN_PACKAGES.filter((pkg) => pkg.active).map((pkg, idx) => (
            <div key={idx} className="col-12 col-md-6">
              <div
                className={`card border-2 rounded-4 p-3 h-100 transition-all position-relative bg-white ${
                  pkg.popular ? "shadow-md" : "shadow-sm"
                }`}
                style={{
                  borderColor: pkg.popular ? "#73112D" : "#EFEAE4",
                }}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <span
                    className="position-absolute top-0 end-0 translate-middle-y me-3 badge rounded-pill text-white fw-semibold"
                    style={{
                      backgroundColor: "#73112D",
                      fontSize: "0.7rem",
                      padding: "0.4em 0.8em",
                    }}
                  >
                    Most Popular
                  </span>
                )}

                <div className="d-flex flex-column h-100 justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h5 className="fw-bold text-dark m-0">{pkg.name}</h5>
                      <span className="fw-extrabold fs-4" style={{ color: "#73112D" }}>
                        ${pkg.price} <span className="fs-6 text-muted">{pkg.currency}</span>
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-1 mb-2">
                      <span>🪙</span>
                      <span className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                        {pkg.points} Points
                      </span>
                    </div>

                    <p className="text-muted mb-3" style={{ fontSize: "0.82rem" }}>
                      {pkg.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenCheckout(pkg)}
                    className="btn w-100 rounded-pill fw-bold text-white shadow-xs py-2 border-0"
                    style={{
                      backgroundColor: pkg.popular ? "#73112D" : "#212529",
                      fontSize: "0.88rem",
                    }}
                  >
                    Select Package
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
        onClose={() => setResultModalState((prev) => ({ ...prev, isOpen: false }))}
        isSuccess={resultModalState.isSuccess}
        packageData={selectedPkg}
      />
    </div>
  );
};

export default BuyCoins;