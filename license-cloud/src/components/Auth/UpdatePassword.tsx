import React, { useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINTS } from "../../API/Endpoint";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./UpdatePassword.css";
import Logo from "../../components/Logo/Logo";
import storageService from "../../utils/storageService";

// const generateCaptcha = () => {
//   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let captcha = "";
//   for (let i = 0; i < 5; i++) {
//     captcha += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return captcha;
// };

const UpdatePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
//   const [captchaInput, setCaptchaInput] = useState("");
//   const [captchaText, setCaptchaText] = useState(generateCaptcha());
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Take Email and Access Token from storageService
  const email = storageService.getItem(storageService.KEYS.FORGOT_PASSWORD_EMAIL);
  const accessToken = storageService.getItem(storageService.KEYS.ACCESS_TOKEN);

  const navigate = useNavigate();

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // if (captchaInput !== captchaText) {
    //   toast.error("Captcha is incorrect.");
    //   return;
    // }

    try {
        const params = new URLSearchParams();
        params.append('email', email);
        params.append('new_password', newPassword);
        params.append('confirm_password', confirmPassword);
        
        const res = await fetch(ENDPOINTS.AUTH.UPDATED_PASSWORD, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${accessToken}`,
          },
          body: params.toString(),
        });
      
        const data = await res.json();
        
        if (res.ok) {
          navigate("/dashboard");
          toast.success(data.message || "Password updated successfully!");
        } else {
          toast.error(data.message || "Something went wrong.");
        }
      } catch (err) {
        toast.error("Failed to update password.");
      }
    };

//   const refreshCaptcha = () => {
//     setCaptchaText(generateCaptcha());
//     setCaptchaInput("");
//   };

  return (
    <div className="update-container">
      <Logo />
      <div className="update-card">
        <div className="update-header">
          <h2>Update Password</h2>
          <p className="subtitle">Change your Old Password → New Password</p>
        </div>
        <div className="update-form-container">
          <div className="form-group password-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                className="toggle-password"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="form-group password-group">
            <label>Confirm New Password</label>
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

          {/* <div className="form-group">  
            <div className="captcha-visual-wrapper">
                <div className="captcha-visual">
                <svg width="100%" height="40" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                    <filter id="blurry" x="0" y="0">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
                        <feOffset dx="0.5" dy="0.5" />
                    </filter>
                    </defs>
                    <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="Courier New, monospace"
                    fontSize="20"
                    fill="#111827"
                    filter="url(#blurry)"
                    >
                    {captchaText}
                    </text>
                </svg>
                <button className="captcha-refresh" onClick={refreshCaptcha}>↻</button>
                </div>
            </div>
            <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Enter the captcha text"
            />
            </div> */}

          <button onClick={handlePasswordUpdate} className="update-button">
            Update Password
          </button>

          <div className="back-to-login">
            <a href="/login">← Back to Login</a>
         </div>
        
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
