// CodeTabContent.jsx - Refactored
import "./CodeTabContent.css";
import { useCodeTabLogic } from "../../hooks/useCodeTabLogic";
import { useSettingsContext } from "../../contexts/settingsContext";
import { useCodeAnalytics } from "../../hooks/useCodeAnalytics";
import { getErrorDetailsForLine } from "../../utils/codeUtils";

// Components
import CodeLine from "./CodeLine";
import LineEditPopup from "./LineEditPopUp";
import LineMenu from "./LineMenu";
import CompletionModal from "./CompletitionModal";
import DownloadButton from "./DownloadButton";

const CodeTabContent = ({ codeProcessor, currentStatus = null, exId = null }) => {
  const {
    processedHTML,
    isLoading,
    getHTMLHintErrorsForLine,
    lineHasHTMLHintError,
    htmlHintErrors
  } = codeProcessor;

  const { settings } = useSettingsContext();
  
  // Analytics
  const { userId, logLineClickEvent, logCodeChangeEvent } = useCodeAnalytics(
    exId, 
    processedHTML, 
    htmlHintErrors
  );

  // Code tab logic
  const {
    selectedLineIndex,
    inputPopupOpen,
    inputValue,
    purposeOfPopUp,
    menuOpen,
    operationInProgress,
    confirmEditModal,
    handleLineClick: originalHandleLineClick,
    closeMenu,
    closeInputPopup,
    handleInputChange,
    handleInputSubmit: originalHandleInputSubmit,
    handleDeleteLine,
    handleAddLineBefore,
    handleAddLineAfter,
    handleEditLine,
    handleKeepCompleted
  } = useCodeTabLogic(codeProcessor, currentStatus, exId);

  // Check if any line has an error
  const hasAnyError = processedHTML.some((line, index) => lineHasHTMLHintError(index));
  
  // Get syntax highlighting setting
  const getSyntaxHighlight = () => {
    return settings.syntaxHighlight !== undefined ? settings.syntaxHighlight : true;
  };

  // Enhanced handleLineClick with analytics
  const handleLineClick = (index) => {
    originalHandleLineClick(index);
    
    if (userId && exId && processedHTML && processedHTML[index]) {
      const lineContent = processedHTML[index]?.[0] || '';
      const lineErrors = getHTMLHintErrorsForLine ? getHTMLHintErrorsForLine(index) : null;
      logLineClickEvent(index, lineContent, lineErrors);
    }
  };

  // Enhanced handleInputSubmit with analytics
  const handleInputSubmit = () => {
    const currentLine = processedHTML[selectedLineIndex];
    const previousContent = currentLine?.[0] || '';

    // Call original submit handler
    originalHandleInputSubmit();

    // Log the change
    logCodeChangeEvent(purposeOfPopUp, selectedLineIndex, inputValue, previousContent);
  };

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <div className="code-viewer-container">
      <div className="code-viewer-content" style={{ fontSize: settings.codeFontSize }}>
        {processedHTML.map((line, index) => {
          const hasError = lineHasHTMLHintError(index);
          const errorDetails = getErrorDetailsForLine(index, getHTMLHintErrorsForLine);
          const htmlHintErrorsForLine = getHTMLHintErrorsForLine ? getHTMLHintErrorsForLine(index) : [];
          
          return (
            <CodeLine
              key={`${index}-${line[0]}`}
              line={line}
              index={index}
              isSelected={selectedLineIndex === index}
              hasError={hasError}
              hasAnyError={hasAnyError}
              errorDetails={errorDetails}
              currentStatus={currentStatus}
              operationInProgress={operationInProgress}
              codeFontSize={settings.codeFontSize}
              syntaxHighlight={getSyntaxHighlight()}
              onClick={() => handleLineClick(index)}
              htmlHintErrors={htmlHintErrorsForLine}
            />
          );
        })}
      </div>

      {/* Download Button */}
      <DownloadButton processedHTML={processedHTML} exId={exId} />

      {/* Input Popup */}
      <LineEditPopup
        isOpen={inputPopupOpen}
        purposeOfPopUp={purposeOfPopUp}
        selectedLineIndex={selectedLineIndex}
        inputValue={inputValue}
        processedHTML={processedHTML}
        operationInProgress={operationInProgress}
        codeFontSize={settings.codeFontSize}
        syntaxHighlight={getSyntaxHighlight()}
        onClose={closeInputPopup}
        onInputChange={handleInputChange}
        onSubmit={handleInputSubmit}
      />

      {/* Menu Popup */}
      <LineMenu
        isOpen={menuOpen}
        selectedLineIndex={selectedLineIndex}
        processedHTML={processedHTML}
        errorDetails={selectedLineIndex !== null ? getErrorDetailsForLine(selectedLineIndex, getHTMLHintErrorsForLine) : []}
        codeFontSize={settings.codeFontSize}
        syntaxHighlight={getSyntaxHighlight()}
        onClose={closeMenu}
        onEditLine={handleEditLine}
        onAddLineBefore={handleAddLineBefore}
        onAddLineAfter={handleAddLineAfter}
        onDeleteLine={handleDeleteLine}
      />

      {/* Completion protection modal */}
      <CompletionModal
        isOpen={confirmEditModal}
        onClose={handleKeepCompleted}
      />
    </div>
  );
};

export default CodeTabContent;