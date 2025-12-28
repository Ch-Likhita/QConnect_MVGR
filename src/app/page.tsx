import Link from 'next/link';
import { BookOpen, ShieldCheck, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              Institutional Knowledge Repository
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Ask verified experts. Get real answers.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Connect with verified MVGR alumni and faculty. A trusted space for career guidance, academic doubts, and placement mentorship. No noise, just knowledge.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register" className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Join the Network
            </Link>
            <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900">
              Log in <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <BookOpen />
            </div>
            <h3 className="text-xl font-semibold mb-2">Academic Repository</h3>
            <p className="text-gray-600">Search years of solved questions and pathways curated by top performers.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
              <ShieldCheck />
            </div>
            <h3 className="text-xl font-semibold mb-2">Verified Experts</h3>
            <p className="text-gray-600">Only manually verified alumni and experts can answer. Trust the advice you get.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600">
              <Users />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mentorship</h3>
            <p className="text-gray-600">Direct guidance on placements and higher education from those who made it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}