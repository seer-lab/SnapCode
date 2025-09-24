import { useEffect } from 'react';
import { useExerciseStatus } from './useExerciseStatus';

export const useExerciseSync = (exId, codeProcessor) => {
  const { updateExerciseStatus } = useExerciseStatus();

  // Sync when critical exercise data changes
  useEffect(() => {
    if (exId !== null && exId !== undefined && !codeProcessor?.isLoading) {
      // Update status when exercise is processed
      const timeoutId = setTimeout(() => {
        updateExerciseStatus(exId);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [
    codeProcessor?.numberOfErrors,
    codeProcessor?.finalHTMLOutput, 
    codeProcessor?.isLoading,
    exId, 
    updateExerciseStatus
  ]);

  return null; // This hook does not return any value
};