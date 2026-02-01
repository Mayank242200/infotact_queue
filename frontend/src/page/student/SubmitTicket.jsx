import { useState } from "react";
import { createTicket } from "../../api/ticketApi";

export default function SubmitTicket({ onTicketCreated }) {
  const [problem, setProblem] = useState("");

  const submit = async () => {
    if (!problem) return alert("Please describe your problem!");

    try {
      const newTicket = await createTicket(problem);
      alert("Ticket submitted!");

      if (onTicketCreated) onTicketCreated(newTicket);
      setProblem(""); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit ticket");
    }
  };

  return (
    <div>
      <textarea
        placeholder="Describe your problem..."
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />
      <button onClick={submit}>Join Queue</button>
    </div>
  );
}
