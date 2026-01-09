'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from '../../../lib/firebase';

export default function CompleteProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get('token') : null;
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  
  console.log('User:', user);
  console.log('Loading:', loading);
  console.log('Role:', user?.role);

  // State for form fields
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Role-specific states (shown conditionally)
  // Student
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState<'CSE' | 'ECE' | 'EEE' | 'ME' | 'CIVIL'>('CSE');
  const [currentAcademicYear, setCurrentAcademicYear] = useState<1 | 2 | 3 | 4>(1);
  const [currentCGPA, setCurrentCGPA] = useState<number | undefined>();
  const [primaryCareerGoal, setPrimaryCareerGoal] = useState<'Internships' | 'Placements' | 'Higher Studies'>('Internships');
  const [interestedCareerPathways, setInterestedCareerPathways] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [placementStatus, setPlacementStatus] = useState<'Not Started' | 'Interviewing' | 'Placed' | undefined>();
  const [companyName, setCompanyName] = useState('');

  // Alumni
  const [graduationYear, setGraduationYear] = useState<number>(2020);
  const [degree, setDegree] = useState<'B.Tech' | 'M.Tech' | 'MBA'>('B.Tech');
  const [alumniBranch, setAlumniBranch] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
  const [careerDomain, setCareerDomain] = useState<'Software' | 'Data' | 'Core ECE' | 'Consulting' | 'Product'>('Software');
  const [alumniSkills, setAlumniSkills] = useState<string[]>([]);
  const [careerPathwayTags, setCareerPathwayTags] = useState<string[]>([]);

  // Faculty
  const [facultyDepartment, setFacultyDepartment] = useState('');
  const [designation, setDesignation] = useState<'Assistant Professor' | 'Associate Professor' | 'Professor'>('Assistant Professor');
  const [facultyYearsOfExperience, setFacultyYearsOfExperience] = useState<number>(0);
  const [subjectsTaught, setSubjectsTaught] = useState<string[]>([]);
  const [guidanceAreas, setGuidanceAreas] = useState<string[]>([]);

  // Recruiter
  const [officialEmail, setOfficialEmail] = useState('');
  const [companyNameRecruiter, setCompanyNameRecruiter] = useState('');
  const [companyType, setCompanyType] = useState<'Service' | 'Product' | 'Startup'>('Service');
  const [rolesHiringFor, setRolesHiringFor] = useState<string[]>([]);
  const [eligibleBranches, setEligibleBranches] = useState<string[]>([]);

  // Verify email token if present
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !user) return;
      
      setVerifyingEmail(true);
      try {
        const functions = getFunctionsInstance();
        if (!functions) throw new Error('Client only');
        const verifyFn = httpsCallable(functions, 'verifyStudentEmail');
        await verifyFn({ token });
        setVerifyError('');
      } catch (err: any) {
        console.error('Email verification error:', err);
        setVerifyError(err?.message || 'Email verification failed');
      } finally {
        setVerifyingEmail(false);
      }
    };
    
    verifyToken();
  }, [token, user]);

  // Navigation decisions moved into effect to avoid calling router during render
  useEffect(() => {
    if (loading || verifyingEmail) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.profileCompleted) {
      router.push('/home');
      return;
    }

    if (user.verificationStatus !== 'verified') {
      if (user.role === 'student') {
        router.push('/verify/student-email');
      } else if (user.role === 'expert' || user.role === 'recruiter') {
        router.push('/verify/pending');
      } else {
        router.push('/verify/role-select');
      }
      return;
    }
  }, [loading, user, router, verifyingEmail]);

  // While loading, show loader
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  // While redirecting, render nothing
  if (!user || user.profileCompleted || user.verificationStatus !== 'verified') return null;

  // Role-specific states were moved to the top of this component to satisfy Hooks rules


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const userRef = doc(db, 'users', user.uid);

      // Build update object based on role
      let updateData: any = {
        displayName,
        profileCompleted: true,
        updatedAt: Timestamp.now(),
      };

      if (user.role === 'student') {
        updateData.studentProfile = {
          rollNumber,
          branch,
          currentAcademicYear,
          currentCGPA,
          primaryCareerGoal,
          interestedCareerPathways,
          skills,
          ...(currentAcademicYear === 4 && { placementStatus, companyName }),
        };
      } else if (user.role === 'alumni') {
        updateData.alumniProfile = {
          graduationYear,
          degree,
          branch: alumniBranch,
          currentCompany,
          currentRole,
          yearsOfExperience,
          careerDomain,
          skills: alumniSkills,
          careerPathwayTags,
        };
      } else if (user.role === 'faculty') {
        updateData.facultyProfile = {
          department: facultyDepartment,
          designation,
          yearsOfExperience: facultyYearsOfExperience,
          subjectsTaught,
          guidanceAreas,
        };
      } else if (user.role === 'recruiter') {
        updateData.recruiterProfile = {
          officialEmail,
          companyName: companyNameRecruiter,
          companyType,
          rolesHiringFor,
          eligibleBranches,
          canViewAlumniProfiles: false, // Default, admin sets
          canPostOpportunities: false, // Default, admin sets
        };
      }

      await updateDoc(userRef, updateData);

      // Redirect to home
      router.push('/home');
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>

        <form onSubmit={handleSubmit}>
          {/* Display Name - All Roles */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Student Fields */}
          {user.role === 'student' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Roll Number</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Branch/Department</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value as 'CSE' | 'ECE' | 'EEE' | 'ME' | 'CIVIL')}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Branch</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="ME">ME</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Current Academic Year</label>
                <select
                  value={currentAcademicYear}
                  onChange={(e) => setCurrentAcademicYear(Number(e.target.value) as 1 | 2 | 3 | 4)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Current CGPA (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentCGPA || ''}
                  onChange={(e) => setCurrentCGPA(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Primary Career Goal</label>
                <select
                  value={primaryCareerGoal}
                  onChange={(e) => setPrimaryCareerGoal(e.target.value as 'Internships' | 'Placements' | 'Higher Studies')}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="Internships">Internships</option>
                  <option value="Placements">Placements</option>
                  <option value="Higher Studies">Higher Studies</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Interested Career Pathways</label>
                <div className="space-y-2">
                  {['Software', 'Data Science', 'Core ECE', 'MS Abroad', 'MBA', 'Govt Exams'].map(pathway => (
                    <label key={pathway} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={interestedCareerPathways.includes(pathway)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setInterestedCareerPathways([...interestedCareerPathways, pathway]);
                          } else {
                            setInterestedCareerPathways(interestedCareerPathways.filter(p => p !== pathway));
                          }
                        }}
                        className="mr-2"
                      />
                      {pathway}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Skills</label>
                <input
                  type="text"
                  value={skills.join(', ')}
                  onChange={(e) => setSkills(e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="comma separated"
                />
              </div>

              {currentAcademicYear === 4 && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Placement Status</label>
                    <select
                      value={placementStatus || ''}
                      onChange={(e) => setPlacementStatus(e.target.value as 'Not Started' | 'Interviewing' | 'Placed')}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Not Started">Not Started</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Placed">Placed</option>
                    </select>
                  </div>

                  {placementStatus === 'Placed' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Alumni Fields */}
          {user.role === 'alumni' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Graduation Year</label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Degree</label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value as 'B.Tech' | 'M.Tech' | 'MBA')}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Branch/Department</label>
                <input
                  type="text"
                  value={alumniBranch}
                  onChange={(e) => setAlumniBranch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Current Company/Organization</label>
                <input
                  type="text"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Current Role/Designation</label>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Career Domain/Industry</label>
                <select
                  value={careerDomain}
                  onChange={(e) => setCareerDomain(e.target.value as 'Software' | 'Data' | 'Core ECE' | 'Consulting' | 'Product')}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="Software">Software</option>
                  <option value="Data">Data</option>
                  <option value="Core ECE">Core ECE</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Product">Product</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Skills</label>
                <input
                  type="text"
                  value={alumniSkills.join(', ')}
                  onChange={(e) => setAlumniSkills(e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="comma separated"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Career Pathway Tags</label>
                <input
                  type="text"
                  value={careerPathwayTags.join(', ')}
                  onChange={(e) => setCareerPathwayTags(e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="comma separated"
                />
              </div>
            </>
          )}

          {/* Faculty Fields */}
          {user.role === 'faculty' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Department</label>
                <input
                  type="text"
                  value={facultyDepartment}
                  onChange={(e) => setFacultyDepartment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Designation</label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value as 'Assistant Professor' | 'Associate Professor' | 'Professor')}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Professor">Professor</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={facultyYearsOfExperience}
                  onChange={(e) => setFacultyYearsOfExperience(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Subjects Taught (Optional)</label>
                <input
                  type="text"
                  value={subjectsTaught.join(', ')}
                  onChange={(e) => setSubjectsTaught(e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="comma separated"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Guidance Areas</label>
                <div className="space-y-2">
                  {['Academics', 'Research', 'Higher Studies', 'Career Guidance'].map(area => (
                    <label key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={guidanceAreas.includes(area)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGuidanceAreas([...guidanceAreas, area]);
                          } else {
                            setGuidanceAreas(guidanceAreas.filter(a => a !== area));
                          }
                        }}
                        className="mr-2"
                      />
                      {area}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Recruiter Fields */}
          {user.role === 'recruiter' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Official Email</label>
                <input
                  type="email"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyNameRecruiter}
                  onChange={(e) => setCompanyNameRecruiter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Company Type</label>
                <select
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value as 'Service' | 'Product' | 'Startup')}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="Service">Service</option>
                  <option value="Product">Product</option>
                  <option value="Startup">Startup</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Roles Hiring For</label>
                <input
                  type="text"
                  value={rolesHiringFor.join(', ')}
                  onChange={(e) => setRolesHiringFor(e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="comma separated"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Eligible Branches (Optional)</label>
                <input
                  type="text"
                  value={eligibleBranches.join(', ')}
                  onChange={(e) => setEligibleBranches(e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="comma separated"
                />
              </div>
            </>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

