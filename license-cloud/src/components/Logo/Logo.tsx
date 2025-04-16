import React from "react";
import logo from "../../assets/logo.png";
import "./Logo.css";

const Logo: React.FC = () => {
  return (
    <div className="logo-wrapper">
      <img src={logo} alt="Logo" className="background-logo" />
    </div>
  );
};

export default Logo;
