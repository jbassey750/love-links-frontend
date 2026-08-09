const ChatHeader = ({ activeChat }) => {
  if (!activeChat) return null;

  return (
    <div className="p-3 bg-white border-bottom shadow-sm d-flex justify-content-between align-items-center z-2">
      <div className="d-flex align-items-center gap-3">
        <img
          src={activeChat.fakeAccount.avatar || "https://via.placeholder.com/150"}
          alt={activeChat.fakeAccount.name}
          className="rounded-circle object-fit-cover shadow-sm"
          width="44"
          height="44"
        />
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-dark">{activeChat.fakeAccount.name}</span>
            <i className="bi bi-arrow-right text-muted fs-6"></i>
            <span className="fw-semibold text-primary">{activeChat.realUser.name}</span>
          </div>
          <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.75rem" }}>
            <span
              className={`badge rounded-pill ${
                activeChat.realUser.isOnline
                  ? "bg-success-subtle text-success"
                  : "bg-secondary-subtle text-secondary"
              }`}
            >
              {activeChat.realUser.isOnline ? "Online" : "Offline"}
            </span>
            <span className="text-muted">•</span>
            <span className="text-muted">Assigned Conversation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;