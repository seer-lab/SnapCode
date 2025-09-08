import React from "react";
import { useNavigate } from "react-router-dom";
import "./TopNavbar.css";
import { IoArrowBack } from "react-icons/io5";

const TopNavbar = ({ title, leftimage = true, rightimage, leftOnClick }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="navbar">
      <div 
        className="left-content" 
        onClick={leftimage ? handleBackClick : undefined}
        style={{ cursor: leftimage ? "pointer" : "default" }}
      >
        {leftimage && (
          <IoArrowBack
            className="arrow"
            size={30}
          />
        )}
      </div>
      
      <div className="title">{title}</div>
      
      <div className="right-content"></div>
    </div>
  );
};

export default TopNavbar;