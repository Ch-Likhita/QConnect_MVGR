import React from 'react';
import { createRoot } from 'react-dom/client';
import RootLayout from './src/app/layout';
import LandingPage from './src/app/page';
import LoginPage from './src/app/(auth)/login/page';
import RegisterPage from './src/app/(auth)/register/page';
import HomePage from './src/app/(user)/home/page';
import AskPage from './src/app/(user)/ask/page';
import QuestionPage from './src/app/(user)/question/[id]/page';
import AdminDashboard from './src/app/(admin)/admin/dashboard/page';
import VerificationQueue from './src/app/(admin)/admin/verifications/page';
import { RouterProvider, usePathname } from './src/lib/router';

const AppRoutes = () => {
  const path = usePathname();

  if (path === '/') return <LandingPage />;
  if (path === '/login') return <LoginPage />;
  if (path === '/register') return <RegisterPage />;
  if (path === '/home') return <HomePage />;
  if (path === '/ask') return <AskPage />;
  if (path.startsWith('/question/')) return <QuestionPage />;
  if (path.startsWith('/profile/')) return <div className="p-8 text-center">Profile Page (Placeholder)</div>;
  if (path === '/admin/dashboard') return <AdminDashboard />;
  if (path === '/admin/verifications') return <VerificationQueue />;
  
  return <LandingPage />; // Default to landing
};

const App = () => {
  return (
    <RouterProvider>
      <RootLayout>
        <AppRoutes />
      </RootLayout>
    </RouterProvider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);