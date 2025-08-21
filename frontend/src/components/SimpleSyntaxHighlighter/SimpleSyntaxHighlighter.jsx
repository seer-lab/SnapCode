// components/SyntaxHighlighter/SimpleSyntaxHighlighter.jsx

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SimpleSyntaxHighlighter = ({ 
  code, 
  language = 'markup',
  syntaxHighlight = true,
  className = '',
  style = {}
}) => {
  
  // If syntax highlighting is disabled, show plain black text
  if (!syntaxHighlight) {
    return (
      <span
        className={className}
        style={{
          color: '#000000',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          ...style
        }}
      >
        {code || ''}
      </span>
    );
  }

  // If syntax highlighting is enabled, use Prism with default light theme
  return (
    <SyntaxHighlighter
      language={language}
      style={prism}
      PreTag="span"
      CodeTag="span"
      className={className}
      customStyle={{
        background: 'transparent',
        backgroundColor: 'transparent',
        margin: 0,
        padding: 0,
        border: 'none',
        borderRadius: 0,
        ...style
      }}
    >
      {code || ''}
    </SyntaxHighlighter>
  );
};

export default SimpleSyntaxHighlighter;