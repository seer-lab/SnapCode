import "./LineEditPopUp.css";
// components/LineEditPopup.jsx
import SimpleSyntaxHighlighter from "../SimpleSyntaxHighlighter/SimpleSyntaxHighlighter";
import { getLanguageForLine } from "../../utils/codeUtils";

const LineEditPopup = ({
  isOpen,
  purposeOfPopUp,
  selectedLineIndex,
  inputValue,
  processedHTML,
  operationInProgress,
  codeFontSize,
  syntaxHighlight,
  onClose,
  onInputChange,
  onSubmit
}) => {
  if (!isOpen || selectedLineIndex === null || !processedHTML[selectedLineIndex]) {
    return null;
  }

  const currentLine = processedHTML[selectedLineIndex];

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ zIndex: 9999 }}>
      <div className="popup" style={{ zIndex: 10000 }}>
        <div className="popup-header">
          <h3>
            {purposeOfPopUp === "AddingBefore"
              ? `Adding Before Line ${selectedLineIndex + 1}`
              : purposeOfPopUp === "AddingAfter"
              ? `Adding After Line ${selectedLineIndex + 1}`
              : `${purposeOfPopUp} Line ${selectedLineIndex + 1}`}
          </h3>
          <span onClick={onClose} className="close-btn">
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
                onChange={onInputChange}
                autoFocus
                disabled={operationInProgress}
                style={{ fontFamily: 'monospace', fontSize: codeFontSize }}
                rows={Math.max(inputValue.split('\n').length, 3)}
              />
              <div className="popup-line-info">
                <span className="popup-line-label">Line {selectedLineIndex + 1}:</span>
                <div className="popup-line-content" style={{ fontFamily: 'monospace', fontSize: codeFontSize }}>
                  <SimpleSyntaxHighlighter 
                    code={currentLine[0]}
                    language={getLanguageForLine(currentLine[0])}
                    syntaxHighlight={syntaxHighlight}
                    style={{ fontSize: codeFontSize }}
                  />
                </div>
              </div>
            </>
          )}

          {purposeOfPopUp === "AddingAfter" && (
            <>
              <div className="popup-line-info">
                <span className="popup-line-label">Line {selectedLineIndex + 1}:</span>
                <div className="popup-line-content" style={{ fontFamily: 'monospace', fontSize: codeFontSize }}>
                  <SimpleSyntaxHighlighter 
                    code={currentLine[0]}
                    language={getLanguageForLine(currentLine[0])}
                    syntaxHighlight={syntaxHighlight}
                    style={{ fontSize: codeFontSize }}
                  />
                </div>
              </div>
              <span className="popup-line-label">New line:</span>
              <textarea
                className="popup-textarea"
                value={inputValue}
                onChange={onInputChange}
                autoFocus
                disabled={operationInProgress}
                style={{ fontFamily: 'monospace', fontSize: codeFontSize }}
                rows={Math.max(inputValue.split('\n').length, 3)}
              />
            </>
          )}

          {purposeOfPopUp === "Editing" && (
            <textarea
              className="popup-textarea"
              value={inputValue}
              onChange={onInputChange}
              autoFocus
              disabled={operationInProgress}
              style={{ fontFamily: 'monospace', fontSize: codeFontSize }}
              rows={Math.max(inputValue.split('\n').length, 3)}
            />
          )}

          {purposeOfPopUp === "Deleting" && (
            <>
              <div className="popup-line-info">
                <div className="popup-line-content" style={{ fontFamily: 'monospace', fontSize: codeFontSize }}>
                  <SimpleSyntaxHighlighter 
                    code={currentLine[0]}
                    language={getLanguageForLine(currentLine[0])}
                    syntaxHighlight={syntaxHighlight}
                    style={{ fontSize: codeFontSize }}
                  />
                </div>
              </div>
              <div style={{ textAlign: 'center', margin: '15px 0' }}>Delete this line?</div>
            </>
          )}

          <button 
            onClick={onSubmit} 
            className="submit-btn"
            disabled={operationInProgress}
          >
            {operationInProgress ? "Processing..." : (purposeOfPopUp === "Deleting" ? "Confirm" : "Submit")}
          </button>
          {purposeOfPopUp === "Deleting" && (
            <button 
              onClick={onClose} 
              className="submit-btn-border"
              disabled={operationInProgress}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LineEditPopup;