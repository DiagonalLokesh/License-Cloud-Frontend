import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BadgePlus,
  Users,
  // FileSearch,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import "./Dashboard.css";
import { ENDPOINTS } from "../../API/Endpoint";
import storageService from "../../utils/storageService";
import { toast } from "react-toastify";
import Logo from "../../../public/Logo.png";

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = storageService.getItem(storageService.KEYS.USER_NAME);

  // Token Extract
  const accessToken = storageService.getItem(storageService.KEYS.ACCESS_TOKEN);
  const sessionToken = storageService.getItem(storageService.KEYS.SESSION_TOKEN);

  const getInitial = (email: string | null): string => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
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
        setShowLogoutModal(true);
        navigate("/login");
      }
    } catch (err) {
      console.error("Logout failed");
    };
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="dashboard-wrapper">
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="logo-container">
            <img src={Logo} alt="Logo" className="logo" />
            <span className="logo-text">Aryabhat</span>
          </div>
        )}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      </div>

        <nav className="nav-links">
          <Link
            to="/dashboard/new-license"
            className={location.pathname.includes("new-license") ? "active" : ""}>
            <BadgePlus />
            {!collapsed && <span>New License</span>}
          </Link>

          {/* <Link
            to="/dashboard/license-details"
            className={location.pathname.includes("license-details") ? "active" : ""}>
            <FileSearch />
            {!collapsed && <span>License Details</span>}
          </Link> */}

          <Link
            to="/dashboard/clients"
            className={location.pathname.includes("clients") ? "active" : ""}>
            <Users />
            {!collapsed && <span>Clients</span>}
          </Link>
          
          <Link
            to="/dashboard/user-details"
            className={location.pathname.includes("user-details") ? "active" : ""}
          >
            <User />
            {!collapsed && <span>User Details</span>}
          </Link>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut />
            {!collapsed && <span>Logout</span>}
          </button>
        </nav>
        
        {/* User profile with avatar at bottom */}
        <div className="bottom-user-profile">
          <div className="avatar-circle" data-initial={getInitial(email)}></div>
          {!collapsed && 
            <div className="bottom-email">
              {email || "user@example.com"}
            </div>
          }
        </div>
      </aside>

      <main className="dashboard-content">
        <Outlet />
      </main>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to log out?</p>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={confirmLogout}>Yes</button>
              <button className="btn-cancel" onClick={cancelLogout}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;