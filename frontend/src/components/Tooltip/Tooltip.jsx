import React from "react";
import "./Tooltip.css";

const Tooltip = ({ text, children, position = "top", className = "" }) => {
  return (
    <div className={`tooltip-wrapper ${className}`}>
      {children}
      <span className={`tooltip tooltip-${position}`}>{text}</span>
    </div>
  );
};

export default Tooltip;