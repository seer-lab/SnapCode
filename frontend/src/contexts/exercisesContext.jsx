import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { exercises as exerciseData } from '../data/exercises';
import { getAllExercises, getExercise } from '../utils/exerciseStorage';

const ExercisesContext = createContext();

export const useExercisesContext = () => {
  const context = useContext(ExercisesContext);
  if (!context) {
    throw new Error('useExercisesContext must be used within an ExercisesProvider');
  }
  return context;
};

export const ExercisesProvider = ({ children }) => {
  const [exercisesWithStatus, setExercisesWithStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to determine exercise status based on saved data
  const calculateExerciseStatus = useCallback((exerciseId, savedData = null) => {
    const saved = savedData || getExercise(exerciseId);
    
    // Draft: no code or empty code
    if (!saved || !saved.processedHTML || saved.processedHTML.length === 0) {
      return 'Draft';
    }

    // Check if there's real content (not just empty lines)
    const hasRealContent = saved.processedHTML.some(line => {
      const content = Array.isArray(line) ? line[0] : line;
      return content && content.trim() !== '';
    });

    if (!hasRealContent) {
      return 'Draft';
    }

    // Done: if manually completed, maintain this status regardless of current errors
    if (saved.manuallyCompleted === true) {
      return 'Done';
    }

    // Invalid: has critical errors (stored directly now)
    if (saved.criticalErrors > 0) {
      return 'Invalid';
    }

    // Fallback: check validation object if criticalErrors field doesn't exist (backward compatibility)
    if (saved.criticalErrors === undefined && saved.htmlHintValidation?.errors) {
      const allErrors = Object.values(saved.htmlHintValidation.errors).flat();
      const hasCriticalErrors = allErrors.some(error => error.severity === 'error');
      if (hasCriticalErrors) {
        return 'Invalid';
      }
    }

    // Pending: valid code but not manually completed yet
    return 'Pending';
  }, []);

  // Function to load all exercises with their current status
  const loadExercisesWithStatus = useCallback(() => {
    setIsLoading(true);
    
    const savedExercises = getAllExercises();
    
    const exercisesWithCurrentStatus = exerciseData.map(exercise => {
      const savedData = savedExercises[exercise.id];
      const currentStatus = calculateExerciseStatus(exercise.id, savedData);
      
      return {
        ...exercise,
        currentStatus,
        savedData,
        lastUpdated: savedData?.lastUpdated || null
      };
    });

    setExercisesWithStatus(exercisesWithCurrentStatus);
    setIsLoading(false);
  }, [calculateExerciseStatus]);

  // Optimized function to update status of a specific exercise
  const updateExerciseStatus = useCallback((exerciseId) => {
    setExercisesWithStatus(prev => 
      prev.map(exercise => {
        if (exercise.id === parseInt(exerciseId)) {
          const savedData = getExercise(exerciseId);
          const currentStatus = calculateExerciseStatus(exerciseId, savedData);
          
          // Only create new object if status actually changed
          if (exercise.currentStatus !== currentStatus || 
              exercise.lastUpdated !== savedData?.lastUpdated) {
            return {
              ...exercise,
              currentStatus,
              savedData,
              lastUpdated: savedData?.lastUpdated || null
            };
          }
          return exercise; // Return same reference if no meaningful change
        }
        return exercise; // Return same reference for unchanged exercises
      })
    );
  }, [calculateExerciseStatus]);

  // Function to get a specific exercise with its status
  const getExerciseWithStatus = useCallback((exerciseId) => {
    return exercisesWithStatus.find(ex => ex.id === parseInt(exerciseId)) || null;
  }, [exercisesWithStatus]);

  // Function to refresh all statuses (useful when returning from other pages)
  const refreshAllStatuses = useCallback(() => {
    loadExercisesWithStatus();
  }, [loadExercisesWithStatus]);

  // Load initial data
  useEffect(() => {
    loadExercisesWithStatus();
  }, [loadExercisesWithStatus]);

  // Listen for localStorage changes to sync across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
     if (!e.key) {
       loadExercisesWithStatus();
       return;
     }
     if (e.key.startsWith('exercises')) {
       loadExercisesWithStatus();
     }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadExercisesWithStatus]);

  // Listen for custom events when exercises are updated internally
  useEffect(() => {
    const handleExerciseUpdate = (event) => {
      // Check if event has specific exercise ID for targeted update
      if (event.detail && event.detail.exerciseId) {
        updateExerciseStatus(event.detail.exerciseId);
      } else {
        // Fallback to full refresh if no specific ID provided
        loadExercisesWithStatus();
      }
    };

    window.addEventListener('exerciseUpdated', handleExerciseUpdate);
    return () => window.removeEventListener('exerciseUpdated', handleExerciseUpdate);
  }, [updateExerciseStatus, loadExercisesWithStatus]);

  // Listen for user changes to reload exercises for new user
  useEffect(() => {
    const onUserChange = () => loadExercisesWithStatus();
    window.addEventListener('exerciseUserChanged', onUserChange);
    return () => window.removeEventListener('exerciseUserChanged', onUserChange);
  }, [loadExercisesWithStatus]);

  const value = {
    exercisesWithStatus,
    isLoading,
    updateExerciseStatus,
    getExerciseWithStatus,
    refreshAllStatuses
  };

  return (
    <ExercisesContext.Provider value={value}>
      {children}
    </ExercisesContext.Provider>
  );
};