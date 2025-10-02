// exerciseSync.js - Synchronization with readable user IDs

import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { getAllExercises, getExercise, saveExercise } from './exerciseStorage';
import { getOrCreateReadableId } from './analytics/firestoreOperations';
import { generateReadableUserId } from './analytics/readableIdGenerator';

/**
 * Get readable user ID for sync operations
 * @param {string} userId - Firebase user ID
 * @returns {Promise<string>} Readable user ID
 */
const getReadableUserIdForSync = async (userId) => {
  return await getOrCreateReadableId(userId, generateReadableUserId);
};

/**
 * Upload a single exercise to Firestore
 * @param {string} userId - Firebase user ID
 * @param {string|number} exId - Exercise ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const uploadExerciseToCloud = async (userId, exId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const readableUserId = await getReadableUserIdForSync(userId);
    const exerciseData = getExercise(exId);
    
    if (!exerciseData) {
      return { success: false, error: 'Exercise not found in local storage' };
    }

    // Convert rawCode - flatten if it contains nested arrays
    const rawCodeForFirestore = exerciseData.rawCode?.map(item => {
      if (Array.isArray(item)) {
        return {
          content: item[0],
          type: item[1] || 'text'
        };
      }
      return typeof item === 'string' ? { content: item, type: 'text' } : item;
    }) || [];

    // Convert processedHTML - same logic
    const processedHTMLForFirestore = exerciseData.processedHTML?.map(line => {
      if (Array.isArray(line)) {
        return {
          content: line[0],
          type: line[1] || 'text'
        };
      }
      return typeof line === 'string' ? { content: line, type: 'text' } : line;
    }) || [];

    // Convert validation errors to serializable format
    let validationForFirestore = null;
    if (exerciseData.htmlHintValidation) {
      const validation = exerciseData.htmlHintValidation;
      const errorsObj = {};
      
      if (validation.errors) {
        const errorsSource = validation.errors instanceof Map 
          ? Object.fromEntries(validation.errors)
          : validation.errors;
          
        Object.keys(errorsSource).forEach(key => {
          errorsObj[key] = errorsSource[key];
        });
      }
      
      validationForFirestore = {
        isValid: validation.isValid,
        totalErrors: validation.totalErrors,
        messages: validation.messages || [],
        errors: errorsObj
      };
    }

    const exerciseRef = doc(db, 'users', readableUserId, 'exercises', String(exId));
    
    await setDoc(exerciseRef, {
      id: exerciseData.id,
      rawCode: rawCodeForFirestore,
      processedHTML: processedHTMLForFirestore,
      htmlHintValidation: validationForFirestore,
      finalHTMLOutput: exerciseData.finalHTMLOutput || false,
      criticalErrors: exerciseData.criticalErrors || 0,
      manuallyCompleted: exerciseData.manuallyCompleted || false,
      hasCode: exerciseData.hasCode || false,
      lastUpdated: serverTimestamp(),
      syncedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error uploading exercise to cloud:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload all exercises to Firestore
 * @param {string} userId - Firebase user ID
 * @returns {Promise<{success: boolean, uploaded: number, errors: number}>}
 */
export const uploadAllExercisesToCloud = async (userId) => {
  try {
    if (!userId) {
      return { success: false, uploaded: 0, errors: 1, error: 'User not authenticated' };
    }

    const allExercises = getAllExercises();
    const exerciseIds = Object.keys(allExercises);
    
    let uploaded = 0;
    let errors = 0;

    for (const exId of exerciseIds) {
      const result = await uploadExerciseToCloud(userId, exId);
      if (result.success) {
        uploaded++;
      } else {
        errors++;
      }
    }

    return { success: errors === 0, uploaded, errors };
  } catch (error) {
    console.error('Error uploading all exercises:', error);
    return { success: false, uploaded: 0, errors: 1, error: error.message };
  }
};

