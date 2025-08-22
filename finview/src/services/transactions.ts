
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';

const getTransactionsCollection = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in");
    return collection(db, 'users', userId, 'transactions');
}

// Add a new transaction
export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  try {
    const docRef = await addDoc(getTransactionsCollection(), transaction);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to add transaction");
  }
};

// Get real-time updates on transactions
export const getTransactions = (callback: (transactions: Transaction[]) => void) => {
    if (!auth.currentUser) {
        callback([]);
        return () => {};
    }
    const transactionsCollection = getTransactionsCollection();
    const q = query(transactionsCollection, orderBy('date', 'desc'));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const transactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        callback(transactions);
    }, (error) => {
        console.error("Error fetching transactions:", error);
    });

    return unsubscribe;
};

// Delete a transaction
export const deleteTransaction = async (id: string) => {
    try {
        const docRef = doc(getTransactionsCollection(), id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Failed to delete transaction");
    }
};
