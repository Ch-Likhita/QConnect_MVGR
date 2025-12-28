'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { User } from '../../../types/user';
import RoleBadge from '../../../components/common/RoleBadge';
import { notFound } from 'next/navigation';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', params.id));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          notFound();
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    notFound();
  }

  const renderProfileContent = () => {
    switch (user.role) {
      case 'student':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user.displayName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                  <p className="mt-1 text-sm text-gray-900">{user.studentProfile?.rollNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch/Department</label>
                  <p className="mt-1 text-sm text-gray-900">{user.studentProfile?.branch}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Academic Year</label>
                  <p className="mt-1 text-sm text-gray-900">{user.studentProfile?.currentAcademicYear}th Year</p>
                </div>
                {user.studentProfile?.currentCGPA && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CGPA</label>
                    <p className="mt-1 text-sm text-gray-900">{user.studentProfile.currentCGPA}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Primary Career Goal</label>
                  <p className="mt-1 text-sm text-gray-900">{user.studentProfile?.primaryCareerGoal}</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Interested Career Pathways</label>
                <div className="flex flex-wrap gap-2">
                  {user.studentProfile?.interestedCareerPathways.map((pathway, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {pathway}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {user.studentProfile?.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              {user.studentProfile?.currentAcademicYear === 4 && user.studentProfile.placementStatus && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Placement Status</label>
                  <p className="mt-1 text-sm text-gray-900">{user.studentProfile.placementStatus}</p>
                  {user.studentProfile.placementStatus === 'Placed' && user.studentProfile.companyName && (
                    <p className="mt-1 text-sm text-gray-900">Company: {user.studentProfile.companyName}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'alumni':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Alumni Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user.displayName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                  <p className="mt-1 text-sm text-gray-900">{user.alumniProfile?.graduationYear}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Degree & Branch</label>
                  <p className="mt-1 text-sm text-gray-900">{user.alumniProfile?.degree} in {user.alumniProfile?.branch}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Company/Organization</label>
                  <p className="mt-1 text-sm text-gray-900">{user.alumniProfile?.currentCompany}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Role/Designation</label>
                  <p className="mt-1 text-sm text-gray-900">{user.alumniProfile?.currentRole}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <p className="mt-1 text-sm text-gray-900">{user.alumniProfile?.yearsOfExperience} years</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Career Domain/Industry</label>
                  <p className="mt-1 text-sm text-gray-900">{user.alumniProfile?.careerDomain}</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {user.alumniProfile?.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Career Pathway Tags</label>
                <div className="flex flex-wrap gap-2">
                  {user.alumniProfile?.careerPathwayTags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {user.verificationStatus === 'verified' && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Verified Alumni
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 'faculty':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Faculty Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user.displayName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <p className="mt-1 text-sm text-gray-900">{user.facultyProfile?.department}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Designation</label>
                  <p className="mt-1 text-sm text-gray-900">{user.facultyProfile?.designation}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <p className="mt-1 text-sm text-gray-900">{user.facultyProfile?.yearsOfExperience} years</p>
                </div>
              </div>
              {user.facultyProfile?.subjectsTaught && user.facultyProfile.subjectsTaught.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subjects Taught</label>
                  <div className="flex flex-wrap gap-2">
                    {user.facultyProfile.subjectsTaught.map((subject, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Guidance Areas</label>
                <div className="flex flex-wrap gap-2">
                  {user.facultyProfile?.guidanceAreas.map((area, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              {user.facultyProfile?.moderatorStatus && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Moderator
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 'recruiter':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recruiter Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user.displayName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user.recruiterProfile?.companyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Type</label>
                  <p className="mt-1 text-sm text-gray-900">{user.recruiterProfile?.companyType}</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles Hiring For</label>
                <div className="flex flex-wrap gap-2">
                  {user.recruiterProfile?.rolesHiringFor.map((role, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              {user.recruiterProfile?.eligibleBranches && user.recruiterProfile.eligibleBranches.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Branches</label>
                  <div className="flex flex-wrap gap-2">
                    {user.recruiterProfile.eligibleBranches.map((branch, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {branch}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile</h2>
            <p className="text-gray-600">Profile information not available.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <RoleBadge role={user.role || 'unknown'} />
          </div>
        </div>
        {renderProfileContent()}
      </div>
    </div>
  );
}
