// utils/analytics/firestoreOperations.js  (SAFE FRONTEND VERSION)
import { db } from '../../config/firebase';
import {
  doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp,
} from 'firebase/firestore';

/**
 * Inicializa (o asegura) la sesión del usuario bajo:
 *   users/{readableUserId}/sessions/{sessionId}
 * No toca índices ni colecciones bloqueadas.
 */
export const initializeUserSession = async (readableUserId, sessionId) => {
  if (!readableUserId || !sessionId) return false;

  // Asegura el doc base del usuario (sin PII)
  const userRef = doc(db, 'users', readableUserId);
  await setDoc(
    userRef,
    { readableId: readableUserId, updatedAt: serverTimestamp() },
    { merge: true }
  );

  const sessionRef = doc(db, 'users', readableUserId, 'sessions', sessionId);
  const snap = await getDoc(sessionRef);

  if (!snap.exists()) {
    await setDoc(sessionRef, {
      sessionId,
      sessionStart: serverTimestamp(),
      lastActivity: serverTimestamp(),
      actions: [],
    });
    return true; // nueva sesión
  }
  return false; // ya existía
};

/**
 * Agrega una acción a la sesión.
 * No enviar email/displayName aquí (evitar PII).
 */
export const logActionToFirestore = async (readableUserId, sessionId, actionEntry) => {
  if (!readableUserId || !sessionId) return;
  const sessionRef = doc(db, 'users', readableUserId, 'sessions', sessionId);
  await updateDoc(sessionRef, {
    actions: arrayUnion(actionEntry),
    lastActivity: serverTimestamp(),
  });
};
