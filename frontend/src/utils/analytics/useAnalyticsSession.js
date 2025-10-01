import { useState, useEffect } from 'react';
import { getSessionId } from '../../utils/analytics/sessionManager';
import { initializeUserSession } from '../../utils/analytics/firestoreOperations';

export const useAnalyticsSession = (readableUserId, isEnabled) => {
  const [sessionId] = useState(() => getSessionId());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!readableUserId || !isEnabled) return;

    const initialize = async () => {
      try {
        const isNewSession = await initializeUserSession(readableUserId, sessionId);
        setIsInitialized(true);
        
        if (isNewSession) {
          console.log('New session created:', sessionId);
        } else {
          console.log('Session already exists:', sessionId);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };

    initialize();
  }, [readableUserId, sessionId, isEnabled]);

  return { sessionId, isInitialized };
};