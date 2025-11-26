
import express from "express";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";
import Ticket from "../models/Ticket.js";

const ticketRoutes = (io) => {
  const router = express.Router();

  router.post("/", auth, roleCheck(["student"]), async (req, res) => {
    try {
      const { description } = req.body;

      const ticket = await Ticket.create({
        student: req.user._id,
        description,
        status: "pending"
      });

      const populated = await Ticket.findById(ticket._id)
        .populate("student", "name email")
        .populate("mentor", "name email");


      io.to("mentors").emit("new_ticket", populated);

      res.status(201).json(populated);
    } catch (err) {
      console.error("create ticket error:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  });


  router.get("/my", auth, roleCheck(["student"]), async (req, res) => {
    try {
      const tickets = await Ticket.find({ student: req.user._id })
        .sort({ createdAt: -1 })
        .populate("mentor", "name email");
      res.json(tickets);
    } catch (err) {
      console.error("my tickets error:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  });


  router.get(
    "/pending",
    auth,
    roleCheck(["mentor", "admin"]),
    async (req, res) => {
      try {
        const tickets = await Ticket.find({ status: "pending" })
          .sort({ createdAt: 1 })
          .populate("student", "name email");
        res.json(tickets);
      } catch (err) {
        console.error("pending tickets error:", err.message);
        res.status(500).json({ message: "Server error" });
      }
    }
  );


  router.get("/my-queue", auth, roleCheck(["mentor"]), async (req, res) => {
    try {
      const tickets = await Ticket.find({
        mentor: req.user._id,
        status: { $in: ["claimed", "resolved"] }
      })
        .sort({ createdAt: 1 })
        .populate("student", "name email");
      res.json(tickets);
    } catch (err) {
      console.error("my queue error:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  });

  return router;
};

export default ticketRoutes;
