'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';

export default function RecruiterVerificationRequestPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    position: '',
    companyEmail: '',
    linkedinUrl: '',
    companyWebsite: '',
    purpose: '',
    proofLinks: [] as string[],
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProofLinkChange = (index: number, value: string) => {
    const newProofLinks = [...formData.proofLinks];
    newProofLinks[index] = value;
    setFormData(prev => ({ ...prev, proofLinks: newProofLinks }));
  };

  const addProofLink = () => {
    setFormData(prev => ({ ...prev, proofLinks: [...prev.proofLinks, ''] }));
  };

  const removeProofLink = (index: number) => {
    const newProofLinks = formData.proofLinks.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, proofLinks: newProofLinks }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName || !formData.companyName || !formData.position ||
        !formData.companyEmail || !formData.linkedinUrl || !formData.companyWebsite ||
        !formData.purpose) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.proofLinks.length < 1) {
      setError('Please provide at least one proof document');
      return;
    }

    // Check if company email is not personal
    if (formData.companyEmail.includes('gmail.com') || formData.companyEmail.includes('yahoo.com') ||
        formData.companyEmail.includes('hotmail.com')) {
      setError('Please use your work email address, not a personal email');
      return;
    }

    setSubmitting(true);
    try {
      const submitVerificationRequest = httpsCallable(functions, 'submitVerificationRequest');
      await submitVerificationRequest({
        role: 'recruiter',
        ...formData,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  if (user.role !== 'recruiter') {
    router.push('/verify/role-select');
    return null;
  }

  if (user.verificationStatus === 'verified') {
    router.push('/profile/complete');
    return null;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Request Submitted!</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your recruiter access request has been submitted for admin review.
            </p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => router.push('/profile/complete')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Complete Your Profile
              </button>
              <button
                onClick={() => router.push('/verify/pending')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="md:grid md:grid-cols-1 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recruiter Access Request</h3>
              <p className="mt-1 text-sm text-gray-600">
                Please provide your company details for verification. We&apos;ll review your request within 24-48 hours.
              </p>
            </div>
          </div>

          <div className="mt-5 md:col-span-2 md:mt-0">
            <form onSubmit={handleSubmit}>
              <div className="overflow-hidden shadow sm:rounded-md">
                <div className="bg-white px-4 py-5 sm:p-6">
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        id="companyName"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.companyName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                        Your Position/Title *
                      </label>
                      <input
                        type="text"
                        name="position"
                        id="position"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.position}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700">
                        Company Email *
                      </label>
                      <input
                        type="email"
                        name="companyEmail"
                        id="companyEmail"
                        required
                        placeholder="your.name@company.com"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.companyEmail}
                        onChange={handleInputChange}
                      />
                      <p className="mt-1 text-sm text-gray-500">Must be a work email, not personal</p>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
                        LinkedIn Profile *
                      </label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        id="linkedinUrl"
                        required
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700">
                        Company Website *
                      </label>
                      <input
                        type="url"
                        name="companyWebsite"
                        id="companyWebsite"
                        required
                        placeholder="https://company.com"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.companyWebsite}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                        Purpose of Access *
                      </label>
                      <textarea
                        name="purpose"
                        id="purpose"
                        required
                        rows={3}
                        placeholder="Explain why you need access to the platform (e.g., hiring MVGR graduates, campus recruitment, etc.)"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.purpose}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-span-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proof of Employment * (at least one required)
                      </label>
                      {formData.proofLinks.map((link, index) => (
                        <div key={index} className="flex mb-2">
                          <input
                            type="url"
                            placeholder="Link to company ID, offer letter, or LinkedIn profile"
                            className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={link}
                            onChange={(e) => handleProofLinkChange(index, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeProofLink(index)}
                            className="px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 rounded-r-md text-gray-500 hover:bg-gray-100"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addProofLink}
                        className="mt-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        + Add Proof Link
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Request Access'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
