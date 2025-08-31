
import { useState, useEffect } from 'react';
import { getRecurringTransactions } from '@/services/recurring';
import type { RecurringTransaction } from '@/lib/types';
import { useAuth } from './use-auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useRecurring() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(true);
        try {
          const unsubscribeSnap = getRecurringTransactions((newRecurring) => {
            setRecurring(newRecurring);
            setLoading(false);
          });
          return () => unsubscribeSnap();
        } catch (e) {
          setError(e as Error);
          setLoading(false);
        }
      } else {
        setRecurring([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [user]);

  return { recurring, loading, error };
}
