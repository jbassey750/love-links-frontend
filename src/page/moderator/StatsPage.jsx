import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Pie, Radar } from "react-chartjs-2";
import api from "../../api/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatsPage = () => {
  const [filter, setFilter] = useState("Today");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/moderator/stats?range=${filter}`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load statistics:", err);
        // Fallback mock structure for visual rendering
        setStats({
          summary: {
            today: 142,
            yesterday: 128,
            thisWeek: 890,
            thisMonth: 3420,
            total: 12450,
            avgResponseTime: "1m 45s",
            activeConvos: 18,
            closedConvos: 124,
          },
          fakeAccounts: [
            { name: "Jessica, 24", chats: 45, replies: 130, respTime: "1m 12s" },
            { name: "Sophia, 26", chats: 38, replies: 110, respTime: "1m 50s" },
            { name: "Emma, 22", chats: 29, replies: 85, respTime: "2m 05s" },
          ],
          moderators: [
            { name: "Alex (You)", chats: 84, respTime: "1m 15s", activeHours: "6.5h" },
            { name: "Sarah M.", chats: 76, respTime: "1m 40s", activeHours: "7.0h" },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [filter]);

  // Chart configs
  const barData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Chats Handled",
        data: [120, 190, 150, 220, 280, 310, 260],
        backgroundColor: "#5c1d24",
        borderRadius: 8,
      },
    ],
  };

  const lineData = {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "30-Day Conversation Trend",
        data: [40, 65, 59, 80, 81, 56, 70, 75, 90, 100, 110, 95, 120, 130, 125, 140, 135, 150, 160, 155, 170, 165, 180, 175, 190, 200, 210, 205, 220, 230],
        borderColor: "#b55fe6",
        backgroundColor: "rgba(181, 95, 230, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const pieData = {
    labels: ["Active", "Closed"],
    datasets: [
      {
        data: [stats?.summary?.activeConvos || 18, stats?.summary?.closedConvos || 124],
        backgroundColor: ["#5c1d24", "#e0e0e0"],
      },
    ],
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Header & Date Filters */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Performance Dashboard</h3>
          <p className="text-muted mb-0">Track response metrics, chat volume, and moderator activity.</p>
        </div>

        <div className="btn-group bg-white p-1 rounded-pill shadow-sm border">
          {["Today", "Yesterday", "Last 7 Days", "Last 30 Days"].map((range) => (
            <button
              key={range}
              onClick={() => setFilter(range)}
              className={`btn btn-sm rounded-pill border-0 px-3 fw-medium ${
                filter === range ? "text-white" : "text-secondary"
              }`}
              style={{ backgroundColor: filter === range ? "#5c1d24" : "transparent" }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Today's Chats", value: stats?.summary?.today, icon: "bi-chat-left-text-fill", color: "#5c1d24" },
          { label: "This Week", value: stats?.summary?.thisWeek, icon: "bi-calendar-week-fill", color: "#4f46e5" },
          { label: "Total Chats", value: stats?.summary?.total, icon: "bi-database-fill", color: "#059669" },
          { label: "Avg Response Time", value: stats?.summary?.avgResponseTime, icon: "bi-clock-history", color: "#d97706" },
        ].map((card, i) => (
          <div key={i} className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-semibold" style={{ fontSize: "0.85rem" }}>
                  {card.label}
                </span>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: "38px", height: "38px", backgroundColor: card.color }}
                >
                  <i className={`bi ${card.icon} fs-6`}></i>
                </div>
              </div>
              <h3 className="fw-bold text-dark m-0">{loading ? "..." : card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h6 className="fw-bold text-dark mb-3">Chats Per Day</h6>
            <div style={{ height: "260px" }}>
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h6 className="fw-bold text-dark mb-3">Active vs Closed Ratio</h6>
            <div style={{ height: "260px" }} className="d-flex align-items-center justify-content-center">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="row g-3">
        {/* Most Active Fake Accounts */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h6 className="fw-bold text-dark mb-3">Most Active Persona Profiles</h6>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Fake Account</th>
                    <th>Chats</th>
                    <th>Replies</th>
                    <th>Avg Speed</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.fakeAccounts?.map((row, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold text-dark">{row.name}</td>
                      <td>{row.chats}</td>
                      <td>{row.replies}</td>
                      <td>
                        <span className="badge bg-light text-dark border">{row.respTime}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Most Active Moderators */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h6 className="fw-bold text-dark mb-3">Moderator Rankings</h6>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Moderator</th>
                    <th>Chats</th>
                    <th>Response Time</th>
                    <th>Active Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.moderators?.map((mod, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold text-dark">{mod.name}</td>
                      <td>{mod.chats}</td>
                      <td>
                        <span className="badge bg-success-subtle text-success">{mod.respTime}</span>
                      </td>
                      <td>{mod.activeHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;