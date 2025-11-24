import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';

// Add a new transaction
export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not logged in. Cannot add transaction.");
  
  try {
    const transactionsCollection = collection(db, 'users', userId, 'transactions');
    const docRef = await addDoc(transactionsCollection, { ...transaction, userId });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to add transaction");
  }
};

// Get real-time updates on transactions
export const getTransactions = (callback: (transactions: Transaction[]) => void, errorCallback: (error: Error) => void) => {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {}; // Return an empty unsubscribe function
  }

  const transactionsCollection = collection(db, 'users', user.uid, 'transactions');
  const q = query(transactionsCollection, orderBy('date', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const transactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });
    callback(transactions);
  }, (error) => {
    console.error("Error fetching transactions:", error);
    errorCallback(error);
  });

  return unsubscribe;
};


// Delete a transaction
export const deleteTransaction = async (id: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in. Cannot delete transaction.");
    
    try {
        const docRef = doc(db, 'users', userId, 'transactions', id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Failed to delete transaction");
    }
};
