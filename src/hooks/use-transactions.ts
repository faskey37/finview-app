
import { useState, useEffect } from 'react';
import { getTransactions } from '@/services/transactions';
import type { Transaction } from '@/lib/types';
import { useAuth } from '../hooks/use-auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
     const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(true);
        try {
          const unsubscribeSnap = getTransactions((newTransactions) => {
            setTransactions(newTransactions);
            setLoading(false);
          });
          return () => unsubscribeSnap();
        } catch (e) {
          setError(e as Error);
          setLoading(false);
        }
      } else {
        setTransactions([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [user]);

  return { transactions, loading, error };
}
