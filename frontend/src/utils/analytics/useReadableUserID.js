import { useState, useEffect } from 'react';
import { getOrCreateReadableId } from '../../utils/analytics/firestoreOperations';
import { generateReadableUserId } from '../../utils/analytics/readableIdGenerator';

export const useReadableUserId = (userId) => {
  const [readableUserId, setReadableUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    const fetchReadableId = async () => {
      setIsLoading(true);
      const id = await getOrCreateReadableId(userId, generateReadableUserId);
      setReadableUserId(id);
      setIsLoading(false);
      console.log('Readable user ID loaded:', id);
    };
    
    fetchReadableId();
  }, [userId]);

  return { readableUserId, isLoading };
};