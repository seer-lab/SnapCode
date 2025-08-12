import { useState, useEffect } from 'react';
import { validateHTML, stringToHTML } from '../utils/preprocessinghtml.jsx';

export const useCodeProcessor = (initialCode) => {
  const [rawCode, setRawCode] = useState(initialCode);
  const [processedHTML, setProcessedHTML] = useState([]);
  const [numberOfErrors, setNumberOfErrors] = useState(-1);
  const [htmlTagError, setHtmlTagError] = useState(false);
  const [finalHTMLOutput, setFinalHTMLOutput] = useState(false);
  const [isManualUpdate, setIsManualUpdate] = useState(false);

  const lineHasError = (line) => {
    return (
      line[1] === "invalid tag" ||
      line[1] === "unclosed open tag" ||
      line[1] === "extra closing tag"
    );
  };

  const processCode = (codeArray, preserveContent = false) => {
    if (!codeArray || codeArray.length === 0) return;
    
    let processedHTMLOutput;
    
    if (preserveContent) {
      // For manual updates - treat as already processed HTML
      processedHTMLOutput = validateHTML(codeArray, true);
    } else {
      // For initial OCR processing
      const userCodeString = codeArray.join("");
      processedHTMLOutput = validateHTML(stringToHTML(userCodeString), false);
    }
    
    let countErrors = 0;
    processedHTMLOutput.forEach((line, index) => {
      if (index === 0) {
        if (line[0].trim() !== "<html>") {
          setHtmlTagError(true);
          countErrors += 1;
        } else {
          setHtmlTagError(false);
        }
      }
      if (lineHasError(line)) {
        countErrors += 1;
      }
    });

    setProcessedHTML(processedHTMLOutput);
    setNumberOfErrors(countErrors);

    // Generate final HTML for output
    const codeStrings = processedHTMLOutput.map(line => line[0]);
    if (countErrors === 0) {
      let htmlString = codeStrings.join("");
      htmlString = htmlString.replace(/^<html>/i, "");
      htmlString = htmlString.replace(/<\/html>$/i, "");
      setFinalHTMLOutput(htmlString);
    } else {
      setFinalHTMLOutput(false);
    }
  };

  // Process code only on initial load, not on manual updates
  useEffect(() => {
    if (rawCode && !isManualUpdate) {
      console.log("Processing code from rawCode:", rawCode);
      processCode(rawCode, false); // OCR processing
    }
  }, [rawCode]);

  // Reset manual update flag
  useEffect(() => {
    if (isManualUpdate) {
      setIsManualUpdate(false);
    }
  }, [isManualUpdate]);

  const validateSingleLine = (content) => {
    if (!content || !content.trim()) {
      return [content, "text"];
    }

    const trimmed = content.trim();
    
    // Check if it's a tag
    if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
      // Use the existing isValidTag function
      const { isValidTag } = require('../utils/preprocessinghtml.jsx');
      if (isValidTag(trimmed)) {
        return [content, "valid tag"];
      } else {
        return [content, "invalid tag"];
      }
    } else {
      // It's text content
      return [content, "text"];
    }
  };

  // Simplified direct update using the refactored validateHTML
  const updateProcessedHTMLDirectly = (newProcessedHTML) => {
    setIsManualUpdate(true);
    console.log("Direct update with:", newProcessedHTML);
    
    // Use the refactored validateHTML with preserveUserContent = true
    processCode(newProcessedHTML, true);
    
    // Update rawCode to match
    const newCodeArray = newProcessedHTML.map(line => line[0]);
    setRawCode(newCodeArray);
  };

  // For external updates (like from OCR)
  const updateCode = (newCode) => {
    setIsManualUpdate(false);
    setRawCode(newCode);
  };

  return {
    // State
    rawCode,
    processedHTML,
    numberOfErrors,
    htmlTagError,
    finalHTMLOutput,
    
    // Actions
    updateCode,
    updateProcessedHTMLDirectly,
    validateSingleLine,
    lineHasError,
    
    // Computed
    isLoading: numberOfErrors === -1
  };
};