
import { useState, useEffect } from 'react';
import { getGoals } from '@/services/goals';
import type { Goal } from '@/lib/types';
import { useAuth } from './use-auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(true);
        try {
          const unsubscribeSnap = getGoals((newGoals) => {
            setGoals(newGoals);
            setLoading(false);
          });
          return () => unsubscribeSnap();
        } catch (e) {
          setError(e as Error);
          setLoading(false);
        }
      } else {
        setGoals([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [user]);

  return { goals, loading, error };
}
