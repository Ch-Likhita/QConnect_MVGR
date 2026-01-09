'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { subscribeToAnswers } from '../../../../services/answers.services';
import { useAuth } from '../../../../hooks/useAuth';
import RoleBadge from '../../../../components/common/RoleBadge';
import VerifiedBadge from '../../../../components/common/VerifiedBadge';
import AnswerCard from '../../../../components/questions/AnswerCard';
import { Question } from '../../../../types/question';
import { Answer } from '../../../../types/answer';
import { Check, ThumbsUp } from 'lucide-react';

export default function QuestionPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, userProfile } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const qDoc = await getDoc(doc(db, 'questions', id));
        if (qDoc.exists()) {
          setQuestion({ id: qDoc.id, ...qDoc.data() } as Question);
        }
      } catch (e) {
        console.error("Error loading question:", e);
      }
      setLoading(false);
    };
    if (!id) return;

    fetchData();

    const unsubscribe = subscribeToAnswers(id, (answers) => {
      // Sort answers: isAccepted desc, then likeCount desc
      const sortedAnswers = answers.sort((a, b) => {
        if (a.isAccepted !== b.isAccepted) {
          return b.isAccepted ? 1 : -1;
        }
        return b.likeCount - a.likeCount;
      });
      setAnswers(sortedAnswers);
    });

    return () => unsubscribe?.();
  }, [id]);

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile || !id) return;

    try {
      await addDoc(collection(db, 'questions', id, 'answers'), {
        body: newAnswer,
        authorId: user.uid,
        authorRole: userProfile.role,
        isAccepted: false,
        likeCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewAnswer('');
      // Real-time updates handled by subscribeToAnswers
    } catch (err) {
      console.error(err);
    }
  };



  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!question) return <div className="p-10 text-center">Question not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Question Header */}
      <div className="bg-white shadow sm:rounded-lg p-6 mb-6 border-l-4 border-indigo-600">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{question.title}</h1>
        <div className="flex space-x-2 mb-4">
           {question.tags.map(t => <span key={t} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">#{t}</span>)}
        </div>
        <div className="prose max-w-none text-gray-800 mb-6 whitespace-pre-wrap">
          {question.body}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
          <span>Posted by Author ID: {question.authorId.substring(0,6)}...</span>
          <span>{new Date((question.createdAt as any)?.seconds * 1000).toLocaleDateString()}</span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-4">{answers.length} Answers</h3>

      {/* Answer List */}
      <div className="space-y-6 mb-10">
        {answers.map(ans => (
          <AnswerCard
            key={ans.id}
            answer={ans}
            questionId={id}
          />
        ))}
      </div>

      {/* Post Answer Form */}
      {userProfile && userProfile.verificationStatus === 'verified' ? (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Write an Answer</h3>
          <form onSubmit={handlePostAnswer}>
            <textarea
              className="w-full border rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500"
              rows={5}
              placeholder="Share your expertise..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              required
            ></textarea>
            <button type="submit" className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Post Answer
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600">
          Only verified experts can answer questions.
        </div>
      )}
    </div>
  );
}