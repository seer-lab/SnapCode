import React, { useState } from "react";
import "./Accordion.css";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

const Accordion = ({ title, children, defaultOpen = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleAccordion = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className={`accordion-section ${className}`}>
      <button 
        className="accordion-header"
        onClick={toggleAccordion}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span>{title}</span>
        {isOpen ? 
          <FiChevronDown size={20} /> : 
          <FiChevronRight size={20} />
        }
      </button>
      {isOpen && (
        <div 
          className="accordion-content"
          id={`accordion-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;