import React, { useRef } from "react";
import "./CodeTabContent.css";
import editIcon from "../../assets/grey-edit.png";

import redErrorIcon from "../../assets/red-error.png";

import { useCodeTabLogic } from "../../hooks/useCodeTabLogic";
import { MdDelete } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";

import SolidButton from "../buttons/Solid/SolidButton";
const CodeTabContent = ({ codeProcessor }) => {
  const {
    processedHTML,
    htmlTagError,
    lineHasError,
    isLoading
  } = codeProcessor;

  const menuRef = useRef(null);
  
  const {
    selectedLineIndex,
    inputPopupOpen,
    inputValue,
    purposeOfPopUp,
    menuOpen,
    operationInProgress,
    handleLineClick,
    closeMenu,
    closeInputPopup,
    handleInputChange,
    handleInputSubmit,
    handleDeleteLine,
    handleAddLineBefore,
    handleAddLineAfter,
    handleEditLine,
    handleOverlayClick
  } = useCodeTabLogic(codeProcessor);

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <div className="code-viewer">
      {htmlTagError && (
        <div className="error-row" style={{ padding: "5px", fontSize: "1rem" }}>
          <img className="menu-icon" src={redErrorIcon} alt="Error" />
          <div className="menu-text">Entire code should be enclosed in html tags</div>
        </div>
      )}

      {processedHTML.map((line, index) => (
        <div
          key={`${index}-${line[0]}`}
          className={`code-line ${index % 2 === 0 ? "even" : "odd"} ${
            selectedLineIndex === index
              ? lineHasError(line) ? "red-colour-row" : "blue-colour-row"
              : ""
          }`}
          onClick={() => handleLineClick(index)}
          style={{ 
            pointerEvents: operationInProgress ? 'none' : 'auto',
            opacity: operationInProgress ? 0.7 : 1 
          }}
        >
          <span className="line-number">
            {lineHasError(line) ? (
              <img src={redErrorIcon} style={{ width: "16px" }} alt="Error" />
            ) : (
              index + 1
            )}
          </span>
          <span className="code">{line[0]}</span>
        </div>
      ))}

      {/* Input Popup */}
      {inputPopupOpen && selectedLineIndex !== null && processedHTML[selectedLineIndex] && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeInputPopup()} style={{ zIndex: 9999 }}>
          <div className="popup" style={{ zIndex: 10000 }}>
            <div className="popup-header">
              <h3>
                {purposeOfPopUp === "AddingBefore"
                  ? `Adding Before Line ${selectedLineIndex + 1}`
                  : purposeOfPopUp === "AddingAfter"
                  ? `Adding After Line ${selectedLineIndex + 1}`
                  : `${purposeOfPopUp} Line ${selectedLineIndex + 1}`}
              </h3>
              <span onClick={closeInputPopup} className="close-btn">
                &times;
              </span>
            </div>
            <div className="popup-body">
              <p>
                Line {selectedLineIndex + 1}:{" "}
                {purposeOfPopUp === "AddingBefore" || purposeOfPopUp === "AddingAfter" || purposeOfPopUp === "Deleting"
                  ? processedHTML[selectedLineIndex][0]
                  : inputValue}
              </p>
              <p>
                {purposeOfPopUp === "AddingBefore"
                  ? `New Line ${selectedLineIndex + 1}: ${inputValue}`
                  : purposeOfPopUp === "AddingAfter"
                  ? `New Line ${selectedLineIndex + 2}: ${inputValue}`
                  : null}
              </p>
              {purposeOfPopUp !== "Deleting" ? (
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  autoFocus
                  disabled={operationInProgress}
                />
              ) : null}

              <button 
                onClick={handleInputSubmit} 
                className="submit-btn"
                disabled={operationInProgress}
              >
                {operationInProgress ? "Processing..." : (purposeOfPopUp === "Deleting" ? "Delete" : "Submit")}
              </button>
              {purposeOfPopUp === "Deleting" ? (
                <button 
                  onClick={closeInputPopup} 
                  className="submit-btn-border"
                  disabled={operationInProgress}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Menu Popup */}
      {menuOpen && selectedLineIndex !== null && processedHTML[selectedLineIndex] && (
        <div className="menu-overlay" onClick={handleOverlayClick} style={{ zIndex: 9999 }}>
          <div ref={menuRef} className="menu-popup" style={{ zIndex: 10000 }}>
            <div className="menu-popup-header">
              <span onClick={closeMenu} className="menu-close-btn">
                &times;
              </span>
            </div>
            <div className="menu-popup-body">
              {lineHasError(processedHTML[selectedLineIndex]) ? (
                <div className="error-row">
                  <img className="menu-icon" src={redErrorIcon} alt="Error" />
                  <div className="menu-text">{`Error ${processedHTML[selectedLineIndex][1]}`}</div>
                </div>
              ) : null}

              <p className="menu-codeline">
                Line {selectedLineIndex + 1}:{" "}
                {processedHTML[selectedLineIndex][0]}
              </p>

              <div className="menu-row" >
             <SolidButton onClick={handleEditLine}><BiSolidPencil size={20} style={{ marginRight: "5px"}} />
              Edit Line
             </SolidButton>
              </div>
              <div className="menu-grey-line"></div>
              <div className="menu-row">
             <SolidButton onClick={handleAddLineBefore}><FaPlus size={20} style={{ marginRight: "5px"}} />
              Add Line Before
             </SolidButton>
              </div>
              <div className="menu-grey-line"></div>
              <div className="menu-row">
              <SolidButton onClick={handleAddLineAfter}><FaPlus size={20} style={{ marginRight: "5px"}} />
              Add Line After
             </SolidButton>
              </div>
              <div className="menu-grey-line"></div>
              
              <div className="menu-row">

              <SolidButton onClick={handleDeleteLine}><MdDelete style={{ marginRight: "5px" }} />
              Delete Line
             </SolidButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeTabContent;