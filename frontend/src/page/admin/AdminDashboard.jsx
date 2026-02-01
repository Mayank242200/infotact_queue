import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- import navigate
import { useSocket } from "../../context/SocketContext";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./AdminDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AdminDashboard = () => {
  const { socket } = useSocket();
  const [stats, setStats] = useState(null);
  const navigate = useNavigate(); // <-- initialize navigate

  useEffect(() => {
    if (!socket) return;

    socket.on("queue_stats_update", (data) => {
      setStats(data);
    });

    return () => socket.off("queue_stats_update");
  }, [socket]);

  const handleLogout = () => {
    // Clear any auth info stored in localStorage/session
    localStorage.removeItem("adminToken"); // replace with your token key
    // Optionally disconnect socket
    if (socket) socket.disconnect();

    // Redirect to login page
    navigate("/login");
  };

  if (!stats) return <div className="admin-loading">Loading live statistics…</div>;

  const leaderboardChart = {
    labels: stats.mentorLeaderboard.map(m => m.mentorName),
    datasets: [
      {
        label: "Resolved Tickets",
        data: stats.mentorLeaderboard.map(m => m.resolvedCount),
        backgroundColor: "#2563eb",
        borderRadius: 8,
        barThickness: 28
      }
    ]
  };

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Live queue & mentor performance metrics</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* KPI CARDS */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-title">AVG WAIT TIME</div>
          <div className="stat-value">{(stats.avgWaitMs / 60000).toFixed(2)} mins</div>
        </div>
        <div className="stat-card green">
          <div className="stat-title">AVG RESOLVE TIME</div>
          <div className="stat-value">{(stats.avgResolveMs / 60000).toFixed(2)} mins</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-title">LAST UPDATED</div>
          <div className="stat-value">{new Date(stats.generatedAt).toLocaleTimeString()}</div>
        </div>
      </div>

      {/* CHART */}
      <div className="chart-card">
        <h3>Mentor Leaderboard</h3>
        <Bar
          data={leaderboardChart}
          options={{
            plugins: {
              legend: { display: false },
              tooltip: { enabled: true, backgroundColor: "#111827", titleColor: "#fff", bodyColor: "#fff" }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 14 }, color: "#374151" } },
              y: { beginAtZero: true, ticks: { stepSize: 1, color: "#374151", font: { size: 14 } } }
            }
          }}
          height={250}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
