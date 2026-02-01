import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (name, value) => {
    let error = "";

    if (name === "name") {
      if (value.length === 0) error = ""; 
      else if (value.length < 3)
        error = "Name must be at least 3 characters";
    }

    if (name === "email") {
      if (value.length === 0) error = "";
      else if (!/\S+@\S+\.\S+/.test(value))
        error = "Invalid email format";
    }

  if (name === "password") {
      if (value.length === 0) error = "";
      else if (value.length < 8)
        error = "Password must be at least 8 characters";
      else if (!/[A-Z]/.test(value))
        error = "Password must contain 1 capital letter";
      else if (!/[0-9]/.test(value))
        error = "Password must contain 1 number";
      else if (!/[@]/.test(value))
        error = "Password must contain @ symbol";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.password
    ) {
      toast.error("Please fill all details");
      return;
    }

    if (errors.name || errors.email || errors.password) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );

      toast.success("Registration successful!");

      setTimeout(() => {
        navigate("/login");
      }, 700);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create an Account</h2>
        <p className="subtitle">Join the Queue system today</p>

        <form onSubmit={handleSubmit} noValidate>
    
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
            />
            {errors.name && (
              <span className="error">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
            {errors.email && (
              <span className="error">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
              <span
                className={`eye-icon ${
                  showPassword ? "open" : "closed"
                }`}
                onClick={() => setShowPassword(!showPassword)}
              ></span>
            </div>
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label>Select Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            className="register-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
