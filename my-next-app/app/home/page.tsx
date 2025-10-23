/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNavigation from '../components/BottomNavigation';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  location: string;
  price: number | string;
  rating: number;
  experience: number | string;
  availableDates: string[];
  availableTimes: string[];
  image?: string;
  qualification?: string;
  phone?: string;
}

interface User {
  id: string;
  email: string;
  location: string;
  mobile: string;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/doctors');
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        
        const loggedInUser = data.users?.find((u: any) => u.id === userId);
        
        if (loggedInUser) {
          setUser({
            id: loggedInUser.id,
            email: loggedInUser.email,
            mobile: loggedInUser.mobile,
            location: loggedInUser.location
          });
        } else {
          setUser({
            id: userId,
            email: localStorage.getItem('userEmail') || '',
            mobile: localStorage.getItem('userMobile') || '',
            location: localStorage.getItem('userLocation') || 'India'
          });
        }

        setDoctors(data.doctors || []);

        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const toggleFavorite = (doctorId: string) => {
    const newFavorites = favorites.includes(doctorId)
      ? favorites.filter(id => id !== doctorId)
      : [...favorites, doctorId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserName = () => {
    if (!user?.email) return 'User';
    const name = user.email.split('@')[0];
    return name.split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
  };

  const getAvailabilityStatus = (doctor: Doctor) => {
    if (!doctor.availableDates || doctor.availableDates.length === 0) {
      return { status: 'Not Available', color: 'bg-gray-100 text-gray-700' };
    }
    
    const today = new Date().toISOString().split('T')[0];
    const isAvailableToday = doctor.availableDates.includes(today);
    
    if (isAvailableToday) {
      return { status: 'Available today', color: 'bg-green-100 text-green-700' };
    } else {
      return { status: 'Available soon', color: 'bg-yellow-100 text-yellow-700' };
    }
  };

  const getTiming = (doctor: Doctor) => {
    if (!doctor.availableTimes || doctor.availableTimes.length === 0) {
      return 'Not specified';
    }
    const sortedTimes = [...doctor.availableTimes].sort();
    return `${sortedTimes[0]} - ${sortedTimes[sortedTimes.length - 1]}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4FC3F7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-linear-to-br from-[#91C8E4] to-[#4682A9] flex items-center justify-center text-white font-bold text-base sm:text-lg">
                {getUserName().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                  Hello, {getUserName().split(' ')[0]}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 flex items-center truncate">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{user?.location || 'India'}</span>
                </p>
              </div>
            </div>

            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Doctors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent text-sm sm:text-base text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Doctors Count */}
        <div className="mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-gray-600">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found
          </p>
        </div>

        {/* Doctors List */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm sm:text-base text-gray-500">No doctors found</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredDoctors.map((doctor) => {
              const availability = getAvailabilityStatus(doctor);
              
              return (
                <div
                  key={doctor.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-start space-x-3 sm:space-x-0">
                      <div className="relative w-20 h-20 sm:w-32 sm:h-32 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-linear-to-br from-[#91C8E4] to-[#4682A9] flex items-center justify-center text-white font-bold text-2xl sm:text-3xl">
                        {doctor.image ? (
                          <Image
                            src={doctor.image}
                            alt={doctor.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          doctor.name.split(' ')[1]?.charAt(0) || doctor.name.charAt(0)
                        )}
                      </div>

                      <div className="flex-1 sm:hidden">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-gray-900 mb-1 truncate">
                              {doctor.name}
                            </h3>
                            <p className="text-[#4FC3F7] font-semibold text-xs mb-1 truncate">
                              {doctor.speciality}
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => toggleFavorite(doctor.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0 ml-2"
                          >
                            <svg
                              className={`w-5 h-5 ${favorites.includes(doctor.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                              fill={favorites.includes(doctor.id) ? 'currentColor' : 'none'}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="hidden sm:flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                            {doctor.name}
                          </h3>
                          <p className="text-[#4FC3F7] font-semibold text-sm mb-2">
                            {doctor.speciality}
                          </p>
                        </div>

                        <button 
                          onClick={() => toggleFavorite(doctor.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                        >
                          <svg
                            className={`w-6 h-6 ${favorites.includes(doctor.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                            fill={favorites.includes(doctor.id) ? 'currentColor' : 'none'}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-block px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold rounded-full ${availability.color}`}>
                          {availability.status}
                        </span>
                        {doctor.location && (
                          <span className="text-xs text-gray-600 flex items-center">
                            <svg className="w-3 h-3 mr-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="truncate">{doctor.location}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {doctor.experience}+ yrs
                        </span>
                        <span className="flex items-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-500 fill-yellow-500 shrink-0" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {doctor.rating}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3">
                        <div className="flex items-center text-xs sm:text-sm text-gray-700 font-medium">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="truncate">{getTiming(doctor)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                          <span className="text-base sm:text-lg font-bold text-[#4682A9]">
                            ₹{doctor.price}
                          </span>
                          <Link
                            // href={`/appointments?doctorId=${doctor.id}`} 
                           href={`/book-appointment/${doctor.id}`}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white text-xs sm:text-sm font-semibold rounded-lg hover:shadow-md transition-all"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNavigation activeTab="home" />
    </div>
  );
}
