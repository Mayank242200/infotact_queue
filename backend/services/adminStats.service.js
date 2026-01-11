const Ticket = require("../models/Ticket");

const getQueueStats = async () => {
  const stats = await Ticket.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  // Convert array to object
  const result = {
    total: 0,
    pending: 0,
    claimed: 0,
    resolved: 0
  };

  stats.forEach((s) => {
    result[s._id] = s.count;
    result.total += s.count;
  });

  return result;
};

module.exports = { getQueueStats };
