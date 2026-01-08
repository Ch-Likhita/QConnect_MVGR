import { collection, query, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Answer } from '../types/answer';

/**
 * Subscribes to real-time updates for answers of a specific question.
 * @param questionId - The ID of the question to fetch answers for
 * @param callback - Callback function called with updated answers array
 * @returns Unsubscribe function to stop listening to updates
 */
export const subscribeToAnswers = (
  questionId: string,
  callback: (answers: Answer[]) => void
): Unsubscribe => {
  try {
    const answersRef = collection(db, 'questions', questionId, 'answers');
    const answersQuery = query(answersRef);

    const unsubscribe = onSnapshot(
      answersQuery,
      (querySnapshot) => {
        const answers: Answer[] = [];
        querySnapshot.forEach((doc) => {
          const answerData = doc.data();
          answers.push({
            id: doc.id,
            ...answerData,
          } as Answer);
        });
        callback(answers);
      },
      (error) => {
        console.error('Error listening to answers:', error);
        // You might want to call callback with empty array or handle error in callback
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up answers subscription:', error);
    // Return a no-op unsubscribe function
    return () => {};
  }
};
