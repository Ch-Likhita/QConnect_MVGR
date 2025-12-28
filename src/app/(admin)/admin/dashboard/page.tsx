'use client';
import { useAuth } from '../../../../hooks/useAuth';
import Link from 'next/link';
import { Users, FileText, CheckSquare, BarChart2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { userProfile, loading } = useAuth();
  const { push } = useRouter();
  // Initialize mock stats (avoid setState synchronously inside effect)
  const [stats] = useState({ users: 120, pending: 5, questions: 45 });

  useEffect(() => {
    if (!loading && userProfile?.role !== 'admin') {
      push('/home');
    }
    // In a real app, fetch and update stats asynchronously here
  }, [loading, userProfile, push]);

  if (loading || userProfile?.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <Users className="text-blue-500 mr-3" />
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{stats.users}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center">
            <CheckSquare className="text-yellow-500 mr-3" />
            <div>
              <p className="text-gray-500 text-sm">Pending Verifications</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <FileText className="text-green-500 mr-3" />
            <div>
              <p className="text-gray-500 text-sm">Total Questions</p>
              <p className="text-2xl font-bold">{stats.questions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <BarChart2 className="text-purple-500 mr-3" />
            <div>
              <p className="text-gray-500 text-sm">Active Experts</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
           <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
           <div className="space-y-3">
             <Link href="/admin/verifications" className="block p-3 border rounded hover:bg-gray-50">
                Review Pending Verifications
             </Link>
             <Link href="/admin/users" className="block p-3 border rounded hover:bg-gray-50">
                Manage Users & Roles
             </Link>
             <Link href="/admin/content" className="block p-3 border rounded hover:bg-gray-50">
                Content Moderation
             </Link>
           </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
           <h3 className="text-lg font-medium mb-4">Recent Audit Logs</h3>
           <div className="text-sm text-gray-500">
             <p className="py-2 border-b">Admin X approved verification for User Y</p>
             <p className="py-2 border-b">Admin Z changed role of User A to moderator</p>
             <p className="py-2">System logged new registration</p>
           </div>
        </div>
      </div>
    </div>
  );
}