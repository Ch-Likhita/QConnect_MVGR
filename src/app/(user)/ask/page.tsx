'use client';
import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function AskPage() {
  const { user, userProfile } = useAuth();
  const { push } = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 5) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (tags.length === 0) {
        alert("Please add at least one tag");
        return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'questions'), {
        title,
        body,
        authorId: user.uid,
        authorRole: user.role,
        tags,
        status: 'open',
        answerCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      push(`/question/${docRef.id}`);
    } catch (error) {
      console.error('Error adding document: ', error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Ask a Question</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <p className="text-sm text-gray-500 mb-2">Be specific and imagine you’re asking a question to another person.</p>
          <input
            type="text"
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="e.g. What is the best way to prepare for TCS interviews?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <p className="text-sm text-gray-500 mb-2">Include all the information someone would need to answer your question.</p>
          <textarea
            required
            rows={8}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <div className="flex space-x-2 mb-2">
             <input
                type="text"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Add a tag (e.g. placements)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
             />
             <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-gray-100 rounded-md">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Post Question'}
          </button>
        </div>
      </form>
    </div>
  );
}