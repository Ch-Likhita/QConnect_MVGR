'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getAlumniProfile, getAlumniAnswers, AlumniProfile, AlumniAnswer } from '../../../services/alumni.service';
import AnswerCard from '../../../components/AnswerCard';

export default function AlumniProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [answers, setAnswers] = useState<AlumniAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('answers');
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchAnswers();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      const data = await getAlumniProfile(id as string);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAnswers = async () => {
    try {
      const data = await getAlumniAnswers(id as string, 10);
      setAnswers(data);
    } catch (error) {
      console.error('Error fetching answers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-gray-300 rounded"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">Alumni profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {getInitials(profile.displayName)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
                <p className="text-gray-600">{profile.alumniProfile?.currentRole} at {profile.alumniProfile?.currentCompany}</p>
              </div>
            </div>
            {/* Mentorship request functionality to be implemented */}
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Education</h3>
              <p className="text-gray-700">{profile.alumniProfile?.degree} in {profile.alumniProfile?.branch}</p>
              <p className="text-gray-600">Graduated in {profile.alumniProfile?.graduationYear}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience</h3>
              <p className="text-gray-700">{profile.alumniProfile?.yearsOfExperience} years</p>
              <p className="text-gray-600">{profile.alumniProfile?.careerDomain}</p>
            </div>
          </div>

          {/* Expertise */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Expertise Areas</h3>
            <div className="flex flex-wrap gap-2">
              {profile.alumniProfile?.skills?.map((skill, index) => (
                <span key={index} className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Bio Placeholder */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
            <p className="text-gray-600 italic">Bio information will be added soon.</p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{profile.answerCount}</div>
              <div className="text-gray-600">Total Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{profile.acceptedAnswerCount}</div>
              <div className="text-gray-600">Accepted Answers</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('answers')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'answers'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recent Answers ({answers.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'answers' && (
              <div>
                {answers.length > 0 ? (
                  answers.map((alumniAnswer, index) => (
                    <AnswerCard key={index} alumniAnswer={alumniAnswer} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No answers yet.</p>
                )}
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}
