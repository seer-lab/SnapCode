// utils/codeUtils.js

/**
 * Detect language for syntax highlighting based on line content
 */
export const getLanguageForLine = (lineContent) => {
  if (lineContent.includes('<script>') || lineContent.includes('</script>')) {
    return 'javascript';
  }
  if (lineContent.includes('<style>') || lineContent.includes('</style>')) {
    return 'css';
  }
  return 'markup';
};

/**
 * Get all errors from htmlHintErrors object/Map
 */
export const getAllErrorsFrom = (errorsObj) => {
  if (!errorsObj) return [];
  const entries = errorsObj instanceof Map
    ? Array.from(errorsObj.entries())
    : Object.entries(errorsObj || {});
  return entries.flatMap(([lineIndex, errors]) =>
    (errors || []).map(error => ({
      message: error.message,
      severity: error.severity,
      rule: error.rule,
      line: Number(lineIndex)
    }))
  );
};

/**
 * Get error details for a specific line
 */
export const getErrorDetailsForLine = (lineIndex, getHTMLHintErrorsForLine) => {
  const errors = [];
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

/**
 * Download HTML content as file
 */
export const downloadHTMLFile = (processedHTML, exId) => {
  try {
    // Join all lines to create the complete HTML
    const htmlContent = processedHTML.map(line => line[0]).join('\n');
    
    // Create a Blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with exercise ID and timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = exId 
      ? `exercise-${exId}-${timestamp}.html`
      : `code-${timestamp}.html`;
    
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('HTML downloaded successfully');
    return true;
  } catch (error) {
    console.error('Error downloading HTML:', error);
    alert('Error downloading file. Please try again.');
    return false;
  }
};