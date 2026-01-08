'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from '../../../lib/firebase';

export default function StudentEmailVerificationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get('token') : null;

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!email.endsWith('@mvgrce.edu.in')) {
      setError('Please use your official MVGR college email address');
      return;
    }

    setSending(true);
    try {
      const funcs = getFunctionsInstance();
      if (!funcs) throw new Error('Client only');
      const sendVerificationEmail = httpsCallable(funcs, 'sendStudentVerificationEmail');
      const response = await sendVerificationEmail({ email });
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      const token = (response.data as any).token;
      console.log('Extracted token:', token);

      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setSending(false);
    }
  };





  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  // Redirect if not student or already verified
  if (user.role !== 'student') {
    router.push('/verify/role-select');
    return null;
  }

  if (user.verificationStatus === 'verified') {
    router.push('/home');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Verify Your College Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your official MVGR college email to get started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Check your email</h3>
              <p className="mt-1 text-sm text-gray-500">
                We&apos;ve sent a verification link to {email}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Didn&apos;t receive the email? Check your spam folder or try again in 60 seconds.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  College Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="your.name@mvgrce.edu.in"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Must end with @mvgrce.edu.in
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Verification Email'}
                </button>
              </div>
            </form>
          ) }
        </div>
      </div>
    </div>
  );
}
