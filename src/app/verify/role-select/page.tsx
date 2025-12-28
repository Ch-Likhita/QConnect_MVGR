'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function RoleSelectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'student' | 'expert' | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = async (role: 'student' | 'expert') => {
    setSelectedRole(role);
    setError('');
    setUpdating(true);

    try {
      if (!user) throw new Error('User not authenticated');

      // Update user role in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        role,
        updatedAt: new Date(),
      });

      // Redirect based on selected role
      if (role === 'student') {
        router.push('/verify/student-email');
      } else if (role === 'expert') {
        router.push('/verify/alumni-request');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  // Redirect if role already selected
  if (user.role && user.role !== 'student' && user.role !== 'expert') {
    router.push('/profile/complete');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Choose Your Role
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Select whether you are a student or an expert to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('student')}
              disabled={updating}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {updating && selectedRole === 'student' ? 'Updating...' : 'I am a Student'}
            </button>

            <button
              onClick={() => handleRoleSelect('expert')}
              disabled={updating}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {updating && selectedRole === 'expert' ? 'Updating...' : 'I am an Expert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
