import { useState, useEffect, useCallback } from 'react';
import { useHTMLValidation } from './useHTMLValidation';
import { saveExerciseCode, getExercise } from '../utils/exerciseStorage';

export const useCodeProcessor = (initialCode, exId, insertData = null) => {
  const [exerciseData, setExerciseData] = useState({
    rawCode: null,
    processedHTML: [],
    validation: null,
    finalHTMLOutput: false,
    criticalErrors: 0,
    isLoaded: false
  });

  const { validateCode } = useHTMLValidation();

  // Process and save code
  const processAndSave = useCallback((code, preserveContent = false) => {
    if (!code || !exId) return;

    const result = validateCode(code, preserveContent);
    
    // Generate final HTML output
    let finalHTML = false;
    if (result.canGenerateOutput) {
      const codeStrings = result.processedHTML.map(line => line[0]);
      let htmlString = codeStrings.join("");
      htmlString = htmlString.replace(/^<html>/i, "");
      htmlString = htmlString.replace(/<\/html>$/i, "");
      finalHTML = htmlString;
    }

    const newData = {
      rawCode: Array.isArray(code) ? code : [code],
      processedHTML: result.processedHTML,
      validation: result.validation,
      finalHTMLOutput: finalHTML,
      criticalErrors: result.criticalErrors,
      isLoaded: true
    };

    setExerciseData(newData);

    // Save to localStorage
    saveExerciseCode(exId, {
      rawCode: newData.rawCode,
      processedHTML: newData.processedHTML,
      validation: newData.validation,
      finalHTMLOutput: finalHTML,
      criticalErrors: newData.criticalErrors
    });
  }, [validateCode, exId]);

  // Load exercise data
  useEffect(() => {
    if (!exId || exerciseData.isLoaded) return;

    const savedExercise = getExercise(exId);
    
    if (savedExercise?.rawCode) {
      // Load existing data
      setExerciseData({
        rawCode: savedExercise.rawCode,
        processedHTML: savedExercise.processedHTML || [],
        validation: savedExercise.htmlHintValidation,
        finalHTMLOutput: savedExercise.finalHTMLOutput || false,
        criticalErrors: savedExercise.criticalErrors || 0,
        isLoaded: true
      });
      
      // Re-validate only if we don't have validation data
      if (!savedExercise.htmlHintValidation && savedExercise.processedHTML) {
        processAndSave(savedExercise.processedHTML, true);
      }
    } else if (initialCode) {
      // Process initial code (from OCR)
      processAndSave(initialCode, false);
    } else {
      // No data available
      setExerciseData(prev => ({ ...prev, isLoaded: true }));
    }
  }, [exId, initialCode, exerciseData.isLoaded, processAndSave]);

  // Handle new initial code (replacement)
  useEffect(() => {
    if (initialCode && exerciseData.isLoaded) {
      processAndSave(initialCode, false);
    }
  }, [initialCode, exerciseData.isLoaded, processAndSave]);

  // Handle insertions
  useEffect(() => {
    if (insertData?.ocrOutput && insertData?.insertPosition && exerciseData.isLoaded) {
      const { ocrOutput, insertPosition } = insertData;
      const currentHTML = [...exerciseData.processedHTML];
      
      // Convert OCR to HTML and insert
      const result = validateCode(ocrOutput, false);
      const insertIndex = insertPosition.type === 'before' 
        ? insertPosition.lineIndex 
        : insertPosition.lineIndex + 1;
      
      currentHTML.splice(insertIndex, 0, ...result.processedHTML);
      processAndSave(currentHTML, true);
    }
  }, [insertData, exerciseData.processedHTML, exerciseData.isLoaded, processAndSave, validateCode]);

  // Manual update (editing in UI)
  const updateCode = useCallback((newCode) => {
    processAndSave(newCode, true);
  }, [processAndSave]);

  // Line validation functions (simplified)
  const lineHasHTMLHintError = useCallback((lineIndex) => {
    if (!exerciseData.validation?.errors) return false;
    return lineIndex in exerciseData.validation.errors;
  }, [exerciseData.validation]);

  const getHTMLHintErrorsForLine = useCallback((lineIndex) => {
    if (!exerciseData.validation?.errors) return [];
    return exerciseData.validation.errors[lineIndex] || [];
  }, [exerciseData.validation]);

  const validateSingleLine = useCallback((content) => {
    if (!content?.trim()) return [content, "text"];
    const trimmed = content.trim();
    return trimmed.startsWith("<") && trimmed.endsWith(">") 
      ? [content, "tag"] 
      : [content, "text"];
  }, []);

  return {
    // Core data
    rawCode: exerciseData.rawCode,
    processedHTML: exerciseData.processedHTML,
    finalHTMLOutput: exerciseData.finalHTMLOutput,
    
    // Error information  
    numberOfErrors: exerciseData.criticalErrors,
    htmlTagError: false, // Deprecated
    htmlHintErrors: exerciseData.validation?.errors ? new Map(Object.entries(exerciseData.validation.errors)) : new Map(),
    htmlHintTotalErrors: exerciseData.validation?.totalErrors || 0,
    
    // Functions
    updateCode,
    updateProcessedHTMLDirectly: updateCode, // Alias for backward compatibility
    validateSingleLine,
    lineHasError: () => false, // Deprecated
    lineHasHTMLHintError,
    getHTMLHintErrorsForLine,
    lineHasAnyError: lineHasHTMLHintError,
    
    // Status
    isLoading: !exerciseData.isLoaded
  };
};