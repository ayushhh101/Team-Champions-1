/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, MoreVertical, X, CreditCard, XCircle } from 'lucide-react'
import BottomNavigation from '../../components/BottomNavigation'

interface Booking {
  id: string
  doctorId: string
  doctorName: string
  speciality: string
  date: string
  time: string
  status: 'confirmed' | 'completed' | 'cancelled'
  patientName: string
  patientPhone: string
  patientEmail: string
  price: number
  notes?: string
  paymentStatus?: 'paid' | 'not_paid'
  createdAt: string
}

interface Doctor {
  id: string
  name: string
  speciality: string
  image?: string
}

interface Appointment {
  id: string
  doctor: Doctor
  date: string
  time: string
  status: 'upcoming' | 'completed' | 'canceled'
  paymentStatus: 'paid' | 'not_paid'
  summaryAvailable?: boolean
  price?: number
}

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
]

export default function AppointmentHistoryPage() {
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'canceled'>('upcoming')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState<Map<string, Doctor>>(new Map())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [cancellingAppointment, setCancellingAppointment] = useState(false)

  useEffect(() => {
    fetchAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAppointments = async () => {
    try {
      // Get user email from localStorage
      const userEmail = localStorage.getItem('userEmail')

      // Fetch doctors data first
      const doctorsResponse = await fetch('/api/doctors')
      const doctorsData = await doctorsResponse.json()

      // Create a map of doctors by ID for quick lookup
      const doctorsMap = new Map<string, Doctor>()
      if (doctorsData.doctors) {
        doctorsData.doctors.forEach((doctor: any) => {
          doctorsMap.set(doctor.id, {
            id: doctor.id,
            name: doctor.name,
            speciality: doctor.speciality,
            image: doctor.image
          })
        })
      }
      setDoctors(doctorsMap)

      // Fetch bookings from API
      const response = await fetch('/api/bookings')
      const data = await response.json()

      if (data.bookings) {
        // Filter by user email if available
        let userBookings = data.bookings as Booking[]
        if (userEmail) {
          userBookings = userBookings.filter((b: Booking) => b.patientEmail === userEmail)
        }

        // Transform bookings to match Appointment interface
        const transformedAppointments: Appointment[] = userBookings.map((booking: Booking) => {
          // Determine status based on booking status
          let status: 'upcoming' | 'completed' | 'canceled' = 'upcoming'
          if (booking.status === 'confirmed') {
            // Check if appointment date has passed
            const appointmentDate = new Date(`${booking.date} ${booking.time}`)
            const now = new Date()
            status = appointmentDate < now ? 'completed' : 'upcoming'
          } else if (booking.status === 'completed') {
            status = 'completed'
          } else if (booking.status === 'cancelled') {
            status = 'canceled'
          }

          // Get doctor info from the map
          const doctorInfo = doctorsMap.get(booking.doctorId)

          return {
            id: booking.id,
            doctor: {
              id: booking.doctorId,
              name: booking.doctorName,
              speciality: booking.speciality,
              image: doctorInfo?.image
            },
            date: formatDate(booking.date),
            time: formatTime(booking.time),
            status,
            paymentStatus: booking.paymentStatus || 'not_paid',
            summaryAvailable: status === 'completed',
            price: booking.price
          }
        })

        setAppointments(transformedAppointments)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }
    return date.toLocaleDateString('en-US', options)
  }

  // Format time to 12-hour format
  const formatTime = (timeString: string) => {
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString
    }

    const [hours, minutes] = timeString.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Handle payment button click
  const handlePaymentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowPaymentModal(true)
  }

  // Handle cancel button click
  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowCancelModal(true)
  }

  // Handle payment modal close
  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedAppointment(null)
  }

  // Handle cancel modal close
  const closeCancelModal = () => {
    setShowCancelModal(false)
    setSelectedAppointment(null)
  }

  // Cancel appointment
  const cancelAppointment = async () => {
    if (!selectedAppointment) return

    setCancellingAppointment(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedAppointment.id,
          status: 'cancelled'
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh appointments
        await fetchAppointments()
        closeCancelModal()

        // Show success message (optional)
        alert('Appointment cancelled successfully')
      } else {
        alert('Failed to cancel appointment. Please try again.')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setCancellingAppointment(false)
    }
  }

  const filtered = appointments.filter(a => a.status === tab)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center">
            <Link href="/user/dashboard">
              <button className="p-2 hover:bg-[#91C8E4]/10 rounded-full transition-all duration-200">
                <ChevronLeft className="w-6 h-6 text-[#4682A9]" />
              </button>
            </Link>
            <h1 className="ml-3 text-lg sm:text-xl font-bold text-white">Appointments</h1>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-[#91C8E4]/20 bg-white">
          {TABS.map(tabOption => (
            <button
              key={tabOption.value}
              className={`flex-1 py-3 text-center text-sm font-semibold capitalize transition-all duration-300
          ${tab === tabOption.value
                  ? 'text-[#4682A9] border-b-3 border-[#4682A9] bg-[#91C8E4]/5'
                  : 'text-[#4682A9]/60 border-b-2 border-transparent hover:text-[#4682A9] hover:bg-[#91C8E4]/5'
                }`}
              onClick={() => setTab(tabOption.value as any)}
            >
              {tabOption.label}
            </button>
          ))}
        </div>
      </header>


      {/* Appointments List */}
      <div className="flex-1 px-3 py-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-[#91C8E4] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <svg width={120} height={120} fill="none" viewBox="0 0 120 120">
              <rect x="15" y="40" width="65" height="70" fill="#E7F6FD" rx="6" />
              <rect x="38" y="30" width="65" height="70" fill="#B9E1F4" rx="6" />
              <rect x="38" y="30" width="65" height="10" fill="#91C8E4" rx="2.5" />
              <rect x="15" y="40" width="65" height="10" fill="#749BC2" rx="2.5" />
              <rect x="49" y="65" width="43" height="25" fill="#F4F6F7" rx="2.5" />
            </svg>
            <h2 className="mt-8 mb-2 text-center text-[18px] font-bold text-gray-700">
              You don&apos;t have an appointment yet
            </h2>
            <p className="text-center text-gray-500 mb-8 text-sm">
              Please click the button below to book an appointment.
            </p>
            <Link href="/user/dashboard">
              <button className="w-full bg-[#91C8E4] hover:bg-[#749BC2] text-white font-semibold rounded-xl px-8 py-3 transition-all">
                Book appointment
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(appt => (
              <div key={appt.id} className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Card Content */}
                <div className="p-5">
                  {/* Top Section: Doctor Info + Payment Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1">
                      {/* Doctor Image */}
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#91C8E4] flex items-center justify-center mr-4 shrink-0">
                        {appt.doctor.image ? (
                          <Image
                            src={appt.doctor.image}
                            alt={appt.doctor.name}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-white font-bold text-2xl">
                            {appt.doctor.name.split(' ').map(w => w[0]).join('')}
                          </span>
                        )}
                      </div>

                      {/* Doctor Details */}
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-[#2C5F7C] mb-1">{appt.doctor.name}</h2>
                        <p className="text-sm font-semibold text-[#4682A9] mb-3">{appt.doctor.speciality}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-[#4682A9]">
                          <span className="inline-flex items-center gap-1.5 bg-[#91C8E4]/10 px-3 py-1.5 rounded-lg font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {appt.date}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-[#FFFBDE] px-3 py-1.5 rounded-lg">
                            <svg className="w-4 h-4 text-[#4682A9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-[#4682A9]">{appt.time}</span>
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Payment Status Badge + Menu */}
                    <div className="flex items-start gap-2">
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${appt.paymentStatus === 'paid'
                        ? 'bg-green-50 text-green-600 border border-green-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                        {appt.paymentStatus === 'paid' ? '✓ Paid' : '✗ Not paid'}
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Fee */}
                  {appt.price && (
                    <div className="text-sm font-bold text-gray-900 mb-4">
                      Fee: ₹{appt.price}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    {tab === 'upcoming' && (
                      <>
                        <Link href={`/user/doctors/${appt.doctor.id}`} className="flex-1">
                          <button className="w-full px-4 py-3 bg-[#91C8E4]/10 hover:bg-[#91C8E4]/20 text-[#4682A9] rounded-xl font-semibold text-sm border-2 border-[#91C8E4]/30 hover:border-[#91C8E4]/50 transition-all duration-300 shadow-sm hover:shadow-md">
                            View Profile
                          </button>
                        </Link>
                        {appt.paymentStatus === 'not_paid' && (
                          <button
                            onClick={() => handlePaymentClick(appt)}
                            className="flex-1 px-4 py-3 bg-linear-to-r from-[#91C8E4] to-[#4682A9] hover:from-[#749BC2] hover:to-[#4682A9] text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                          </button>
                        )}
                        <button
                          onClick={() => handleCancelClick(appt)}
                          className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-sm border-2 border-red-200 hover:border-red-300 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    )}

                    {tab === 'completed' && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link href={`/user/feedback/${appt.id}?doctorId=${appt.doctor.id}&doctorName=${encodeURIComponent(appt.doctor.name)}&speciality=${encodeURIComponent(appt.doctor.speciality)}&date=${encodeURIComponent(appt.date)}&time=${encodeURIComponent(appt.time)}`}
                          className="flex-1 min-w-[140px]"
                        >
                          <button className="w-full px-4 py-3 bg-linear-to-r from-[#91C8E4] to-[#4682A9] hover:from-[#749BC2] hover:to-[#4682A9] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                            Give Feedback
                          </button>
                        </Link>
                        {appt.summaryAvailable && (
                          <Link href={`/appointment-summary/${appt.id}`} className="flex-1 min-w-[140px]">
                            <button className="w-full px-4 py-3 bg-[#FFFBDE] hover:bg-[#FFF9E6] text-[#4682A9] border-2 border-[#91C8E4]/30 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-300">
                              View Summary
                            </button>
                          </Link>
                        )}
                      </div>
                    )}

                    {tab === 'canceled' && (
                      <Link href={`/user/doctors/${appt.doctor.id}?from=cancelled`} className="flex-1">
                        <button className="w-full px-4 py-2.5 bg-[#91C8E4] text-white rounded-xl font-semibold text-sm shadow hover:bg-[#749BC2] transition-all">
                          Rebook
                        </button>
                      </Link>
                    )}

                  </div>
                </div>

                {/* Bottom Info Banner - Only for upcoming */}
                {tab === 'upcoming' && (
                  <div className="px-5 py-3 bg-linear-to-r from-[#FFFBDE] to-[#FFF9E6] border-t border-[#91C8E4]/20 rounded-b-2xl">
                    <p className="text-xs text-[#4682A9] flex items-center gap-2">
                      <span className="text-base">💡</span>
                      <span className="font-medium">Tip: Pay upfront to reduce waiting time at the clinic</span>
                    </p>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#2C5F7C]">Complete Payment</h3>
              <button
                onClick={closePaymentModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Appointment Details */}
            <div className="bg-linear-to-r from-[#91C8E4]/10 to-[#4682A9]/10 rounded-xl p-4 mb-6 border border-[#91C8E4]/20">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#91C8E4] flex items-center justify-center mr-3">
                  {selectedAppointment.doctor.image ? (
                    <Image
                      src={selectedAppointment.doctor.image}
                      alt={selectedAppointment.doctor.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-white font-medium text-lg">
                      {selectedAppointment.doctor.name.split(' ').map(w => w[0]).join('')}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-[#2C5F7C]">{selectedAppointment.doctor.name}</h4>
                  <p className="text-xs text-[#4682A9]">{selectedAppointment.doctor.speciality}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#91C8E4]/20">
                <span className="text-sm text-[#4682A9]">
                  {selectedAppointment.date} at {selectedAppointment.time}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-[#FFFBDE] rounded-xl p-4 mb-6 border border-[#91C8E4]/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#4682A9]">Consultation Fee</span>
                <span className="font-semibold text-[#2C5F7C]">₹{selectedAppointment.price}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#91C8E4]/20">
                <span className="font-bold text-[#2C5F7C]">Total Amount</span>
                <span className="text-xl font-bold text-[#2C5F7C]">₹{selectedAppointment.price}</span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-3 mb-6">
              <p className="text-sm font-semibold text-[#4682A9] mb-3">Choose Payment Method</p>

              <Link href={`/user/payment?appointmentId=${selectedAppointment.id}&amount=${selectedAppointment.price}&doctorName=${encodeURIComponent(selectedAppointment.doctor.name)}`}>
                <button className="w-full px-4 py-3.5 bg-linear-to-r from-[#91C8E4] to-[#4682A9] hover:from-[#749BC2] hover:to-[#4682A9] text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment
                </button>
              </Link>

            </div>

            <button
              onClick={closePaymentModal}
              className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-red-600">Cancel Appointment</h3>
              <button
                onClick={closeCancelModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#91C8E4] flex items-center justify-center mr-3">
                  {selectedAppointment.doctor.image ? (
                    <Image
                      src={selectedAppointment.doctor.image}
                      alt={selectedAppointment.doctor.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-white font-medium text-lg">
                      {selectedAppointment.doctor.name.split(' ').map(w => w[0]).join('')}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{selectedAppointment.doctor.name}</h4>
                  <p className="text-xs text-gray-600">{selectedAppointment.doctor.speciality}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  {selectedAppointment.date} at {selectedAppointment.time}
                </span>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800 text-center">
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeCancelModal}
                disabled={cancellingAppointment}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                Keep Appointment
              </button>
              <button
                onClick={cancelAppointment}
                disabled={cancellingAppointment}
                className="flex-1 px-4 py-3 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancellingAppointment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Yes, Cancel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation activeTab="appointments" />
    </div>
  )
}
