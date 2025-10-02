import { useState, useEffect } from 'react';
import { getOrCreateReadableId } from '../../utils/analytics/firestoreOperations';
import { generateReadableUserId } from '../../utils/analytics/readableIdGenerator';

export const useReadableUserId = (userId) => {
  const [readableUserId, setReadableUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setReadableUserId(null);
      setIsLoading(false);
      return;
    }

    const fetchReadableId = async () => {
      setIsLoading(true);
      try {
        const id = await getOrCreateReadableId(userId, generateReadableUserId);
        setReadableUserId(id);
        console.log('✅ Readable user ID loaded:', id);
      } catch (err) {
        console.error('Error fetching readable ID:', err);
        // fallback al UID si algo falla
        setReadableUserId(userId);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadableId();
  }, [userId]);

  return { readableUserId, isLoading };
};
