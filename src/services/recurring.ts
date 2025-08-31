
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc } from 'firebase/firestore';
import type { RecurringTransaction } from '@/lib/types';

const getRecurringCollection = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in");
    return collection(db, 'users', userId, 'recurring');
}

export const addRecurringTransaction = async (transaction: Omit<RecurringTransaction, 'id'>) => {
  try {
    const docRef = await addDoc(getRecurringCollection(), transaction);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to add recurring transaction");
  }
};

export const getRecurringTransactions = (callback: (transactions: RecurringTransaction[]) => void) => {
  if (!auth.currentUser) {
      callback([]);
      return () => {};
  }
  const recurringCollection = getRecurringCollection();
  const q = query(recurringCollection);
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const transactions: RecurringTransaction[] = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as RecurringTransaction);
    });
    callback(transactions);
  }, (error) => {
    console.error("Error fetching recurring transactions:", error);
  });

  return unsubscribe;
};

export const deleteRecurringTransaction = async (id: string) => {
    try {
        const docRef = doc(getRecurringCollection(), id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Failed to delete recurring transaction");
    }
};
