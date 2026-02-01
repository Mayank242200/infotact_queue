import SubmitTicket from "./SubmitTicket";
import { useEffect, useState, useContext } from "react";
import { useSocket } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import { getMyTickets } from "../../api/ticketApi";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const { socket } = useSocket();
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getMyTickets();
        setTickets(data);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      }
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (data) => {
      setTickets((prev) =>
        prev.map((t) =>
          t._id === data.ticketId
            ? { ...t, status: data.status, mentor: data.mentor }
            : t
        )
      );
    };

    socket.on("ticket_status_update", handleStatusUpdate);
    return () => socket.off("ticket_status_update", handleStatusUpdate);
  }, [socket]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="student-dashboard">
   
      <header className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome back, {user?.name}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

  
      <div className="dashboard-content">
       
        <section className="card submit-ticket-container">
          <h2>Raise a Support Ticket</h2>
          <SubmitTicket
            onTicketCreated={(newTicket) =>
              setTickets((prev) => [newTicket, ...prev])
            }
          />
        </section>

     
        <section className="card tickets-container">
          <h2>My Tickets</h2>

          {tickets.length === 0 ? (
            <p className="empty-text">No tickets submitted yet.</p>
          ) : (
            <ul className="ticket-list">
              {tickets.map((t) => (
                <li key={t._id} className="ticket-item">
                  <div className="ticket-info">
                    <p className="ticket-desc">{t.description}</p>
                    {t.mentor && (
                      <span className="mentor">
                        Mentor: {t.mentor.name}
                      </span>
                    )}
                  </div>

                  <span className={`status-badge ${t.status.toLowerCase()}`}>
                    {t.status}
                  </span>

                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
