import { useEffect } from 'react';
import { useExerciseStatus } from './useExerciseStatus';


export const useExerciseSync = (exId, codeProcessor) => {
  const { updateExerciseStatus } = useExerciseStatus();

  // Sync when processedHTML changes
  useEffect(() => {
    if (codeProcessor?.processedHTML && exId !== null && exId !== undefined) {
      // Small delay to ensure state is updated
      const timeoutId = setTimeout(() => {
        updateExerciseStatus(exId);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [codeProcessor?.processedHTML, codeProcessor?.finalHTMLOutput, exId, updateExerciseStatus]);

  // Sync when finalHTMLOutput changes
  useEffect(() => {
    if (codeProcessor?.finalHTMLOutput && exId !== null && exId !== undefined) {
      const timeoutId = setTimeout(() => {
        updateExerciseStatus(exId);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [codeProcessor?.finalHTMLOutput, exId, updateExerciseStatus]);

  return null; // This hook does not return any value
};