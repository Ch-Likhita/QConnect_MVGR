'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';

export default function VerificationPendingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold">Verification Pending</h2>
        <p className="mt-4 text-gray-600">Your verification is being reviewed by the admins. We&apos;ll notify you when it&apos;s complete.</p>
        <div className="mt-6">
          <button onClick={() => router.push('/home')} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Go to Home</button>
        </div>
      </div>
    </div>
  );
}
