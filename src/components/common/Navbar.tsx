'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { getAuthInstance } from '../../lib/firebase';
import RoleBadge from './RoleBadge';
import { LogOut, User, LayoutDashboard, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { user, userProfile } = useAuth();
  const { push } = useRouter();

  const handleSignOut = async () => {
    try {
        const authInst = getAuthInstance();
        if (!authInst) {
          console.error('Sign out attempted on server');
          push('/login');
          return;
        }
        await signOut(authInst);
        push('/login');
    } catch (error) {
        console.error("Sign out failed", error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-700 tracking-tight">Q<span className="text-gray-900">Connect - MVGR College Of Engineering</span></span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user && userProfile ? (
              <>
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-medium text-gray-900">{userProfile.displayName}</span>
                  <RoleBadge role={userProfile.role} />
                </div>
                
                <Link href="/home" className="p-2 text-gray-500 hover:text-indigo-600">
                  <LayoutDashboard size={20} />
                </Link>

                <Link href={`/profile/${user.uid}`} className="p-2 text-gray-500 hover:text-indigo-600">
                  <User size={20} />
                </Link>

                {userProfile.role === 'admin' && (
                   <Link href="/admin/dashboard" className="p-2 text-red-500 hover:text-red-700" title="Admin Panel">
                     <Shield size={20} />
                   </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-500 hover:text-red-600 focus:outline-none"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;