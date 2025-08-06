import React, { useState, useEffect } from "react";
import "./BottomNavbar.css"; 
import { FiHome, FiUser } from "react-icons/fi";

const BottomNavbar = ({ handleChange, selectedValue }) => {
  const navItems = [
    { 
      label: 'Home', 
      value: 'home', 
      Icon: FiHome 
    },
    { 
      label: 'Account', 
      value: 'account', 
      Icon: FiUser 
    },
  ];

  // Find index of selected item
  const getSelectedIndex = (value) => {
    const index = navItems.findIndex(item => item.value === value);
    return index !== -1 ? index : 0;
  };

  const [selectedIndex, setSelectedIndex] = useState(getSelectedIndex(selectedValue));

  // Sync internal state when selectedValue changes from parent
  useEffect(() => {
    setSelectedIndex(getSelectedIndex(selectedValue));
  }, [selectedValue]);

  const handleItemClick = (index, value) => {
    setSelectedIndex(index);
    handleChange(value);
  };

  return (
    <nav className="lower-nav">
      {navItems.map((item, index) => {
        const isSelected = selectedIndex === index;
        const { Icon } = item;
        
        return (
          <button
            key={item.value}
            className={`nav-item ${isSelected ? 'selected' : ''}`}
            onClick={() => handleItemClick(index, item.value)}
          >
            <Icon 
              className="nav-item-icon" 
              size={30}
              style={{ 
                color: isSelected ? 'var(--primary-color)' : '#999',
                marginBottom: '0.25rem'
              }}
            />
            <div className="nav-item-text">{item.label}</div>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavbar;