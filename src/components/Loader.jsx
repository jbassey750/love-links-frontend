import React from "react";

const Loader = ({ message = "Loading, please wait...", fullScreen = false }) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4 text-center">
      <style>{`
        @keyframes imageBeat {
          0% {
            transform: scale(0.92);
            box-shadow: 0 0 0 0 rgba(115, 17, 45, 0.45);
          }

          35% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(115, 17, 45, 0.15);
          }

          50% {
            transform: scale(0.96);
            box-shadow: 0 0 0 14px rgba(115, 17, 45, 0.08);
          }

          70% {
            transform: scale(1);
            box-shadow: 0 0 0 20px rgba(115, 17, 45, 0);
          }

          100% {
            transform: scale(0.92);
            box-shadow: 0 0 0 0 rgba(115, 17, 45, 0);
          }
        }

        .loader-image {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          animation: imageBeat 1.5s infinite ease-in-out;
        }

        @keyframes dots {
          0%, 20% {
            content: '.';
          }

          40% {
            content: '..';
          }

          60%, 100% {
            content: '...';
          }
        }

        .loading-dots::after {
          display: inline-block;
          animation: dots 1.5s infinite steps(1);
          content: '';
        }
      `}</style>

      {/* LoveLink Image - Beating Animation */}
      <div className="mb-3">
        <img
          src="/images/lovelink-loader.PNG"
          alt="LoveLink"
          className="loader-image"
        />
      </div>

      {/* Loading Spinner */}
      {/* <div */}
        {/* // className="spinner-border mb-3" */}
        {/* // role="status" */}
        {/* // style={{ */}
          {/* // width: "2rem", */}
          {/* // height: "2rem", */}
          {/* // color: "#73112D", */}
          {/* // borderWidth: "0.2em", */}
        {/* // }} */}
      {/* // > */}
        {/* <span className="visually-hidden">Loading...</span> */}
      {/* </div> */}

      {/* Animated Text */}
      <h6
        className="fw-bold text-dark m-0"
        style={{ fontSize: "0.95rem" }}
      >
        {message}
        <span className="loading-dots"></span>
      </h6>
    </div>
  );

  // =====================================================
  // FULL SCREEN LOADER
  // =====================================================
  if (fullScreen) {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: "rgba(251, 246, 240, 0.85)",
          backdropFilter: "blur(4px)",
          zIndex: 2000,
        }}
      >
        {content}
      </div>
    );
  }

  // =====================================================
  // NORMAL LOADER
  // =====================================================
  return (
    <div className="w-100 d-flex align-items-center justify-content-center py-5">
      {content}
    </div>
  );
};

export default Loader;