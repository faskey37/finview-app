
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import type { Account } from '@/lib/types';

// Add a new account
export const addAccount = async (account: Omit<Account, 'id'>) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not logged in. Cannot add account.");
  try {
    const accountsCollection = collection(db, 'users', userId, 'accounts');
    const docRef = await addDoc(accountsCollection, account);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Failed to add account");
  }
};

// Get real-time updates on accounts
export const getAccounts = (callback: (accounts: Account[]) => void, errorCallback: (error: Error) => void) => {
  const user = auth.currentUser;
  if (!user) {
      callback([]);
      return () => {};
  }
  const accountsCollection = collection(db, 'users', user.uid, 'accounts');
  const q = query(accountsCollection);
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const accounts: Account[] = [];
    querySnapshot.forEach((doc) => {
      accounts.push({ id: doc.id, ...doc.data() } as Account);
    });
    callback(accounts);
  }, (error) => {
    console.error("Error fetching accounts:", error);
    errorCallback(error);
  });

  return unsubscribe;
};

// Update an account
export const updateAccount = async (id: string, updates: Partial<Account>) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in. Cannot update account.");
    try {
        const docRef = doc(db, 'users', userId, 'accounts', id);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Failed to update account");
    }
}


// Delete an account
export const deleteAccount = async (id: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in. Cannot delete account.");
    try {
        const docRef = doc(db, 'users', userId, 'accounts', id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Failed to delete account");
    }
};
