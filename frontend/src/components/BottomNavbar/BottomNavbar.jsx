import React, { useState } from "react";
import "./BottomNavbar.css"; 
import home_grey from "../../assets/home_grey.png"
import home_purple from "../../assets/home_purple.png"
import account_grey from "../../assets/account_grey.png"
import account_purple from "../../assets/account_purple.png"

const BottomNavbar = ({handleChange}) => {
  const navItems = [
  { label: 'Home', value: 'home', icons: [home_grey, home_purple] },
  { label: 'Account', value: 'account', icons: [account_grey, account_purple] },
];
  const [selected,setSelected] = useState(0);

  const handleClick = (number,value) => {
    setSelected(number);
    handleChange(value);
  }

return (
  <nav className="lower-nav">
    {navItems.map((item, index) => (
      <button
        key={item.value}
        className={`nav-item ${selected === index ? 'selected' : ''}`}
        onClick={() => handleClick(index, item.value)}
      >
        <img className="nav-item-icon" src={selected === index ? item.icons[1] : item.icons[0]} alt={`${item.label} Icon`} />
        <div className="nav-item-text">{item.label}</div>
      </button>
    ))}
  </nav>
);
};

export default BottomNavbar;
