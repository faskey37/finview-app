
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc } from 'firebase/firestore';
import type { Account } from '@/lib/types';

const getAccountsCollection = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in");
    return collection(db, 'users', userId, 'accounts');
}

// Add a new account
export const addAccount = async (account: Omit<Account, 'id'>) => {
  try {
    const docRef = await addDoc(getAccountsCollection(), account);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to add account");
  }
};

// Get real-time updates on accounts
export const getAccounts = (callback: (accounts: Account[]) => void) => {
  if (!auth.currentUser) {
      callback([]);
      return () => {};
  }
  const accountsCollection = getAccountsCollection();
  const q = query(accountsCollection);
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const accounts: Account[] = [];
    querySnapshot.forEach((doc) => {
      accounts.push({ id: doc.id, ...doc.data() } as Account);
    });
    callback(accounts);
  }, (error) => {
    console.error("Error fetching accounts:", error);
    // You might want to handle this error in the UI
  });

  return unsubscribe;
};

// Delete an account
export const deleteAccount = async (id: string) => {
    try {
        const docRef = doc(getAccountsCollection(), id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Failed to delete account");
    }
};
