import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);


  const validate = (name, value) => {
    let error = "";

 
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

  
    if (!form.email || !form.password) {
      toast.error("Please fill all details");
      return;
    }

    if (errors.email || errors.password) {
      toast.error("Please fix validation errors");
      return;
    }

    try {
      const user = await login(form.email, form.password);

      if (!user) {
        toast.error("Invalid email or password");
        return;
      }

      toast.success("Login successful!");

      setTimeout(() => {
        if (user.role === "student") window.location.href = "/dashboard";
        else if (user.role === "mentor") window.location.href = "/mentor";
        else if (user.role === "admin") window.location.href = "/admin";
      }, 700);
    } catch (err) {
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error">{errors.email}</span>}

          {/* Password */}
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            <span
              className={`eye-icon ${showPassword ? "open" : "closed"}`}
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            ></span>
          </div>
          {errors.password && (
            <span className="error">{errors.password}</span>
          )}

          <button type="submit">Login</button>
        </form>

        <p>
          New user? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}
