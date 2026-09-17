

// Generic renderer for a list of code lines + line-click popups/menu.
// This is the part of the CodeTabContent that used to be hardcoded.


import "./CodeTabContent.css";
import CodeLine from "./CodeLine";
import LineMenu from "./LineMenu";
import LineEditPopup from "./LineEditPopup";
import CompletionModal from "./CompletionModal";
import { getErrorDetailsForLine } from "../../utils/codeUtils";

/**
 * @param {Array} lines - processedHTML or processedCSS
 * @param {Function} lineHasError - (index) => boolean
 * @param {Function} getErrorForLine - (index) => Array of error objects
 * @param {Object} tabLogic - result of useCodeTabLogic / useCSSTabLogic
 * @param {string|null} currentStatus
 * @param {Object} settings - from useSettingsContext
 */

const CodeSection = ({
    lines, 
    lineHasError, 
    getErrorsForLine,
    tabLogic,
    currentStatus,
    settings,
}) => {
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
        handleKeepCompleted,
    } = tabLogic;

    const hasAnyError = lines.some((line, index) => lineHasError(index));

    const getSyntaxHighlight = () => {
        return settings.syntaxHighlight !== undefined ? settings.syntaxHighlight : true;
    };


    return (
        <div className="code-viewer-container">
            <div className="code-viewer-content" style={{ fontSize: settings.codeFontSize }}>
                {lines.map((line, index) => {
                    const hasError = lineHasError(index);
                    const errorDetails = getErrorsDetailsForLine(index, getErrorsForLine);
                    const errorsForLine = getErrorsForLine ? getErrorsForLine(index) : [];

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
                            htmlHintErrors={errorsForLine}
                        />
                    );
                })}
            </div>

            {/* Input Popup */}

            <LineEditPopup
                isOpen={menuOpen}
                selectedLineIndex={selectedLineIndex}
                processedHTML={lines}
                errorDetails={selectedLineIndex !== null ? getErrorDetailsForLine(selectedLineIndex, getErrorsForLine) : []}
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

export default CodeSection;