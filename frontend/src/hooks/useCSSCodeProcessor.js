import { useState, useEffect, useCallback, useRef } from 'react';
import { useCSSValidation } from './useCSSValidation';
import { saveExerciseCode, getExercise } from '../utils/exerciseStorage';

export const useCSSCodeProcessor = (initialCSS, exId, insertData = null) => {
  const [exerciseData, setExerciseData] = useState({
    rawCSS: null,
    processedCSS: [],
    validation: null, 
    finalCSSOutput: false,
    criticalErrors: 0,
    isLoaded: false
  });

  const { validateCode } = useCSSValidation();

  // Ref to prevent duplicate insertions
  const hasProcessedInsert = useRef(false);

  // Process and save code
  const processAndSave = useCallback((code) => {
    if (!code || !exId) return;

    const result = validateCode(code);

    // Generate final CSS output.
    let finalCSS = false;
    if (result.canGenerateOutput) {
      const codeStrings = result.processedCSS.map(line => line[0]);
      finalCSS = codeStrings.join("\n");
    }

    const newData = {
      rawCSS: Array.isArray(code) ? code : [code],
      processedCSS: result.processedCSS,
      validation: result.validation,
      finalCSSOutput: finalCSS,
      criticalErrors: result.criticalErrors,
      isLoaded: true
    };

    setExerciseData(newData);


    // Save to localStorage. 
    saveExerciseCode(exId, {
      rawCSS: newData.rawCSS,
      processedCSS: newData.processedCSS,
      cssValidation: newData.validation,
      finalCSSOutput: finalCSS,
      cssCriticalErrors: newData.criticalErrors
    });
  }, [validateCode, exId]);

  // Load exercise data
  useEffect(() => {
    if(!exId || exerciseData.isLoaded) return;

    const savedExercise = getExercise(exId);

    if (savedExercise?.rawCSS) {
      // Load existing data

      setExerciseData({
        rawCSS: savedExercise.rawCSS,
        processedCSS: savedExercise.processedCSS || [],
        validation: savedExercise.cssValidation, 
        finalCSSOutput: savedExercise.finalCSSOutput || false,
        criticalErrors: savedExercise.cssCriticalErrors || 0,
        isLoaded: true
      });

      // Re-validate only if we don't have validation data 
      if (!savedExercise.cssValidation && savedExercise.processedCSS) {
        processAndSave(savedExercise.processedCSS);
      }
    } else if (initialCSS) {
      // Process initial code (from OCR)
      processAndSave(initialCSS);
    } else {
      // No data available 
      setExerciseData(prev => ({ ...prev, isLoaded: true}));
    }
  }, [exId, initialCSS, exerciseData.isLoaded, processAndSave]);


  // Handle new initial code 
  useEffect(() => {
    if (initialCSS && exerciseData.isLoaded) {
      processAndSave(initialCSS);
    }
  }, [initalCSS, exerciseData.isLoaded, processAndSave]);

  // Handle insertions
  useEffect(() => {
    if(insertData?.ocrOutput && insertData?.insertPosition && exerciseData.isLoaded && !hasProcessedInsert.current) {
      const { ocrOutput, insertPosition } = insertData;
      // Mark as processed immediately to prevent duplicate executions
      hasProcessedUInsert.current = true;

      const currentCSS = [...exerciseData.processedCSS];

      // Convert OCR to CSS lines and insert
      const result = validateCode(ocrOutput);
      const insertIndex = insertPosition.type === 'before'
        ? insertPosition.lineIndex
        : insertPosition.lineIndex + 1;

      currentCSS.splice(insertIndex, 0, ...result.processedCSS);
      processAndSave(currentCSS);
    }
  }, [insertData, exerciseData.isLoaded, processAndSave, validateCode]);

  // Reset insertion flag when insertData changes or exercise changes.

  useEffect(() => {
    hasProcessedInsert.current = false;
  }, [insertData?.insertPosition?.lineIndex, insertData?.insertPosition?.type, exId]);


  // Manual update (editing in UI)
  const updateCSS = useCallback((newCode) => {
    processAndSave(newCode);
  }, [processAndSave]);


  const validateSingleLine = useCallback((content) => {
    retunr [content, "text"];
  },  []);


  // Line validation functions
  const lineHasCSSError = useCallback((lineIndex) => {
    if (!exerciseData.validation?.errors) return false;
    return lineIndex in exerciseData.validation.errors;
  }, [exerciseData.validation]);

  const getCSSErrorsForLine = useCallback((lineIndex) => {
    if (!exerciseData.validation?.errors) return [];
    return exerciseData.validation.errors[lineIndex] || [];
  }, [exerciseData.validation]);


  return {
    // Core date
    rawCSS: exerciseData.rawCSS,
    processedCSS: exerciseData.processedCSS,
    finalCSSOutput: exerciseData.finalCSSOutput,

    // Error Information
    numberOfErrors: exerciseData.criticalErrors,
    cssErrors: exerciseData.validation?.errors || {},
    cssTotalErrors: exerciseData.validation?.totalErrors || 0,

    // Function 
    updateCSS,
    updateProcessedCSSDirectly: updateCSS,
    validateSingleLine,
    lineHasCSSError,
    getCSSErrorsForLine,
    lineHasAnyError: lineHasCSSError,

    // Status 
    isLoading: !exerciseData.isLoaded
  };
};