import React, { useState } from "react";
import { ENDPOINTS } from "../../API/Endpoint";
import { toast } from "react-toastify";
import "./Signup.css";
import Logo from "../../components/Logo/Logo";
import storageService from "../../utils/storageService";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleSignup = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("confirm_password", confirmPassword);

      storageService.setItem("signup_email", email); 

      const res = await fetch(ENDPOINTS.AUTH.SIGNUP, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {

        navigate("/otp-validation", {
          state: { from: "signup" },
        });

        toast.success(data.OTP_Validate || "Signup successful!");

        // Optionally clear the fields:
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.detail);
      }
    } catch (err) {
      toast.error("Signup failed. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <Logo />
      <div className="signup-card">
        <h2>Create an account</h2>

        <div className="signup-form-container">
          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
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

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button onClick={handleSignup} className="signup-button">
            Sign Up
          </button>

          <div className="login-prompt">
            <p>
              Already have an account? <a href="/login">Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
