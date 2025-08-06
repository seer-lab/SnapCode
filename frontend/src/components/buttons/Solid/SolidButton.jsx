import React from 'react';
import './SolidButton.css'; // Be sure the filename matches

const SolidButton = ({ children, onClick, disabled }) => {
  return (
    <button
      className="solid-button"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default SolidButton;