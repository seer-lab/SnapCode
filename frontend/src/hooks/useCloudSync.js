// useCloudSync.js - React hook for cloud synchronization

import { useState, useCallback, useEffect } from 'react';
import { useAuthContext } from '../contexts/authContext';
import {
  syncAllExercises,
  syncExercise,
  uploadAllExercisesToCloud,
  downloadAllExercisesFromCloud,
  getExerciseSyncStatus
} from '../utils/exerciseSync';

export const useCloudSync = () => {
  const { currentUser } = useAuthContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    lastSyncTime: null,
    uploaded: 0,
    downloaded: 0,
    synced: 0,
    errors: 0
  });
  const [error, setError] = useState(null);

  // Load last sync time from localStorage
  useEffect(() => {
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
      setSyncStatus(prev => ({ ...prev, lastSyncTime: new Date(lastSync) }));
    }
  }, []);

  /**
   * Sync all exercises with cloud
   */
  const syncAll = useCallback(async () => {
    if (!currentUser) {
      setError('User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }

    setIsSyncing(true);
    setError(null);

    try {
      const result = await syncAllExercises(currentUser.uid);

      if (result.success) {
        const now = new Date();
        localStorage.setItem('lastSyncTime', now.toISOString());
        
        setSyncStatus({
          lastSyncTime: now,
          uploaded: result.uploaded,
          downloaded: result.downloaded,
          synced: result.synced,
          errors: result.errors
        });

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('exercisesSynced'));
      } else {
        setError(result.error || 'Sync failed');
      }

      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser]);

  /**
   * Sync a single exercise
   */
  const syncSingle = useCallback(async (exId) => {
    if (!currentUser) {
      setError('User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }

    setIsSyncing(true);
    setError(null);

    try {
      const result = await syncExercise(currentUser.uid, exId);

      if (!result.success) {
        setError(result.error || 'Sync failed');
      }

      // Dispatch event for this specific exercise
      window.dispatchEvent(new CustomEvent('exerciseUpdated', {
        detail: { exerciseId: exId }
      }));

      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser]);

  /**
   * Force upload all to cloud (overwrite cloud)
   */
  const forceUploadAll = useCallback(async () => {
    if (!currentUser) {
      setError('User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }

    setIsSyncing(true);
    setError(null);

    try {
      const result = await uploadAllExercisesToCloud(currentUser.uid);

      if (result.success) {
        const now = new Date();
        localStorage.setItem('lastSyncTime', now.toISOString());
        
        setSyncStatus({
          lastSyncTime: now,
          uploaded: result.uploaded,
          downloaded: 0,
          synced: 0,
          errors: result.errors
        });

        window.dispatchEvent(new CustomEvent('exercisesSynced'));
      } else {
        setError(result.error || 'Upload failed');
      }

      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser]);

  /**
   * Force download all from cloud (overwrite local)
   */
  const forceDownloadAll = useCallback(async () => {
    if (!currentUser) {
      setError('User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }

    setIsSyncing(true);
    setError(null);

    try {
      
      const result = await downloadAllExercisesFromCloud(currentUser.uid);
      

      if (result.success) {
        // Save all downloaded exercises to localStorage
        const { exercises } = result;
        
        // Import saveExercise to properly save each exercise
        const { saveExercise } = await import('../utils/exerciseStorage');
        
        Object.keys(exercises).forEach(exId => {
          saveExercise(exId, exercises[exId]);
        });

        const now = new Date();
        localStorage.setItem('lastSyncTime', now.toISOString());
        
        setSyncStatus({
          lastSyncTime: now,
          uploaded: 0,
          downloaded: result.downloaded,
          synced: 0,
          errors: 0
        });

        window.dispatchEvent(new CustomEvent('exercisesSynced'));

      } else {
        console.error('Download failed:', result.error);
        setError(result.error || 'Download failed');
      }

      return result;
    } catch (err) {
      console.error('Exception during download:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser]);

  /**
   * Get sync status for a specific exercise
   */
  const getExerciseStatus = useCallback(async (exId) => {
    if (!currentUser) {
      return { synced: false, localOnly: true };
    }

    try {
      return await getExerciseSyncStatus(currentUser.uid, exId);
    } catch (err) {
      console.error('Error getting exercise status:', err);
      return { synced: false, localOnly: true };
    }
  }, [currentUser]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isSyncing,
    syncStatus,
    error,
    isAuthenticated: !!currentUser,
    
    // Actions
    syncAll,
    syncSingle,
    forceUploadAll,
    forceDownloadAll,
    getExerciseStatus,
    clearError
  };
};