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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!doctor || !user || !appointmentData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm">
        <div className="flex items-center mt-2">
          <Link 
            href="/home" 
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <FaArrowLeft className="text-xl text-gray-700" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-800 ml-4">Appointment Scheduled</h1>
        </div>
      </header>

      <main className="grow p-4 space-y-4">
        {/* Doctor Information Card */}
        <section className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-linear-to-br from-[#91C8E4] to-[#4682A9] flex items-center justify-center shrink-0">
            {doctor.image ? (
              <Image
                src={doctor.image}
                alt={doctor.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {doctor.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-800 truncate">{doctor.name}</h2>
            <p className="text-sm text-gray-600 truncate">
              {doctor.speciality} • {doctor.location}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {doctor.qualification || "MBBS, MD"} • {doctor.experience}+ years experience
            </p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm text-gray-600 ml-1">
                  {doctor.rating} ({doctor.reviewCount || Math.floor(Math.random() * 50) + 10} reviews)
                </span>
              </div>
              <span className="text-lg font-bold text-blue-600">₹{doctor.price}</span>
            </div>
          </div>
        </section>

        {/* Appointment Details Card */}
        <section className="bg-white rounded-lg shadow-md p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Appointment ID</h3>
              <p className="text-lg font-bold text-gray-800">{appointmentData.id}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Status</h3>
              <p className="text-md font-semibold text-green-600">{appointmentData.status}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Date:</span>
              <span className="text-sm font-medium text-gray-800">{appointmentData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Time:</span>
              <span className="text-sm font-medium text-gray-800">{appointmentData.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Reporting Time:</span>
              <span className="text-sm font-medium text-gray-800">{appointmentData.reportingTime}</span>
            </div>
          </div>

          <button 
            onClick={addToCalendar}
            className="flex items-center justify-center w-full px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition duration-200"
          >
            <FaCalendarAlt className="mr-2" /> Add to calendar
          </button>
        </section>

        {/* Patient Information */}
        <section className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">Patient Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Name:</span>
              <span className="text-sm font-medium text-gray-800 truncate ml-2">
                {getUserName(user.email)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Email:</span>
              <span className="text-sm font-medium text-gray-800 truncate ml-2">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Mobile:</span>
              <span className="text-sm font-medium text-gray-800">{user.mobile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Location:</span>
              <span className="text-sm font-medium text-gray-800 truncate ml-2">{user.location}</span>
            </div>
          </div>
        </section>

        {/* Add Patient Details */}
        <section className="pt-2">
          <h3 className="text-md font-medium text-gray-700 mb-2">Add Additional Patient Details</h3>
          <button className="flex items-center justify-center w-full px-4 py-3 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition duration-200">
            <FaPlus className="mr-2" /> Add Medical History & Documents
          </button>
        </section>
      </main>

      {/* Footer Button */}
      <footer className="p-4 bg-white border-t border-gray-200">
        <Link href="/appointments">
          <button className="w-full bg-blue-500 text-white py-3 rounded-md text-lg font-semibold hover:bg-blue-600 transition duration-200 shadow-lg">
            View My Appointments
          </button>
        </Link>
      </footer>
    </div>
  );
}
