import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { hashUserId } from './readableIdGenerator';

export const getOrCreateReadableId = async (userId, generateFn) => {
  if (!userId) return null;
  
  try {
    const hashedUserId = await hashUserId(userId);
    const userMappingRef = doc(db, 'user_id_mappings', hashedUserId);
    const userMappingSnap = await getDoc(userMappingRef);
    
    if (userMappingSnap.exists() && userMappingSnap.data().readableId) {
      return userMappingSnap.data().readableId;
    }
    
    const readableId = generateFn(userId);
    
    await setDoc(userMappingRef, {
      readableId: readableId,
      createdAt: serverTimestamp()
    });
    
    return readableId;
  } catch (error) {
    console.error('Error getting readable user ID:', error);
    return generateFn(userId);
  }
};

export const initializeUserSession = async (readableUserId, sessionId) => {
  const userDocRef = doc(db, 'users', readableUserId);
  const userDocSnap = await getDoc(userDocRef);
  
  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {
      userId: readableUserId,
      createdAt: serverTimestamp()
    });
  }
  
  const sessionDocRef = doc(db, 'users', readableUserId, 'sessions', sessionId);
  const sessionDocSnap = await getDoc(sessionDocRef);
  
  if (!sessionDocSnap.exists()) {
    await setDoc(sessionDocRef, {
      sessionId: sessionId,
      sessionStart: serverTimestamp(),
      lastActivity: serverTimestamp(),
      actions: []
    });
    return true; // New session created
  }
  
  return false; // Session already exists
};

export const logActionToFirestore = async (readableUserId, sessionId, actionEntry) => {
  const sessionDocRef = doc(db, 'users', readableUserId, 'sessions', sessionId);
  
  await updateDoc(sessionDocRef, {
    actions: arrayUnion(actionEntry),
    lastActivity: serverTimestamp()
  });
};