import { Timestamp } from 'firebase/firestore';

export interface Answer {
  id?: string;
  body: string;
  authorId: string;
  authorRole: 'expert' | 'moderator';
  isAccepted: boolean;
  likeCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}