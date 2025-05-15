import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import storageService from "../utils/storageService";
import { ENDPOINTS } from "../API/Endpoint";
import { toast } from "react-toastify";

/**
 * ActivityManager - Tracks user activity and manages session timeouts
 * 
 * This component handles:
 * 1. Detecting user inactivity
 * 2. Showing reconnect dialog after 15 minutes of inactivity
 * 3. Showing relogin dialog after 45 minutes of inactivity
 * 4. Periodically updating backend about user activity
 * 5. Managing session tokens and authentication
 */

const ActivityManager: React.FC = () => {
  // State management for tracking activity times and dialog visibility
  const [, setActivityTime] = useState(0); // Tracks active time (unused variable)
  const [inactivityTime, setInactivityTime] = useState(0); // Minutes of inactivity
  const [showReconnect, setShowReconnect] = useState(false); // Controls 15-min dialog
  const [showRelogin, setShowRelogin] = useState(false); // Controls 45-min dialog

  // Ref to store timestamp of last user activity
  const lastActivityRef = useRef(Date.now());
  const navigate = useNavigate();

  // Retrieve authentication tokens from storage
  const accessToken = storageService.getItem(storageService.KEYS.ACCESS_TOKEN);
  const refreshToken = storageService.getItem(storageService.KEYS.REFRESH_TOKEN);
  const sessionToken = storageService.getItem(storageService.KEYS.SESSION_TOKEN);

  // On mount: Check localStorage to restore dialog state after page refreshes
  useEffect(() => {
    const storedInactivityState = localStorage.getItem('inactivityState');
    const lastInactiveTime = localStorage.getItem('lastInactiveTime');
    
    // If user refreshed page while dialog was showing, restore that state
    if (storedInactivityState === 'reconnect') {
      setShowReconnect(true);
    } else if (storedInactivityState === 'relogin') {
      setShowRelogin(true);
    }
    
    // Restore the timestamp of when inactivity began
    if (lastInactiveTime) {
      lastActivityRef.current = parseInt(lastInactiveTime, 10);
    }
  }, []);

  // Setup event listeners to detect user activity and check inactivity intervals
  useEffect(() => {
    // Function that handles any user interaction
    const handleUserActivity = () => {
      // Don't reset timers if dialogs are already showing
      if (showReconnect || showRelogin || 
          localStorage.getItem('inactivityState') === 'reconnect' || 
          localStorage.getItem('inactivityState') === 'relogin') return;

      const now = Date.now();
      const inactiveMinute = (now - lastActivityRef.current) / 60000;

      // Only reset if user has been inactive for more than 0.1 minutes (6 seconds)
      // This prevents constant resetting on rapid interactions
      if (inactiveMinute > 0.1) {
        setActivityTime(inactivityTime);
        setInactivityTime(0);
        lastActivityRef.current = now; // Reset last activity timestamp
      }
    };

    // Special handler for when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && 
          !showReconnect && !showRelogin && 
          localStorage.getItem('inactivityState') !== 'reconnect' && 
          localStorage.getItem('inactivityState') !== 'relogin') {
        handleUserActivity();
      }
    };

    // Register event listeners for various user interactions
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("visibilitychange", handleVisibilityChange);

    // Main inactivity check runs every second
    const timer = setInterval(() => {
      const now = Date.now();
      const currentInactiveMinute = Math.floor((now - lastActivityRef.current) / 60000);

      // Update inactivity timer state when it changes
      if (!showRelogin && currentInactiveMinute !== inactivityTime) {
        setInactivityTime(currentInactiveMinute);

        // After 15 minutes of inactivity, show reconnect dialog
        if (currentInactiveMinute >= 15 && currentInactiveMinute < 45 && !showReconnect) {
          setShowReconnect(true);
          localStorage.setItem('inactivityState', 'reconnect');
          localStorage.setItem('lastInactiveTime', lastActivityRef.current.toString());
          console.log("reconnect");
        }

        // After 45 minutes of inactivity, show relogin dialog
        if (currentInactiveMinute >= 45) {
          setShowRelogin(true);
          setShowReconnect(false);
          localStorage.setItem('inactivityState', 'relogin');
          localStorage.setItem('lastInactiveTime', lastActivityRef.current.toString());
          console.log("relogin");
        }
      }
    }, 1000); // Check every second

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(timer);
    };
  }, [inactivityTime, showReconnect, showRelogin]);

  // Backend communication effect - ping server every 5 minutes to keep session alive
  useEffect(() => {
    let lastUpdateHit = 0;
  
    // Run check every minute
    const timer = setInterval(async () => {
      const now = Date.now();
      const currentInactiveMinutes = Math.floor((now - lastActivityRef.current) / 60000);
      setInactivityTime(currentInactiveMinutes);
  
      // Backend ping happens every 5 minutes (when currentMinute % 5 === 0)
      const currentMinute = Math.floor(now / 60000);
      if (currentMinute % 5 === 0 && currentMinute !== lastUpdateHit) {
        lastUpdateHit = currentMinute;
  
        try {
          // Call the UPDATE_ACTIVITY endpoint to keep session alive on server
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
  
      // Additional inactivity threshold checks (redundant with the checks in previous effect)
      if (currentInactiveMinutes >= 15 && currentInactiveMinutes < 45 && !showReconnect) {
        setShowReconnect(true);
        localStorage.setItem('inactivityState', 'reconnect');
        localStorage.setItem('lastInactiveTime', lastActivityRef.current.toString());
        console.log("Reconnect");
      }
  
      if (currentInactiveMinutes >= 45) {
        setShowRelogin(true);
        setShowReconnect(false);
        localStorage.setItem('inactivityState', 'relogin');
        localStorage.setItem('lastInactiveTime', lastActivityRef.current.toString());
        console.log("Relogin");
      }
    }, 60000); // Run every minute
  
    return () => {
      clearInterval(timer);
    };
  }, [accessToken, refreshToken, sessionToken, showReconnect, showRelogin]);
  
  /**
   * Handles reconnection when user clicks "Reconnect" button after 15 min inactivity
   * First tries with access token, then falls back to refresh token if needed
   */
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
        
        // Store new access token if provided
        if (data?.access_token) {
          storageService.setItem(storageService.KEYS.ACCESS_TOKEN, data.access_token);
        }
        
        // Clear inactivity state in localStorage
        localStorage.removeItem('inactivityState');
        localStorage.removeItem('lastInactiveTime');
        
        setShowReconnect(false);
        // Reset activity timer
        lastActivityRef.current = Date.now();
        setInactivityTime(0);
      }

      // If access token is expired (401), try using refresh token instead

      else if (res.status === 401) {
        console.log("Access token expired, trying refresh token...");

        const refreshRes = await fetch(ENDPOINTS.AUTH.REFRESH_ACTIVITY, {
          method: "POST",
          headers: {
            "Session-Token": sessionToken,
            "Authorization": `Bearer ${refreshToken}`, // Use refresh token instead
            "Content-Type": "application/json",
          },
        });
        
        if (refreshRes.status === 200) {
          const data = await refreshRes.json();
          console.log("refresh token worked", data.access_token);
      
          // Store new access token
          if (data?.access_token) {
            storageService.setItem(storageService.KEYS.ACCESS_TOKEN, data.access_token);
          }
          
          // Clear inactivity state
          localStorage.removeItem('inactivityState');
          localStorage.removeItem('lastInactiveTime');
          
          setShowReconnect(false);
          console.log("reconnect");
          // Reset activity timer
          lastActivityRef.current = Date.now();
          setInactivityTime(0);
        }
      }
    } 
    catch (err) {
      console.error("Refresh failed");
    }
  };

  /**
   * Handles relogin when user clicks "Relogin" button after 45 min inactivity
   * Logs out user and redirects to login page
   */

  const handleRelogin = async () => {
    try {
      // Call logout endpoint to invalidate session on server
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
        
        // Clear inactivity state
        localStorage.removeItem('inactivityState');
        localStorage.removeItem('lastInactiveTime');
        
        setShowRelogin(false);
        navigate("/login"); // Redirect to login page
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

// Styles for the dialogs and buttons
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


// By Lokesh Wankhede - 24.04.2025