import { Timestamp } from 'firebase/firestore';

export type UserRole = 'student' | 'alumni' | 'faculty' | 'recruiter' | 'expert' | 'moderator' | 'admin';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type AccountStatus = 'active' | 'suspended' | 'banned';

export interface StudentProfile {
  rollNumber: string;
  branch: 'CSE' | 'ECE' | 'EEE' | 'ME' | 'CIVIL';
  currentAcademicYear: 1 | 2 | 3 | 4;
  currentCGPA?: number; // Optional
  primaryCareerGoal: 'Internships' | 'Placements' | 'Higher Studies';
  interestedCareerPathways: string[]; // Multi-select: Software / Data Science / Core ECE / MS Abroad / MBA / Govt Exams
  skills: string[]; // Multi-select/tags: Programming languages, tools, subjects
  placementStatus?: 'Not Started' | 'Interviewing' | 'Placed'; // Only if 4th year
  companyName?: string; // If placed
}

export interface AlumniProfile {
  graduationYear: number;
  degree: 'B.Tech' | 'M.Tech' | 'MBA';
  branch: string;
  currentCompany: string;
  currentRole: string;
  yearsOfExperience: number;
  careerDomain: 'Software' | 'Data' | 'Core ECE' | 'Consulting' | 'Product';
  skills: string[]; // Technical + non-technical, tags
  careerPathwayTags: string[]; // Same as student pathways
}

export interface FacultyProfile {
  department: string;
  designation: 'Assistant Professor' | 'Associate Professor' | 'Professor';
  yearsOfExperience: number;
  subjectsTaught?: string[]; // Optional, multi-select
  guidanceAreas: string[]; // Academics / Research / Higher Studies / Career Guidance
  moderatorStatus: boolean; // Yes/No - assigned by admin only
}

export interface RecruiterProfile {
  officialEmail: string;
  companyName: string;
  companyType: 'Service' | 'Product' | 'Startup';
  rolesHiringFor: string[];
  eligibleBranches?: string[]; // Optional
  canViewAlumniProfiles: boolean;
  canPostOpportunities: boolean;
}

export interface ModeratorProfile {
  // Moderator is not a separate profile, but can be assigned to Faculty or Alumni
  // Powers: Delete abusive questions, Remove inappropriate answers, Flag content, Resolve reports
  // Cannot: Assign roles, Verify alumni, Access admin dashboard
}

export interface AdminProfile {
  adminType: 'Super Admin' | 'TPO' | 'Faculty Admin';
  permissions: {
    verifyAlumni: boolean;
    assignRoles: boolean;
    assignModerators: boolean;
    manageRecruiters: boolean;
  };
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole | null; // Allow null for role selection
  verificationStatus: VerificationStatus;
  accountStatus: AccountStatus;
  profileCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Verification fields
  collegeEmail?: string | null;        // Only for students (auto-verified)
  personalEmail: string;              // The email they signed up with
  verificationMethod?: "auto" | "manual" | "none";
  verifiedAt?: Timestamp | null;
  verifiedBy?: string; // Admin uid for alumni verification
  verifiedAtTimestamp?: Timestamp; // For alumni

  // One of these will be populated based on role
  studentProfile?: StudentProfile;
  alumniProfile?: AlumniProfile;
  facultyProfile?: FacultyProfile;
  recruiterProfile?: RecruiterProfile;
  moderatorProfile?: ModeratorProfile; // If needed
  adminProfile?: AdminProfile;
}
