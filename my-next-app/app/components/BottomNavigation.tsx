'use client';

import Link from 'next/link';

interface BottomNavigationProps {
  activeTab?: 'home' | 'appointments' | 'records' | 'profile';
}

export default function BottomNavigation({ activeTab = 'home' }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg safe-area-pb">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around py-2 sm:py-3">
          {/* Find Doctor */}
          <Link 
            href="/user/dashboard" 
            className={`flex flex-col items-center space-y-0.5 sm:space-y-1 min-w-0 ${
              activeTab === 'home' ? 'text-[#4FC3F7]' : 'text-gray-600 hover:text-[#4FC3F7]'
            }`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-medium truncate">Find Doctor</span>
          </Link>

          {/* Appointments */}
          <Link 
            href="/user/appointment-history" 
            className={`flex flex-col items-center space-y-0.5 sm:space-y-1 min-w-0 ${
              activeTab === 'appointments' ? 'text-[#4FC3F7]' : 'text-gray-600 hover:text-[#4FC3F7]'
            }`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-medium truncate">Appoint.</span>
          </Link>

          {/* Records */}
          <Link 
            href="/records" 
            className={`flex flex-col items-center space-y-0.5 sm:space-y-1 min-w-0 ${
              activeTab === 'records' ? 'text-[#4FC3F7]' : 'text-gray-600 hover:text-[#4FC3F7]'
            }`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-medium truncate">Records</span>
          </Link>

          {/* Profile */}
          <Link 
            href="/user/profile" 
            className={`flex flex-col items-center space-y-0.5 sm:space-y-1 min-w-0 ${
              activeTab === 'profile' ? 'text-[#4FC3F7]' : 'text-gray-600 hover:text-[#4FC3F7]'
            }`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-medium truncate">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
