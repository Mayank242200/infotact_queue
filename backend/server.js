import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import Ticket from "./models/Ticket.js";
import User from "./models/User.js";
import startAdminStatsEmitter from "./socket/adminStatsEmitter.js";

dotenv.config();        // MUST be first
connectDB();            // Connect to MongoDB

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: "*", methods: ["GET", "POST"] }
// });

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket"]
});

// SOCKET LOGIC (same as your original code)
const socketUsers = {};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("register", ({ userId, role }) => {
    socketUsers[socket.id] = { userId, role };
    socket.join(`user:${userId}`);

    if (role === "mentor") socket.join("mentors");
    if (role === "admin") socket.join("admins");

    console.log(`Socket ${socket.id} registered as ${role} (${userId})`);
  });

  socket.on("claim_ticket", async ({ ticketId }) => {
    try {
      const info = socketUsers[socket.id];
      if (!info || info.role !== "mentor") return;

      const mentorId = info.userId;

      const ticket = await Ticket.findOneAndUpdate(
        { _id: ticketId, status: "pending", mentor: null },
        { status: "claimed", mentor: mentorId, claimedAt: new Date() },
        { new: true }
      )
        .populate("student", "name email")
        .populate("mentor", "name email");

      if (!ticket) {
        socket.emit("claim_failed", { ticketId, reason: "Already claimed" });
        return;
      }

      io.to("mentors").emit("ticket_claimed", ticket);
      io.to(`user:${mentorId}`).emit("my_queue_update", ticket);
      io.to(`user:${ticket.student._id.toString()}`).emit(
        "ticket_status_update",
        {
          ticketId: ticket._id,
          status: "in_progress",
          mentor: ticket.mentor
        }
      );
    } catch (err) {
      console.error("claim_ticket error:", err.message);
      socket.emit("error_message", "Error claiming ticket");
    }
  });

  socket.on("resolve_ticket", async ({ ticketId }) => {
    try {
      const info = socketUsers[socket.id];
      if (!info || info.role !== "mentor") return;

      const mentorId = info.userId;

      const ticket = await Ticket.findOneAndUpdate(
        { _id: ticketId, status: "claimed", mentor: mentorId },
        { status: "resolved", resolvedAt: new Date() },
        { new: true }
      )
        .populate("student", "name email")
        .populate("mentor", "name email");

      if (!ticket) {
        socket.emit("resolve_failed", {
          ticketId,
          reason: "Not claimed by you or already resolved"
        });
        return;
      }

      io.to("mentors").emit("ticket_resolved", ticket);
      io.to(`user:${mentorId}`).emit("my_queue_update", ticket);
      io.to(`user:${ticket.student._id.toString()}`).emit(
        "ticket_status_update",
        {
          ticketId: ticket._id,
          status: "resolved",
          mentor: ticket.mentor
        }
      );
    } catch (err) {
      console.error("resolve_ticket error:", err.message);
      socket.emit("error_message", "Error resolving ticket");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    delete socketUsers[socket.id];
  });
});

// Start admin live queue stats
startAdminStatsEmitter(io);

// Queue Stats (unchanged)
// setInterval(async () => {
//   try {
//     const waitAgg = await Ticket.aggregate([
//       { $match: { claimedAt: { $ne: null } } },
//       { $project: { waitMs: { $subtract: ["$claimedAt", "$createdAt"] } } },
//       { $group: { _id: null, avgWaitMs: { $avg: "$waitMs" } } }
//     ]);

//     const resolveAgg = await Ticket.aggregate([
//       {
//         $match: {
//           resolvedAt: { $ne: null },
//           claimedAt: { $ne: null }
//         }
//       },
//       { $project: { resolveMs: { $subtract: ["$resolvedAt", "$claimedAt"] } } },
//       { $group: { _id: null, avgResolveMs: { $avg: "$resolveMs" } } }
//     ]);

//     const leaderboardAgg = await Ticket.aggregate([
//       { $match: { status: "resolved", mentor: { $ne: null } } },
//       { $group: { _id: "$mentor", resolvedCount: { $sum: 1 } } },
//       { $sort: { resolvedCount: -1 } },
//       { $limit: 10 }
//     ]);

//     const mentorIds = leaderboardAgg.map(e => e._id);
//     const mentors = await User.find({ _id: { $in: mentorIds } }).select(
//       "name email"
//     );

//     const leaderboard = leaderboardAgg.map(entry => ({
//       mentorId: entry._id,
//       mentorName:
//         mentors.find(m => m._id.toString() === entry._id.toString())?.name ||
//         "Unknown",
//       resolvedCount: entry.resolvedCount
//     }));

//     io.to("admins").emit("queue_stats_update", {
//       generatedAt: new Date(),
//       avgWaitMs: waitAgg[0]?.avgWaitMs || null,
//       avgResolveMs: resolveAgg[0]?.avgResolveMs || null,
//       mentorLeaderboard: leaderboard
//     });
//   } catch (err) {
//     console.error("queue stats error:", err.message);
//   }
// }, 60000);

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes(io));

app.get("/", (req, res) => res.send("Backend running…"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
