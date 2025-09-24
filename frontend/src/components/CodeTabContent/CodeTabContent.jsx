import "./CodeTabContent.css";
import { useCodeTabLogic } from "../../hooks/useCodeTabLogic";
import { useSettingsContext } from "../../contexts/settingsContext";
import { saveExercise } from "../../utils/exerciseStorage";
import { MdDelete } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import { MdError, MdWarning, MdInfo } from "react-icons/md";
import SolidButton from "../buttons/Solid/SolidButton";
import SimpleSyntaxHighlighter from "../SimpleSyntaxHighlighter/SimpleSyntaxHighlighter";
import BottomModal from "../BottomModal/BottomModal";
import Switch from "../Switch/Switch";

const CodeTabContent = ({ codeProcessor, currentStatus = null, exId = null }) => {
  const {
    processedHTML,
    htmlTagError,
    lineHasError,
    isLoading,
    // HTMLHint functions
    lineHasAnyError,
    getHTMLHintErrorsForLine,
    htmlHintTotalErrors,
    lineHasHTMLHintError,
    htmlHintErrors
  } = codeProcessor;

  const { settings } = useSettingsContext();
  
  // Check if any line has an error (only HTMLHint errors now)
  const hasAnyError = processedHTML.some((line, index) => lineHasHTMLHintError(index));
  
  const {
    selectedLineIndex,
    inputPopupOpen,
    inputValue,
    purposeOfPopUp,
    menuOpen,
    operationInProgress,
    confirmEditModal,
    handleLineClick,
    closeMenu,
    closeInputPopup,
    handleInputChange,
    handleInputSubmit,
    handleDeleteLine,
    handleAddLineBefore,
    handleAddLineAfter,
    handleEditLine,
    handleKeepCompleted
  } = useCodeTabLogic(codeProcessor, currentStatus, exId);

  // Handle switch toggle for completion status
  const handleSwitchToggle = (isChecked) => {
    if (isChecked) {
      saveExercise(exId, {
        manuallyCompleted: true,
        manuallyCompletedAt: new Date().toISOString()
      });
    } else {
      saveExercise(exId, {
        manuallyCompleted: false,
        manuallyCompletedAt: null
      });
    }
  };

  // Language detection for syntax highlighting
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

  // Get error icon based on severity
  const getErrorIcon = (line, lineIndex) => {
    const htmlHintErrors = getHTMLHintErrorsForLine && getHTMLHintErrorsForLine(lineIndex);
    
    if (htmlHintErrors && htmlHintErrors.length > 0) {
      // Find the highest severity error for this line
      const hasError = htmlHintErrors.some(error => error.severity === 'error');
      const hasWarning = htmlHintErrors.some(error => error.severity === 'warning');
      const hasInfo = htmlHintErrors.some(error => error.severity === 'info');
      
      if (hasError) {
        return <MdError color={"#EB5031"} size={20} className="error-icon" alt="Error"/>;
      } else if (hasWarning) {
        return <MdWarning color={"#FF9800"} size={20} className="warning-icon" alt="Warning"/>;
      } else if (hasInfo) {
        return <MdInfo color={"#2196F3"} size={20} className="info-icon" alt="Info"/>;
      }
    }
    return null;
  };

  // Get error details for a line (only HTMLHint errors)
  const getErrorDetails = (line, lineIndex) => {
    const errors = [];
    
    // Only HTMLHint errors
    if (getHTMLHintErrorsForLine) {
      const htmlHintErrors = getHTMLHintErrorsForLine(lineIndex);
      htmlHintErrors.forEach(error => {
        errors.push({ 
          type: error.severity || 'warning', 
          message: error.message,
          rule: error.rule 
        });
      });
    }
    
    return errors;
  };

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <div className="code-viewer-container">
      {/* HTMLHint summary removed - no longer showing above code */}

      {/* Scrollable code content */}
      <div className="code-viewer-content" style={{ fontSize: settings.codeFontSize }}>
        {processedHTML.map((line, index) => {
          const hasError = lineHasHTMLHintError(index);
          const errorDetails = getErrorDetails(line, index);
          
          return (
            <div
              key={`${index}-${line[0]}`}
              className={`code-line ${index % 2 === 0 ? "even" : "odd"} ${
                selectedLineIndex === index
                  ? hasError ? "red-colour-row" : "blue-colour-row"
                  : ""
              } ${currentStatus === 'Done' ? 'code-line-completed' : ''}`}
              onClick={() => handleLineClick(index)}
              style={{ 
                pointerEvents: operationInProgress ? 'none' : 'auto',
                opacity: operationInProgress ? 0.7 : 1 
              }}
              title={errorDetails.length > 0 ? errorDetails.map(e => e.message).join('; ') : ''}
            >
              <span className={`line-number ${hasAnyError ? 'has-errors' : ''}`}>
                <span className="line-number-text">{index + 1}</span>
                {getErrorIcon(line, index)}
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
          );
        })}
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
        <BottomModal
          isOpen={menuOpen}
          onClose={closeMenu}
          title={`Line ${selectedLineIndex + 1}`}
        >
          <div className="camera-action-modal-content">
            {/* Show all error details (only HTMLHint now) */}
          {(() => {
            const errorDetails = getErrorDetails(processedHTML[selectedLineIndex], selectedLineIndex);
            return errorDetails.length > 0 && (
              <div className="error-details-section" style={{ marginBottom: "0.75rem" }}>
                {errorDetails.map((error, i) => (
                  <div key={i} className={`error-row ${error.type}`}>
                    {error.type === 'error' ? (
                      <MdError color={"#EB5031"} size={24} alt="Error"/>
                    ) : error.type === 'warning' ? (
                      <MdWarning color={"#FF9800"} size={24} alt="Warning"/>
                    ) : (
                      <MdInfo color={"#2196F3"} size={24} alt="Info"/>
                    )}
                    <div className="menu-text">
                      {error.message}
                      {error.rule && (
                        <span className="error-rule" style={{ fontSize: '0.8em', color: '#666', marginLeft: '0.5rem' }}>
                          ({error.rule})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

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

            {/* Full-width buttons */}
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
        </BottomModal>
      )}

      {/* Completion protection modal */}
      <BottomModal
        isOpen={confirmEditModal}
        onClose={handleKeepCompleted}
        title="Exercise is Completed"
      >
        <div className="camera-action-modal-content">
          <div style={{ 
            textAlign: 'center',
            color: '#555',
            fontSize: '1.2rem'
          }}>
            This exercise is already marked as completed. If you want to replace or add more code, you can switch it back to incomplete at the output page.
          </div>
        </div>
      </BottomModal>
    </div>
  );
};

export default CodeTabContent;