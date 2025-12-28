'use client';
import { useAuth } from '../../../hooks/useAuth';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Question } from '../../../types/question';

export default function HomePage() {
  const { user, userProfile, loading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const qs: Question[] = [];
        querySnapshot.forEach((doc) => {
          qs.push({ id: doc.id, ...doc.data() } as Question);
        });
        setQuestions(qs);
      } catch (e) {
        console.error("Error fetching questions:", e);
      }
    };
    fetchQuestions();
  }, [user]);

  if (loading) return <div className="flex justify-center p-12">Loading...</div>;
  if (!user) return <div className="flex justify-center p-12">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.displayName}
          </h1>
          <p className="text-gray-500 mt-1">
            {user.role === 'student' ? 'Find answers to your academic doubts.' : 'Share your expertise with the community.'}
          </p>
        </div>
        <Link 
          href="/ask" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusCircle className="mr-2" size={16} />
          Ask Question
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Questions</h2>
          {questions.length === 0 ? <p className="text-gray-500">No questions yet. Be the first to ask!</p> : null}
          {questions.map((q) => (
            <div key={q.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <Link href={`/question/${q.id}`} className="text-xl font-semibold text-gray-900 hover:text-indigo-600">
                  {q.title}
                </Link>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${q.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {q.status}
                </span>
              </div>
              <p className="mt-2 text-gray-600 line-clamp-2">{q.body}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex space-x-2">
                  {q.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span>{q.answerCount} answers</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Topics</h3>
            <div className="flex flex-wrap gap-2">
              {['Placements', 'Computer Science', 'Career', 'Internships', 'Higher Studies'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm cursor-pointer hover:bg-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {user.verificationStatus === 'verified' && (
             <div className="bg-purple-50 border border-purple-200 shadow rounded-lg p-6">
               <h3 className="text-purple-900 font-medium mb-2">Expert Status</h3>
               <p className="text-purple-700 text-sm">You are a verified expert. Your answers carry the verified badge.</p>
             </div>
          )}

          {user.verificationStatus === 'unverified' && user.role === 'student' && (
            <div className="bg-yellow-50 border border-yellow-200 shadow rounded-lg p-6">
               <h3 className="text-yellow-900 font-medium mb-2">Become an Expert</h3>
               <p className="text-yellow-700 text-sm mb-3">Are you an alumni or faculty? Verify your profile to contribute answers.</p>
               <button className="text-sm font-medium text-yellow-800 underline">Request Verification</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}