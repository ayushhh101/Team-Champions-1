/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Heart, MapPin, Clock, Star, Award, Search, Filter } from 'lucide-react';
import BottomNavigation from '../../components/BottomNavigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';

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
  about?: string;
  reviewCount?: number;
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
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'experience' | 'price'>('name');
  const router = useRouter();

  // Get unique specialties for filter dropdown
  const specialties = [...new Set(doctors.map(doctor => doctor.speciality))].sort();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          router.push('/user/login');
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

  // Enhanced filtering and sorting logic
  useEffect(() => {
    let filtered = doctors.filter(doctor => {
      const matchesSearch = 
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.qualification?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSpecialty = selectedSpecialty === '' || doctor.speciality === selectedSpecialty;
      
      return matchesSearch && matchesSpecialty;
    });

    // Sort doctors
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return Number(b.experience) - Number(a.experience);
        case 'price':
          return Number(a.price) - Number(b.price);
        default:
          return 0;
      }
    });

    setFilteredDoctors(filtered);
  }, [doctors, searchQuery, selectedSpecialty, sortBy]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userMobile');
    localStorage.removeItem('userLocation');
    localStorage.removeItem('favorites');
    router.push('/user/login');
  };

  const toggleFavorite = (doctorId: string) => {
    const newFavorites = favorites.includes(doctorId)
      ? favorites.filter(id => id !== doctorId)
      : [...favorites, doctorId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    // Add a small animation effect
    const element = document.getElementById(`favorite-${doctorId}`);
    if (element) {
      element.classList.add('animate-bounce');
      setTimeout(() => {
        element.classList.remove('animate-bounce');
      }, 600);
    }
  };

  const getUserName = () => {
    if (!user?.email) return 'User';
    const name = user.email.split('@')[0];
    return name.split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
  };

  const getAvailabilityStatus = (doctor: Doctor) => {
    if (!doctor.availableDates || doctor.availableDates.length === 0) {
      return { status: 'Not Available', color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-400' };
    }
    
    const today = new Date().toISOString().split('T')[0];
    const isAvailableToday = doctor.availableDates.includes(today);
    
    if (isAvailableToday) {
      return { status: 'Available today', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' };
    } else {
      return { status: 'Available soon', color: 'bg-yellow-100 text-yellow-700', dotColor: 'bg-yellow-500' };
    }
  };

  const getTiming = (doctor: Doctor) => {
    if (!doctor.availableTimes || doctor.availableTimes.length === 0) {
      return 'Not specified';
    }
    const sortedTimes = [...doctor.availableTimes].sort();
    return `${sortedTimes[0]} - ${sortedTimes[sortedTimes.length - 1]}`;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('');
    setSortBy('name');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#91C8E4] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#4682A9] font-medium text-lg">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 pb-20">
        {/* Enhanced Header - Mobile Responsive */}
        <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-linear-to-br from-[#91C8E4] to-[#4682A9] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg shrink-0">
                  {getUserName().charAt(0).toUpperCase()}
                  <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold text-[#2C5F7C] truncate">
                    Hello, {getUserName().split(' ')[0]}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#4682A9] flex items-center truncate">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 shrink-0" />
                    <span className="truncate">{user?.location || 'India'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                <button className="relative p-2 sm:p-3 hover:bg-[#91C8E4]/10 rounded-full transition-all duration-200 hover:shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#4682A9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 sm:top-2 sm:right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-all font-medium text-xs sm:text-sm shadow-md hover:shadow-lg"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Enhanced Search and Filter Section */}
          <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-[#4682A9]" />
              </div>
              <input
                type="text"
                placeholder="Search doctors by name, specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-white border-2 border-[#91C8E4]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] text-sm sm:text-base text-[#2C5F7C] placeholder:text-[#4682A9]/60 shadow-lg transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#4682A9] hover:text-[#2C5F7C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white border-2 border-[#91C8E4]/30 rounded-xl hover:bg-[#91C8E4]/10 transition-all shadow-md text-sm sm:text-base"
              >
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4682A9]" />
                <span className="text-[#4682A9] font-medium">Filters</span>
              </button>

              {(searchQuery || selectedSpecialty || sortBy !== 'name') && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-medium text-xs sm:text-sm shadow-md"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Expandable Filter Options */}
            {showFilters && (
              <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border border-[#91C8E4]/20 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Specialty Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#2C5F7C] mb-2">Specialization</label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#91C8E4]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#91C8E4] text-[#2C5F7C] text-sm sm:text-base"
                    >
                      <option value="">All Specializations</option>
                      {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#2C5F7C] mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 border-2 border-[#91C8E4]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#91C8E4] text-[#2C5F7C] text-sm sm:text-base"
                    >
                      <option value="name">Name (A-Z)</option>
                      <option value="rating">Highest Rated</option>
                      <option value="experience">Most Experienced</option>
                      <option value="price">Lowest Price</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs sm:text-sm text-[#4682A9] font-medium">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found
              {selectedSpecialty && ` in ${selectedSpecialty}`}
            </p>
            
            {favorites.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#4682A9]">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 fill-red-500" />
                <span>{favorites.length} favorite{favorites.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Enhanced Doctors List */}
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl shadow-lg mx-1 sm:mx-0">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-[#91C8E4] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg sm:text-xl font-bold text-[#2C5F7C] mb-2">No doctors found</h3>
              <p className="text-sm sm:text-base text-[#4682A9] mb-4">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredDoctors.map((doctor) => {
                const availability = getAvailabilityStatus(doctor);
                const isFavorite = favorites.includes(doctor.id);
                
                return (
                  <div
                    key={doctor.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Main Card Content */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                      {/* Doctor Image */}
                      <div className="relative shrink-0 mx-auto sm:mx-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-linear-to-br from-[#91C8E4] to-[#4682A9] flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg">
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
                        {/* Availability Indicator */}
                        <div className={`absolute -top-1 -right-1 w-4 h-4 ${availability.dotColor} rounded-full border-2 border-white shadow-md`}></div>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                          <div className="flex-1 mb-3 sm:mb-0">
                            <h3 className="text-xl font-bold text-[#2C5F7C] mb-1">
                              {doctor.name}
                            </h3>
                            <p className="text-[#4682A9] font-semibold text-base mb-2">
                              {doctor.speciality}
                            </p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                              <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${availability.color}`}>
                                <span className={`w-2 h-2 ${availability.dotColor} rounded-full mr-2`}></span>
                                {availability.status}
                              </span>
                              {doctor.location && (
                                <span className="inline-flex items-center text-xs text-[#4682A9] bg-[#91C8E4]/10 px-3 py-1 rounded-full">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {doctor.location}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Favorite Button */}
                          <button 
                            id={`favorite-${doctor.id}`}
                            onClick={() => toggleFavorite(doctor.id)}
                            className={`p-2.5 rounded-full transition-all duration-300 transform hover:scale-110 ${
                              isFavorite 
                                ? 'bg-red-50 hover:bg-red-100 text-red-500' 
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-red-500'
                            }`}
                          >
                            <Heart 
                              className={`w-5 h-5 transition-all duration-300 ${
                                isFavorite ? 'fill-red-500' : ''
                              }`} 
                            />
                          </button>
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-4 text-sm text-[#4682A9]">
                          <div className="flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-[#4682A9]" />
                            <span className="font-medium">{doctor.experience}+ years</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{doctor.rating}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#4682A9]" />
                            <span className="font-medium">{getTiming(doctor)}</span>
                          </div>
                        </div>

                        {/* Bottom Section - Price and Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="text-center sm:text-left">
                            <span className="text-lg font-bold text-[#2C5F7C]">₹{doctor.price}</span>
                            <span className="text-sm text-[#4682A9] ml-1">consultation</span>
                          </div>
                          
                          <div className="flex gap-3">
                            <button className="px-4 py-2 bg-[#91C8E4]/10 hover:bg-[#91C8E4]/20 text-[#4682A9] font-medium rounded-lg transition-all duration-300 border border-[#91C8E4]/30 text-sm">
                              View Profile
                            </button>
                            <Link
                              href={`/user/book-appointment/${doctor.id}`}
                              className="px-6 py-2 bg-linear-to-r from-[#91C8E4] to-[#4682A9] hover:from-[#749BC2] hover:to-[#4682A9] text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm"
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

          {/* Enhanced Logout Modal */}
          {showLogoutModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogOut className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2C5F7C] mb-2">Logout Confirmation</h3>
                  <p className="text-[#4682A9] mb-6">Are you sure you want to logout from your account?</p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLogoutModal(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 px-4 py-3 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
        
        <BottomNavigation activeTab="home" />
      </div>
    </ProtectedRoute>
  );
}