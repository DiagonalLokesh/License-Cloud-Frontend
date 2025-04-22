import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ForgotPassword from "./components/Auth/ForgotPassword";
import Dashboard from "./components/Dashboard/Dashboard";
import OTPValidation from "./components/Auth/OtpValidation";
import UpdatePassword from "./components/Auth/UpdatePassword";
import UserDetails from "../src/components/Dashboard/UserDetails/UserDetails";
import NewLicense from "../src/components/Dashboard/NewLicense/NewLicense";
import Clients from "../src/components/Dashboard/Clients/Clients";
import LicenseDetails from "../src/components/Dashboard/LicenseDetails/LicenseDetails";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-validation" element={<OTPValidation />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="new-license" element={<NewLicense />} />
          <Route path="license-details" element={<LicenseDetails />} />
          <Route path="clients" element={<Clients />} />
          <Route path="user-details" element={<UserDetails />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
