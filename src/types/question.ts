import { Timestamp } from 'firebase/firestore';

export interface Question {
  id?: string;
  title: string;
  body: string;
  authorId: string;
  authorRole: 'student' | 'expert';
  tags: string[];
  status: 'open' | 'answered' | 'closed';
  answerCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}