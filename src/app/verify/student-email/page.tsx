'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';

export default function StudentEmailVerificationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get('token') : null;

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Verification via token state
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);

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
      const sendVerificationEmail = httpsCallable(functions, 'sendStudentVerificationEmail');
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

  // If there's a token in the URL, attempt verification
  useEffect(() => {
    console.log('verifyEffect state', { token, userExists: !!user, verifying, verifySuccess });
    if (!token) return;

    // Must be authenticated to verify
    if (!user) {
      console.log('verifyEffect: no user, redirecting to /login');
      router.push('/login');
      return;
    }

    if (user.verificationStatus === 'verified') {
      console.log('verifyEffect: user already verified, skipping');
      return;
    }

    // Avoid double-run
    if (verifying || verifySuccess) {
      console.log('verifyEffect: skipping due to verifying or success', { verifying, verifySuccess });
      return;
    }

    const runVerify = async () => {
      setVerifying(true);
      setVerifyError('');
      console.log('About to call verifyStudentEmail with token:', token);
      console.log('verifyStudentEmail: calling with token', token);
      try {
        const verifyFn = httpsCallable(functions, 'verifyStudentEmail');
        const res = await verifyFn({ token });
        console.log('verifyStudentEmail response', res);
        setVerifySuccess(true);
      } catch (err: any) {
        console.error('verifyStudentEmail error', err);
        setVerifyError(err?.message || 'Verification failed');
      } finally {
        setVerifying(false);
      }
    };

    runVerify();
  }, [token, user, router, verifying, verifySuccess]);

  // After successful verification, redirect to complete profile
  useEffect(() => {
    if (verifySuccess) {
      // Redirect to profile completion for next step
      router.push('/profile/complete');
    }
  }, [verifySuccess, router]);

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
          {verifying ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"></path>
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Verifying...</h3>
              <p className="mt-1 text-sm text-gray-500">Please wait while we verify the token.</p>
            </div>
          ) : verifySuccess ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Email verified</h3>
              <p className="mt-1 text-sm text-gray-500">Your email has been successfully verified.</p>
              <p className="mt-4 text-sm text-gray-600">
                After clicking the verification link in your email, you'll be automatically redirected to complete your profile.
              </p>
            </div>
          ) : sent ? (
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
              <p className="mt-4 text-sm text-gray-600">
                After clicking the verification link in your email, you'll be automatically redirected to your dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {verifyError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {verifyError}
                </div>
              )}
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
