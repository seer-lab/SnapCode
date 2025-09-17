import { useExercisesContext } from '../contexts/exercisesContext';

export const useExerciseStatus = () => {
  const {
    exercisesWithStatus,
    isLoading,
    updateExerciseStatus,
    getExerciseWithStatus,
    refreshAllStatuses
  } = useExercisesContext();

  // Get status of a specific exercise
  const getExerciseStatus = (exerciseId) => {
    const exercise = getExerciseWithStatus(exerciseId);
    return exercise?.currentStatus || 'Draft';
  };

  // Check if an exercise has code
  const hasExerciseCode = (exerciseId) => {
    const exercise = getExerciseWithStatus(exerciseId);
    return exercise?.savedData?.processedHTML?.length > 0 || false;
  };

  return {
    // Core data
    exercisesWithStatus,
    isLoading,
    
    // Essential functions only
    getExerciseStatus,
    hasExerciseCode,
    updateExerciseStatus,
    refreshAllStatuses
  };
};