/**
 * Download a single exercise from Firestore
 * @param {string} userId - Firebase user ID
 * @param {string|number} exId - Exercise ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const downloadExerciseFromCloud = async (userId, exId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const readableUserId = await getReadableUserIdForSync(userId);
    const exerciseRef = doc(db, 'users', readableUserId, 'exercises', String(exId));
    const exerciseSnap = await getDoc(exerciseRef);

    if (!exerciseSnap.exists()) {
      return { success: false, error: 'Exercise not found in cloud' };
    }

    const cloudData = exerciseSnap.data();
    
    // Convert Firestore Timestamps to ISO strings
    if (cloudData.lastUpdated?.toDate) {
      cloudData.lastUpdated = cloudData.lastUpdated.toDate().toISOString();
    }
    if (cloudData.syncedAt?.toDate) {
      cloudData.syncedAt = cloudData.syncedAt.toDate().toISOString();
    }

    // Convert rawCode objects back to arrays
    if (cloudData.rawCode && Array.isArray(cloudData.rawCode)) {
      cloudData.rawCode = cloudData.rawCode.map(item => {
        if (item && typeof item === 'object' && 'content' in item) {
          return [item.content, item.type || 'text'];
        }
        return item;
      });
    }

    // Convert processedHTML objects back to arrays
    if (cloudData.processedHTML && Array.isArray(cloudData.processedHTML)) {
      cloudData.processedHTML = cloudData.processedHTML.map(line => {
        if (line && typeof line === 'object' && 'content' in line) {
          return [line.content, line.type || 'text'];
        }
        return line;
      });
    }

    return { success: true, data: cloudData };
  } catch (error) {
    console.error('Error downloading exercise from cloud:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Download all exercises from Firestore
 * @param {string} userId - Firebase user ID
 * @returns {Promise<{success: boolean, exercises?: object, downloaded: number, error?: string}>}
 */
export const downloadAllExercisesFromCloud = async (userId) => {
  try {
    if (!userId) {
      return { success: false, downloaded: 0, error: 'User not authenticated' };
    }

    const readableUserId = await getReadableUserIdForSync(userId);
    const exercisesRef = collection(db, 'users', readableUserId, 'exercises');
    const q = query(exercisesRef, orderBy('lastUpdated', 'desc'));
    const querySnapshot = await getDocs(q);

    const exercises = {};
    let downloaded = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Convert Firestore Timestamps to ISO strings
      if (data.lastUpdated?.toDate) {
        data.lastUpdated = data.lastUpdated.toDate().toISOString();
      }
      if (data.syncedAt?.toDate) {
        data.syncedAt = data.syncedAt.toDate().toISOString();
      }

      // Convert rawCode objects back to arrays
      if (data.rawCode && Array.isArray(data.rawCode)) {
        data.rawCode = data.rawCode.map(item => {
          if (item && typeof item === 'object' && 'content' in item) {
            return [item.content, item.type || 'text'];
          }
          return item;
        });
      }

      // Convert processedHTML objects back to arrays
      if (data.processedHTML && Array.isArray(data.processedHTML)) {
        data.processedHTML = data.processedHTML.map(line => {
          if (line && typeof line === 'object' && 'content' in line) {
            return [line.content, line.type || 'text'];
          }
          return line;
        });
      }

      exercises[doc.id] = data;
      downloaded++;
    });

    return { success: true, exercises, downloaded };
  } catch (error) {
    console.error('Error downloading all exercises:', error);
    return { success: false, downloaded: 0, error: error.message };
  }
};

/**
 * Sync a single exercise (smart merge: choose most recent version)
 * @param {string} userId - Firebase user ID
 * @param {string|number} exId - Exercise ID
 * @returns {Promise<{success: boolean, action: string, error?: string}>}
 */
export const syncExercise = async (userId, exId) => {
  try {
    if (!userId) {
      return { success: false, action: 'none', error: 'User not authenticated' };
    }

    const localData = getExercise(exId);
    const cloudResult = await downloadExerciseFromCloud(userId, exId);

    // Case 1: Only local version exists
    if (localData && !cloudResult.success) {
      await uploadExerciseToCloud(userId, exId);
      return { success: true, action: 'uploaded' };
    }

    // Case 2: Only cloud version exists
    if (!localData && cloudResult.success) {
      saveExercise(exId, cloudResult.data);
      return { success: true, action: 'downloaded' };
    }

    // Case 3: Both exist - compare timestamps
    if (localData && cloudResult.success) {
      const localTime = new Date(localData.lastUpdated || 0).getTime();
      const cloudTime = new Date(cloudResult.data.lastUpdated || 0).getTime();

      if (localTime > cloudTime) {
        // Local is newer
        await uploadExerciseToCloud(userId, exId);
        return { success: true, action: 'uploaded' };
      } else if (cloudTime > localTime) {
        // Cloud is newer
        saveExercise(exId, cloudResult.data);
        return { success: true, action: 'downloaded' };
      } else {
        // Same timestamp
        return { success: true, action: 'already_synced' };
      }
    }

    // Case 4: Neither exists
    return { success: true, action: 'none' };
  } catch (error) {
    console.error('Error syncing exercise:', error);
    return { success: false, action: 'error', error: error.message };
  }
};

