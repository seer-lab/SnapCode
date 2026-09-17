// exerciseStorage.js - Storage per user

// Current user ID (set when user logs in)
let currentUserId = null;

/**
 * Set the current user ID for storage operations
 * @param {string} userId - Firebase user ID
 */
export const setCurrentUserId = (userId) => {
  currentUserId = userId;
  console.log('Storage user ID set to:', userId);
  window.dispatchEvent(new CustomEvent('exerciseUserChanged', {
    detail: { userId }
  }));
};

/**
 * Get the storage key for current user
 * @returns {string} Storage key
 */
const getStorageKey = () => {
  if (!currentUserId) {
    console.warn('No user ID set, using default storage');
    return 'exercises'; // Fallback for backward compatibility
  }
  return `exercises_${currentUserId}`;
};

// Helper function to dispatch update events with optional exercise ID
const dispatchUpdate = (exerciseId = null) => {
  const event = new CustomEvent('exerciseUpdated', {
    detail: exerciseId ? { exerciseId } : {}
  });
  window.dispatchEvent(event);
};

export const getAllExercises = () => {
  try {
    const key = getStorageKey();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading exercises from storage:', error);
    return {};
  }
};

export const getExercise = (exId) => {
  const exercises = getAllExercises();
  return exercises[exId] || null;
};

export const saveExercise = (exId, exerciseData) => {
  try {
    const key = getStorageKey();
    const exercises = getAllExercises();
    exercises[exId] = {
      ...exercises[exId],
      ...exerciseData,
      lastUpdated: new Date().toISOString(),
      id: exId
    };
    localStorage.setItem(key, JSON.stringify(exercises));
    
    // Dispatch targeted update event with specific exercise ID
    dispatchUpdate(exId);
  } catch (error) {
    console.error('Error saving exercise to storage:', error);
  }
};

// Simplified save function that expects pre-processed data
export const saveExerciseCode = (exId, exerciseData) => {
  const {
    rawCode,
    processedHTML,
    validation,
    finalHTMLOutput,
    criticalErrors = 0,

    rawCSS,
    processedCSS,
    cssValidation,
    finalCSSOutput,
    cssCriticalErrors = 0
  } = exerciseData;

  // Ensure processedHTML is properly formatted
  const formattedHTML = processedHTML ? processedHTML.map(line => 
    Array.isArray(line) ? line : [line, "text"])
    : undefined;

  const formattedCSS = processedCSS ? processedCSS.map(line => 
    Array.isArray(line) ? line : [line, "text"]) 
    : undefined;

  saveExercise(exId, {
    ...(rawCode !== undefined && { rawCode }),
    ...(formattedHTML !== undefined && {
      processedHTML: formattedHTML,
      hasCode: formattedHTML.length > 0,
    }),
    ...(validation !== undefined && { htmlHintValidation: validation }),
    ...(finalHTMLOutput !== undefined && { finalHTMLOutput }),
    ...(criticalErrors !== undefined && { criticalErrors }),
 
    ...(rawCSS !== undefined && { rawCSS }),
    ...(formattedCSS !== undefined && {
      processedCSS: formattedCSS,
      hasCSS: formattedCSS.length > 0,
    }),
    ...(cssValidation !== undefined && { cssValidation }),
    ...(finalCSSOutput !== undefined && { finalCSSOutput }),
    ...(cssCriticalErrors !== undefined && { cssCriticalErrors }),
  });
};

export const hasExerciseCode = (exId) => {
  try {
    const exercise = getExercise(exId);
    if (!exercise || !exercise.processedHTML) return false;
    
    return exercise.processedHTML.some(line => {
      const content = Array.isArray(line) ? line[0] : line;
      return content && content.trim() !== '';
    });
  } catch (error) {
    console.error('Error checking exercise code:', error);
    return false;
  }
};

export const hasExcerciseCSS = (exId) => {
  try {
    const excercise = getExercise(exId);
    if (!excercise || !excercise.processedCSS) return false;

    return excercise.processedCSS.some(line => {
      const content = Array.isArray(line) ? line[0] : line;
      return content && content.trim() !== '';
    });
  } catch (error) {
    console.error('Error checking exercise CSS:', error);
    return false;
  }
};

export const clearExercise = (exId) => {
  try {
    const key = getStorageKey();
    const exercises = getAllExercises();
    delete exercises[exId];
    localStorage.setItem(key, JSON.stringify(exercises));
    
    // Dispatch targeted update event with specific exercise ID
    dispatchUpdate(exId);
  } catch (error) {
    console.error('Error clearing exercise from storage:', error);
  }
};


/**
 * Clear all exercises for current user
 */
export const clearAllExercises = () => {
  try {
    const key = getStorageKey();
    localStorage.removeItem(key);

  } catch (error) {
    console.error('Error clearing all exercises:', error);
  }
};