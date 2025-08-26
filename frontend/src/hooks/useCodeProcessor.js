import { useState, useEffect } from 'react';
import { validateHTML, stringToHTML } from '../utils/preprocessinghtml.jsx';
import { saveExerciseCode, getExercise } from '../utils/exerciseStorage';

export const useCodeProcessor = (initialCode, exId, insertData = null) => {
  const [rawCode, setRawCode] = useState(null);
  const [processedHTML, setProcessedHTML] = useState([]);
  const [numberOfErrors, setNumberOfErrors] = useState(-1);
  const [htmlTagError, setHtmlTagError] = useState(false);
  const [finalHTMLOutput, setFinalHTMLOutput] = useState(false);
  const [isManualUpdate, setIsManualUpdate] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [needsOCRProcessing, setNeedsOCRProcessing] = useState(false);

  // Handle insertion when insertData is provided
  useEffect(() => {
    if (insertData && insertData.ocrOutput && insertData.insertPosition && isLoaded) {
      console.log("Processing insertion:", insertData);
      
      const { ocrOutput, insertPosition } = insertData;
      const currentProcessedHTML = [...processedHTML];
      
      // Convert OCR output to HTML lines
      const ocrCodeString = ocrOutput.join("");
      const newLines = validateHTML(stringToHTML(ocrCodeString), false);
      
      // Insert the new lines at the specified position
      const insertIndex = insertPosition.type === 'before' 
        ? insertPosition.lineIndex 
        : insertPosition.lineIndex + 1;
      
      currentProcessedHTML.splice(insertIndex, 0, ...newLines);
      
      // Update the processed HTML directly
      updateProcessedHTMLDirectly(currentProcessedHTML);
      
      console.log("Insertion completed");
    }
  }, [insertData, isLoaded, processedHTML]);

  // Load initial data from localStorage or initialCode
  useEffect(() => {
    if (exId && !isLoaded) {
      console.log("Attempting to load from localStorage for exId:", exId);
      const savedExercise = getExercise(exId);
      
      // PRIORITY 1: Load from localStorage if it exists
      if (savedExercise && savedExercise.rawCode) {
        console.log("Loading from localStorage:", savedExercise);
        
        setRawCode(savedExercise.rawCode);
        
        // Process saved processedHTML (already formatted correctly)
        const processedData = savedExercise.processedHTML || [];
        const properlyFormattedHTML = processedData.map((line, index) => {
          if (Array.isArray(line) && line.length === 2) {
            return line;
          } else if (typeof line === 'string') {
            if (line.includes(',')) {
              const parts = line.split(',');
              if (parts.length >= 2) {
                return [parts[0], parts.slice(1).join(',')];
              }
            }
            return [line, "text"];
          } else {
            return [String(line), "text"];
          }
        });
        
        // Re-validate using existing validateHTML with preserveContent = true
        console.log("Re-validating loaded data with validateHTML");
        const revalidatedHTML = validateHTML(properlyFormattedHTML, true);
        
        // Set data directly without OCR processing but with revalidated status
        setProcessedHTML(revalidatedHTML);
        setFinalHTMLOutput(savedExercise.finalHTMLOutput || false);
        setNumberOfErrors(revalidatedHTML.filter(line => lineHasError(line)).length);
        
        // Calculate htmlTagError based on revalidated data
        if (revalidatedHTML.length > 0) {
          setHtmlTagError(revalidatedHTML[0][0].trim() !== "<html>");
        }
        
        setNeedsOCRProcessing(false); // No OCR processing needed
        setIsLoaded(true);
        return;
      }
      
      // PRIORITY 2: If no saved data AND there's initialCode, use initialCode
      if (initialCode) {
        console.log("No saved data, using initialCode for OCR processing:", initialCode);
        setRawCode(initialCode);
        setNeedsOCRProcessing(true); // OCR processing needed
        setIsLoaded(true);
        return;
      }
      
      // If there's nothing, mark as loaded anyway
      console.log("No saved data or initialCode");
      setIsLoaded(true);
    }
  }, [exId]);

  // Handle initialCode ONLY if we haven't loaded saved data OR if we're explicitly replacing
  useEffect(() => {
    if (initialCode && isLoaded) {
      const savedExercise = getExercise(exId);
      
      // Always process initialCode when it comes from OCR, even if saved data exists
      // This handles both first-time upload and "Replace All" scenarios
      console.log("Received initialCode - processing for OCR (replace mode):", initialCode);
      setRawCode(initialCode);
      setNeedsOCRProcessing(true); // OCR processing needed
    }
  }, [initialCode, isLoaded, exId]);

  const lineHasError = (line) => {
    return (
      line[1] === "invalid tag" ||
      line[1] === "unclosed open tag" ||
      line[1] === "extra closing tag"
    );
  };

  const processCode = (codeArray, preserveContent = false) => {
    if (!codeArray || codeArray.length === 0) return;
    
    console.log("Processing code with preserveContent:", preserveContent);
    
    let processedHTMLOutput;
    
    if (preserveContent) {
      // For manual updates - treat as already processed HTML
      processedHTMLOutput = validateHTML(codeArray, true);
    } else {
      // For initial OCR processing ONLY
      console.log("OCR Processing: Converting string to HTML");
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
    let finalHTML = false;
    
    if (countErrors === 0) {
      let htmlString = codeStrings.join("");
      htmlString = htmlString.replace(/^<html>/i, "");
      htmlString = htmlString.replace(/<\/html>$/i, "");
      finalHTML = htmlString;
      setFinalHTMLOutput(htmlString);
    } else {
      setFinalHTMLOutput(false);
    }

    // Save to localStorage whenever code is processed
    if (exId) {
      console.log("Saving to localStorage via processCode");
      const rawCodeStrings = codeArray.map(line => Array.isArray(line) ? line[0] : line);
      saveExerciseCode(exId, rawCodeStrings, processedHTMLOutput, finalHTML);
    }
  };

  // CRITICAL: Only process code for OCR, not for localStorage loads
  useEffect(() => {
    if (rawCode && !isManualUpdate && isLoaded && needsOCRProcessing) {
      console.log("OCR Processing triggered for rawCode:", rawCode);
      processCode(rawCode, false); // OCR processing
      setNeedsOCRProcessing(false); // Reset flag after processing
    }
  }, [rawCode, isLoaded, needsOCRProcessing]);

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
    
    if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
      const { isValidTag } = require('../utils/preprocessinghtml.jsx');
      if (isValidTag(trimmed)) {
        return [content, "valid tag"];
      } else {
        return [content, "invalid tag"];
      }
    } else {
      return [content, "text"];
    }
  };

  // Direct update for manual edits (from CodeTabContent)
  const updateProcessedHTMLDirectly = (newProcessedHTML) => {
    console.log("Direct manual update:", newProcessedHTML);
    setIsManualUpdate(true);
    
    // Use processCode to validate and update status immediately
    processCode(newProcessedHTML, true);
    
    // Update rawCode to match
    const newCodeArray = newProcessedHTML.map(line => line[0]);
    setRawCode(newCodeArray);
  };

  // For external updates (like from OCR)
  const updateCode = (newCode) => {
    console.log("External code update for OCR processing:", newCode);
    setIsManualUpdate(false);
    setNeedsOCRProcessing(true); // This will need OCR processing
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
    isLoading: numberOfErrors === -1 || !isLoaded
  };
};