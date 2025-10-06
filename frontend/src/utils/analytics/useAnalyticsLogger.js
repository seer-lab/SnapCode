import { useCallback } from 'react';
import { logActionToFirestore } from './firestoreOperations';
import { compareErrorStates } from './errorComparison';

export const useAnalyticsLogger = (readableUserId, sessionId, isEnabled) => {
  const logAction = useCallback(async (action, data = {}) => {
    if (!readableUserId || !isEnabled) {
      console.warn('Cannot log action - userId or analytics disabled:', action);
      return;
    }

    try {
      const { exerciseId, lineIndex, email, displayName, ...restData } = data;
      
      const actionEntry = {
        ...(exerciseId !== undefined && { exerciseId }),
        ...(lineIndex !== undefined && { lineIndex }),
        action,
        timestamp: new Date().toISOString(),
        ...restData
      };

      await logActionToFirestore(readableUserId, sessionId, actionEntry);
      console.log('Action logged successfully:', action);
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }, [readableUserId, sessionId, isEnabled]);

  // Specific loggers
  const logExerciseEntered = useCallback((exerciseId) => {
    return logAction('exercise_entered', { exerciseId });
  }, [logAction]);

  const logExerciseCompleted = useCallback((exerciseId) => {
    return logAction('exercise_completed', { exerciseId });
  }, [logAction]);

  const logExerciseUncompleted = useCallback((exerciseId) => {
    return logAction('exercise_uncompleted', { exerciseId });
  }, [logAction]);

  const logLineClicked = useCallback((exerciseId, lineIndex, lineContent, errors = null) => {
    const logData = {
      exerciseId,
      lineIndex,
      lineContent,
      hasErrors: !!errors && errors.length > 0
    };

    if (errors && errors.length > 0) {
      logData.errors = errors.map(error => ({
        message: error.message,
        severity: error.severity,
        rule: error.rule,
        line: error.line || lineIndex
      }));
    }

    return logAction('line_clicked', logData);
  }, [logAction]);

  const logDownloadedCloud = useCallback(() => {
    return logAction('cloud_sync_download');
  }, [logAction]);

  const logUploadedCloud = useCallback(() => {
    return logAction('cloud_sync_upload');
  }, [logAction]);

  const logSmartSyncCloud = useCallback(() => {
    return logAction('cloud_sync_smart');
  }, [logAction]);

  const logExerciseFileDownloaded = useCallback((exerciseId, code) => {
    return logAction('exercise_file_downloaded', { 
      exerciseId,
      code: code ? code.map(line => Array.isArray(line) ? line[0] : line) : []
    });
  }, [logAction]);

  const logCodeChanged = useCallback((exerciseId, changeType, details, fullCode, beforeErrors = null, afterErrors = null) => {
    const baseData = {
      exerciseId,
      lineIndex: details.lineIndex + 1,
      changeType,
      code: fullCode ? fullCode.map(line => Array.isArray(line) ? line[0] : line) : []
    };

    // Add change-specific details
    switch (changeType) {
      case 'line_added':
        baseData.newLineContent = details.newContent;
        baseData.position = details.position;
        break;
      case 'line_edited':
        baseData.previousContent = details.previousContent;
        baseData.newContent = details.newContent;
        break;
      case 'line_deleted':
        baseData.deletedContent = details.deletedContent;
        break;
      case 'code_uploaded':
        baseData.sourceType = 'ocr';
        break;
      case 'code_inserted':
        baseData.insertPosition = details.insertPosition;
        baseData.insertedLines = details.insertedLines;
        break;
    }

    // Add error analysis if available
    if (beforeErrors || afterErrors) {
      const errorComparison = compareErrorStates(beforeErrors, afterErrors);
      
      baseData.errorAnalysis = {
        errorsBeforeChange: beforeErrors ? beforeErrors.length : 0,
        errorsAfterChange: afterErrors ? afterErrors.length : 0
      };

      if (errorComparison.resolved.length > 0) {
        baseData.errorAnalysis.resolvedErrors = errorComparison.resolved.map(error => ({
          message: error.message,
          rule: error.rule
        }));
      }

      if (errorComparison.newErrors.length > 0) {
        baseData.newErrors = errorComparison.newErrors.map(error => ({
          message: error.message,
          rule: error.rule,
          line: error.line
        }));
      }
    }

    return logAction('code_changed', baseData);
  }, [logAction]);

  return {
    logExerciseEntered,
    logExerciseCompleted,
    logExerciseUncompleted,
    logLineClicked,
    logCodeChanged,
    logDownloadedCloud,
    logUploadedCloud,
    logSmartSyncCloud,
    logExerciseFileDownloaded
  };
};