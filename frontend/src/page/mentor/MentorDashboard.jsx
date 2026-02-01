import { useEffect, useState, useContext } from "react";
import { useSocket } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import { getPendingTickets, getMyQueue } from "../../api/ticketApi";
import { useNavigate } from "react-router-dom";
import "./MentorDashboard.css";

export default function MentorDashboard() {
  const { user, logout } = useContext(AuthContext);
  const { socket } = useSocket();
  const [pendingTickets, setPendingTickets] = useState([]);
  const [myQueue, setMyQueue] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setPendingTickets(await getPendingTickets());
        setMyQueue(await getMyQueue());
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      }
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("new_ticket", (ticket) =>
      setPendingTickets((prev) => [ticket, ...prev])
    );

    socket.on("ticket_claimed", (ticket) => {
      setPendingTickets((prev) => prev.filter((t) => t._id !== ticket._id));
      if (ticket.mentor._id === user._id) {
        setMyQueue((prev) => [ticket, ...prev]);
      }
    });

    socket.on("ticket_resolved", (ticket) => {
      setMyQueue((prev) =>
        prev.map((t) =>
          t._id === ticket._id ? { ...t, status: "resolved" } : t
        )
      );
    });

    return () => {
      socket.off("new_ticket");
      socket.off("ticket_claimed");
      socket.off("ticket_resolved");
    };
  }, [socket, user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mentor-dashboard">
      {/* HEADER */}
      <header className="mentor-header">
        <div>
          <h1>Mentor Dashboard</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* PENDING */}
      <h2 className="section-title">Pending Tickets</h2>
      {pendingTickets.length === 0 && (
        <p className="empty-text">No pending tickets</p>
      )}

      <ul className="ticket-list">
        {pendingTickets.map((t) => (
          <li className="ticket-card" key={t._id}>
            <div className="ticket-info">
              <strong>{t.description}</strong>
              <span>Student: {t.student.name}</span>
            </div>

            <div className="ticket-footer">
              <span className="status-badge pending">Pending</span>
              <button className="claim-btn" onClick={() => socket.emit("claim_ticket", { ticketId: t._id })}>
                Claim
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* MY QUEUE */}
      <h2 className="section-title">My Queue</h2>
      {myQueue.length === 0 && (
        <p className="empty-text">No tickets in your queue</p>
      )}

      <ul className="ticket-list">
        {myQueue.map((t) => (
          <li className="ticket-card" key={t._id}>
            <div className="ticket-info">
              <strong>{t.description}</strong>
              <span>Student: {t.student.name}</span>
            </div>

            <div className="ticket-footer">
              <span className={`status-badge ${t.status}`}>
                {t.status}
              </span>

              {t.status === "claimed" && (
                <button
                  className="resolve-btn"
                  onClick={() => socket.emit("resolve_ticket", { ticketId: t._id })}
                >
                  Resolve
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
