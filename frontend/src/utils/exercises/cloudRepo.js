import { db } from '../../config/firebase';
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc,
  query, orderBy, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { toFirestoreExercise, fromFirestoreExercise } from './serializers';

function exDocRef(readableUserId, exId) {
  return doc(db, 'users', readableUserId, 'exercises', String(exId));
}

export const cloudRepo = {
  async getOne(readableUserId, exId) {
    const snap = await getDoc(exDocRef(readableUserId, exId));
    if (!snap.exists()) return null;
    return fromFirestoreExercise(snap.data());
  },

  async listAll(readableUserId) {
    const q = query(collection(db, 'users', readableUserId, 'exercises'), orderBy('lastUpdated', 'desc'));
    const qs = await getDocs(q);
    const out = {};
    qs.forEach((d) => { out[d.id] = fromFirestoreExercise(d.data()); });
    return out;
  },

  async upsert(readableUserId, exId, localExercise) {
    const payload = toFirestoreExercise(localExercise);
    await setDoc(exDocRef(readableUserId, exId), {
      ...payload,
      lastUpdated: serverTimestamp(),
      syncedAt: serverTimestamp(),
    });
  },

  async upsertMany(readableUserId, mapIdToLocal) {
    const batch = writeBatch(db);
    Object.entries(mapIdToLocal).forEach(([exId, localExercise]) => {
      const ref = exDocRef(readableUserId, exId);
      const payload = toFirestoreExercise(localExercise);
      batch.set(ref, { ...payload, lastUpdated: serverTimestamp(), syncedAt: serverTimestamp() });
    });
    await batch.commit();
  },

  async remove(readableUserId, exId) {
    await deleteDoc(exDocRef(readableUserId, exId));
  }
};
