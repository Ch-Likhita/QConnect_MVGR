'use client';

import React, { useState, useEffect } from 'react';
import { getAllAlumni, AlumniFilters } from '../../services/alumni.service';
import { User } from '../../types/user';
import { useRouter } from 'next/navigation';

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AlumniFilters>({});
  const { push } = useRouter();

  useEffect(() => {
    fetchAlumni();
  }, [filters]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const data = await getAllAlumni(filters);
      setAlumni(data);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AlumniFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Alumni Directory</h1>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              id="department"
              value={filters.department || ''}
              onChange={(e) => handleFilterChange('department', e.target.value || undefined)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="ME">ME</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </div>
          <div>
            <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
            <select
              id="graduationYear"
              value={filters.graduationYear || ''}
              onChange={(e) => handleFilterChange('graduationYear', parseInt(e.target.value) || undefined)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Years</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Alumni Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                  <div className="flex space-x-2 mt-2">
                    <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                    <div className="h-6 bg-gray-300 rounded-full w-14"></div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map((alum) => (
              <div key={alum.uid} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {getInitials(alum.displayName)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{alum.displayName}</h3>
                    <p className="text-sm text-gray-600">{alum.alumniProfile?.currentCompany}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{alum.alumniProfile?.currentRole}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {alum.alumniProfile?.skills?.slice(0, 3).map((skill, index) => (
                    <span key={index} className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => push(`/profile/${alum.uid}`)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && alumni.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No alumni found matching the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
