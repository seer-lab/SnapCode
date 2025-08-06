import React from "react";
import "./Tabs.css";

const Tabs = ({ activeTab, onTabChange }) => {
  const tabItems = [
    { label: "Exercise", value: "exercise" },
    { label: "Code", value: "code" },
    { label: "Output", value: "output" },
  ];

  return (
    <div className="tabs-container">
      {tabItems.map((tab) => (
        <div
          key={tab.value}
          className={`tab ${activeTab === tab.value ? "active" : ""}`}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
