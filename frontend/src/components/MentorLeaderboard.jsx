const MentorLeaderboard = ({ data }) => {
  return (
    <div className="leaderboard">
      <h3>Top Mentors</h3>

      <table>
        <thead>
          <tr>
            <th>Mentor</th>
            <th>Resolved Tickets</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m, index) => (
            <tr key={m.mentorId}>
              <td>{m.mentorName}</td>
              <td>{m.resolvedCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MentorLeaderboard;
