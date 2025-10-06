// components/CodeLine.jsx
import "./CodeLine.css";
import SimpleSyntaxHighlighter from "../SimpleSyntaxHighlighter/SimpleSyntaxHighlighter";
import ErrorIcon from "./ErrorIcon";
import { getLanguageForLine } from "../../utils/codeUtils";

const CodeLine = ({ 
  line, 
  index, 
  isSelected,
  hasError,
  hasAnyError,
  errorDetails,
  currentStatus,
  operationInProgress,
  codeFontSize,
  syntaxHighlight,
  onClick,
  htmlHintErrors
}) => {
  return (
    <div
      key={`${index}-${line[0]}`}
      className={`code-line ${index % 2 === 0 ? "even" : "odd"} ${
        isSelected
          ? hasError ? "red-colour-row" : "blue-colour-row"
          : ""
      } ${currentStatus === 'Done' ? 'code-line-completed' : ''}`}
      onClick={onClick}
      style={{ 
        pointerEvents: operationInProgress ? 'none' : 'auto',
        opacity: operationInProgress ? 0.7 : 1 
      }}
      title={errorDetails.length > 0 ? errorDetails.map(e => e.message).join('; ') : ''}
    >
      <span className={`line-number ${hasAnyError ? 'has-errors' : ''}`}>
        <span className="line-number-text">{index + 1}</span>
        <ErrorIcon errors={htmlHintErrors} />
      </span>
      <span className="code code-text">
        <SimpleSyntaxHighlighter 
          code={line[0]}
          language={getLanguageForLine(line[0])}
          syntaxHighlight={syntaxHighlight}
          style={{ fontSize: codeFontSize }}
        />
      </span>
    </div>
  );
};

export default CodeLine;