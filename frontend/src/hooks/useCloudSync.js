// useCloudSync.js - React hook for cloud synchronization

import { useState, useCallback, useEffect } from 'react';
import { useAuthContext } from '../contexts/authContext';
import { syncService } from '../utils/exercises/syncService';

export const useCloudSync = () => {
  const { currentUser } = useAuthContext();
  const readableId = currentUser?.readableId || null;

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

  /** Sync all exercises with cloud */
  const syncAll = useCallback(async () => {
    if (!readableId) {
      const msg = 'User not authenticated';
      setError(msg);
      return { success: false, error: msg };
    }

    setIsSyncing(true);
    setError(null);

    try {
      const result = await syncService.syncAll(readableId);

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
  }, [readableId]);

  /** Sync a single exercise */
  const syncSingle = useCallback(async (exId) => {
    if (!readableId) {
      const msg = 'User not authenticated';
      setError(msg);
      return { success: false, error: msg };
    }

    setIsSyncing(true);
    setError(null);

    try {
      const result = await syncService.syncOne(readableId, exId);

      if (!result.success) {
        setError(result.error || 'Sync failed');
      }

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
  }, [readableId]);

  /** Force upload all (overwrite cloud) */
  const forceUploadAll = useCallback(async () => {
    if (!readableId) {
      const msg = 'User not authenticated';
      setError(msg);
      return { success: false, error: msg };
    }

    setIsSyncing(true);
    setError(null);

    try {
      const result = await syncService.forceUploadAll(readableId);

      if (result.success) {
        const now = new Date();
        localStorage.setItem('lastSyncTime', now.toISOString());

        setSyncStatus({
          lastSyncTime: now,
          uploaded: result.uploaded,
          downloaded: 0,
          synced: 0,
          errors: result.errors || 0
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
  }, [readableId]);

  /** Force download all (overwrite local) */
  const forceDownloadAll = useCallback(async () => {
    if (!readableId) {
      const msg = 'User not authenticated';
      setError(msg);
      return { success: false, error: msg };
    }

    setIsSyncing(true);
    setError(null);

    try {
      // ⚠️ El servicio ya descarga y guarda en localStorage.
      const result = await syncService.forceDownloadAll(readableId);

      if (result.success) {
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
        setError(result.error || 'Download failed');
      }

      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSyncing(false);
    }
  }, [readableId]);

  /** Get sync status for one exercise */
  const getExerciseStatus = useCallback(async (exId) => {
    if (!readableId) return { synced: false, localOnly: true };
    return syncService.getStatus(readableId, exId);
  }, [readableId]);

  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    isSyncing,
    syncStatus,
    error,
   isAuthenticated: !!readableId,
    // Actions
    syncAll,
    syncSingle,
    forceUploadAll,
    forceDownloadAll,
    getExerciseStatus,
    clearError
  };
};
