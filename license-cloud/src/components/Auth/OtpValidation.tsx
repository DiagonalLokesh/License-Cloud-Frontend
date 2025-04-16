import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { ENDPOINTS } from "../../API/Endpoint";
import "./ForgotPassword.css";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import storageService from "../../utils/storageService";

const OTPValidation: React.FC = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "forgot"; // fallback to "forgot"

  // Take Email and Access Token from storageService
  const accessToken = storageService.getItem(storageService.KEYS.ACCESS_TOKEN);

  const email = from === "signup"
  ? storageService.getItem(storageService.KEYS.SIGNUP_EMAIL)
  : storageService.getItem(storageService.KEYS.FORGOT_PASSWORD_EMAIL);
  
  const otp_validation_type = from === "signup" ? "signup" : "forgot";

  // const email = storageService.getItem(storageService.KEYS.FORGOT_PASSWORD_EMAIL);
  // const signup_email = storageService.getItem(storageService.KEYS.SIGNUP_EMAIL);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      toast.error("Please enter the complete OTP.");
      return;
    }

    try {
      const payload = {
            email,
            otp: fullOtp,
            otp_validation_type,
          };
      
      const res = await fetch(ENDPOINTS.AUTH.OTP_VALIDATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {

        // Signup --> OTP Validation --> Login
        // Forget Password --> OTP Validation --> Update Password
        
        from === "signup" ? navigate("/login") : navigate("/update-password");
        // navigate("/update-password");
        toast.success(data.message || "OTP validated successfully.");
        setOtp(Array(6).fill(""));
      } else {
        toast.error(data.detail || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to validate OTP. Please try again.");
    }
  };

  return (
    <div className="forgot-container">
      <Logo />
      <div className="forgot-card">
        <h2>OTP Validation</h2>
        <p className="subtitle">Enter the 6-character OTP sent to your email.</p>

        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "20px" }}>
          {otp.map((char, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              maxLength={1}
              value={char}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              style={{
                width: "40px",
                height: "48px",
                textAlign: "center",
                fontSize: "18px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
              }}
            />
          ))}
        </div>

        <button className="submit-button" onClick={handleSubmit}>
          Verify OTP
        </button>

        <div className="back-to-login">
          <a href="/login">← Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default OTPValidation;
