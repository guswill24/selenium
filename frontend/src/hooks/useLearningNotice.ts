import { useCallback, useState } from 'react';
import { readSession, removeSession, storageKeys } from '../utils/storage.ts';

/** The notice is pending from login (AuthProvider) until accepted; it survives reloads in the same tab. */
export function useLearningNotice() {
  const [open, setOpen] = useState(() => readSession(storageKeys.learningNotice) === 'pending');
  const accept = useCallback(() => {
    removeSession(storageKeys.learningNotice);
    setOpen(false);
  }, []);
  return { open, accept };
}
