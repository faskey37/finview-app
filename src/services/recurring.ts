
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, where, getDocs } from 'firebase/firestore';
import type { RecurringTransaction, Subscription } from '@/lib/types';

const getRecurringCollection = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in");
    return collection(db, 'users', userId, 'recurring');
}

export const addRecurringTransaction = async (id: string, p0: { isActive: boolean; }, transaction: Omit<RecurringTransaction, 'id'>) => {
  try {
     const recurringCollection = getRecurringCollection();
    // Check if a subscription with the same name already exists
    const q = query(recurringCollection, where("description", "==", transaction.description));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        console.log(`Subscription "${transaction.description}" already exists. Skipping.`);
        return null;
    }

    const docRef = await addDoc(recurringCollection, transaction);
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

export const getSubscriptions = (
  callback: (subscriptions: Subscription[]) => void,
  errorCallback: (error: Error) => void
) => {
    if (!auth.currentUser) {
        callback([]);
        return () => {};
    }
    const recurringCollection = getRecurringCollection();
    const q = query(recurringCollection, where('type', '==', 'expense'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const subscriptions: Subscription[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as RecurringTransaction;
            subscriptions.push({
                id: doc.id,
                name: data.description,
                monthlyCost: data.amount,
                category: data.category,
                suggestion: data.suggestion
            });
        });
        callback(subscriptions);
    }, (error) => {
        console.error("Error fetching subscriptions:", error);
        errorCallback(error);
    });

    return unsubscribe;
};
