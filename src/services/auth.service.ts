import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function waitForUserDocument(uid: string): Promise<boolean> {
  const maxAttempts = 20; // 10 seconds at 500ms intervals
  const interval = 500;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return true;
      }
    } catch (error) {
      console.error('Error checking user document:', error);
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return false; // Timeout
}
