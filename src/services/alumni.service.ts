import { collection, query, where, orderBy, getDocs, doc, getDoc, limit, collectionGroup } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types/user';
import { Answer } from '../types/answer';
import { Question } from '../types/question';

export interface AlumniFilters {
  department?: string;
  graduationYear?: number;
}

export interface AlumniProfile extends User {
  answerCount: number;
  acceptedAnswerCount: number;
}

export interface AlumniAnswer {
  answer: Answer;
  question: Question;
}

export async function getAllAlumni(filters?: AlumniFilters): Promise<User[]> {
  const usersRef = collection(db, 'users');
  let q = query(
    usersRef,
    where('role', '==', 'expert'),
    where('verificationStatus', '==', 'verified'),
    orderBy('displayName')
  );

  if (filters?.department) {
    q = query(q, where('alumniProfile.branch', '==', filters.department));
  }

  if (filters?.graduationYear) {
    q = query(q, where('alumniProfile.graduationYear', '==', filters.graduationYear));
  }

  const querySnapshot = await getDocs(q);
  const alumni: User[] = [];

  querySnapshot.forEach((doc) => {
    alumni.push(doc.data() as User);
  });

  return alumni;
}

export async function getAlumniProfile(alumniId: string): Promise<AlumniProfile> {
  const userDoc = await getDoc(doc(db, 'users', alumniId));
  if (!userDoc.exists()) {
    throw new Error('Alumni not found');
  }

  const userData = userDoc.data() as User;

  // Get answer counts using collection group query
  const answersRef = collectionGroup(db, 'answers');
  const answersQuery = query(
    answersRef,
    where('authorId', '==', alumniId)
  );
  const answersSnapshot = await getDocs(answersQuery);

  let answerCount = 0;
  let acceptedAnswerCount = 0;

  answersSnapshot.forEach((doc) => {
    const answerData = doc.data();
    answerCount++;
    if (answerData.isAccepted) {
      acceptedAnswerCount++;
    }
  });

  return {
    ...userData,
    answerCount,
    acceptedAnswerCount,
  };
}

export async function getAlumniAnswers(alumniId: string, limitCount: number = 10): Promise<AlumniAnswer[]> {
  // Get answers using collection group query
  const answersRef = collectionGroup(db, 'answers');
  const answersQuery = query(
    answersRef,
    where('authorId', '==', alumniId),
    orderBy('isAccepted', 'desc'),
    orderBy('likeCount', 'desc'),
    limit(limitCount)
  );

  const answersSnapshot = await getDocs(answersQuery);
  const alumniAnswers: AlumniAnswer[] = [];

  for (const answerDoc of answersSnapshot.docs) {
    const answerData = answerDoc.data();

    // Get the question document using the parent path
    const questionPath = answerDoc.ref.parent.parent?.path;
    if (questionPath) {
      const questionDoc = await getDoc(doc(db, questionPath));
      if (questionDoc.exists()) {
        const questionData = questionDoc.data() as Question;
        alumniAnswers.push({
          answer: {
            id: answerDoc.id,
            ...answerData,
          } as Answer,
          question: {
            id: questionDoc.id,
            ...questionData,
          } as Question,
        });
      }
    }
  }

  return alumniAnswers;
}
