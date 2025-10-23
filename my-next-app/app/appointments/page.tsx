/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import { useEffect, useState } from 'react';

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
  reviewCount?: number;
}

interface User {
  id: string;
  email: string;
  mobile: string;
  location: string;
}

interface AppointmentData {
  id: string;
  status: string;
  date: string;
  time: string;
  reportingTime: string;
}

export default function AppointmentScheduledPage() {
  const searchParams = useSearchParams();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get parameters from URL
        const doctorId = searchParams.get('doctorId');
        const userId = searchParams.get('userId') || localStorage.getItem('userId');
        const appointmentDate = searchParams.get('date');
        const appointmentTime = searchParams.get('time');

        // Fetch data from API
        const response = await fetch('/api/doctors');
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        // Find the specific doctor and user
        const foundDoctor = data.doctors.find((d: Doctor) => d.id === doctorId) || data.doctors[0];
        const foundUser = data.users.find((u: User) => u.id === userId) || data.users[0];

        setDoctor(foundDoctor);
        setUser(foundUser);

        // Generate appointment data
        const appointment: AppointmentData = {
          id: `#${Math.floor(Math.random() * 100) + 1}`,
          status: "Active",
          date: appointmentDate || foundDoctor.availableDates[0],
          time: appointmentTime || foundDoctor.availableTimes[0],
          reportingTime: getReportingTime(
            appointmentDate || foundDoctor.availableDates[0], 
            appointmentTime || foundDoctor.availableTimes[0]
          )
        };

        setAppointmentData(appointment);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  function getReportingTime(date: string, time: string): string {
    try {
      const appointmentDateTime = new Date(`${date}T${time}`);
      const reportingDateTime = new Date(appointmentDateTime.getTime() - 30 * 60000);
      
      return reportingDateTime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid date';
    }
  }

  function getUserName(email: string): string {
    return email
      .split('@')[0]
      .replace(/\./g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function addToCalendar() {
    if (!appointmentData || !doctor) return;

    const event = {
      text: `Appointment with ${doctor.name}`,
      dates: `${appointmentData.date.replace(/-/g, '')}/${appointmentData.date.replace(/-/g, '')}`,
      details: `Doctor: ${doctor.name}\nSpeciality: ${doctor.speciality}\nLocation: ${doctor.location}`,
      location: doctor.location
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.text)}&dates=${event.dates}&details=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(calendarUrl, '_blank');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4FC3F7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!doctor || !user || !appointmentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load appointment details</p>
          <Link href="/home" className="mt-4 inline-block text-blue-500 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link 
              href="/home" 
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <FaArrowLeft className="text-xl text-gray-700" />
            </Link>
            <h1 className="text-xl font-semibold text-white-800 ml-4">Appointment Scheduled</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Doctor Information Card - Matching Home Page Style */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start space-x-6">
              <div className="relative w-32 h-32 shrink-0 rounded-2xl overflow-hidden bg-linear-to-br from-[#91C8E4] to-[#4682A9] flex items-center justify-center text-white font-bold text-3xl">
                {doctor.image ? (
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {doctor.name.split(' ')[1]?.charAt(0) || doctor.name.charAt(0)}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {doctor.name}
                    </h2>
                    <p className="text-[#4FC3F7] font-semibold text-sm mb-3">
                      {doctor.speciality}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {doctor.location && (
                    <span className="text-sm text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="truncate">{doctor.location}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {doctor.experience}+ yrs
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500 shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {doctor.rating} ({doctor.reviewCount || Math.floor(Math.random() * 50) + 10} reviews)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 font-medium">
                    <p className="text-xs text-gray-500">
                      {doctor.qualification || "MBBS, MD"}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-[#4682A9]">
                    ₹{doctor.price}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Appointment Details Card */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm text-gray-500 mb-2">Appointment ID</h3>
                <p className="text-lg font-bold text-gray-800">{appointmentData.id}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 mb-2">Status</h3>
                <p className="text-md font-semibold text-green-600">{appointmentData.status}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Date:</span>
                <span className="text-sm font-medium text-gray-800">{appointmentData.date}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Time:</span>
                <span className="text-sm font-medium text-gray-800">{appointmentData.time}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Reporting Time:</span>
                <span className="text-sm font-medium text-gray-800">{appointmentData.reportingTime}</span>
              </div>
            </div>

            <button 
              onClick={addToCalendar}
              className="flex items-center justify-center w-full px-4 py-3 border border-[#4682A9] text-[#4682A9] rounded-lg hover:bg-blue-50 transition duration-200 text-sm font-semibold"
            >
              <FaCalendarAlt className="mr-2" /> Add to calendar
            </button>
          </section>

          {/* Patient Information */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-md font-medium text-gray-700 mb-4">Patient Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Name:</span>
                <span className="text-sm font-medium text-gray-800 truncate ml-2">
                  {getUserName(user.email)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Email:</span>
                <span className="text-sm font-medium text-gray-800 truncate ml-2">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Mobile:</span>
                <span className="text-sm font-medium text-gray-800">{user.mobile}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Location:</span>
                <span className="text-sm font-medium text-gray-800 truncate ml-2">{user.location}</span>
              </div>
            </div>
          </section>

          {/* Add Patient Details */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-md font-medium text-gray-700 mb-4">Add Patient Details</h3>
            <button className="flex items-center justify-center w-full px-4 py-3 border border-[#4682A9] text-[#4682A9] rounded-lg hover:bg-blue-50 transition duration-200 text-sm font-semibold">
              <FaPlus className="mr-2" /> Add Patient History 
            </button>
          </section>
        </div>
      </main>

      {/* Footer Button */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/appointments">
            <button className="w-full bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white py-3 rounded-lg text-md font-semibold hover:shadow-md transition-all duration-200">
              View My Appointments
            </button>
          </Link>
        </div>
      </footer>
    </div>
  );
}