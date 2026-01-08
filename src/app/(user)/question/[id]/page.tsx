'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db, getFunctionsInstance } from '../../../../lib/firebase';
import { doc, getDoc, collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../hooks/useAuth';
import RoleBadge from '../../../../components/common/RoleBadge';
import VerifiedBadge from '../../../../components/common/VerifiedBadge';
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
          
          // Fetch answers
          const q = query(collection(db, 'questions', id, 'answers'), orderBy('isAccepted', 'desc'), orderBy('likeCount', 'desc'));
          const ansSnap = await getDocs(q);
          const ansList: Answer[] = [];
          ansSnap.forEach(d => ansList.push({ id: d.id, ...d.data() } as Answer));
          setAnswers(ansList);
        }
      } catch (e) {
        console.error("Error loading question:", e);
      }
      setLoading(false);
    };
    fetchData();
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
      // Ideally trigger cloud function updates here or rely on real-time listeners
      window.location.reload(); 
    } catch (err) {
      console.error(err);
    }
  };

  const likeAnswer = async (answerId: string) => {
     const functions = getFunctionsInstance();
     if (!functions) throw new Error('Client only');
     const likeFn = httpsCallable(functions, 'engagement-likeAnswer');
     try {
       await likeFn({ questionId: id, answerId });
       // reload or update local state
     } catch(e) { console.error(e); }
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
          <div key={ans.id} className={`bg-white shadow sm:rounded-lg p-6 ${ans.isAccepted ? 'border-2 border-green-500' : ''}`}>
            {ans.isAccepted && (
              <div className="flex items-center text-green-600 mb-2 text-sm font-bold">
                <Check size={16} className="mr-1" /> Accepted Solution
              </div>
            )}
            <div className="prose max-w-none text-gray-800 mb-4 whitespace-pre-wrap">{ans.body}</div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2">
                 <div className="font-medium text-sm text-gray-900">Expert User</div>
                 <RoleBadge role={ans.authorRole} />
                 <VerifiedBadge status="verified" />
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-gray-500 hover:text-indigo-600" onClick={() => ans.id && likeAnswer(ans.id)}>
                   <ThumbsUp size={16} className="mr-1" />
                   <span>{ans.likeCount}</span>
                </button>
              </div>
            </div>
          </div>
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