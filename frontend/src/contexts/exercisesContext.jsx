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

    // Check if there's real content (not just empty lines or metadata)
    const hasRealContent = saved.processedHTML.some(line => {
      if (Array.isArray(line) && line.length >= 1) {
        return line[0] && line[0].trim() !== '' && line[0].trim() !== ',valid tag';
      }
      return false;
    });

    if (!hasRealContent) {
      return 'Draft';
    }

    // Done: if manually completed, maintain this status regardless of current errors
    // This allows students to experiment after completing without losing their progress
    if (saved.manuallyCompleted === true) {
      return 'Done';
    }

    // Invalid: has validation errors (only if not manually completed)
    const hasErrors = saved.processedHTML.some(line => {
      if (Array.isArray(line) && line.length >= 2) {
        return line[1] && line[1] !== 'valid tag' && line[1] !== 'text';
      }
      return false;
    });

    if (hasErrors) {
      return 'Invalid';
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

  // Listen for localStorage changes (for synchronization between tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'exercises') {
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

  // Only return what's actually needed
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