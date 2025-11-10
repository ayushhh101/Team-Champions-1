/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, User, Pill, Clock, FileText, Phone, Mail, MapPin } from 'lucide-react';

interface PatientHistory {
  patientInfo: {
    name: string;
    email: string;
    phone?: string;
    totalAppointments: number;
  };
  appointments: Array<{
    id: string;
    date: string;
    time: string;
    type: string;
    status: string;
    diagnosis?: string;
  }>;
  prescriptions: Array<{
    id: string;
    date: string;
    diagnosis: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    followUpDate?: string;
  }>;
}

export default function PatientHistoryPage() {
  const [patientHistory, setPatientHistory] = useState<PatientHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientEmail = searchParams.get('email');

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        if (!patientEmail) {
          router.push('/doctor/dashboard');
          return;
        }

        const doctorId = localStorage.getItem('doctorId');
        if (!doctorId) {
          router.push('/doctor/login');
          return;
        }

        // Fetch comprehensive patient data using multiple API endpoints
        const [appointmentsResponse, bookingsResponse, prescriptionsResponse] = await Promise.all([
          fetch(`/api/appointments?doctorId=${doctorId}`),
          fetch(`/api/bookings?doctorId=${doctorId}`),
          fetch(`/api/prescriptions?doctorId=${doctorId}&patientEmail=${encodeURIComponent(patientEmail)}`)
        ]);

        const [appointmentsData, bookingsData, prescriptionsData] = await Promise.all([
          appointmentsResponse.json(),
          bookingsResponse.json(),
          prescriptionsResponse.json()
        ]);

        // Filter appointments and bookings for this specific patient
        const patientAppointments = appointmentsData.success ? 
          appointmentsData.appointments.filter((apt: any) => 
            apt.patientEmail === patientEmail || 
            apt.patientPhone === patientEmail
          ) : [];

        const patientBookings = bookingsData.success ? 
          bookingsData.bookings.filter((booking: any) => 
            booking.patientEmail === patientEmail || 
            booking.patientPhone === patientEmail
          ) : [];

        // Combine and deduplicate appointments and bookings
        const allPatientInteractions = [...patientAppointments, ...patientBookings];
        
        const uniqueInteractions = allPatientInteractions.filter((interaction, index, self) => 
          index === self.findIndex(t => 
            t.date === interaction.date && 
            t.time === interaction.time && 
            (t.patientEmail === interaction.patientEmail || t.patientPhone === interaction.patientPhone)
          )
        );

        if (uniqueInteractions.length > 0 || prescriptionsData.success) {
          // Get patient info from the most recent interaction
          const recentInteraction = uniqueInteractions.sort((a: any, b: any) => 
            new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
          )[0];

          const patientInfo = {
            name: recentInteraction?.patientName || patientEmail.split('@')[0] || 'Unknown Patient',
            email: patientEmail,
            phone: recentInteraction?.patientPhone || undefined,
            totalAppointments: uniqueInteractions.length
          };

          const appointments = uniqueInteractions
            .sort((a: any, b: any) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
            .map((interaction: any) => ({
              id: interaction.id,
              date: interaction.date || interaction.createdAt,
              time: interaction.time || 'N/A',
              type: interaction.type || interaction.appointmentType || 'Consultation',
              status: interaction.status || 'completed'
            }));

          const prescriptions = prescriptionsData.success && prescriptionsData.prescriptions ? 
            prescriptionsData.prescriptions
              .sort((a: any, b: any) => new Date(b.prescribedAt).getTime() - new Date(a.prescribedAt).getTime())
              .map((presc: any) => ({
                id: presc.id,
                date: presc.prescribedAt,
                diagnosis: presc.diagnosis || 'No diagnosis provided',
                medications: presc.medications || [],
                followUpDate: presc.followUpDate
              })) : [];

          setPatientHistory({
            patientInfo,
            appointments,
            prescriptions
          });
        } else {
          // If no data found, still show patient with empty history
          setPatientHistory({
            patientInfo: {
              name: patientEmail.split('@')[0] || 'Unknown Patient',
              email: patientEmail,
              phone: undefined,
              totalAppointments: 0
            },
            appointments: [],
            prescriptions: []
          });
        }
      } catch (error) {
        console.error('Error fetching patient history:', error);
        setPatientHistory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientHistory();
  }, [patientEmail, router]);

  const formatDate = (dateString: string) => {
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
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#91C8E4] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#4682A9] font-medium text-lg">Loading patient history...</p>
        </div>
      </div>
    );
  }

  if (!patientHistory) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
          <p className="text-gray-800 text-lg font-semibold mb-4">Patient not found</p>
          <Link href="/doctor/dashboard" className="inline-block px-6 py-3 bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 pb-20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/doctor/dashboard">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 mr-3">
                  <ChevronLeft className="w-6 h-6 text-[#4682A9]" />
                </button>
              </Link>
              <h1 className="text-xl font-bold text-[#2C5F7C]">Patient History</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Patient Info Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#91C8E4]/20 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-linear-to-r from-[#91C8E4] to-[#4682A9] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#2C5F7C]">{patientHistory.patientInfo.name}</h2>
              <p className="text-[#4682A9] font-medium">{patientHistory.patientInfo.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-[#91C8E4]/10 rounded-xl p-4 text-center border border-[#91C8E4]/20">
              <div className="text-2xl font-bold text-[#4682A9]">{patientHistory.patientInfo.totalAppointments}</div>
              <div className="text-sm text-gray-600">Total Appointments</div>
            </div>
            <div className="bg-[#749BC2]/10 rounded-xl p-4 text-center border border-[#749BC2]/20">
              <div className="text-2xl font-bold text-[#4682A9]">{patientHistory.prescriptions.length}</div>
              <div className="text-sm text-gray-600">Prescriptions</div>
            </div>
            <div className="bg-[#4682A9]/10 rounded-xl p-4 text-center border border-[#4682A9]/20">
              <div className="text-2xl font-bold text-[#4682A9]">
                {patientHistory.appointments.filter(apt => apt.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed Visits</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointments History */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#91C8E4]/20 p-6">
            <h3 className="text-xl font-bold text-[#2C5F7C] mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Appointment History
            </h3>
            
            {patientHistory.appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No appointments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patientHistory.appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-[#91C8E4]/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-[#2C5F7C]">
                        {formatDateTime(appointment.date)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        appointment.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-200' :
                        appointment.status === 'upcoming' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                        'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {appointment.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {appointment.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {appointment.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescriptions History */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#91C8E4]/20 p-6">
            <h3 className="text-xl font-bold text-[#2C5F7C] mb-6 flex items-center gap-2">
              <Pill className="w-6 h-6" />
              Prescription History
            </h3>
            
            {patientHistory.prescriptions.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No prescriptions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patientHistory.prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-[#91C8E4]/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-[#2C5F7C] mb-1">
                          {prescription.diagnosis}
                        </div>
                        <div className="text-sm text-gray-600">
                          Prescribed on {formatDate(prescription.date)}
                        </div>
                      </div>
                      {prescription.followUpDate && (
                        <span className="bg-[#749BC2]/10 text-[#4682A9] px-3 py-1 rounded-full text-xs font-medium border border-[#749BC2]/20">
                          Follow-up: {formatDate(prescription.followUpDate)}
                        </span>
                      )}
                    </div>
                    
                    {/* Medications */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-[#4682A9] text-sm">Medications:</h5>
                      <div className="grid gap-2">
                        {prescription.medications.map((med, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
                          >
                            <div className="font-medium text-gray-800">{med.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}