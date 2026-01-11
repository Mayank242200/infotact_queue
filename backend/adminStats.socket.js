const { getQueueStats } = require("./services/adminStats.service");

const startAdminStatsEmitter = (io) => {
  setInterval(async () => {
    try {
      const stats = await getQueueStats();

      io.emit("queue_stats_update", stats); // admin listens to this
    } catch (error) {
      console.error("Queue stats error:", error);
    }
  }, 60 * 1000); // every 1 minute
};

module.exports = startAdminStatsEmitter;
