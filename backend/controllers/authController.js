import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const isExist = await User.findOne({ email });
    if (isExist) return res.status(400).json({ msg: "Email already exists" });

    const hashPass = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPass,
      role,
    });

    res.json({ msg: "User Registered", user });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", err });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ msg: "Login Successful", token, user });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", err });
  }
};
