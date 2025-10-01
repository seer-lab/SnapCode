import { useState,useEffect } from 'react';
import { useReadableUserId } from '../utils/analytics/useReadableUserID';
import { useAnalyticsSession } from '../utils/analytics/useAnalyticsSession';
import { useAnalyticsLogger } from '../utils/analytics/useAnalyticsLogger';
import { clearSession } from '../utils/analytics/sessionManager';

export const clearAnalyticsSession = clearSession;

export const useUserAnalytics = (userId) => {
  const [isEnabled, setIsEnabled] = useState(true);
  
  const { readableUserId, isLoading: userIdLoading } = useReadableUserId(userId);
  const { sessionId, isInitialized } = useAnalyticsSession(readableUserId, isEnabled);
  
  // Solo crear loggers cuando TODO esté listo
  const canLog = isEnabled && isInitialized && readableUserId && !userIdLoading;
  const loggers = useAnalyticsLogger(readableUserId, sessionId, canLog);

  // Log cuando esté listo
  useEffect(() => {
    if (canLog) {
      console.log('Analytics ready - User:', readableUserId, 'Session:', sessionId);
    }
  }, [canLog, readableUserId, sessionId]);

  return {
    ...loggers,
    toggleAnalytics: setIsEnabled,
    isEnabled,
    sessionId,
    readableUserId,
    isReady: canLog
  };
};