import { collection, query, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../lib/firebase';
import { Answer } from '../types/answer';

const functions = getFunctions();

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

/**
 * Increments the like count for a specific answer via Cloud Functions.
 * @param questionId The ID of the parent question
 * @param answerId The ID of the answer to like
 */
export const likeAnswer = async (questionId: string, answerId: string) => {
  try {
    const likeAnswerFn = httpsCallable(functions, 'likeAnswer');
    const result = await likeAnswerFn({ questionId, answerId });
    return result.data;
  } catch (error) {
    console.error("Error liking answer:", error);
    throw error;
  }
};
