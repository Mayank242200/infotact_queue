import { useEffect, useState } from "react";
import axios from "axios";

export default function PendingTickets({ socket }) {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    loadPending();
    socket.on("new_ticket", (ticket) => {
      setPending((prev) => [...prev, ticket]);
    });

    socket.on("ticket_claimed", (id) => {
      setPending((prev) => prev.filter((t) => t._id !== id));
    });
  }, []);

  const loadPending = async () => {
    const res = await axios.get("/api/tickets/pending");
    setPending(res.data);
  };

  const claim = (id) => {
    socket.emit("claim_ticket", { ticketId: id });
  };

  return (
    <div className="column">
      <h2>Pending</h2>
      {pending.map((t) => (
        <div key={t._id} className="ticket">
          <p>{t.problem}</p>
          <button onClick={() => claim(t._id)}>Claim</button>
        </div>
      ))}
    </div>
  );
}
