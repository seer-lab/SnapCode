import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'analytics_session_id';

export const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const clearSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
};