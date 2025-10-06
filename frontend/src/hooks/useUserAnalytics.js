// hooks/useUserAnalytics.js
import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/authContext';
import { useAnalyticsSession } from '../utils/analytics/useAnalyticsSession';
import { useAnalyticsLogger } from '../utils/analytics/useAnalyticsLogger';
import { clearSession } from '../utils/analytics/sessionManager';

export const clearAnalyticsSession = clearSession;

/**
 * No recibe userId. Lee readableId desde AuthContext (backend).
 */
export const useUserAnalytics = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  const { currentUser, isAuthContextLoading } = useAuthContext();
  const readableUserId = currentUser?.readableId || null;

  // Inicializa sesión de analytics usando el readableId del backend
  const { sessionId, isInitialized } = useAnalyticsSession(readableUserId, isEnabled);

  // Listo para loggear cuando:
  // - analytics está habilitado
  // - sesión está inicializada
  // - hay readableId del backend
  // - el AuthContext ya terminó de cargar
  const canLog = isEnabled && isInitialized && !!readableUserId && !isAuthContextLoading;

  const loggers = useAnalyticsLogger(readableUserId, sessionId, canLog);

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
