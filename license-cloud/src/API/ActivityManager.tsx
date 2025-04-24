import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import storageService from "../utils/storageService";
import { ENDPOINTS } from "../API/Endpoint";
import { toast } from "react-toastify";

const ActivityManager: React.FC = () => {
  const [activityTime, setActivityTime] = useState(0);
  const [inactivityTime, setInactivityTime] = useState(0);
  const [showReconnect, setShowReconnect] = useState(false);  // 15-min inactive dialog
  const [showRelogin, setShowRelogin] = useState(false);      // 45-min inactive dialog

  // Reference to track when the last user activity occurred
  const lastActivityRef = useRef(Date.now());
  const navigate = useNavigate();

  // Extract authentication tokens from storage
  const accessToken = storageService.getItem(storageService.KEYS.ACCESS_TOKEN);
  const refreshToken = storageService.getItem(storageService.KEYS.REFRESH_TOKEN);
  const sessionToken = storageService.getItem(storageService.KEYS.SESSION_TOKEN);

  useEffect(() => {
    // Function to handle user activity events (mouse move, click, mouse scroll, keyboard)
    const handleUserActivity = () => {
      // Don't reset timers if dialogs are already showing
      if (showReconnect || showRelogin) return;

      const now = Date.now();
      const inactiveSeconds = (now - lastActivityRef.current) / 60000;

      // TIMING: Activity sensitivity threshold (0.1 minutes)
      // Change this value to adjust how quickly system recognizes new activity
      if (inactiveSeconds > 0.1) {
        setActivityTime(inactivityTime);
        setInactivityTime(0);
        lastActivityRef.current = now;
        // console.log("activity detected");
      }
    };

    // Handle tab/window visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !showReconnect && !showRelogin) {
        handleUserActivity();
      }
    };

    // Add event listeners for user activity
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("visibilitychange", handleVisibilityChange);

    // TIMING: Activity check interval (every 1 second)
    // This timer checks for inactivity every second
    const timer = setInterval(() => {
      const now = Date.now();
      const currentInactiveMinute = Math.floor((now - lastActivityRef.current) / 60000);

      if (!showRelogin && currentInactiveMinute !== inactivityTime) {
        setInactivityTime(currentInactiveMinute);

        // TIMING: First timeout threshold (15 minutes)
        // After 15 minutes of inactivity, show reconnect dialog
        if (currentInactiveMinute >= 15 && currentInactiveMinute < 45 && !showReconnect) {
          setShowReconnect(true);
          console.log("reconnect");
        }

        // TIMING: Second timeout threshold (45 minutes)
        // After 45 minutes of inactivity, show relogin dialog
        if (currentInactiveMinute >= 45) {
          setShowRelogin(true);
          setShowReconnect(false);
          console.log("relogin");
        }
      }
    }, 1000);

    // Clean up event listeners and timers
    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.addEventListener("scroll", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(timer);
    };
  }, [inactivityTime, showReconnect, showRelogin]);

  useEffect(() => {
    let lastUpdateHit = 0;
  
    // TIMING: Backend activity update check (every minute)
    // This timer runs the backend activity update logic
    const timer = setInterval(async () => {
      const now = Date.now();
      const currentInactiveMinutes = Math.floor((now - lastActivityRef.current) / 60000);
      setInactivityTime(currentInactiveMinutes);
  
      // TIMING: Backend activity endpoint call frequency (every 5 minutes)
      // Hit the activity update endpoint every 5 minutes
      const currentMinute = Math.floor(now / 60000);
      if (currentMinute % 5 === 0 && currentMinute !== lastUpdateHit) {
        lastUpdateHit = currentMinute;
  
        try {
          // Call the UPDATE_ACTIVITY endpoint to keep session alive
          const res = await fetch(ENDPOINTS.AUTH.UPDATE_ACTIVITY, {
            method: "PUT",
            headers: {
              "Session-Token": sessionToken,
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });
  
          if (!res.ok) {
            console.log("Update activity failed", await res.text());
          } else {
            console.log("Update activity hit");
          }
        } catch (err) {
          console.log("Error updating activity", err);
        }
      }
  
      // TIMING: First timeout threshold (15 minutes) - duplicate check
      // After 15 minutes of inactivity, show reconnect dialog
      if (currentInactiveMinutes >= 15 && currentInactiveMinutes < 45 && !showReconnect) {
        setShowReconnect(true);
        console.log("Reconnect");
      }
  
      // TIMING: Second timeout threshold (45 minutes) - duplicate check
      // After 45 minutes of inactivity, show relogin dialog
      if (currentInactiveMinutes >= 45) {
        setShowRelogin(true);
        setShowReconnect(false);
        console.log("Relogin");
      }
    }, 60000); // TIMING: Check frequency - once per minute (60000ms)
  
    return () => {
      clearInterval(timer);
    };
  }, [accessToken, refreshToken, sessionToken, showReconnect, showRelogin]);
  
  
  // Function to handle when user clicks "Reconnect" button
  const handleReconnect = async () => {
    try {
      // First try refreshing with access token
      const res = await fetch(ENDPOINTS.AUTH.REFRESH_ACTIVITY, {
        method: "POST",
        headers: {
          "Session-Token": sessionToken,
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if(res.status === 200) {
        const data = await res.json();
        console.log("reconnect");
        
        if (data?.access_token) {
          storageService.setItem(storageService.KEYS.ACCESS_TOKEN, data.access_token);
        }

        setShowReconnect(true);
        window.location.reload();
      }
      // If access token is expired, try refresh token
      else if (res.status === 401) {
        console.log("Access token expired, trying refresh token...");

        const refreshRes = await fetch(ENDPOINTS.AUTH.REFRESH_ACTIVITY, {
          method: "POST",
          headers: {
            "Session-Token": sessionToken,
            "Authorization": `Bearer ${refreshToken}`,
            "Content-Type": "application/json",
          },
        });
        if (refreshRes.status === 200) {
          const data = await refreshRes.json();
          console.log("refresh token worked", data.access_token);
      
          if (data?.access_token) {
            storageService.setItem(storageService.KEYS.ACCESS_TOKEN, data.access_token);
          }

          setShowReconnect(true);
          console.log("reconnect");
          window.location.reload();
        }
      }
    } 
    catch (err) {
      console.error("Refresh failed");
    }
  };

  // Function to handle when user clicks "Relogin" button
  const handleRelogin = async () => {
    try {
      // Call logout endpoint to invalidate session
      const relogin = await fetch(ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
        headers: {
          "Session-Token": sessionToken,
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if(relogin.status === 200) {
        const data = await relogin.json();
        toast.success(data.Logout);
        setShowReconnect(true);
        navigate("/login");
      }
    } catch (err) {
      console.error("Logout failed");
    }
  };

  return (
    <>
      {/* Dialog shown after 15 minutes of inactivity */}
      {showReconnect && (
        <div style={dialogStyle}>
          <h2>You were inactive for 15 minutes</h2>
          <button onClick={handleReconnect} style={buttonStyle}>Reconnect</button>
        </div>
      )}
      {/* Dialog shown after 45 minutes of inactivity */}
      {showRelogin && (
        <div style={dialogStyle}>
          <h2>You were inactive for 45 minutes</h2>
          <button onClick={handleRelogin} style={buttonStyle}>Relogin</button>
        </div>
      )}
    </>
  );
};

const dialogStyle: React.CSSProperties = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#fff",
  padding: "30px",
  boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.2)",
  borderRadius: "10px",
  textAlign: "center",
  zIndex: 1000
};

const buttonStyle: React.CSSProperties = {
  marginTop: "20px",
  padding: "10px 20px",
  fontSize: "16px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

export default ActivityManager;
