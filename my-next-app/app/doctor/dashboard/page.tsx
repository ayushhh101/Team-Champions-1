/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Users, TrendingUp, Bell, ChevronRight, Star, LogOut, MapPin, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import ProtectedRoute from '@/app/components/ProtectedRoute';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  speciality: string;
  location: string;
  experience: number | string;
  rating: number;
  price: number | string;
  availableDates: string[];
  availableTimes: string[];
  image?: string;
  isVerified: boolean;
  licenseNumber?: string;
  about?: string;
  reviewCount?: number;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  date: string;
  time: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId');
        
        if (!doctorId) {
          router.push('/user/login');
          return;
        }

        // Fetch doctor data
        const doctorResponse = await fetch('/api/doctors');
        if (!doctorResponse.ok) {
          throw new Error('Failed to fetch doctor data');
        }
        const doctorData = await doctorResponse.json();
        const loggedInDoctor = doctorData.doctors?.find((d: any) => d.id === doctorId);
        
        if (!loggedInDoctor) {
          router.push('/doctor/login');
          return;
        }
        
        setDoctor(loggedInDoctor);

        // Fetch appointments for this doctor
        try {
          const appointmentsResponse = await fetch(`/api/appointments?doctorId=${doctorId}`);
          if (appointmentsResponse.ok) {
            const appointmentsData = await appointmentsResponse.json();
            const todayAppointments = appointmentsData.appointments?.filter((apt: Appointment) => 
              apt.doctorId === doctorId && apt.status === 'upcoming'
            ) || [];
            setAppointments(todayAppointments.slice(0, 4)); // Show first 4
          }
        } catch (error) {
          console.error('Error fetching appointments:', error);
          setAppointments([]);
        }

        // Generate sample notifications
        const sampleNotifications: Notification[] = [
          {
            id: '1',
            type: 'info',
            title: 'New Appointment',
            message: 'John Doe has booked an appointment for tomorrow at 10:00 AM',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
            read: false
          },
          {
            id: '2',
            type: 'success',
            title: 'Payment Received',
            message: 'Payment of ₹500 received from Sarah Wilson',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
            read: false
          },
          {
            id: '3',
            type: 'warning',
            title: 'Schedule Reminder',
            message: 'You have 3 appointments scheduled for today',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            read: true
          },
          {
            id: '4',
            type: 'info',
            title: 'Profile Update',
            message: 'Your profile has been successfully updated',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            read: true
          },
          {
            id: '5',
            type: 'error',
            title: 'Appointment Cancelled',
            message: 'Mike Johnson cancelled his appointment for today',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
            read: false
          }
        ];
        
        setNotifications(sampleNotifications);

      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/user/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('doctorId');
    router.push('/user/login');
  };

  const getDoctorInitials = () => {
    if (!doctor?.name) return 'DR';
    const names = doctor.name.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notifTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const stats = {
    todayAppointments: appointments.length,
    totalPatients: 110,
    avgRating: doctor?.rating || 4.8,
    reviewCount: doctor?.reviewCount || 0
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#91C8E4] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#4682A9] font-medium text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#FFFBDE] flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
          <p className="text-gray-800 text-lg font-semibold mb-4">Failed to load dashboard</p>
          <Link href="/user/login" className="inline-block px-6 py-3 bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 pb-20">
  {/* Enhanced Header */}
  <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Greeting */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Avatar Circle */}
          {doctor.image ? (
            <div className="w-12 h-12 rounded-full overflow-hidden border-3 border-[#91C8E4] shadow-lg">
              <Image
                src={doctor.image}
                alt={doctor.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#91C8E4] to-[#4682A9] flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {getDoctorInitials()}
              <div className="absolute inset-0 bg-white/20 rounded-full"></div>
            </div>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#2C5F7C]">
              Hello, {doctor.name.split(' ')[1] || doctor.name.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-[#4682A9] flex items-center gap-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              {doctor.location}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 hover:bg-[#91C8E4]/10 rounded-full transition-all duration-200 hover:shadow-md"
            >
              <Bell className="w-5 h-5 text-[#4682A9]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#91C8E4]/20 z-50 max-h-96 overflow-hidden">
                <div className="p-4 border-b border-[#91C8E4]/20 bg-linear-to-r from-[#91C8E4]/5 to-[#4682A9]/5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#2C5F7C]">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-[#91C8E4]/20 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-[#4682A9]" />
                    </button>
                  </div>
                  {unreadCount > 0 && (
                    <p className="text-xs text-[#4682A9] mt-1">{unreadCount} unread notifications</p>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-50 hover:bg-[#91C8E4]/5 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-[#91C8E4]/10' : ''
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-sm font-semibold ${
                                !notification.read ? 'text-[#2C5F7C]' : 'text-[#4682A9]'
                              }`}>
                                {notification.title}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 hover:bg-[#91C8E4]/20 rounded-full transition-colors"
                              >
                                <X className="w-3 h-3 text-[#4682A9]" />
                              </button>
                            </div>
                            <p className="text-xs text-[#4682A9] mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-[#4682A9]/60">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-[#91C8E4] rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-[#91C8E4] mx-auto mb-3" />
                      <p className="text-[#4682A9]">No notifications</p>
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-[#91C8E4]/20 bg-[#91C8E4]/5">
                    <button
                      onClick={() => {
                        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
                      }}
                      className="w-full text-center text-sm text-[#4682A9] hover:text-[#2C5F7C] font-medium transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowLogoutModal(true)}
            className="ml-2 flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-all font-medium text-sm shadow-md hover:shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  {/* Main Content */}
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    {/* Enhanced Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Today's Appointments */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#91C8E4]/20 p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-linear-to-br from-[#91C8E4]/20 to-[#4682A9]/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#4682A9]" />
          </div>
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">Today</span>
        </div>
        <h3 className="text-3xl font-bold text-[#2C5F7C] mb-1">{stats.todayAppointments}</h3>
        <p className="text-sm text-[#4682A9] font-medium">Appointments</p>
      </div>

      {/* Total Patients */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#91C8E4]/20 p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-linear-to-br from-[#749BC2]/20 to-[#4682A9]/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-[#4682A9]" />
          </div>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <h3 className="text-3xl font-bold text-[#2C5F7C] mb-1">{stats.totalPatients}</h3>
        <p className="text-sm text-[#4682A9] font-medium">Total Patients</p>
      </div>

      {/* Rating */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#91C8E4]/20 p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-linear-to-br from-yellow-50 to-yellow-100 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          </div>
          <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">★ {doctor.rating}</span>
        </div>
        <h3 className="text-3xl font-bold text-[#2C5F7C] mb-1">{doctor.rating}</h3>
        <p className="text-sm text-[#4682A9] font-medium">Average Rating</p>
      </div>

      {/* Reviews */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#91C8E4]/20 p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-linear-to-br from-[#91C8E4]/20 to-[#4682A9]/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-[#4682A9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        </div>
        <h3 className="text-3xl font-bold text-[#2C5F7C] mb-1">{stats.reviewCount}</h3>
        <p className="text-sm text-[#4682A9] font-medium">Reviews</p>
      </div>
    </div>

    {/* Main Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Today's Schedule */}
      <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#91C8E4]/20 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#2C5F7C]">Today's Schedule</h2>
          <Link href="/doctor/appointments" className="text-sm font-semibold text-[#4682A9] hover:text-[#2C5F7C] transition-colors flex items-center gap-1 bg-[#91C8E4]/10 px-3 py-1.5 rounded-lg hover:bg-[#91C8E4]/20">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-linear-to-r from-[#91C8E4]/5 to-[#4682A9]/5 rounded-xl border border-[#91C8E4]/20 hover:border-[#91C8E4] hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  {/* Patient Avatar */}
                  <div className="w-12 h-12 bg-linear-to-br from-[#91C8E4] to-[#4682A9] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {appointment.patientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  {/* Info */}
                  <div>
                    <h3 className="font-semibold text-[#2C5F7C] group-hover:text-[#4682A9] transition-colors">{appointment.patientName}</h3>
                    <p className="text-xs text-[#4682A9]/70">{appointment.type}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 bg-[#91C8E4]/20 text-[#4682A9] px-3 py-1.5 rounded-lg text-sm font-medium border border-[#91C8E4]/30">
                    <Clock className="w-3.5 h-3.5" />
                    {appointment.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-[#91C8E4] mx-auto mb-3" />
            <p className="text-[#4682A9] font-medium">No appointments scheduled for today</p>
            <p className="text-sm text-[#4682A9]/70 mt-1">Your schedule is clear</p>
          </div>
        )}

        {/* View More */}
        <Link href="/doctor/appointments">
          <button className="w-full mt-5 py-3 bg-linear-to-r from-[#91C8E4] to-[#4682A9] hover:from-[#749BC2] hover:to-[#4682A9] text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]">
            View All Appointments
          </button>
        </Link>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Profile Summary */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#91C8E4]/20 p-6 hover:shadow-xl transition-all duration-300">
          <h2 className="text-lg font-bold text-[#2C5F7C] mb-4">Profile Info</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[#4682A9]/70 text-xs mb-1 font-medium">Speciality</p>
              <p className="font-semibold text-[#2C5F7C]">{doctor.speciality}</p>
            </div>
            <div>
              <p className="text-[#4682A9]/70 text-xs mb-1 font-medium">Experience</p>
              <p className="font-semibold text-[#2C5F7C]">{doctor.experience}+ years</p>
            </div>
            <div>
              <p className="text-[#4682A9]/70 text-xs mb-1 font-medium">Consultation Fee</p>
              <p className="font-semibold text-[#2C5F7C]">₹{doctor.price}</p>
            </div>
            {doctor.isVerified && (
              <div className="pt-3 border-t border-[#91C8E4]/20">
                <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-sm">Verified Doctor</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#91C8E4]/20 p-6 hover:shadow-xl transition-all duration-300">
          <h2 className="text-lg font-bold text-[#2C5F7C] mb-4">Quick Actions</h2>
          
          <div className="space-y-3">
            <Link
              href="/doctor/schedule"
              className="flex items-center justify-between p-3 bg-white/50 hover:bg-linear-to-r hover:from-[#91C8E4] hover:to-[#749BC2] rounded-xl transition-all group border border-[#91C8E4]/30 hover:border-[#91C8E4] shadow-md hover:shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#91C8E4] group-hover:bg-white/90 rounded-xl flex items-center justify-center transition-all">
                  <Calendar className="w-5 h-5 text-white group-hover:text-[#4682A9] transition-all" />
                </div>
                <span className="font-medium text-[#2C5F7C] group-hover:text-white text-sm transition-all">Manage Schedule</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#4682A9] group-hover:text-white transition-all" />
            </Link>

            <Link
              href="/doctor/patients"
              className="flex items-center justify-between p-3 bg-white/50 hover:bg-linear-to-r hover:from-[#749BC2] hover:to-[#4682A9] rounded-xl transition-all group border border-[#91C8E4]/30 hover:border-[#749BC2] shadow-md hover:shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#749BC2] group-hover:bg-white/90 rounded-xl flex items-center justify-center transition-all">
                  <Users className="w-5 h-5 text-white group-hover:text-[#4682A9] transition-all" />
                </div>
                <span className="font-medium text-[#2C5F7C] group-hover:text-white text-sm transition-all">View Patients</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#4682A9] group-hover:text-white transition-all" />
            </Link>

            <Link
              href="/doctor/profile"
              className="flex items-center justify-between p-3 bg-white/50 hover:bg-linear-to-r hover:from-[#4682A9] hover:to-[#749BC2] rounded-xl transition-all group border border-[#91C8E4]/30 hover:border-[#4682A9] shadow-md hover:shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#4682A9] group-hover:bg-white/90 rounded-xl flex items-center justify-center transition-all">
                  <svg className="w-5 h-5 text-white group-hover:text-[#4682A9] transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-medium text-[#2C5F7C] group-hover:text-white text-sm transition-all">Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#4682A9] group-hover:text-white transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </main>

  {/* Enhanced Logout Modal */}
  {showLogoutModal && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all border border-[#91C8E4]/20">
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
</div>
    </ProtectedRoute>
  );
}
