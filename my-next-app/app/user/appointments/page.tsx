/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendarAlt, FaPlus } from 'react-icons/fa';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import BottomNavigation from '@/app/components/BottomNavigation';

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
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrCreateAppointment = async () => {
      try {
        // Check if appointment ID exists in URL (coming back to this page)
        const appointmentId = searchParams.get('appointmentId');
        
        if (appointmentId) {
          // Fetch existing appointment from backend
          await fetchExistingAppointment(appointmentId);
        } else {
          // Create new appointment in backend
          await createNewAppointment();
        }
      } catch (error) {
        console.error('Error handling appointment:', error);
        setError('Failed to load appointment details. Please try again.');
        setIsLoading(false);
      }
    };

    fetchOrCreateAppointment();
  }, [searchParams]);

  const fetchExistingAppointment = async (appointmentId: string) => {
    try {
      // Fetch appointment from backend
      const response = await fetch(`/api/bookings`);
      const data = await response.json();

      if (data.success && data.bookings) {
        const booking = data.bookings.find((b: any) => b.id === appointmentId);
        
        if (booking) {
          // Fetch doctor details
          const doctorsResponse = await fetch('/api/doctors');
          const doctorsData = await doctorsResponse.json();
          const foundDoctor = doctorsData.doctors.find((d: Doctor) => d.id === booking.doctorId);
          const foundUser = doctorsData.users.find((u: User) => u.email === booking.patientEmail) || doctorsData.users[0];

          if (foundDoctor && foundUser) {
            setDoctor(foundDoctor);
            setUser(foundUser);

            const appointment: AppointmentData = {
              id: booking.id,
              status: booking.status === 'confirmed' ? 'Confirmed' : booking.status,
              date: formatDateDisplay(booking.date),
              time: booking.time,
              reportingTime: getReportingTime(booking.date, booking.time)
            };

            setAppointmentData(appointment);
          }
        } else {
          throw new Error('Appointment not found');
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      setError('Appointment not found. Please book a new appointment.');
      setIsLoading(false);
    }
  };

  const createNewAppointment = async () => {
    try {
      const doctorId = searchParams.get('doctorId');
      const appointmentDate = searchParams.get('date');
      const appointmentTime = searchParams.get('time');

      if (!doctorId) {
        setError('Doctor information is missing. Please book an appointment again.');
        setIsLoading(false);
        return;
      }

      // Fetch doctor and user data
      const response = await fetch('/api/doctors');
      const data = await response.json();

      const foundDoctor = data.doctors.find((d: Doctor) => d.id === doctorId);
      const userEmail = localStorage.getItem('userEmail');
      const foundUser = data.users.find((u: User) => u.email === userEmail) || data.users[0];

      if (!foundDoctor || !foundUser) {
        throw new Error('Doctor or user not found');
      }

      setDoctor(foundDoctor);
      setUser(foundUser);

      // Generate unique booking ID
      const bookingId = Date.now().toString();
      const finalDate = appointmentDate || foundDoctor.availableDates[0] || new Date().toISOString().split('T')[0];
      const finalTime = appointmentTime || foundDoctor.availableTimes[0] || '10:00 AM';

      // Create booking object
      const bookingData = {
        id: bookingId,
        doctorId: foundDoctor.id,
        doctorName: foundDoctor.name,
        speciality: foundDoctor.speciality,
        date: finalDate,
        time: finalTime,
        patientName: getUserName(foundUser.email),
        patientPhone: foundUser.mobile,
        patientEmail: foundUser.email,
        notes: '',
        price: foundDoctor.price,
        status: 'confirmed',
        paymentStatus: 'not_paid',
        createdAt: new Date().toISOString()
      };

      // Save to backend (data.json)
      const saveResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const saveResult = await saveResponse.json();

      if (saveResult.success) {
        // Set appointment data using the booking ID
        const appointment: AppointmentData = {
          id: bookingId,
          status: 'Confirmed',
          date: formatDateDisplay(finalDate),
          time: finalTime,
          reportingTime: getReportingTime(finalDate, finalTime)
        };

        setAppointmentData(appointment);

        // Update URL with appointment ID so it persists on refresh
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('appointmentId', bookingId);
        window.history.replaceState({}, '', newUrl.toString());
      } else {
        throw new Error('Failed to save appointment to backend');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError('Failed to create appointment. Please try again.');
      setIsLoading(false);
    }
  };

  function formatDateDisplay(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  function getReportingTime(date: string, time: string): string {
    try {
      let time24h = time;
      if (time.includes('AM') || time.includes('PM')) {
        const [timePart, modifier] = time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        time24h = `${hours.toString().padStart(2, '0')}:${minutes?.toString().padStart(2, '0') || '00'}`;
      }

      const appointmentDateTime = new Date(`${date}T${time24h}`);
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
      console.error('Error calculating reporting time:', error);
      return '30 minutes before appointment';
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

    try {
      let time24h = appointmentData.time;
      if (appointmentData.time.includes('AM') || appointmentData.time.includes('PM')) {
        const [timePart, modifier] = appointmentData.time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        time24h = `${hours.toString().padStart(2, '0')}:${minutes?.toString().padStart(2, '0') || '00'}`;
      }

      const startDate = new Date(`${appointmentData.date}T${time24h}`);
      const endDate = new Date(startDate.getTime() + 60 * 60000);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
      }

      const formatDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
      };

      const event = {
        text: `Appointment with Dr. ${doctor.name}`,
        dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
        details: `Appointment with Dr. ${doctor.name}\nSpeciality: ${doctor.speciality}\nLocation: ${doctor.location}\nAppointment ID: ${appointmentData.id}`,
        location: doctor.location
      };

      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.text)}&dates=${event.dates}&details=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}`;
      
      window.open(calendarUrl, '_blank');
    } catch (error) {
      console.error('Error creating calendar event:', error);
      alert('Could not open calendar. Please try again.');
    }
  }

  const handleAddPatientDetails = () => {
    if (appointmentData) {
      router.push(`/user/add-patient/${appointmentData.id}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

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

  if (error || !doctor || !user || !appointmentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Unable to Load Appointment</h2>
          <p className="text-red-600 mb-6">{error || 'Appointment details not found'}</p>
          <div className="space-y-3">
            <Link 
              href="/user/dashboard" 
              className="block w-full bg-[#4FC3F7] text-white py-3 rounded-lg font-semibold hover:bg-[#4682A9] transition duration-200"
            >
              Book New Appointment
            </Link>
            <Link 
              href="/user/appointments" 
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition duration-200"
            >
              View My Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
        {/* Header */}
        <header className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white sticky top-0 z-50 shadow-lg">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="ml-3 text-lg sm:text-xl font-bold">Appointment Scheduled</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Success Confirmation */}
            <section className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-green-800 mb-2">Appointment Confirmed!</h2>
              <p className="text-green-600">Your appointment has been successfully scheduled</p>
            </section>

            {/* Doctor Information Card */}
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
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>
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
                className="flex items-center justify-center w-full px-4 py-3 border border-[#4682A9] text-[#4682A9] rounded-lg hover:bg-blue-50 transition duration-200 text-sm font-semibold mb-4"
              >
                <FaCalendarAlt className="mr-2" /> Add to calendar
              </button>
            </section>

            {/* Patient Information */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Medical History</h3>
              <button 
                onClick={handleAddPatientDetails}
                className="flex items-center justify-center w-full px-4 py-4 bg-[#4682A9] text-white rounded-lg hover:bg-[#3a6c8a] transition duration-200 text-base font-semibold shadow-md"
              >
                <FaPlus className="mr-3 text-lg" /> Add Patient Medical Details
              </button>
            </section>
          </div>
        </main>

        <BottomNavigation activeTab="appointments" />
      </div>
    </ProtectedRoute>
  );
}
