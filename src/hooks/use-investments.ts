
import { useState, useEffect } from 'react';
import { getInvestments } from '@/services/investments';
import type { Investment } from '@/lib/types';
import { useAuth } from './use-auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(true);
        try {
          const unsubscribeSnap = getInvestments((newInvestments) => {
            setInvestments(newInvestments);
            setLoading(false);
          });
          return () => unsubscribeSnap();
        } catch (e) {
          setError(e as Error);
          setLoading(false);
        }
      } else {
        setInvestments([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [user]);

  return { investments, loading, error };
}
