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

export const hasExerciseCode = (exId) => {
  try {
    const exercise = getExercise(exId);
    if (!exercise) return false;
    
    // Check if rawCode has content
    if (exercise.rawCode && Array.isArray(exercise.rawCode) && exercise.rawCode.length > 0) {
      const hasContent = exercise.rawCode.some(line => {
        if (typeof line === 'string') {
          return line.trim() !== '';
        }
        if (Array.isArray(line)) {
          return line[0] && line[0].trim() !== '';
        }
        return false;
      });
      
      if (hasContent) return true;
    }
    
    // Check if processedHTML has content
    if (exercise.processedHTML && Array.isArray(exercise.processedHTML) && exercise.processedHTML.length > 0) {
      const hasContent = exercise.processedHTML.some(line => {
        if (Array.isArray(line) && line.length >= 2) {
          return line[0] && line[0].trim() !== '' && line[0].trim() !== ',valid tag';
        }
        return false;
      });
      
      if (hasContent) return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking exercise code:', error);
    return false;
  }
};

export const saveExerciseCode = (exId, rawCode, processedHTML, finalHTMLOutput) => {
  // Ensure processedHTML is properly formatted as array of arrays
  const properlyFormattedHTML = processedHTML.map(line => {
    if (Array.isArray(line)) {
      return line;
    } else {
      return [line, "text"];
    }
  });

  saveExercise(exId, {
    rawCode,
    processedHTML: properlyFormattedHTML,
    finalHTMLOutput,
    hasCode: true
  });
  
  // saveExercise already dispatches the targeted update event
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