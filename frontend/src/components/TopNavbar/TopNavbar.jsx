import React from "react";
import { useNavigate } from "react-router-dom";
import "./TopNavbar.css";
import backarrow from "../../assets/backarrow.png";

const TopNavbar = ({ title, leftimage = true, rightimage, leftOnClick }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="navbar">
      <div className="left-content">
        {leftimage === false ? null : (
          <img
            src={backarrow}
            alt="Back Arrow"
            className="arrow"
            style={{ height: "20px", width: "11px" }}
            onClick={handleBackClick}
          />
        )}
      </div>
      <div className="title">{title}</div>
      <div className="right-content"></div>
    </div>
  );
};

export default TopNavbar;