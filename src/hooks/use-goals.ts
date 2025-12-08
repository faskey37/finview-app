
import { useState, useEffect, useCallback } from 'react';
import { getGoals, getGoals as getGoalsFromSvc } from '@/services/goals';
import type { Goal } from '@/lib/types';
import { useAuth } from './use-auth.tsx';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchGoals = useCallback(() => {
    let unsubscribe: () => void;

    if (user) {
      setLoading(true);
      unsubscribe = getGoals(
        (newGoals) => {
          setGoals(newGoals);
          setLoading(false);
          setError(null);
        },
        (e) => {
          setError(e);
          setLoading(false);
        }
      );
    } else {
      // Not logged in, clear data and stop loading
      setGoals([]);
      setLoading(false);
    }

    // Cleanup subscription on component unmount or user change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  useEffect(() => {
    const unsubscribe = fetchGoals();
    return unsubscribe;
  }, [fetchGoals]);
  
  const refetch = useCallback(() => {
    fetchGoals();
  }, [fetchGoals]);


  return { goals, loading, error, refetch };
}