/**
 * Sync all exercises (smart merge)
 * @param {string} userId - Firebase user ID
 * @returns {Promise<{success: boolean, uploaded: number, downloaded: number, synced: number, errors: number}>}
 */
export const syncAllExercises = async (userId) => {
  try {
    if (!userId) {
      return { 
        success: false, 
        uploaded: 0, 
        downloaded: 0, 
        synced: 0, 
        errors: 1,
        error: 'User not authenticated' 
      };
    }

    const localExercises = getAllExercises();
    const cloudResult = await downloadAllExercisesFromCloud(userId);

    if (!cloudResult.success) {
      return {
        success: false,
        uploaded: 0,
        downloaded: 0,
        synced: 0,
        errors: 1,
        error: cloudResult.error
      };
    }

    const cloudExercises = cloudResult.exercises || {};
    
    // Get all unique exercise IDs from both sources
    const allExerciseIds = new Set([
      ...Object.keys(localExercises),
      ...Object.keys(cloudExercises)
    ]);

    let uploaded = 0;
    let downloaded = 0;
    let synced = 0;
    let errors = 0;

    for (const exId of allExerciseIds) {
      const result = await syncExercise(userId, exId);
      
      if (result.success) {
        if (result.action === 'uploaded') uploaded++;
        else if (result.action === 'downloaded') downloaded++;
        else if (result.action === 'already_synced') synced++;
      } else {
        errors++;
      }
    }

    return {
      success: errors === 0,
      uploaded,
      downloaded,
      synced,
      errors
    };
  } catch (error) {
    console.error('Error syncing all exercises:', error);
    return {
      success: false,
      uploaded: 0,
      downloaded: 0,
      synced: 0,
      errors: 1,
      error: error.message
    };
  }
};

/**
 * Delete exercise from cloud
 * @param {string} userId - Firebase user ID
 * @param {string|number} exId - Exercise ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteExerciseFromCloud = async (userId, exId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const readableUserId = await getReadableUserIdForSync(userId);
    const exerciseRef = doc(db, 'users', readableUserId, 'exercises', String(exId));
    await deleteDoc(exerciseRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting exercise from cloud:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get sync status for an exercise
 * @param {string} userId - Firebase user ID
 * @param {string|number} exId - Exercise ID
 * @returns {Promise<{synced: boolean, localNewer: boolean, cloudNewer: boolean, localOnly: boolean, cloudOnly: boolean}>}
 */
export const getExerciseSyncStatus = async (userId, exId) => {
  try {
    if (!userId) {
      return { synced: false, localNewer: false, cloudNewer: false, localOnly: true, cloudOnly: false };
    }

    const localData = getExercise(exId);
    const cloudResult = await downloadExerciseFromCloud(userId, exId);

    if (localData && !cloudResult.success) {
      return { synced: false, localNewer: true, cloudNewer: false, localOnly: true, cloudOnly: false };
    }

    if (!localData && cloudResult.success) {
      return { synced: false, localNewer: false, cloudNewer: true, localOnly: false, cloudOnly: true };
    }

    if (localData && cloudResult.success) {
      const localTime = new Date(localData.lastUpdated || 0).getTime();
      const cloudTime = new Date(cloudResult.data.lastUpdated || 0).getTime();

      if (localTime > cloudTime) {
        return { synced: false, localNewer: true, cloudNewer: false, localOnly: false, cloudOnly: false };
      } else if (cloudTime > localTime) {
        return { synced: false, localNewer: false, cloudNewer: true, localOnly: false, cloudOnly: false };
      } else {
        return { synced: true, localNewer: false, cloudNewer: false, localOnly: false, cloudOnly: false };
      }
    }

    return { synced: false, localNewer: false, cloudNewer: false, localOnly: false, cloudOnly: false };
  } catch (error) {
    console.error('Error getting sync status:', error);
    return { synced: false, localNewer: false, cloudNewer: false, localOnly: true, cloudOnly: false };
  }
};