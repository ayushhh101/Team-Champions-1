/* eslint-disable @typescript-eslint/no-unused-vars */

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

  // Function to generate unique numeric appointment ID
  const generateNumericAppointmentId = (): string => {
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return timestamp + randomNum;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get parameters from URL
        const doctorId = searchParams.get('doctorId');
        const userId = searchParams.get('userId') || localStorage.getItem('userId');
        const appointmentDate = searchParams.get('date');
        const appointmentTime = searchParams.get('time');

        console.log('URL Parameters:', {
          doctorId,
          userId,
          appointmentDate,
          appointmentTime
        });

        // If no doctorId in URL, try to get from sessionStorage or localStorage
        const storedAppointmentData = sessionStorage.getItem('lastAppointment') || localStorage.getItem('lastAppointment');
        
        let finalDoctorId = doctorId;
        let finalDate = appointmentDate;
        let finalTime = appointmentTime;

        if (!finalDoctorId && storedAppointmentData) {
          try {
            const storedData = JSON.parse(storedAppointmentData);
            finalDoctorId = storedData.doctorId || finalDoctorId;
            finalDate = storedData.date || finalDate;
            finalTime = storedData.time || finalTime;
            console.log('Using stored appointment data:', storedData);
          } catch (parseError) {
            console.error('Error parsing stored appointment data:', parseError);
          }
        }

        if (!finalDoctorId) {
          setError('Doctor information is missing. Please book an appointment again.');
          setIsLoading(false);
          return;
        }

        // Fetch data from API
        const response = await fetch('/api/doctors');
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        // Find the specific doctor and user
        const foundDoctor = data.doctors.find((d: Doctor) => d.id === finalDoctorId);
        const foundUser = data.users.find((u: User) => u.id === userId) || data.users[0];

        if (!foundDoctor) {
          // If doctor not found, use the first doctor as fallback
          const fallbackDoctor = data.doctors[0];
          if (!fallbackDoctor) {
            throw new Error('No doctors available');
          }
          setDoctor(fallbackDoctor);
          console.warn('Requested doctor not found, using fallback doctor');
        } else {
          setDoctor(foundDoctor);
        }

        setUser(foundUser);

        // Generate appointment data with numeric ID
        const appointment: AppointmentData = {
          id: generateNumericAppointmentId(),
          status: "Confirmed",
          date: finalDate || foundDoctor?.availableDates[0] || new Date().toISOString().split('T')[0],
          time: finalTime || foundDoctor?.availableTimes[0] || '10:00 AM',
          reportingTime: getReportingTime(
            finalDate || foundDoctor?.availableDates[0] || new Date().toISOString().split('T')[0], 
            finalTime || foundDoctor?.availableTimes[0] || '10:00 AM'
          )
        };

        setAppointmentData(appointment);
        
        // Store appointment in localStorage for appointments page
        if (foundDoctor) {
          storeAppointmentInLocalStorage(appointment, foundDoctor, foundUser);
        }

        // Store in sessionStorage for recovery
        sessionStorage.setItem('lastAppointment', JSON.stringify({
          doctorId: finalDoctorId,
          date: finalDate,
          time: finalTime
        }));

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load appointment details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  function storeAppointmentInLocalStorage(appointment: AppointmentData, doctor: Doctor, user: User) {
    try {
      const storedAppointments = localStorage.getItem('userAppointments');
      const appointments = storedAppointments ? JSON.parse(storedAppointments) : [];
      
      const newAppointment = {
        id: appointment.id,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpeciality: doctor.speciality,
        doctorImage: doctor.image,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        patientName: getUserName(user.email),
        price: doctor.price,
        createdAt: new Date().toISOString()
      };
      
      appointments.unshift(newAppointment);
      localStorage.setItem('userAppointments', JSON.stringify(appointments));
      
      console.log('Appointment stored:', newAppointment);
    } catch (error) {
      console.error('Error storing appointment:', error);
    }
  }

  function getReportingTime(date: string, time: string): string {
    try {
      // Parse the time (handle both 12h and 24h formats)
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
    // Parse the appointment time to 24-hour format
    let time24h = appointmentData.time;
    if (appointmentData.time.includes('AM') || appointmentData.time.includes('PM')) {
      const [timePart, modifier] = appointmentData.time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      time24h = `${hours.toString().padStart(2, '0')}:${minutes?.toString().padStart(2, '0') || '00'}`;
    }

    // Create date objects
    const startDate = new Date(`${appointmentData.date}T${time24h}`);
    const endDate = new Date(startDate.getTime() + 60 * 60000); // 1 hour duration

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }

    // Format dates for Google Calendar (YYYYMMDDTHHmmssZ)
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
    if (appointmentData && doctor) {
      sessionStorage.setItem('returnToAppointment', JSON.stringify({
        appointmentId: appointmentData.id,
        doctorId: doctor.id,
        date: appointmentData.date,
        time: appointmentData.time
      }));
    }

    // Navigate to add-patient page with query parameter
    router.push(`/user/add-patient/${appointmentData?.id}`);
    
  };

  const handleBack = () => {
    // Go back to previous page in history
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
              href="/home" 
              className="block w-full bg-[#4FC3F7] text-white py-3 rounded-lg font-semibold hover:bg-[#4682A9] transition duration-200"
            >
              Book New Appointment
            </Link>
            <Link 
              href="/appointments" 
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

            {/* Add Patient Details - Fixed visibility and proper navigation */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Medical History</h3>
              {/* <p className="text-sm text-gray-600 mb-4">
                Add your medical history, allergies, current medications, and other important health information to help your doctor provide better care.
              </p> */}
              <button 
                onClick={handleAddPatientDetails}
                className="flex items-center justify-center w-full px-4 py-4 bg-[#4682A9] text-white rounded-lg hover:bg-[#3a6c8a] transition duration-200 text-base font-semibold shadow-md"
              >
                <FaPlus className="mr-3 text-lg" /> Add Patient Medical Details
              </button>
              <br/>
            </section>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab="appointments" />

        {/* Footer Button */}
        <footer className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Link href="/appointments">
              <button className="w-full bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white py-3 rounded-lg text-md font-semibold hover:shadow-md transition-all duration-200 shadow-lg">
                View My Appointments
              </button>
            </Link>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}