/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  MoreVertical, 
  CheckCircle, 
  Edit3, 
  FileText,
  Filter,
  Search,
  CalendarDays,
  List
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface Booking {
  id: string;
  doctorId: string;
  doctorName: string;
  speciality: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  price: number;
  notes?: string;
  paymentStatus?: 'paid' | 'not_paid';
  createdAt: string;
}

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  location: string;
  image?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    patientName: string;
    patientPhone: string;
    status: string;
    price: number;
    notes?: string;
  };
}

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
];

const VIEW_MODES = [
  { value: 'list', label: 'List View', icon: List },
  { value: 'calendar', label: 'Calendar View', icon: CalendarDays },
];

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Booking[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [dayPreview, setDayPreview] = useState<{
    date: Date;
    appointments: Booking[];
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentForAction, setSelectedAppointmentForAction] = useState<CalendarEvent | null>(null);
  const [pendingReschedule, setPendingReschedule] = useState<{
    appointmentId: string;
    newDate: string;
    newTime: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, activeTab, searchQuery, selectedDate]);

  useEffect(() => {
    generateCalendarEvents();
  }, [filteredAppointments]);

  // Handle escape key and click outside to close modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showEventModal) {
          setShowEventModal(false);
          setSelectedEvent(null);
        }
        if (showCancelModal) {
          setShowCancelModal(false);
          setSelectedAppointmentForAction(null);
        }
        if (showRescheduleModal) {
          setShowRescheduleModal(false);
          setPendingReschedule(null);
        }
        // Also close day preview on escape
        if (dayPreview) {
          setDayPreview(null);
        }
      }
    };

    if (showEventModal || showCancelModal || showRescheduleModal) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Always listen for escape to close preview
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showEventModal, showCancelModal, showRescheduleModal, dayPreview]);

  // Cleanup day preview on component unmount or when view mode changes
  useEffect(() => {
    return () => {
      setDayPreview(null);
    };
  }, [viewMode]);

  const fetchDoctorAppointments = async () => {
    try {
      const doctorId = localStorage.getItem('doctorId');
      
      if (!doctorId) {
        router.push('/doctor/login');
        return;
      }

      // Fetch doctor data
      const doctorResponse = await fetch('/api/doctors');
      const doctorData = await doctorResponse.json();
      const loggedInDoctor = doctorData.doctors?.find((d: any) => d.id === doctorId);
      
      if (loggedInDoctor) {
        setDoctor({
          id: loggedInDoctor.id,
          name: loggedInDoctor.name,
          speciality: loggedInDoctor.speciality,
          location: loggedInDoctor.location,
          image: loggedInDoctor.image
        });
      }

      // Fetch bookings
      const bookingsResponse = await fetch('/api/bookings');
      const bookingsData = await bookingsResponse.json();

      if (bookingsData.bookings) {
        // Filter appointments for this doctor
        const doctorAppointments = bookingsData.bookings.filter(
          (booking: Booking) => booking.doctorId === doctorId
        );
        
        setAppointments(doctorAppointments);
        console.log('Fetched doctor appointments:', doctorAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    // Filter by tab (upcoming/past)
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(apt => {
        const appointmentDate = new Date(`${apt.date} ${apt.time}`);
        const now = new Date();
        return appointmentDate >= now || apt.status === 'confirmed';
      });
    } else {
      filtered = filtered.filter(apt => {
        const appointmentDate = new Date(`${apt.date} ${apt.time}`);
        const now = new Date();
        return appointmentDate < now || apt.status === 'completed';
      });
    }

    // Filter by search query (patient name)
    if (searchQuery) {
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected date
    if (selectedDate) {
      filtered = filtered.filter(apt => apt.date === selectedDate);
    }

    setFilteredAppointments(filtered);
  };

  const generateCalendarEvents = () => {
    const events: CalendarEvent[] = filteredAppointments.map(appointment => {
      const startDateTime = new Date(`${appointment.date}T${appointment.time}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Add 1 hour

      const getEventColor = (status: string) => {
        switch (status) {
          case 'confirmed':
            return { bg: '#3B82F6', border: '#2563EB' }; // Blue
          case 'completed':
            return { bg: '#10B981', border: '#059669' }; // Green
          case 'cancelled':
            return { bg: '#EF4444', border: '#DC2626' }; // Red
          default:
            return { bg: '#F59E0B', border: '#D97706' }; // Yellow
        }
      };

      const colors = getEventColor(appointment.status);

      return {
        id: appointment.id,
        title: `${appointment.patientName}`,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        backgroundColor: colors.bg,
        borderColor: colors.border,
        extendedProps: {
          patientName: appointment.patientName,
          patientPhone: appointment.patientPhone,
          status: appointment.status,
          price: appointment.price,
          notes: appointment.notes
        }
      };
    });

    setCalendarEvents(events);
    console.log('Generated calendar events:', events);
  };

  // Helper function to get appointments for a specific date - memoized
  const getAppointmentsForDate = useCallback((dateStr: string): typeof filteredAppointments => {
    return filteredAppointments.filter(appointment => appointment.date === dateStr);
  }, [filteredAppointments]);

  // Handle day hover with improved positioning and performance - memoized
  const handleDayHover = useCallback((date: Date, mouseX: number, mouseY: number) => {
    const dateStr = date.toISOString().split('T')[0];
    const appointments = getAppointmentsForDate(dateStr);
    
    if (appointments.length > 0) {
      // Calculate better positioning
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const previewWidth = 350; // Updated to match new max-width
      const previewHeight = Math.max(150, appointments.length * 100 + 70); // Dynamic height with more padding
      
      let adjustedX = mouseX + 15;
      let adjustedY = mouseY - 15;
      
      // Keep preview within viewport bounds
      if (adjustedX + previewWidth > viewportWidth) {
        adjustedX = mouseX - previewWidth - 15;
      }
      if (adjustedY + previewHeight > viewportHeight) {
        adjustedY = mouseY - previewHeight - 15;
      }
      if (adjustedX < 10) adjustedX = 10;
      if (adjustedY < 10) adjustedY = 10;
      
      setDayPreview({
        date,
        appointments,
        mouseX: adjustedX,
        mouseY: adjustedY
      });
    } else {
      setDayPreview(null);
    }
  }, [getAppointmentsForDate]);

  // Handle day leave - memoized
  const handleDayLeave = useCallback(() => {
    setDayPreview(null);
  }, []);

  // Handle appointment rescheduling via drag and drop
  const handleEventDrop = async (dropInfo: any) => {
    const { event, delta, revert } = dropInfo;
    
    // Calculate new date and time
    const newStartDate = event.start;
    const newDate = newStartDate.toISOString().split('T')[0];
    const newTime = newStartDate.toTimeString().split(' ')[0].substring(0, 5);
    
    console.log('Dropping event:', {
      appointmentId: event.id,
      newDate,
      newTime,
      originalStart: event.start
    });

    try {
      const response = await fetch('/api/calendar', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: event.id,
          newDate,
          newTime,
          action: 'reschedule'
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Failed to reschedule appointment:', result.message);
        revert(); // Revert the event to its original position
        alert('Failed to reschedule appointment. Please try again.');
        return;
      }

      console.log('Appointment rescheduled successfully:', result);
      
      // Update the event's extended properties
      event.setExtendedProp('rescheduled', true);
      
      // Refresh the appointments data
      await fetchDoctorAppointments();
      
      // Show success message
      alert(`Appointment rescheduled to ${newDate} at ${newTime}`);
      
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      revert(); // Revert the event to its original position
      alert('Failed to reschedule appointment. Please try again.');
    }
  };

  // Handle appointment resizing (changing duration)
  const handleEventResize = async (resizeInfo: any) => {
    const { event, endDelta, revert } = resizeInfo;
    
    // For simplicity, we'll revert resize operations since we're using fixed 1-hour slots
    // You can implement custom duration handling here if needed
    revert();
    alert('Appointment duration is fixed at 1 hour. Use drag to reschedule the entire appointment.');
  };

  // Handle cancel appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          action: 'cancel'
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Failed to cancel appointment:', result.message);
        alert('Failed to cancel appointment. Please try again.');
        return;
      }

      console.log('Appointment cancelled successfully:', result);
      
      // Refresh the appointments data
      await fetchDoctorAppointments();
      
      // Close any open modals
      setShowCancelModal(false);
      setShowEventModal(false);
      setSelectedAppointmentForAction(null);
      
      alert('Appointment cancelled successfully');
      
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const event: CalendarEvent = {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.start.toISOString(),
      end: clickInfo.event.end.toISOString(),
      backgroundColor: clickInfo.event.backgroundColor,
      borderColor: clickInfo.event.borderColor,
      extendedProps: clickInfo.event.extendedProps
    };
    
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#91C8E4] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#4682A9] font-semibold text-lg">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20">
      {/* Header */}
      <header className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white sticky top-0 z-50 shadow-lg">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/20 rounded-full transition-colors mr-3"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">My Appointments</h1>
                <p className="text-sm text-white/80">Manage your patient appointments</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex bg-white/20 rounded-lg p-1">
                {VIEW_MODES.map((mode) => {
                  const IconComponent = mode.icon;
                  return (
                    <button
                      key={mode.value}
                      onClick={() => setViewMode(mode.value as 'list' | 'calendar')}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                        viewMode === mode.value
                          ? 'bg-white text-[#4682A9] shadow-sm'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
              <Link href="/doctor/prescriptions/list">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-semibold">
             <FileText className="w-4 h-4" />
             <span className="hidden sm:inline">Prescriptions</span>
            </button>
             </Link>

            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Doctor Info Card */}
        {doctor && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
                <Image
                  src={doctor.image || '/default-doctor.png'}
                  alt={doctor.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#2C5F7C] mb-1">{doctor.name}</h2>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-[#4FC3F7] font-semibold bg-[#4FC3F7]/10 px-3 py-1 rounded-lg">
                    {doctor.speciality}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#4682A9]">
                  {filteredAppointments.length}
                </div>
                <div className="text-sm text-gray-500">
                  {activeTab === 'upcoming' ? 'Upcoming' : 'Past'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 mb-6">
          <div className="flex space-x-2">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as 'upcoming' | 'past')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all text-center ${
                  activeTab === tab.value
                    ? 'bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter - Only show in list view */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] focus:border-transparent"
                />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none text-black focus:ring-2 focus:ring-[#4FC3F7] focus:border-transparent"
                />
              </div>
              {(searchQuery || selectedDate) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDate('');
                  }}
                  className="px-4 py-3 text-gray-500 hover:text-gray-700 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Current Date - Only show in list view */}
        {viewMode === 'list' && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#2C5F7C] mb-2">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
          </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'list' ? (
          /* List View */
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No appointments found</h3>
                <p className="text-gray-500">
                  {activeTab === 'upcoming' 
                    ? "You don't have any upcoming appointments." 
                    : "You don't have any past appointments."}
                </p>
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#4FC3F7]/10 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-[#4FC3F7]" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-[#2C5F7C]">{appointment.patientName}</h4>
                        <span
                          className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(appointment.status)}`}
                        >
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-[#4682A9]">₹{appointment.price}</span>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatTime(appointment.time)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{appointment.patientPhone}</span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <p className="text-sm text-gray-600">{appointment.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {appointment.status === 'confirmed' && (
                        <button className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark Complete</span>
                        </button>
                      )}
                      <button className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                        <Edit3 className="w-4 h-4" />
                        <span>View History</span>
                      </button>
                    </div>
                    <Link href={`/doctor/prescription?appointmentId=${appointment.id}`}>
                     <button className="flex items-center space-x-1 px-3 py-2 bg-[#4FC3F7]/10 text-[#4FC3F7] rounded-lg hover:bg-[#4FC3F7]/20 transition-colors text-sm font-medium">
                     <FileText className="w-4 h-4" />
                     <span>Write Prescription</span>
                    </button>
                   </Link>

                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Calendar View */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <style jsx global>{`
                .fc {
                  color: #000000 !important;
                }
                .fc-theme-standard td, .fc-theme-standard th {
                  border-color: #e5e7eb !important;
                }
                .fc-toolbar-title {
                  color: #1f2937 !important;
                  font-weight: 600;
                }
                .fc-button {
                  background-color: #4682A9 !important;
                  border-color: #4682A9 !important;
                  color: white !important;
                }
                .fc-button:hover {
                  background-color: #2C5F7C !important;
                  border-color: #2C5F7C !important;
                }
                .fc-button:focus {
                  box-shadow: 0 0 0 0.2rem rgba(70, 130, 169, 0.25) !important;
                }
                .fc-button-active {
                  background-color: #2C5F7C !important;
                  border-color: #2C5F7C !important;
                }
                .fc-daygrid-day-number {
                  color: #374151 !important;
                  font-weight: 500;
                }
                .fc-col-header-cell {
                  background-color: #f9fafb !important;
                }
                .fc-col-header-cell-cushion {
                  color: #6b7280 !important;
                  font-weight: 600;
                  text-transform: uppercase;
                  font-size: 0.75rem;
                }
                .fc-event {
                  border-radius: 6px !important;
                  border: none !important;
                  padding: 2px 4px !important;
                  font-size: 0.75rem !important;
                  font-weight: 500 !important;
                  color: white !important;
                  margin: 1px 0 !important;
                  cursor: move !important;
                  position: relative !important;
                }
                .fc-event:hover {
                  opacity: 0.9 !important;
                  transform: scale(1.02) !important;
                  transition: all 0.2s ease !important;
                  cursor: move !important;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
                }
                .fc-event.fc-event-dragging {
                  opacity: 0.6 !important;
                  transform: rotate(5deg) !important;
                  z-index: 1000 !important;
                  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
                }
                .fc-event-cancel-btn {
                  position: absolute;
                  top: -5px;
                  right: -5px;
                  width: 16px;
                  height: 16px;
                  background: #ef4444;
                  border-radius: 50%;
                  border: 1px solid white;
                  color: white;
                  font-size: 10px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 10;
                }
                .fc-event-cancel-btn:hover {
                  background: #dc2626;
                }
                .fc-event-title {
                  color: white !important;
                  overflow: hidden !important;
                  text-overflow: ellipsis !important;
                  white-space: nowrap !important;
                }
                .fc-more-link {
                  color: #4682A9 !important;
                  font-weight: 500 !important;
                }
                .fc-popover {
                  border: 1px solid #e5e7eb !important;
                  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1) !important;
                  border-radius: 12px !important;
                }
                .fc-popover-header {
                  background-color: #f9fafb !important;
                  border-bottom: 1px solid #e5e7eb !important;
                  padding: 8px 12px !important;
                  border-radius: 12px 12px 0 0 !important;
                }
                .fc-popover-title {
                  color: #1f2937 !important;
                  font-weight: 600 !important;
                }
                .fc-today {
                  background-color: #f0f9ff !important;
                }
                .fc-day-other {
                  opacity: 0.5 !important;
                }
                .fc-daygrid-day:hover {
                  background-color: #f8fafc !important;
                  cursor: pointer !important;
                  transition: background-color 0.2s ease !important;
                }
                .fc-daygrid-day.has-appointments {
                  position: relative !important;
                }
                .fc-daygrid-day.has-appointments::after {
                  content: '' !important;
                  position: absolute !important;
                  top: 2px !important;
                  right: 2px !important;
                  width: 6px !important;
                  height: 6px !important;
                  background: #4FC3F7 !important;
                  border-radius: 50% !important;
                  z-index: 1 !important;
                  box-shadow: 0 0 0 1px white !important;
                }
                .fc-daygrid-day.has-appointments:hover {
                  background-color: #eff6ff !important;
                  border: 1px solid #bfdbfe !important;
                  cursor: pointer !important;
                  transform: scale(1.02) !important;
                  transition: all 0.2s ease !important;
                  z-index: 2 !important;
                  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.2) !important;
                }
                .day-preview {
                  position: fixed;
                  background: white;
                  border: 1px solid #e5e7eb;
                  border-radius: 12px;
                  padding: 16px;
                  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                  z-index: 10000;
                  max-width: 350px;
                  min-width: 280px;
                  font-family: system-ui, -apple-system, sans-serif;
                  pointer-events: none;
                  user-select: none;
                  opacity: 0;
                  animation: fadeIn 0.15s ease-out forwards;
                  backdrop-filter: blur(8px);
                  border: 2px solid #4FC3F7;
                  background: rgba(255, 255, 255, 0.95);
                }
                
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(-5px) scale(0.95);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
                }
                .fc-highlight {
                  background: rgba(79, 195, 247, 0.3) !important;
                  border: 2px dashed #4FC3F7 !important;
                }
                .fc-event-dragging .fc-event-main {
                  pointer-events: none;
                }
                .fc-daygrid-day.fc-day-today .fc-daygrid-day-bg {
                  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
                }
              `}</style>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={calendarEvents}
                eventClick={handleEventClick}
                editable={true}
                droppable={true}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                eventMouseEnter={(mouseEnterInfo) => {
                  const event = mouseEnterInfo.event;
                  const tooltip = document.createElement('div');
                  tooltip.className = 'fc-tooltip';
                  tooltip.innerHTML = `
                    <div style="
                      background: white;
                      border: 1px solid #e5e7eb;
                      border-radius: 8px;
                      padding: 12px;
                      box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
                      font-size: 14px;
                      color: #1f2937;
                      z-index: 1000;
                      position: absolute;
                      max-width: 250px;
                      font-family: system-ui, -apple-system, sans-serif;
                    ">
                      <div style="font-weight: 600; margin-bottom: 8px; color: #2C5F7C;">
                        ${event.extendedProps.patientName}
                      </div>
                      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: #6b7280; font-size: 12px;">
                        <span>📞</span>
                        <span>${event.extendedProps.patientPhone}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: #6b7280; font-size: 12px;">
                        <span>🕒</span>
                        <span>${event.start ? event.start.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit', 
                          hour12: true 
                        }) : 'Time not available'}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; color: #6b7280; font-size: 12px;">
                        <span>💰</span>
                        <span>₹${event.extendedProps.price}</span>
                      </div>
                      <div style="
                        display: inline-block;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 11px;
                        font-weight: 500;
                        ${event.extendedProps.status === 'confirmed' ? 'background-color: #dbeafe; color: #1d4ed8;' :
                          event.extendedProps.status === 'completed' ? 'background-color: #dcfce7; color: #16a34a;' :
                          'background-color: #fee2e2; color: #dc2626;'}
                      ">
                        ${event.extendedProps.status.charAt(0).toUpperCase() + event.extendedProps.status.slice(1)}
                      </div>
                      ${event.extendedProps.notes ? `
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                          📝 ${event.extendedProps.notes}
                        </div>
                      ` : ''}
                    </div>
                  `;
                  
                  document.body.appendChild(tooltip);
                  
                  const updateTooltipPosition = (e: any) => {
                    tooltip.style.left = (e.pageX + 10) + 'px';
                    tooltip.style.top = (e.pageY - 10) + 'px';
                  };
                  
                  mouseEnterInfo.el.addEventListener('mousemove', updateTooltipPosition);
                  updateTooltipPosition(mouseEnterInfo.jsEvent);
                  
                  mouseEnterInfo.el.setAttribute('data-tooltip', 'true');
                }}
                eventMouseLeave={(mouseLeaveInfo) => {
                  const tooltip = document.querySelector('.fc-tooltip');
                  if (tooltip) {
                    tooltip.remove();
                  }
                  mouseLeaveInfo.el.removeAttribute('data-tooltip');
                }}
                height="auto"
                eventDisplay="block"
                dayMaxEvents={3}
                moreLinkClick="popover"
                eventTimeFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  meridiem: 'short'
                }}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                businessHours={{
                  daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday - Saturday
                  startTime: '08:00',
                  endTime: '18:00'
                }}
                eventClassNames="cursor-pointer hover:opacity-90 transition-all duration-200"
                dayCellClassNames="hover:bg-gray-50 transition-colors"
                eventContent={(eventInfo) => {
                  const { event } = eventInfo;
                  return (
                    <div className="relative w-full h-full">
                      <div className="truncate text-xs">
                        {event.title}
                      </div>
                      <button
                        className="fc-event-cancel-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointmentForAction(event as any);
                          setShowCancelModal(true);
                        }}
                        title="Cancel appointment"
                      >
                        ×
                      </button>
                    </div>
                  );
                }}
                dayCellDidMount={(info) => {
                  // Add hover event listeners to day cells
                  const dayEl = info.el;
                  const dateStr = info.date.toISOString().split('T')[0];
                  
                  // Check for appointments on this date
                  const hasAppointments = filteredAppointments.some(apt => apt.date === dateStr);
                  
                  // Add visual indicator for days with appointments
                  if (hasAppointments) {
                    dayEl.classList.add('has-appointments');
                  }
                  
                  // Use a single mousemove handler with throttling
                  let isHovering = false;
                  let throttleTimeout: NodeJS.Timeout | null = null;
                  
                  const handleMouseEnter = (e: MouseEvent) => {
                    isHovering = true;
                    const appointments = getAppointmentsForDate(dateStr);
                    if (appointments.length > 0) {
                      handleDayHover(info.date, e.pageX, e.pageY);
                    }
                  };
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    if (!isHovering) return;
                    
                    // Throttle position updates
                    if (throttleTimeout) {
                      clearTimeout(throttleTimeout);
                    }
                    
                    throttleTimeout = setTimeout(() => {
                      const appointments = getAppointmentsForDate(dateStr);
                      if (appointments.length > 0 && isHovering) {
                        handleDayHover(info.date, e.pageX, e.pageY);
                      }
                    }, 50); // Reduced frequency for smoother performance
                  };
                  
                  const handleMouseLeave = () => {
                    isHovering = false;
                    if (throttleTimeout) {
                      clearTimeout(throttleTimeout);
                      throttleTimeout = null;
                    }
                    handleDayLeave();
                  };
                  
                  // Add event listeners
                  dayEl.addEventListener('mouseenter', handleMouseEnter);
                  dayEl.addEventListener('mousemove', handleMouseMove);
                  dayEl.addEventListener('mouseleave', handleMouseLeave);
                  
                  // Store cleanup function
                  (dayEl as any)._cleanupHover = () => {
                    dayEl.removeEventListener('mouseenter', handleMouseEnter);
                    dayEl.removeEventListener('mousemove', handleMouseMove);
                    dayEl.removeEventListener('mouseleave', handleMouseLeave);
                    if (throttleTimeout) {
                      clearTimeout(throttleTimeout);
                    }
                  };
                }}
                eventWillUnmount={(info) => {
                  // Cleanup event listeners when component unmounts
                  if ((info.el as any)._cleanupHover) {
                    (info.el as any)._cleanupHover();
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Day Preview Tooltip */}
      {dayPreview && dayPreview.appointments.length > 0 && (
        <div 
          className="day-preview"
          style={{
            left: `${dayPreview.mouseX}px`,
            top: `${dayPreview.mouseY}px`
          }}
        >
          <div className="font-semibold text-gray-800 mb-3 text-sm border-b border-gray-200 pb-2">
            {dayPreview.date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })}
            <span className="text-xs text-gray-500 ml-2">
              ({dayPreview.appointments.length} appointment{dayPreview.appointments.length > 1 ? 's' : ''})
            </span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dayPreview.appointments.map((appointment, index) => (
              <div key={`${appointment.id}-${index}`} className="border-l-3 border-blue-400 pl-3 py-2 bg-gray-50 rounded-r-lg">
                <div className="font-medium text-sm text-gray-900 mb-1">
                  {appointment.patientName}
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-1">
                    🕒 {formatTime(appointment.time)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    💰 ₹{appointment.price}
                  </span>
                  <span className="flex items-center gap-1">
                    📞 {appointment.patientPhone}
                  </span>
                </div>
                {appointment.notes && (
                  <div className="text-xs text-gray-500 mt-2 p-2 bg-white rounded border-l-2 border-blue-200">
                    <span className="text-blue-600 font-medium">Note:</span> {appointment.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowEventModal(false);
              setSelectedEvent(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#2C5F7C]">Appointment Details</h3>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#4FC3F7]/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-[#4FC3F7]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedEvent.extendedProps.patientName}</p>
                  <p className="text-sm text-gray-500">Patient</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#4FC3F7]/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#4FC3F7]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedEvent.extendedProps.patientPhone}</p>
                  <p className="text-sm text-gray-500">Phone Number</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#4FC3F7]/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#4FC3F7]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedEvent.start).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedEvent.start).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })} - {new Date(selectedEvent.end).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusColor(selectedEvent.extendedProps.status)}`}
                >
                  {getStatusText(selectedEvent.extendedProps.status)}
                </span>
                <span className="text-lg font-bold text-[#4682A9]">₹{selectedEvent.extendedProps.price}</span>
              </div>

              {selectedEvent.extendedProps.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">{selectedEvent.extendedProps.notes}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              {selectedEvent.extendedProps.status === 'confirmed' && (
                <button 
                  onClick={() => {
                    setSelectedAppointmentForAction(selectedEvent);
                    setShowCancelModal(true);
                    setShowEventModal(false);
                  }}
                  className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  Cancel Appointment
                </button>
              )}
              <button className="flex-1 bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors font-medium">
                Mark Complete
              </button>
              <Link href={`/doctor/prescription?appointmentId=${selectedEvent.id}`} className="flex-1">
               <button className="w-full bg-[#4FC3F7]/10 text-[#4FC3F7] py-2 px-4 rounded-lg hover:bg-[#4FC3F7]/20 transition-colors font-medium">
               Write Prescription
              </button>
              </Link>

            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedAppointmentForAction && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowCancelModal(false);
              setSelectedAppointmentForAction(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600">Cancel Appointment</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedAppointmentForAction(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to cancel this appointment?
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedAppointmentForAction.extendedProps?.patientName}
                    </p>
                    <p className="text-sm text-gray-500">Patient</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedAppointmentForAction.start).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedAppointmentForAction.start).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This action cannot be undone. The patient will need to book a new appointment.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedAppointmentForAction(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Keep Appointment
              </button>
              <button
                onClick={() => {
                  if (selectedAppointmentForAction) {
                    handleCancelAppointment(selectedAppointmentForAction.id);
                  }
                }}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Confirmation Modal */}
      {showRescheduleModal && pendingReschedule && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowRescheduleModal(false);
              setPendingReschedule(null);
              // Revert the calendar event if user cancels
              fetchDoctorAppointments();
            }
          }}
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-600">Confirm Reschedule</h3>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setPendingReschedule(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Do you want to reschedule this appointment to the new time?
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">New Date & Time:</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(pendingReschedule.newDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {pendingReschedule.newTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setPendingReschedule(null);
                  // Revert the calendar event if user cancels
                  fetchDoctorAppointments();
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (pendingReschedule) {
                    // Proceed with the reschedule
                    try {
                      const response = await fetch('/api/calendar', {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          appointmentId: pendingReschedule.appointmentId,
                          newDate: pendingReschedule.newDate,
                          newTime: pendingReschedule.newTime,
                          action: 'reschedule'
                        }),
                      });

                      const result = await response.json();

                      if (result.success) {
                        await fetchDoctorAppointments();
                        alert('Appointment rescheduled successfully!');
                      } else {
                        alert('Failed to reschedule appointment.');
                      }
                    } catch (error) {
                      console.error('Error:', error);
                      alert('Failed to reschedule appointment.');
                    }
                    
                    setShowRescheduleModal(false);
                    setPendingReschedule(null);
                  }
                }}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}