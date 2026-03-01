
import { useState, useEffect, useCallback } from 'react';
import { getAccounts, getAccounts as getAccountsFromSvc } from '@/services/accounts';
import type { Account } from '@/lib/types';
import { useAuth } from './use-auth';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchAccounts = useCallback(() => {
    let unsubscribe: () => void;

    if (user) {
      setLoading(true);
      unsubscribe = getAccounts(
        (newAccounts) => {
          setAccounts(newAccounts);
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
      setAccounts([]);
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
    const unsubscribe = fetchAccounts();
    return unsubscribe;
  }, [fetchAccounts]);
  
  const refreshAccounts = useCallback(async () => {
    // This is a mock refresh. In a real app, this would trigger a re-fetch from a Plaid-like service.
    setLoading(true);
    // Re-trigger the onSnapshot listener by calling the setup again
    const unsubscribe = getAccountsFromSvc(
        (newAccounts) => {
          setAccounts(newAccounts);
          setLoading(false);
        },
        (e) => {
          setError(e);
          setLoading(false);
        }
      );
    // Immediately unsubscribe to just get one refresh
    unsubscribe();
  }, [user]);


  return { accounts, loading, error, refreshAccounts };
}
