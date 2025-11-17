import express from "express";
import { register, login } from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";
import { roleCheck } from "../middleware/role.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/admin-only", auth, roleCheck(["admin"]), (req, res) => {
  res.send("Admin access granted");
});

export default router;
