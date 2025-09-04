import React from "react";
import "./CodeSettings.css";
import SimpleSyntaxHighlighter from "../SimpleSyntaxHighlighter/SimpleSyntaxHighlighter";

const CodeSettings = ({ settings, updateSetting }) => {
  const handleFontSizeChange = (event) => {
    updateSetting('codeFontSize', event.target.value);
  };

  const handleSyntaxChange = (event) => {
    updateSetting('syntaxHighlight', event.target.value === 'true');
  };

  const fontSizeOptions = [
    { value: '1rem', label: 'Small' },
    { value: '1.25rem', label: 'Medium' },
    { value: '1.5rem', label: 'Large' }
  ];

  const syntaxOptions = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ];

  // Safely get the syntaxHighlight value with fallback
  const syntaxHighlightValue = settings.syntaxHighlight !== undefined ? settings.syntaxHighlight : true;

  return (
    <div className="code-settings">
      <div className="setting-item">
        <label htmlFor="font-size-selector">Choose Code Font Size:</label>
        <select 
          id="font-size-selector"
          className="font-size-selector"
          value={settings.codeFontSize || '1rem'} 
          onChange={handleFontSizeChange}
        >
          {fontSizeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-item">
        <label htmlFor="syntax-selector">Activate Syntax Highlighting?</label>
        <select 
          id="syntax-selector"
          className="syntax-selector"
          value={syntaxHighlightValue.toString()} 
          onChange={handleSyntaxChange}
        >
          {syntaxOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="preview-section">
        <p>Preview:</p>
        <div className="code-preview">
          <SimpleSyntaxHighlighter 
            code={'<h1>Hello</h1>'}
            language="markup"
            syntaxHighlight={syntaxHighlightValue}
            style={{ fontSize: settings.codeFontSize || '1rem' }}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeSettings;