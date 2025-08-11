// src/components/BottomNavbar/BottomNavbar.jsx

import React, { useState, useEffect } from "react";
import "./BottomNavbar.css";
import { FiHome, FiUser, FiUpload } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import Tooltip from "../Tooltip/Tooltip";

const BottomNavbar = ({ handleChange, selectedValue, onCameraClick }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', value: 'home', Icon: FiHome },
    { label: 'Camera', value: 'camera', Icon: FiUpload, isSpecial: true },
    { label: 'Account', value: 'account', Icon: FiUser },
  ];

  const isInExercise = location.pathname.includes("/exerciseDashboard");

  const getSelectedIndex = (value) =>
    navItems.findIndex(item => item.value === value) || 0;

  const [selectedIndex, setSelectedIndex] = useState(getSelectedIndex(selectedValue));

  useEffect(() => {
    setSelectedIndex(getSelectedIndex(selectedValue));
  }, [selectedValue]);

  const handleItemClick = (index, value) => {
    const item = navItems[index];

    if (item.isSpecial && value === 'camera') {
      if (isInExercise && onCameraClick) {
        onCameraClick();
      }
      return;
    }

    setSelectedIndex(index);
    handleChange(value);
  };

  const renderNavItem = (item, index) => {
    const isSelected = selectedIndex === index;
    const isDisabled = item.isSpecial && !isInExercise;
    const { Icon } = item;

    const buttonClass = `
      nav-item
      ${isSelected ? 'selected' : ''}
      ${isDisabled ? 'disabled' : ''}
      ${item.isSpecial ? 'camera-button' : ''}
    `;

    const iconProps = {
      className: "nav-item-icon",
      size: item.isSpecial ? 28 : 24,
      style: {
        color: item.isSpecial ? "white" : isDisabled
          ? '#ccc'
          : isSelected
            ? 'var(--primary-color)'
            : '#999',
      }
    };

    const button = (
      <button
        key={item.value}
        className={buttonClass}
        onClick={() => handleItemClick(index, item.value)}
        disabled={isDisabled}
      >
        <Icon {...iconProps} />
        {!item.isSpecial && (
          <div
            className="nav-item-text"
            style={{ color: isDisabled ? '#ccc' : 'inherit' }}
          >
            {item.label}
          </div>
        )}
      </button>
    );

    return item.isSpecial && isDisabled
      ? <Tooltip key={item.value} text="Upload only works inside an exercise">{button}</Tooltip>
      : button;
  };

  return (
    <nav className="lower-nav">
      {navItems.map((item, index) => renderNavItem(item, index))}
    </nav>
  );
};

export default BottomNavbar;
