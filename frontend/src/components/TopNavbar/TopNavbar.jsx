import React from "react";
import { useNavigate } from "react-router-dom";
import "./TopNavbar.css";
import { IoArrowBack } from "react-icons/io5";

const TopNavbar = ({ title, leftimage = true, rightimage, leftOnClick }) => {
  const navigate = useNavigate();

  // Handle back button click - navigates to previous page
  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="navbar">
      {/* Left side - Back arrow (conditional) */}
      <div 
        className="left-content" 
        onClick={handleBackClick} 
        style={{ cursor: "pointer" }}
      >
        {leftimage === false ? null : (
          <IoArrowBack
            className="arrow"
            size={30}
          />
        )}
      </div>
      
      {/* Center - Page title */}
      <div className="title">{title}</div>
      
      {/* Right side - Empty for now, reserved for future actions */}
      <div className="right-content"></div>
    </div>
  );
};

export default TopNavbar;