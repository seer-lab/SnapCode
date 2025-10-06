// hooks/useCodeAnalytics.js
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from "../config/firebase";
import { useUserAnalytics } from "./useUserAnalytics";
import { getAllErrorsFrom } from "../utils/codeUtils";

export const useCodeAnalytics = (exId, processedHTML, htmlHintErrors) => {
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return unsubscribe;
  }, []);

  const { logLineClicked, logCodeChanged } = useUserAnalytics(userId);

  // Refs to have the most recent state
  const latestProcessedHTMLRef = useRef(processedHTML);
  const latestHtmlHintErrorsRef = useRef(htmlHintErrors);

  useEffect(() => {
    latestProcessedHTMLRef.current = processedHTML;
  }, [processedHTML]);

  useEffect(() => {
    latestHtmlHintErrorsRef.current = htmlHintErrors;
  }, [htmlHintErrors]);

  const logLineClickEvent = (index, lineContent, lineErrors) => {
    if (userId && exId) {
      logLineClicked(exId, index, lineContent, lineErrors);
    }
  };

  const logCodeChangeEvent = (purposeOfPopUp, selectedLineIndex, inputValue, previousContent) => {
    if (!userId || !exId) return;

    const beforeErrors = getAllErrorsFrom(latestHtmlHintErrorsRef.current);

    setTimeout(() => {
      const afterErrors = getAllErrorsFrom(latestHtmlHintErrorsRef.current);
      const codeSnapshot = latestProcessedHTMLRef.current;

      if (purposeOfPopUp === "Editing") {
        logCodeChanged(exId, 'line_edited', {
          lineIndex: selectedLineIndex,
          previousContent: previousContent,
          newContent: inputValue
        }, codeSnapshot, beforeErrors, afterErrors);
      } else if (purposeOfPopUp === "AddingBefore") {
        logCodeChanged(exId, 'line_added', {
          lineIndex: selectedLineIndex,
          newContent: inputValue,
          position: 'before'
        }, codeSnapshot, beforeErrors, afterErrors);
      } else if (purposeOfPopUp === "AddingAfter") {
        logCodeChanged(exId, 'line_added', {
          lineIndex: selectedLineIndex,
          newContent: inputValue,
          position: 'after'
        }, codeSnapshot, beforeErrors, afterErrors);
      } else if (purposeOfPopUp === "Deleting") {
        logCodeChanged(exId, 'line_deleted', {
          lineIndex: selectedLineIndex,
          deletedContent: previousContent
        }, codeSnapshot, beforeErrors, afterErrors);
      }
    }, 500);
  };

  return {
    userId,
    logLineClickEvent,
    logCodeChangeEvent
  };
};