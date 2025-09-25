const EXERCISE_STORAGE_KEY = 'exercises';

// Helper function to dispatch update events with optional exercise ID
const dispatchUpdate = (exerciseId = null) => {
  const event = new CustomEvent('exerciseUpdated', {
    detail: exerciseId ? { exerciseId } : {}
  });
  window.dispatchEvent(event);
};

export const getAllExercises = () => {
  try {
    const data = localStorage.getItem(EXERCISE_STORAGE_KEY);
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
    const exercises = getAllExercises();
    exercises[exId] = {
      ...exercises[exId],
      ...exerciseData,
      lastUpdated: new Date().toISOString(),
      id: exId
    };
    localStorage.setItem(EXERCISE_STORAGE_KEY, JSON.stringify(exercises));
    
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
    criticalErrors = 0
  } = exerciseData;

  // Ensure processedHTML is properly formatted
  const formattedHTML = processedHTML.map(line => 
    Array.isArray(line) ? line : [line, "text"]
  );

  saveExercise(exId, {
    rawCode,
    processedHTML: formattedHTML,
    htmlHintValidation: validation, // Store validation directly
    finalHTMLOutput,
    criticalErrors,
    hasCode: formattedHTML.length > 0
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

export const clearExercise = (exId) => {
  try {
    const exercises = getAllExercises();
    delete exercises[exId];
    localStorage.setItem(EXERCISE_STORAGE_KEY, JSON.stringify(exercises));
    
    // Dispatch targeted update event with specific exercise ID
    dispatchUpdate(exId);
  } catch (error) {
    console.error('Error clearing exercise from storage:', error);
  }
};