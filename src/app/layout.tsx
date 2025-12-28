'use client';
import React from 'react';
import { AuthProvider } from '../hooks/useAuth';
import { RouterProvider } from '../lib/router';
import Navbar from '../components/common/Navbar';
import UserFlowGuard from '../components/UserFlowGuard';
import './globals.css';
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col font-sans text-gray-900">
            <RouterProvider>
              <AuthProvider>
                <Navbar />
                <main className="flex-grow bg-gray-50">
                  <UserFlowGuard>
                    {children}
                  </UserFlowGuard>
                </main>
                <footer className="bg-white border-t py-6 mt-12">
                  <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    &copy; 2024 QConnect - MVGR. Institutional Use Only.
                  </div>
                </footer>
              </AuthProvider>
            </RouterProvider>
        </div>
      </body>
    </html>
  );
}
