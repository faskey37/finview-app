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
    let unsubscribeSnap: (() => void) | null = null;
    console.log('transactions ', transactions)
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(true);
        try {
          unsubscribeSnap = getTransactions(
            (newTransactions) => {
              setTransactions(newTransactions);
              setLoading(false);
              setError(null);
            },
            (error: Error) => {
              setError(error);
              setLoading(false);
            }
          );
        } catch (e) {
          setError(e as Error);
          setLoading(false);
        }
      } else {
        setTransactions([]);
        setLoading(false);
        setError(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnap) {
        unsubscribeSnap();
      }
    };
  }, [user]);

  return { transactions, loading, error };
}