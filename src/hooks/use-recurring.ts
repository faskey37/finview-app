
"use client";

import { useState, useEffect } from 'react';
import { getRecurringTransactions, getSubscriptions as getSubscriptionsFromService } from '@/services/recurring';
import type { RecurringTransaction, Subscription } from '@/lib/types';
import { useAuth } from './use-auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';


const getRecurringCollection = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in");
    return collection(db, 'users', userId, 'recurring');
}

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


export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsubscribe = getSubscriptionsFromService((newSubscriptions) => {
        setSubscriptions(newSubscriptions);
        setLoading(false);
      }, (e) => {
        setError(e);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setSubscriptions([]);
      setLoading(false);
    }
  }, [user]);
  
  const deleteSubscription = async (id: string) => {
     try {
        const docRef = doc(getRecurringCollection(), id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Failed to delete recurring transaction");
    }
  }

  return { subscriptions, loading, error, deleteSubscription };
}

    