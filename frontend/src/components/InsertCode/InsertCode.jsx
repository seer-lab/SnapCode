import "./InsertCode.css";
import { useInsertCodeLogic } from "../../hooks/useInsertCodeLogic";
import { useSettingsContext } from "../../contexts/settingsContext";
import { MdError } from "react-icons/md";
import SimpleSyntaxHighlighter from "../SimpleSyntaxHighlighter/SimpleSyntaxHighlighter";
import BottomModal from "../BottomModal/BottomModal";
import SolidButton from "../buttons/Solid/SolidButton";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import GreyLine from "../GreyLine/GreyLine";

const InsertCode = ({ codeProcessor }) => {
  const {
    processedHTML,
    htmlTagError,
    lineHasError,
    isLoading
  } = codeProcessor;

  const { settings } = useSettingsContext();
  
  // Check if any line has an error
  const hasAnyError = processedHTML.some(line => lineHasError(line));
  
  const {
    selectedLineIndex,
    modalOpen,
    handleLineClick,
    closeModal,
    handleInsertBefore,
    handleInsertAfter
  } = useInsertCodeLogic(codeProcessor);

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

      {/* Instructions header */}
      <div className="insert-instructions">
        <p>Choose a line to insert code before or after:</p>
      </div>

      {/* Scrollable code content */}
      <div className="code-viewer-content" style={{ fontSize: settings.codeFontSize }}>
        {processedHTML.map((line, index) => (
          <div
            key={`${index}-${line[0]}`}
            className={`code-line ${index % 2 === 0 ? "even" : "odd"} ${
              selectedLineIndex === index
                ? lineHasError(line) ? "red-colour-row" : "blue-colour-row"
                : ""
            } insert-mode`}
            onClick={() => handleLineClick(index)}
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

      {/* Insert Position Modal */}
      {modalOpen && selectedLineIndex !== null && processedHTML[selectedLineIndex] && (
        <BottomModal
          isOpen={modalOpen}
          onClose={closeModal}
          title={`Line ${selectedLineIndex + 1}`}
        >
          <div className="camera-action-modal-content">
            <div className="popup-line-content" style={{ fontFamily: 'monospace', fontSize: settings.codeFontSize }}>
              <SimpleSyntaxHighlighter 
                code={processedHTML[selectedLineIndex][0]}
                language={getLanguageForLine(processedHTML[selectedLineIndex][0])}
                syntaxHighlight={getSyntaxHighlight()}
                style={{ fontSize: settings.codeFontSize }}
              />
            </div>

            <p style={{ textAlign: 'center' }}>
              Insert code before or after this line?
            </p>

            <SolidButton onClick={handleInsertBefore}>
              <FaArrowUp size={16} style={{ marginRight: "8px" }} />
              Before
            </SolidButton>
            <GreyLine />
            <SolidButton onClick={handleInsertAfter}>
              <FaArrowDown size={16} style={{ marginRight: "8px" }} />
              After
            </SolidButton>
          </div>
        </BottomModal>
      )}
    </div>
  );
};

export default InsertCode;