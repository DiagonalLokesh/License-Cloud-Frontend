import React, { useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINTS } from "../../API/Endpoint";
import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import storageService from "../../utils/storageService";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  
  const handleSubmit = async () => {
    // navigate("/otp-validation");
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
    
      storageService.setItem("forgot_password_email", email); 

      const accessToken = storageService.getItem(storageService.KEYS.ACCESS_TOKEN);
    
      const res = await fetch(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`, 
        }
      });
    
      const data = await res.json();
    
      if (res.ok) {
        
        navigate("/otp-validation", {
          state: { from: "forgot" }, // Pass source identifier
        });
        
        toast.success(data.detail || "Password reset link sent to your email.");
        setEmail("");
      } else {
        toast.error(data.detail || "Something went wrong.");
      }
    } catch (error) {
      toast.error("Failed to send reset email. Please try again.");
    }    
  };

  return (
    <div className="forgot-container">
      <Logo />
      <div className="forgot-card">
        <h2>Forgot Password</h2>
        <p className="subtitle">Enter your email and we'll send you a reset link.</p>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="submit-button" onClick={handleSubmit}>
          Send Reset Link
        </button>

        <div className="back-to-login">
          <a href="/login">← Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
