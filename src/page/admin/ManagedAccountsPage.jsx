import React, { useEffect, useMemo, useState } from "react";

import AdminNavbar from "./adminHearder";
import api from "../../api/axios";

const ManagedAccountsPage = () => {
  const [activeTab, setActiveTab] = useState("pending");

  const [managedAccounts, setManagedAccounts] = useState([]);
  const [realUsers, setRealUsers] = useState([]);
  const [pendingLikes, setPendingLikes] = useState([]);
  const [matches, setMatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedManagedAccount, setSelectedManagedAccount] = useState("");
  const [selectedRealUser, setSelectedRealUser] = useState("");

  // =========================================================
  // HELPERS
  // =========================================================

  const getPhotoUrl = (photo) => {
    if (!photo) return "";

    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }

    return `https://love-links.miinify.com/uploads/${photo}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getErrorMessage = (err, fallback) => {
    return (
      err?.response?.data?.message ||
      err?.message ||
      fallback
    );
  };

  // =========================================================
  // LOAD PAGE DATA
  // =========================================================

  const loadPageData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const [
        managedAccountsResponse,
        realUsersResponse,
        pendingLikesResponse,
        matchesResponse,
      ] = await Promise.all([
        api.get("/admin/managed-accounts"),
        api.get("/admin/real-users"),
        api.get("/admin/fake-likes/pending"),
        api.get("/admin/matches"),
      ]);

      // -----------------------------------------------------
      // MANAGED ACCOUNTS
      // -----------------------------------------------------

      const accounts = (
        managedAccountsResponse?.data?.accounts || []
      ).map((account) => ({
        id: account._id,
        name: account.fullName,
        username: account.username,
        email: account.email,
        photo: getPhotoUrl(account.photo),
        status: account.status || "offline",
        age: account.age,
        gender: account.gender,
        state: account.state,
        region: account.region,
        badge: account.badge,
        accountType: account.accountType,
        role: account.role,
        createdAt: account.createdAt,

        // These are calculated below from actual data.
        matches: 0,
        likes: 0,
      }));

      // -----------------------------------------------------
      // REAL USERS
      // -----------------------------------------------------

      const users = (
        realUsersResponse?.data?.users || []
      ).map((user) => ({
        id: user._id,
        name: user.fullName,
        username: user.username,
        email: user.email,
        photo: getPhotoUrl(user.photo),
        age: user.age,
        gender: user.gender,
        state: user.state,
        region: user.region,
        status: user.status || "offline",
        badge: user.badge,
        accountType: user.accountType,
        role: user.role,
      }));

      // -----------------------------------------------------
      // PENDING LIKES
      // -----------------------------------------------------

      const likes = (
        pendingLikesResponse?.data?.likes || []
      ).map((like) => ({
        id: like._id,

        realUser: {
          id: like.fromUser?._id,
          name: like.fromUser?.fullName || "Unknown User",
          username: like.fromUser?.username || "unknown",
          age: like.fromUser?.age,
          location:
            like.fromUser?.state ||
            like.fromUser?.region ||
            "Unknown location",
          photo: getPhotoUrl(like.fromUser?.photo),
        },

        managedAccount: {
          id: like.toUser?._id,
          name: like.toUser?.fullName || "Unknown Account",
          username: like.toUser?.username || "unknown",
          photo: getPhotoUrl(like.toUser?.photo),
        },

        date: formatDate(like.createdAt),
      }));

      // -----------------------------------------------------
      // MATCHES
      // -----------------------------------------------------

      const allMatches = matchesResponse?.data?.matches || [];

      const managedAccountIds = new Set(
        accounts.map((account) => String(account.id))
      );

      const managedMatches = allMatches
        .filter((match) => {
          const users = match.users || [];

          return users.some((user) =>
            managedAccountIds.has(String(user?._id))
          );
        })
        .map((match) => {
          const users = match.users || [];

          const managedUser = users.find(
            (user) =>
              user?.accountType === "fake" ||
              managedAccountIds.has(String(user?._id))
          );

          const realUser = users.find(
            (user) => user?.accountType === "real"
          );

          const chatId =
            typeof match.chatId === "object"
              ? match.chatId?._id
              : match.chatId;

          return {
            id: match._id,

            realUser:
              realUser?.fullName ||
              realUser?.username ||
              "Unknown User",

            realUserId: realUser?._id,

            managedAccount:
              managedUser?.fullName ||
              managedUser?.username ||
              "Unknown Account",

            managedAccountId: managedUser?._id,

            chatId: chatId || null,

            // The current Match endpoint does not return
            // moderator information directly.
            moderator: "Assigned / Check Workspace",

            status: match.status || "active",

            date: formatDate(
              match.matchedAt || match.createdAt
            ),
          };
        });

      // -----------------------------------------------------
      // CALCULATE ACCOUNT COUNTS FROM REAL DATA
      // -----------------------------------------------------

      const accountsWithCounts = accounts.map((account) => {
        const accountId = String(account.id);

        const accountMatches = managedMatches.filter(
          (match) =>
            String(match.managedAccountId) === accountId
        );

        const accountLikes = likes.filter(
          (like) =>
            String(like.managedAccount.id) === accountId
        );

        return {
          ...account,
          matches: accountMatches.length,
          likes: accountLikes.length,
        };
      });

      setManagedAccounts(accountsWithCounts);
      setRealUsers(users);
      setPendingLikes(likes);
      setMatches(managedMatches);
    } catch (err) {
      console.error("Failed to load managed accounts data:", err);

      setError(
        getErrorMessage(
          err,
          "Failed to load managed account data."
        )
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  // =========================================================
  // LIKE BACK
  // =========================================================

  const handleLikeBack = async (likeId) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await api.post(
        `/admin/fake-likes/${likeId}/approve`
      );

      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message ||
            "Failed to approve the like."
        );
      }

      setSuccessMessage(
        response?.data?.message ||
          "Like approved successfully."
      );

      await loadPageData(false);

      setActiveTab("matches");
    } catch (err) {
      console.error("Like back error:", err);

      setError(
        getErrorMessage(
          err,
          "Failed to approve this like."
        )
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // SEND LIKE
  // =========================================================

  const handleSendLike = async () => {
    if (!selectedManagedAccount) {
      setError("Please select a managed account.");
      return;
    }

    if (!selectedRealUser) {
      setError("Please select a real user.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await api.post(
        `/admin/fake-accounts/${selectedManagedAccount}/like`,
        {
          realUserId: selectedRealUser,
        }
      );

      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message ||
            "Failed to send like."
        );
      }

      const status = response?.data?.status;

      if (status === "matched") {
        setSuccessMessage(
          response?.data?.message ||
            "Like sent successfully. It's a match."
        );

        setSelectedManagedAccount("");
        setSelectedRealUser("");

        await loadPageData(false);

        setActiveTab("matches");
      } else {
        setSuccessMessage(
          response?.data?.message ||
            "Like sent successfully."
        );

        setSelectedManagedAccount("");
        setSelectedRealUser("");

        await loadPageData(false);

        setActiveTab("pending");
      }
    } catch (err) {
      console.error("Send like error:", err);

      setError(
        getErrorMessage(
          err,
          "Failed to send the like."
        )
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // ACTIVE CHAT COUNT
  // =========================================================

  const activeChatCount = useMemo(() => {
    return matches.filter((match) => match.chatId).length;
  }, [matches]);

  // =========================================================
  // CLEAR MESSAGES WHEN CHANGING TAB
  // =========================================================

  const changeTab = (tab) => {
    setActiveTab(tab);
    setError("");
    setSuccessMessage("");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex flex-column"
        style={{
          backgroundColor: "#fbf6f0",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <AdminNavbar />

        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div
              className="spinner-border"
              style={{ color: "#73112d" }}
              role="status"
            />

            <div
              className="text-muted mt-3"
              style={{ fontSize: "0.85rem" }}
            >
              Loading managed accounts...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        backgroundColor: "#fbf6f0",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <AdminNavbar />

      <div className="container-fluid px-3 px-md-4 py-4 flex-grow-1">
        {/* PAGE HEADER */}

        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "38px",
                  height: "38px",
                  backgroundColor: "#73112d",
                  color: "#fff",
                }}
              >
                <i className="bi bi-person-heart"></i>
              </span>

              <span
                className="text-uppercase fw-bold text-muted"
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "1.2px",
                }}
              >
                Admin Workspace
              </span>
            </div>

            <h2
              className="fs-3 fw-bold text-dark m-0"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Managed Accounts
            </h2>

            <p
              className="text-muted mt-1 mb-0"
              style={{ fontSize: "0.85rem" }}
            >
              Manage likes, matches, conversations, and
              moderator assignments for managed accounts.
            </p>
          </div>

          <button
            className="btn text-white rounded-3 px-3 py-2 fw-semibold"
            onClick={() => changeTab("send-like")}
            style={{
              backgroundColor: "#73112d",
              fontSize: "0.82rem",
            }}
          >
            <i className="bi bi-heart me-2"></i>
            Send New Like
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="alert alert-danger border-0 rounded-3 mb-4"
            style={{ fontSize: "0.82rem" }}
          >
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {successMessage && (
          <div
            className="alert alert-success border-0 rounded-3 mb-4"
            style={{ fontSize: "0.82rem" }}
          >
            <i className="bi bi-check-circle me-2"></i>
            {successMessage}
          </div>
        )}

        {/* STATISTICS */}

        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard
              label="Managed Accounts"
              value={managedAccounts.length}
              icon="bi-person-badge-fill"
            />
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard
              label="Pending Likes"
              value={pendingLikes.length}
              icon="bi-heart-fill"
            />
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard
              label="Active Matches"
              value={matches.length}
              icon="bi-people-fill"
            />
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <StatCard
              label="Active Chats"
              value={activeChatCount}
              icon="bi-chat-heart-fill"
            />
          </div>
        </div>

        {/* MAIN WORKSPACE */}

        <div className="bg-white rounded-4 border shadow-sm overflow-hidden">
          {/* TABS */}

          <div
            className="border-bottom px-3 px-md-4 pt-3"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="d-flex gap-2 flex-wrap">
              <WorkspaceTab
                active={activeTab === "pending"}
                onClick={() => changeTab("pending")}
                icon="bi-heart"
                text="Pending Likes"
                count={pendingLikes.length}
              />

              <WorkspaceTab
                active={activeTab === "send-like"}
                onClick={() => changeTab("send-like")}
                icon="bi-send-heart"
                text="Send Like"
              />

              <WorkspaceTab
                active={activeTab === "matches"}
                onClick={() => changeTab("matches")}
                icon="bi-people"
                text="Matches"
                count={matches.length}
              />

              <WorkspaceTab
                active={activeTab === "accounts"}
                onClick={() => changeTab("accounts")}
                icon="bi-person-badge"
                text="Managed Accounts"
                count={managedAccounts.length}
              />
            </div>
          </div>

          {/* PENDING LIKES */}

          {activeTab === "pending" && (
            <PendingLikes
              pendingLikes={pendingLikes}
              onSendLike={() => changeTab("send-like")}
              onLikeBack={handleLikeBack}
              actionLoading={actionLoading}
            />
          )}

          {/* SEND LIKE */}

          {activeTab === "send-like" && (
            <SendLike
              managedAccounts={managedAccounts}
              realUsers={realUsers}
              selectedManagedAccount={selectedManagedAccount}
              selectedRealUser={selectedRealUser}
              setSelectedManagedAccount={
                setSelectedManagedAccount
              }
              setSelectedRealUser={setSelectedRealUser}
              onSendLike={handleSendLike}
              actionLoading={actionLoading}
            />
          )}

          {/* MATCHES */}

          {activeTab === "matches" && (
            <Matches matches={matches} />
          )}

          {/* MANAGED ACCOUNTS */}

          {activeTab === "accounts" && (
            <ManagedAccounts accounts={managedAccounts} />
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({ label, value, icon }) => {
  return (
    <div className="bg-white border rounded-4 shadow-sm p-3 h-100">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <small
            className="text-uppercase text-muted fw-bold d-block"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "1px",
            }}
          >
            {label}
          </small>

          <div
            className="fw-bold mt-1"
            style={{
              fontSize: "1.55rem",
              color: "#252525",
            }}
          >
            {value}
          </div>
        </div>

        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "43px",
            height: "43px",
            backgroundColor: "#f1e9e4",
            color: "#73112d",
          }}
        >
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   TAB BUTTON
========================================================= */

const WorkspaceTab = ({
  active,
  onClick,
  icon,
  text,
  count,
}) => {
  return (
    <button
      onClick={onClick}
      className="btn border-0 rounded-0 px-3 py-3 fw-semibold"
      style={{
        color: active ? "#73112d" : "#777",
        borderBottom: active
          ? "2px solid #73112d"
          : "2px solid transparent",
        backgroundColor: "transparent",
        fontSize: "0.8rem",
      }}
    >
      <i className={`bi ${icon} me-2`}></i>

      {text}

      {typeof count === "number" && (
        <span
          className="badge ms-2 rounded-pill"
          style={{
            backgroundColor: active
              ? "#73112d"
              : "#eee7e2",
            color: active ? "#fff" : "#777",
            fontSize: "0.62rem",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
};

/* =========================================================
   PENDING LIKES
========================================================= */

const PendingLikes = ({
  pendingLikes,
  onSendLike,
  onLikeBack,
  actionLoading,
}) => {
  return (
    <div>
      <div className="p-3 p-md-4 border-bottom">
        <h5
          className="fw-bold mb-1"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Pending Likes
        </h5>

        <p
          className="text-muted mb-0"
          style={{ fontSize: "0.8rem" }}
        >
          Review people who have liked a managed account.
        </p>
      </div>

      {pendingLikes.length === 0 ? (
        <EmptyState
          icon="bi-heart"
          title="No pending likes"
          text="There are currently no likes waiting for review."
        />
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: "#efeae4" }}>
              <tr>
                <TableHeader text="Real User" />
                <TableHeader text="Managed Account" />
                <TableHeader text="Received" />
                <TableHeader text="Action" align="end" />
              </tr>
            </thead>

            <tbody>
              {pendingLikes.map((like) => (
                <tr key={like.id}>
                  <td className="px-3 px-md-4 py-3">
                    <UserCell
                      name={like.realUser.name}
                      username={like.realUser.username}
                      photo={like.realUser.photo}
                    />

                    <div
                      className="text-muted mt-1"
                      style={{ fontSize: "0.72rem" }}
                    >
                      {like.realUser.age
                        ? `${like.realUser.age} yrs`
                        : "Age not provided"}{" "}
                      • {like.realUser.location}
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <UserCell
                      name={like.managedAccount.name}
                      username={like.managedAccount.username}
                      photo={like.managedAccount.photo}
                      managed
                    />
                  </td>

                  <td
                    className="px-3 py-3 text-muted"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {like.date}
                  </td>

                  <td className="px-3 px-md-4 py-3 text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        style={{ fontSize: "0.75rem" }}
                      >
                        View
                      </button>

                      <button
                        className="btn btn-sm text-white"
                        disabled={actionLoading}
                        onClick={() =>
                          onLikeBack(like.id)
                        }
                        style={{
                          backgroundColor: "#73112d",
                          fontSize: "0.75rem",
                        }}
                      >
                        {actionLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                            />
                            Processing
                          </>
                        ) : (
                          <>
                            <i className="bi bi-heart-fill me-1"></i>
                            Like Back
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   SEND LIKE
========================================================= */

const SendLike = ({
  managedAccounts,
  realUsers,
  selectedManagedAccount,
  selectedRealUser,
  setSelectedManagedAccount,
  setSelectedRealUser,
  onSendLike,
  actionLoading,
}) => {
  return (
    <div className="p-3 p-md-4">
      <div className="mb-4">
        <h5
          className="fw-bold mb-1"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Send a Like
        </h5>

        <p
          className="text-muted mb-0"
          style={{ fontSize: "0.8rem" }}
        >
          Select a managed account and a real user to send a
          like.
        </p>
      </div>

      <div className="row g-4">
        {/* MANAGED ACCOUNT */}

        <div className="col-12 col-lg-5">
          <div
            className="border rounded-4 p-3"
            style={{ backgroundColor: "#fbf6f0" }}
          >
            <label className="form-label fw-semibold small">
              Managed Account
            </label>

            <select
              className="form-select border-0 shadow-sm"
              value={selectedManagedAccount}
              onChange={(e) =>
                setSelectedManagedAccount(e.target.value)
              }
            >
              <option value="">
                Select managed account
              </option>

              {managedAccounts.map((account) => (
                <option
                  key={account.id}
                  value={account.id}
                >
                  {account.name} (@{account.username})
                </option>
              ))}
            </select>

            <div className="mt-3">
              <small className="text-muted">
                This is the managed account from which the
                like will be sent.
              </small>
            </div>
          </div>
        </div>

        {/* HEART */}

        <div className="col-12 col-lg-2 d-flex align-items-center justify-content-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "45px",
              height: "45px",
              backgroundColor: "#f1e9e4",
              color: "#73112d",
            }}
          >
            <i className="bi bi-heart-fill"></i>
          </div>
        </div>

        {/* REAL USER */}

        <div className="col-12 col-lg-5">
          <div
            className="border rounded-4 p-3"
            style={{ backgroundColor: "#fbf6f0" }}
          >
            <label className="form-label fw-semibold small">
              Real User
            </label>

            <select
              className="form-select border-0 shadow-sm"
              value={selectedRealUser}
              onChange={(e) =>
                setSelectedRealUser(e.target.value)
              }
            >
              <option value="">
                Select real user
              </option>

              {realUsers.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.name} (@{user.username})
                </option>
              ))}
            </select>

            <div className="mt-3">
              <small className="text-muted">
                Choose the real user who should receive the
                like.
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="border-top mt-4 pt-4 d-flex justify-content-end">
        <button
          className="btn text-white px-4 py-2 rounded-3 fw-semibold"
          disabled={actionLoading}
          onClick={onSendLike}
          style={{
            backgroundColor: "#73112d",
            fontSize: "0.8rem",
          }}
        >
          {actionLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Sending...
            </>
          ) : (
            <>
              <i className="bi bi-send-heart me-2"></i>
              Send Like
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   MATCHES
========================================================= */

const Matches = ({ matches }) => {
  return (
    <div>
      <div className="p-3 p-md-4 border-bottom">
        <h5
          className="fw-bold mb-1"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Managed Account Matches
        </h5>

        <p
          className="text-muted mb-0"
          style={{ fontSize: "0.8rem" }}
        >
          View matches created through managed accounts.
        </p>
      </div>

      {matches.length === 0 ? (
        <EmptyState
          icon="bi-people"
          title="No managed matches"
          text="There are currently no active matches involving managed accounts."
        />
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: "#efeae4" }}>
              <tr>
                <TableHeader text="Real User" />
                <TableHeader text="Managed Account" />
                <TableHeader text="Moderator" />
                <TableHeader text="Status" />
                <TableHeader text="Actions" align="end" />
              </tr>
            </thead>

            <tbody>
              {matches.map((match) => (
                <tr key={match.id}>
                  <td className="px-3 px-md-4 py-3 fw-semibold">
                    {match.realUser}
                  </td>

                  <td className="px-3 py-3">
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#f1e9e4",
                          color: "#73112d",
                        }}
                      >
                        <i className="bi bi-person"></i>
                      </span>

                      <div>
                        <div className="fw-semibold">
                          {match.managedAccount}
                        </div>

                        <small className="text-muted">
                          Managed account
                        </small>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <span className="text-muted small">
                      {match.moderator}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                      {match.status}
                    </span>
                  </td>

                  <td className="px-3 px-md-4 py-3 text-end">
                    {match.chatId ? (
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() =>
                          (window.location.href = `/admin/chats/${match.chatId}`)
                        }
                        style={{ fontSize: "0.73rem" }}
                      >
                        <i className="bi bi-chat-dots me-1"></i>
                        Open Chat
                      </button>
                    ) : (
                      <span
                        className="text-muted"
                        style={{ fontSize: "0.73rem" }}
                      >
                        No chat
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   MANAGED ACCOUNTS
========================================================= */

const ManagedAccounts = ({ accounts }) => {
  return (
    <div>
      <div className="p-3 p-md-4 border-bottom">
        <h5
          className="fw-bold mb-1"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Managed Accounts
        </h5>

        <p
          className="text-muted mb-0"
          style={{ fontSize: "0.8rem" }}
        >
          Accounts currently managed by the platform.
        </p>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          icon="bi-person-badge"
          title="No managed accounts"
          text="There are currently no managed accounts."
        />
      ) : (
        <div className="row g-3 p-3 p-md-4">
          {accounts.map((account) => (
            <div
              className="col-12 col-md-6 col-xl-4"
              key={account.id}
            >
              <div className="border rounded-4 p-3 h-100">
                <div className="d-flex align-items-center gap-3">
                  <Avatar
                    name={account.name}
                    photo={account.photo}
                  />

                  <div className="flex-grow-1">
                    <div className="fw-bold">
                      {account.name}
                    </div>

                    <div
                      className="text-muted"
                      style={{ fontSize: "0.75rem" }}
                    >
                      @{account.username}
                    </div>

                    <span
                      className="badge mt-1"
                      style={{
                        backgroundColor: "#f1e9e4",
                        color: "#73112d",
                        fontSize: "0.6rem",
                      }}
                    >
                      Managed
                    </span>
                  </div>

                  <span
                    className="rounded-circle"
                    title={account.status}
                    style={{
                      width: "9px",
                      height: "9px",
                      backgroundColor:
                        String(account.status).toLowerCase() ===
                        "online"
                          ? "#198754"
                          : "#adb5bd",
                    }}
                  ></span>
                </div>

                <div className="row g-2 mt-3">
                  <div className="col-6">
                    <div
                      className="rounded-3 p-2 text-center"
                      style={{
                        backgroundColor: "#fbf6f0",
                      }}
                    >
                      <div className="fw-bold">
                        {account.likes}
                      </div>

                      <small className="text-muted">
                        Pending Likes
                      </small>
                    </div>
                  </div>

                  <div className="col-6">
                    <div
                      className="rounded-3 p-2 text-center"
                      style={{
                        backgroundColor: "#fbf6f0",
                      }}
                    >
                      <div className="fw-bold">
                        {account.matches}
                      </div>

                      <small className="text-muted">
                        Matches
                      </small>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-sm btn-outline-secondary w-100 mt-3"
                  style={{ fontSize: "0.75rem" }}
                >
                  View Account
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   USER CELL
========================================================= */

const UserCell = ({
  name,
  username,
  photo,
  managed = false,
}) => {
  return (
    <div className="d-flex align-items-center gap-2">
      <Avatar name={name} photo={photo} />

      <div>
        <div className="fw-bold text-dark">
          {name}
        </div>

        <div
          className="text-muted"
          style={{ fontSize: "0.7rem" }}
        >
          @{username}
        </div>

        {managed && (
          <span
            className="badge mt-1"
            style={{
              backgroundColor: "#f1e9e4",
              color: "#73112d",
              fontSize: "0.55rem",
            }}
          >
            MANAGED
          </span>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   AVATAR
========================================================= */

const Avatar = ({ name, photo }) => {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="rounded-circle"
        style={{
          width: "42px",
          height: "42px",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
      style={{
        width: "42px",
        height: "42px",
        backgroundColor: "#efeae4",
        color: "#73112d",
        flexShrink: 0,
      }}
    >
      {name?.charAt(0)?.toUpperCase()}
    </div>
  );
};

/* =========================================================
   TABLE HEADER
========================================================= */

const TableHeader = ({ text, align }) => {
  return (
    <th
      className={`py-3 px-3 border-0 text-uppercase text-muted ${
        align === "end" ? "text-end" : ""
      }`}
      style={{
        fontSize: "0.62rem",
        letterSpacing: "0.4px",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </th>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({ icon, title, text }) => {
  return (
    <div className="text-center py-5 px-3">
      <div
        className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
        style={{
          width: "58px",
          height: "58px",
          backgroundColor: "#f1e9e4",
          color: "#73112d",
        }}
      >
        <i className={`bi ${icon} fs-4`}></i>
      </div>

      <h6
        className="fw-bold"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {title}
      </h6>

      <p
        className="text-muted mb-0"
        style={{ fontSize: "0.8rem" }}
      >
        {text}
      </p>
    </div>
  );
};

export default ManagedAccountsPage;
