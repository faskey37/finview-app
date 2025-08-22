
import { useState, useEffect } from 'react';
import { getAccounts } from '@/services/accounts';
import type { Account } from '@/lib/types';
import { useAuth } from '../hooks/use-auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(true);
        try {
          const unsubscribeSnap = getAccounts((newAccounts) => {
            setAccounts(newAccounts);
            setLoading(false);
          });
          return () => unsubscribeSnap();
        } catch (e) {
          setError(e as Error);
          setLoading(false);
        }
      } else {
        setAccounts([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [user]);

  return { accounts, loading, error };
}
