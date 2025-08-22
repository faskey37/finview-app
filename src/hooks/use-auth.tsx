
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile, 
    User,
    sendPasswordResetEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    deleteUser
} from "firebase/auth";
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';

interface UserData {
    notifications?: {
        weeklySummary?: boolean;
        budgetAlerts?: boolean;
    }
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true, updateUserData: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data() as UserData);
                } else {
                    // Create user doc if it doesn't exist for some reason
                     await setDoc(userDocRef, { uid: user.uid, email: user.email, displayName: user.displayName }, { merge: true });
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateUserData = async (data: Partial<UserData>) => {
        if (!user) return;
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, data, { merge: true });
        setUserData(prevData => ({ ...prevData, ...data }));
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, updateUserData }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
}

export const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName });
    // Create a document for the user in the 'users' collection
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        notifications: {
            weeklySummary: false,
            budgetAlerts: true
        }
    });
    return user;
}

export const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
}

export const signOutUser = async () => {
    return signOut(auth);
}

export const updateUserProfile = async (profile: { displayName?: string, photoURL?: string }) => {
    if (!auth.currentUser) throw new Error("No user logged in to update.");
    await updateProfile(auth.currentUser, profile);
    // Also update the user document in Firestore
    await setDoc(doc(db, "users", auth.currentUser.uid), profile, { merge: true });
}

export const sendPasswordReset = async (email: string) => {
    return sendPasswordResetEmail(auth, email);
}

export const reauthenticate = async (email: string, password: string): Promise<void> => {
    if (!auth.currentUser) throw new Error("No user is currently signed in.");
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
};

export const deleteUserAccount = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently signed in.");

    try {
        // 1. Delete Firestore data
        const userDocRef = doc(db, 'users', user.uid);
        
        // Delete subcollections (transactions, accounts, budgets)
        const collectionsToDelete = ['transactions', 'accounts', 'budgets'];
        for (const subcollection of collectionsToDelete) {
            const subcollectionRef = collection(db, 'users', user.uid, subcollection);
            const querySnapshot = await getDocs(subcollectionRef);
            const batch = writeBatch(db);
            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }

        // Delete the user document itself
        await deleteDoc(userDocRef);

        // 2. Delete the user from Firebase Authentication
        await deleteUser(user);

    } catch (error) {
        console.error("Error deleting user account:", error);
        if ((error as any).code === 'auth/requires-recent-login') {
             throw new Error("This is a sensitive operation. Please log in again before deleting your account.");
        }
        throw new Error("An error occurred while deleting the account.");
    }
};
