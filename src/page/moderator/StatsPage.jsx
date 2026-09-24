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
import { Bar, Pie } from "react-chartjs-2";
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
  Filler,
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
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [filter]);

  const summary = stats?.summary || {};
  const charts = stats?.charts || {};

  const messageValues =
    charts?.messagesPerDay?.map((day) => day.messages || 0) || [];

  const highestMessageCount = Math.max(...messageValues, 0);

  // Choose a clean tick interval based on the highest value
  let tickStep = 50;

  if (highestMessageCount <= 50) {
    tickStep = 10;
  } else if (highestMessageCount <= 250) {
    tickStep = 50;
  } else if (highestMessageCount <= 500) {
    tickStep = 100;
  } else if (highestMessageCount <= 1000) {
    tickStep = 250;
  } else {
    tickStep = 500;
  }

  // Make the maximum a clean multiple of the tick step
  const chartMax =
    highestMessageCount === 0
      ? tickStep
      : Math.ceil(highestMessageCount / tickStep) * tickStep;

  const barData = {
    labels: charts?.messagesPerDay?.map((day) => day.label) || [],
    datasets: [
      {
        label: "Messages Sent",
        data: charts?.messagesPerDay?.map((day) => day.messages) || [],
        backgroundColor: "#5c1d24",
        borderRadius: 8,
      },
      {
        label: "Chats",
        data: charts?.chatsPerDay?.map((day) => day.chats) || [],
        backgroundColor: "#b8756d",
        borderRadius: 8,
      },
    ],
  };

  const statusData = charts?.conversationStatus || [
    { label: "Active", value: summary.activeConvos || 0 },
    { label: "Closed", value: summary.closedConvos || 0 },
  ];

  const pieData = {
    labels: statusData.map((item) => item.label),
    datasets: [
      {
        data: statusData.map((item) => item.value),
        backgroundColor: ["#5c1d24", "#e0e0e0"],
      },
    ],
  };

  const metricCards = [
    {
      label: "Today's Chats",
      value: summary.today,
      icon: "bi-chat-left-text-fill",
      color: "#5c1d24",
    },
    {
      label: "Today's Messages",
      value: summary.todayMessages,
      icon: "bi-envelope-fill",
      color: "#5c1d24",
    },
    {
      label: "This Week's Chats",
      value: summary.thisWeek,
      icon: "bi-calendar-week-fill",
      color: "#4f46e5",
    },
    {
      label: "This Week's Messages",
      value: summary.thisWeekMessages,
      icon: "bi-calendar-week-fill",
      color: "#4f46e5",
    },
    {
      label: "This Month's Chats",
      value: summary.thisMonth,
      icon: "bi-calendar-month-fill",
      color: "#059669",
    },
    {
      label: "This Month's Messages",
      value: summary.thisMonthMessages,
      icon: "bi-calendar-month-fill",
      color: "#059669",
    },
    {
      label: "Total Chats",
      value: summary.total,
      icon: "bi-database-fill",
      color: "#0ea5e9",
    },
    {
      label: "Total Messages",
      value: summary.totalMessages,
      icon: "bi-database-fill",
      color: "#0ea5e9",
    },
    {
      label: "Avg Response Time",
      value: summary.avgResponseTime,
      icon: "bi-clock-history",
      color: "#d97706",
    },
    {
      label: "Active Conversations",
      value: summary.activeConvos,
      icon: "bi-people-fill",
      color: "#16a34a",
    },
    {
      label: "Closed Conversations",
      value: summary.closedConvos,
      icon: "bi-lock-fill",
      color: "#64748b",
    },
  ];

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Header & Date Filters */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Performance Dashboard</h3>
          <p className="text-muted mb-0">
            Track response metrics, chat volume, and moderator activity.
          </p>
        </div>

        <div className="btn-group bg-white p-1 rounded-pill shadow-sm border">
          {["Today", "Yesterday", "Last 7 Days", "Last 30 Days"].map(
            (range) => (
              <button
                key={range}
                onClick={() => setFilter(range)}
                className={`btn btn-sm rounded-pill border-0 px-3 fw-medium ${
                  filter === range ? "text-white" : "text-secondary"
                }`}
                style={{
                  backgroundColor: filter === range ? "#5c1d24" : "transparent",
                }}
              >
                {range}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="row g-3 mb-4">
        {metricCards.map((card, i) => (
          <div key={i} className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span
                  className="text-muted fw-semibold"
                  style={{ fontSize: "0.85rem" }}
                >
                  {card.label}
                </span>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{
                    width: "38px",
                    height: "38px",
                    backgroundColor: card.color,
                  }}
                >
                  <i className={`bi ${card.icon} fs-6`}></i>
                </div>
              </div>
              <h3 className="fw-bold text-dark m-0">
                {loading ? "..." : (card.value ?? 0)}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h6 className="fw-bold text-dark mb-3">Messages Per Day</h6>
            <div style={{ height: "260px" }}>
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      min: 0,
                      max: chartMax,
                      ticks: {
                        stepSize: tickStep,
                        precision: 0,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h6 className="fw-bold text-dark mb-3">Active vs Closed Ratio</h6>
            <div
              style={{ height: "260px" }}
              className="d-flex align-items-center justify-content-center"
            >
              <Pie
                data={pieData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="row g-3">
        {/* Most Active Fake Accounts */}

        {/* Most Active Moderators */}
        {/* Most Active Moderators */}
      </div>
    </div>
  );
};

export default StatsPage;
