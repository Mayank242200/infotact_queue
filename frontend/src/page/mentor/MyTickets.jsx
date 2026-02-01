export default function MyTickets({ socket }) {
  const [mine, setMine] = useState([]);

  useEffect(() => {
    socket.on("ticket_claimed_by_me", (ticket) => {
      setMine((prev) => [...prev, ticket]);
    });

    socket.on("ticket_resolved", (id) => {
      setMine((prev) => prev.filter((t) => t._id !== id));
    });
  }, []);

  const resolve = (id) => {
    socket.emit("resolve_ticket", { ticketId: id });
  };

  return (
    <div className="column">
      <h2>My Queue</h2>
      {mine.map((t) => (
        <div key={t._id} className="ticket">
          <p>{t.problem}</p>
          <button onClick={() => resolve(t._id)}>Resolve</button>
        </div>
      ))}
    </div>
  );
}
