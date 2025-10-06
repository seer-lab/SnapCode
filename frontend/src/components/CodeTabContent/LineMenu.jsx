import "./LineMenu.css";
// components/LineMenu.jsx
import { MdDelete, MdError, MdWarning, MdInfo } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import SolidButton from "../buttons/Solid/SolidButton";
import BottomModal from "../BottomModal/BottomModal";
import SimpleSyntaxHighlighter from "../SimpleSyntaxHighlighter/SimpleSyntaxHighlighter";
import { getLanguageForLine } from "../../utils/codeUtils";

const LineMenu = ({
  isOpen,
  selectedLineIndex,
  processedHTML,
  errorDetails,
  codeFontSize,
  syntaxHighlight,
  onClose,
  onEditLine,
  onAddLineBefore,
  onAddLineAfter,
  onDeleteLine
}) => {
  if (!isOpen || selectedLineIndex === null || !processedHTML[selectedLineIndex]) {
    return null;
  }

  const currentLine = processedHTML[selectedLineIndex];

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Line ${selectedLineIndex + 1}`}
    >
      <div className="camera-action-modal-content">
        {/* Show all error details */}
        {errorDetails.length > 0 && (
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
        )}

        <div className="menu-codeline" style={{ fontSize: codeFontSize }}>
          <span className="menu-codeline-content">
            <SimpleSyntaxHighlighter 
              code={currentLine[0]}
              language={getLanguageForLine(currentLine[0])}
              syntaxHighlight={syntaxHighlight}
              style={{ fontSize: codeFontSize }}
            />
          </span>
        </div>

        {/* Full-width buttons */}
        <SolidButton onClick={onEditLine}>
          <BiSolidPencil size={20} style={{ marginRight: "5px"}} />
          Edit Line
        </SolidButton>
        <div className="menu-grey-line"></div>
        <SolidButton onClick={onAddLineBefore}>
          <FaPlus size={20} style={{ marginRight: "5px"}} />
          Add Line Before
        </SolidButton>
        <div className="menu-grey-line"></div>
        <SolidButton onClick={onAddLineAfter}>
          <FaPlus size={20} style={{ marginRight: "5px"}} />
          Add Line After
        </SolidButton>
        <div className="menu-grey-line"></div>
        <SolidButton onClick={onDeleteLine} color="#E53935">
          <MdDelete style={{ marginRight: "5px" }} />
          Delete Line
        </SolidButton>
      </div>
    </BottomModal>
  );
};

export default LineMenu;