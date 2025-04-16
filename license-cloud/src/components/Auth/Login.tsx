import React, { useState } from "react";
import { ENDPOINTS } from "../../API/Endpoint";
import { toast } from "react-toastify";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Password
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo/Logo"; // Centralized Logo icon
import storageService from "../../utils/storageService";  // To store other api parameter

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      storageService.setItem("user_name", username); 

      const res = await fetch(ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {

        // Use centralized storage
        storageService.setItem(storageService.KEYS.ACCESS_TOKEN, data.access_token);
        storageService.setItem(storageService.KEYS.REFRESH_TOKEN, data.refresh_token);
        storageService.setItem(storageService.KEYS.SESSION_TOKEN, data.session_token);

        toast.success("Login successful!");
        navigate("/dashboard");
        setMessage("");
        toast.success(data.detail);
      } else {
        toast.error(data.detail);
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <Logo />
      <div className="login-card">
        <div className="login-header"></div>
        <div className="login-form-container">
          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group password-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <button onClick={handleLogin} className="login-button">
            Sign In
          </button>

          {message && <p className="error-message">{message}</p>}
        </div>

        <div className="signup-prompt">
          <p>
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
