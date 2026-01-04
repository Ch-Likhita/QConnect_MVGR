'use client';

import { useAuth } from '../hooks/useAuth';
import { useRouter } from '../lib/router';
import { usePathname } from '../lib/router';
import { User } from '../types/user';

const UserFlowGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const publicPaths = ['/', '/register', '/login'];

  const isComplete = (user: User) =>
    user.role && user.verificationStatus === 'verified' && user.profileCompleted;

  const getNextPath = (user: User) => {
    if (!user.role) return '/verify/role-select';
    if (user.verificationStatus !== 'verified') {
      switch (user.role) {
        case 'student':
          return '/verify/student-email';
        case 'expert':
          return '/verify/alumni-request';
        case 'faculty':
          return '/verify/pending';
        case 'recruiter':
          return '/verify/recruiter-request';
        default:
          return '/verify/role-select';
      }
    }
    return '/home';
  };

  if (!user) {
    // Allow public paths without user
    if (publicPaths.includes(pathname)) {
      return <>{children}</>;
    }
    // For other paths, allow (perhaps they handle auth themselves)
    return <>{children}</>;
  }

  // User is logged in
  const nextPath = getNextPath(user);
  if (isComplete(user) || pathname === nextPath) {
    return <>{children}</>;
  } else {
    // Redirect to next required step
    router.push(nextPath);
    return null;
  }
};

export default UserFlowGuard;
