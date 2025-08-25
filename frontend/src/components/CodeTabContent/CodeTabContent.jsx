import { useRef } from "react";
import "./CodeTabContent.css";
import { useCodeTabLogic } from "../../hooks/useCodeTabLogic";
import { useSettingsContext } from "../../contexts/settingsContext";
import { MdDelete } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import { MdError } from "react-icons/md";
import SolidButton from "../buttons/Solid/SolidButton";
import SimpleSyntaxHighlighter from "../SimpleSyntaxHighlighter/SimpleSyntaxHighlighter";
import CameraActionModal from "../CameraActionModal/BottomModal";

const CodeTabContent = ({ codeProcessor }) => {
  const {
    processedHTML,
    htmlTagError,
    lineHasError,
    isLoading
  } = codeProcessor;

  const { settings } = useSettingsContext();
  const menuRef = useRef(null);
  
  // Check if any line has an error
  const hasAnyError = processedHTML.some(line => lineHasError(line));
  
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

  // Language detection for syntax highlighting (no longer used for highlighting, but kept for consistency)
  const getLanguageForLine = (lineContent) => {
    if (lineContent.includes('<script>') || lineContent.includes('</script>')) {
      return 'javascript';
    }
    if (lineContent.includes('<style>') || lineContent.includes('</style>')) {
      return 'css';
    }
    return 'markup';
  };

  // Get syntax highlighting setting
  const getSyntaxHighlight = () => {
    return settings.syntaxHighlight !== undefined ? settings.syntaxHighlight : true;
  };

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <div className="code-viewer-container">
      {/* Fixed header with error */}
      {htmlTagError && (
        <div className="code-viewer-header">
          <div className="error-row" style={{ padding: "5px", fontSize: "1rem" }}>
            <MdError color={"#EB5031"} size={30} alt="Error"/>
            <div className="menu-text">Entire code should be enclosed in html tags</div>
          </div>
        </div>
      )}

      {/* Scrollable code content */}
      <div className="code-viewer-content" style={{ fontSize: settings.codeFontSize }}>
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
            <span className={`line-number ${hasAnyError ? 'has-errors' : ''}`}>
              <span className="line-number-text">{index + 1}</span>
              {lineHasError(line) && (
                <MdError color={"#EB5031"} size={20} className="error-icon" alt="Error"/>
              )}
            </span>
          <span className="code code-text">
            <SimpleSyntaxHighlighter 
              code={line[0]}
              language={getLanguageForLine(line[0])}
              syntaxHighlight={getSyntaxHighlight()}
              style={{ fontSize: settings.codeFontSize }}
            />
          </span>
          </div>
        ))}
      </div>

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
              {purposeOfPopUp === "AddingBefore" && (
                <>
                  <span className="popup-line-label">New line:</span>
                  <textarea
                    className="popup-textarea"
                    value={inputValue}
                    onChange={handleInputChange}
                    autoFocus
                    disabled={operationInProgress}
                    style={{ fontFamily: 'monospace', fontSize: settings.codeFontSize }}
                    rows={Math.max(inputValue.split('\n').length, 3)}
                  />
                  <div className="popup-line-info">
                    <span className="popup-line-label">Line {selectedLineIndex + 1}:</span>
                    <div className="popup-line-content" style={{ fontFamily: 'monospace', fontSize: settings.codeFontSize }}>
                      <SimpleSyntaxHighlighter 
                        code={processedHTML[selectedLineIndex][0]}
                        language={getLanguageForLine(processedHTML[selectedLineIndex][0])}
                        syntaxHighlight={getSyntaxHighlight()}
                        style={{ fontSize: settings.codeFontSize }}
                      />
                    </div>
                  </div>
                </>
              )}

              {purposeOfPopUp === "AddingAfter" && (
                <>
                  <div className="popup-line-info">
                    <span className="popup-line-label">Line {selectedLineIndex + 1}:</span>
                    <div className="popup-line-content" style={{ fontFamily: 'monospace', fontSize: settings.codeFontSize }}>
                      <SimpleSyntaxHighlighter 
                        code={processedHTML[selectedLineIndex][0]}
                        language={getLanguageForLine(processedHTML[selectedLineIndex][0])}
                        syntaxHighlight={getSyntaxHighlight()}
                        style={{ fontSize: settings.codeFontSize }}
                      />
                    </div>
                  </div>
                  <span className="popup-line-label">New line:</span>
                  <textarea
                    className="popup-textarea"
                    value={inputValue}
                    onChange={handleInputChange}
                    autoFocus
                    disabled={operationInProgress}
                    style={{ fontFamily: 'monospace', fontSize: settings.codeFontSize }}
                    rows={Math.max(inputValue.split('\n').length, 3)}
                  />
                </>
              )}

              {purposeOfPopUp === "Editing" && (
                <textarea
                  className="popup-textarea"
                  value={inputValue}
                  onChange={handleInputChange}
                  autoFocus
                  disabled={operationInProgress}
                  style={{ fontFamily: 'monospace', fontSize: settings.codeFontSize }}
                  rows={Math.max(inputValue.split('\n').length, 3)}
                />
              )}

              {purposeOfPopUp === "Deleting" && (
                <>
                  <div className="popup-line-info">
                    <div className="popup-line-content" style={{ fontFamily: 'monospace', fontSize: settings.codeFontSize }}>
                      <SimpleSyntaxHighlighter 
                        code={processedHTML[selectedLineIndex][0]}
                        language={getLanguageForLine(processedHTML[selectedLineIndex][0])}
                        syntaxHighlight={getSyntaxHighlight()}
                        style={{ fontSize: settings.codeFontSize }}
                      />
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', margin: '15px 0' }}>Delete this line?</div>
                </>
              )}
              

              <button 
                onClick={handleInputSubmit} 
                className={purposeOfPopUp === "Deleting" ? "submit-btn" : "submit-btn"}
                disabled={operationInProgress}
              >
                {operationInProgress ? "Processing..." : (purposeOfPopUp === "Deleting" ? "Confirm" : "Submit")}
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
  <CameraActionModal
    isOpen={menuOpen}
    onClose={closeMenu}
    title={`Line ${selectedLineIndex + 1}`}
  >
    <div className="camera-action-modal-content">
      {/* Error si existe */}
      {lineHasError(processedHTML[selectedLineIndex]) && (
        <div className="error-row" style={{ marginBottom: "0.75rem" }}>
          <MdError color={"#EB5031"} size={30} alt="Error"/>
          <div className="menu-text">{`Error ${processedHTML[selectedLineIndex][1]}`}</div>
        </div>
      )}

      
      <div className="menu-codeline" style={{ fontSize: settings.codeFontSize }}>
        <span className="menu-codeline-content">
          <SimpleSyntaxHighlighter 
            code={processedHTML[selectedLineIndex][0]}
            language={getLanguageForLine(processedHTML[selectedLineIndex][0])}
            syntaxHighlight={getSyntaxHighlight()}
            style={{ fontSize: settings.codeFontSize }}
          />
        </span>
      </div>

      {/* Botones full-width */}
      <SolidButton onClick={handleEditLine}>
        <BiSolidPencil size={20} style={{ marginRight: "5px"}} />
        Edit Line
      </SolidButton>
      <div className="menu-grey-line"></div>
      <SolidButton onClick={handleAddLineBefore}>
        <FaPlus size={20} style={{ marginRight: "5px"}} />
        Add Line Before
      </SolidButton>
      <div className="menu-grey-line"></div>
      <SolidButton onClick={handleAddLineAfter}>
        <FaPlus size={20} style={{ marginRight: "5px"}} />
        Add Line After
      </SolidButton>
      <div className="menu-grey-line"></div>
      <SolidButton onClick={handleDeleteLine} color="#E53935">
        <MdDelete style={{ marginRight: "5px" }} />
        Delete Line
      </SolidButton>
    </div>
  </CameraActionModal>
)}

    </div>
  );
};

export default CodeTabContent;