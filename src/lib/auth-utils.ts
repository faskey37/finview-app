import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  sendEmailVerification
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

// Define response type for better error handling
interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
}

// FIXED: Added missing signIn function
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if email is verified in Firestore
    // You can also check user.emailVerified from Firebase Auth
    
    return { 
      success: true, 
      message: 'Signed in successfully', 
      user: user 
    };
  } catch (error: any) {
    let message = 'Failed to sign in';
    
    switch (error.code) {
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
    }
    
    return { success: false, message };
  }
};

// FIXED: Added missing signInWithGoogle function
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const userCredential = await signInWithPopup(auth, provider);
    
    // Google users are automatically verified
    const userRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userRef, {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      isPro: false,
    }, { merge: true });
    
    return { 
      success: true, 
      message: 'Signed in successfully', 
      user: userCredential.user 
    };
  } catch (error: any) {
    let message = 'Failed to sign in with Google';
    
    if (error.code === 'auth/popup-closed-by-user') {
      message = 'Sign in was cancelled';
    } else if (error.code === 'auth/popup-blocked') {
      message = 'Popup was blocked by your browser. Please allow popups for this site';
    }
    
    return { success: false, message };
  }
};

export const signUp = async (email: string, password: string, displayName: string): Promise<AuthResponse> => {
  try {
    // Create the user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // DON'T wait too long - this might cause issues
    // Remove the 1 second delay
    
    // Create user document in Firestore (unverified)
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      isPro: false,
      currency: 'USD',
    });
    
    // Make sure user is still logged in
    if (!auth.currentUser) {
      console.error('User was signed out unexpectedly');
    }
    
    return { 
      success: true, 
      message: 'Account created! Please verify your email to continue.',
      user: user
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    let message = 'Failed to create account';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists. Please sign in instead.';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Please use a stronger password (min. 6 characters).';
        break;
      default:
        message = error.message || 'Failed to create account';
    }
    
    return { success: false, message };
  }
};
// Mark email as verified in Firestore
export const markEmailAsVerified = async (userId: string): Promise<AuthResponse> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      emailVerified: true,
      verifiedAt: new Date().toISOString(),
    });
    
    return { 
      success: true, 
      message: 'Email verified successfully' 
    };
  } catch (error: any) {
    console.error('Error marking email as verified:', error);
    return { 
      success: false, 
      message: 'Failed to update verification status' 
    };
  }
};

export const sendPasswordReset = async (email: string): Promise<AuthResponse> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { 
      success: true, 
      message: 'Password reset email sent. Please check your inbox.' 
    };
  } catch (error: any) {
    let message = 'Failed to send reset email';
    
    switch (error.code) {
      case 'auth/invalid-email':
        message = 'Please enter a valid email address';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Please try again later';
        break;
    }
    
    return { success: false, message };
  }
};

export const resendVerificationEmail = async (): Promise<AuthResponse> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, message: 'No user found' };
    }
    
    await sendEmailVerification(user);
    
    return { success: true, message: 'Verification email sent' };
  } catch (error: any) {
    console.error('Resend error:', error);
    return { success: false, message: 'Failed to send verification email' };
  }
};