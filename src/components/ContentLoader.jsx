const ContentLoader = ({ message }) => (
  <div
    className="w-100 d-flex flex-column align-items-center justify-content-center py-4 text-center"
    style={{ minHeight: "50vh" }}
    role="status"
    aria-live="polite"
  >
    <div
      className="spinner-border"
      style={{ color: "#73112d" }}
      aria-hidden="true"
    />
    <span className="visually-hidden">{message || "Loading..."}</span>
    {message && <p className="text-muted mt-3 mb-0">{message}</p>}
  </div>
);

export default ContentLoader;
