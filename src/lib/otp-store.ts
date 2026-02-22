// lib/otp-store.ts
import { db } from './firebase';
import { collection, doc, setDoc, getDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

class OTPStore {
  // Store OTP in Firestore
  async set(email: string, otp: string, expiresInMinutes: number = 10) {
    try {
      const otpRef = doc(db, 'otps', email.replace(/\./g, '_')); // Firestore doesn't allow dots in document IDs
      await setDoc(otpRef, {
        email,
        otp,
        expires: Date.now() + expiresInMinutes * 60 * 1000,
        createdAt: new Date().toISOString(),
      });
      console.log('OTP stored in Firestore for:', email);
    } catch (error) {
      console.error('Error storing OTP in Firestore:', error);
      throw error;
    }
  }

  // Get OTP from Firestore
  async get(email: string) {
    try {
      const otpRef = doc(db, 'otps', email.replace(/\./g, '_'));
      const otpDoc = await getDoc(otpRef);
      
      if (otpDoc.exists()) {
        return otpDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting OTP from Firestore:', error);
      return null;
    }
  }

  // Delete OTP from Firestore
  async delete(email: string) {
    try {
      const otpRef = doc(db, 'otps', email.replace(/\./g, '_'));
      await deleteDoc(otpRef);
      console.log('OTP deleted from Firestore for:', email);
    } catch (error) {
      console.error('Error deleting OTP from Firestore:', error);
    }
  }

  // Check if OTP exists
  async has(email: string): Promise<boolean> {
    const data = await this.get(email);
    return data !== null;
  }

  // Clean up expired OTPs (call this periodically)
  async cleanupExpired() {
    try {
      const otpsRef = collection(db, 'otps');
      const now = Date.now();
      const q = query(otpsRef, where('expires', '<', now));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`Cleaned up ${querySnapshot.size} expired OTPs`);
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}

// Export a singleton instance
export const otpStore = new OTPStore();