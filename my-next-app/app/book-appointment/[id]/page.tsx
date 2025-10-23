'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, Calendar, User, Phone, Mail } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Doctor {
  id: string
  name: string
  speciality: string
  location: string
  price: number | string
  rating: number
  experience: number | string
  availableDates: string[]
  availableTimes: string[]
  image?: string
  qualification?: string
  phone?: string
  about?: string
  patients?: string
  yearsExp?: string
  reviews?: string
  services?: string[]
  specialization?: string[]
}

export default function BookAppointmentPage() {
  const router = useRouter()
  const params = useParams()
  const doctorId = params.id as string

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await fetch('/api/doctors')
        const data = await response.json()
        const foundDoctor = data.doctors.find((d: Doctor) => d.id === doctorId)
        
        if (foundDoctor) {
          setDoctor(foundDoctor)
          const userEmail = localStorage.getItem('userEmail') || ''
          const userMobile = localStorage.getItem('userMobile') || ''
          setPatientEmail(userEmail)
          setPatientPhone(userMobile)
        } else {
          toast.error('Doctor not found')
          router.push('/home')
        }
      } catch (error) {
        console.error('Error fetching doctor:', error)
        toast.error('Failed to load doctor details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctor()
  }, [doctorId, router])

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime || !patientName || !patientPhone) {
      toast.error('Please fill all required fields')
      return
    }

    const appointment = {
      id: Date.now().toString(),
      doctorId: doctor?.id,
      doctorName: doctor?.name,
      speciality: doctor?.speciality,
      date: selectedDate,
      time: selectedTime,
      patientName,
      patientPhone,
      patientEmail,
      notes,
      price: doctor?.price,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }

    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]')
    existingAppointments.push(appointment)
    localStorage.setItem('appointments', JSON.stringify(existingAppointments))

    toast.success('Appointment booked successfully!', {
      duration: 2000,
      style: {
        background: '#34D399',
        color: '#ffffff',
        fontWeight: 'bold',
      },
    })

    setTimeout(() => {
      router.push('/appointments')
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4682A9]"></div>
      </div>
    )
  }

  if (!doctor) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-gradient-to-r from-[#91C8E4] to-[#4682A9] text-white sticky top-0 z-50 shadow-lg">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="ml-3 text-lg sm:text-xl font-bold">Book Appointment</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-8">
        {/* Doctor Card */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Doctor Image */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-[#91C8E4] to-[#4682A9] flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shrink-0 shadow-md">
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

            {/* Doctor Info */}
            <div className="flex-1 w-full">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {doctor.name}
              </h2>
              <p className="text-[#4682A9] font-semibold text-sm sm:text-base mb-2">
                {doctor.qualification || 'MBBS, MS'} ({doctor.speciality})
              </p>
              <p className="text-gray-600 text-sm mb-3">
                {doctor.about || `Fellow of Cardiology with extensive and interventional experience`}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                <div className="text-center p-2 bg-gradient-to-br from-[#91C8E4]/10 to-[#91C8E4]/5 rounded-lg border border-[#91C8E4]/20">
                  <div className="flex justify-center mb-1">
                    <User className="w-5 h-5 text-[#4682A9]" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#4682A9]">
                    {doctor.patients || '5,000+'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">patients</p>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-[#91C8E4]/10 to-[#91C8E4]/5 rounded-lg border border-[#91C8E4]/20">
                  <div className="flex justify-center mb-1">
                    <Calendar className="w-5 h-5 text-[#4682A9]" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#4682A9]">
                    {doctor.yearsExp || `${doctor.experience}+`}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">years exp.</p>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                  <div className="flex justify-center mb-1">
                    <svg className="w-5 h-5 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-amber-600">{doctor.rating}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">rating</p>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-[#91C8E4]/10 to-[#91C8E4]/5 rounded-lg border border-[#91C8E4]/20">
                  <div className="flex justify-center mb-1">
                    <svg className="w-5 h-5 text-[#4682A9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#4682A9]">
                    {doctor.reviews || '4,942'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">reviews</p>
                </div>
              </div>
            </div>
          </div>

          {/* About Doctor */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-3">About Doctor</h3>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
              Dr. {doctor.name.split(' ').slice(1).join(' ')} is an expert in all aspects of {doctor.speciality.toLowerCase()}, including minimally invasive procedures and interventional techniques with over {doctor.experience} years of experience.
            </p>
          </div>

          {/* Service & Specialization */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-3">Service & Specialization</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-gray-500 mb-1 text-xs">Service</p>
                <p className="font-semibold text-gray-900">{doctor.services || 'Medicare'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-gray-500 mb-1 text-xs">Specialization</p>
                <p className="font-semibold text-gray-900">{doctor.specialization || doctor.speciality}</p>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-3">Availability for Consulting</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <p className="text-green-700 mb-1 text-xs font-medium">Days</p>
                <p className="font-semibold text-green-900">Monday to Friday</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <p className="text-green-700 mb-1 text-xs font-medium">Time</p>
                <p className="font-semibold text-green-900">
                  {doctor.availableTimes?.[0] || '10:00'} to {doctor.availableTimes?.[doctor.availableTimes.length - 1] || '17:00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Form */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Appointment Details</h3>

          {/* Select Date */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Date *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {doctor.availableDates?.slice(0, 5).map((date) => {
                const dateObj = new Date(date)
                const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                const dateNum = dateObj.getDate()
                const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
                
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-lg border-2 transition-all text-center hover:shadow-md ${
                      selectedDate === date
                        ? 'border-[#4682A9] bg-[#91C8E4]/10 shadow-md'
                        : 'border-gray-200 hover:border-[#91C8E4]'
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-600">{day}</p>
                    <p className="text-lg font-bold text-[#4682A9]">{dateNum}</p>
                    <p className="text-xs text-gray-500">{month}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Select Time */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Time *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {doctor.availableTimes?.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm hover:shadow-md ${
                    selectedTime === time
                      ? 'border-[#4682A9] bg-[#91C8E4]/10 text-[#4682A9] shadow-md'
                      : 'border-gray-200 text-gray-700 hover:border-[#91C8E4]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Information */}
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-base font-bold text-gray-900 mb-3">Patient Information</h4>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 border-2 text-black border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] hover:border-gray-300 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full pl-10 pr-4 py-3 border-2 text-black border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] hover:border-gray-300 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-4 py-3 border-2 text-black border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] hover:border-gray-300 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific concerns or symptoms..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] resize-none hover:border-gray-300 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Price & Book Button */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky bottom-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Consultation Fee</p>
              <p className="text-2xl font-bold text-[#4682A9]">₹{doctor.price}</p>
            </div>
            <button
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime || !patientName || !patientPhone}
              className={`px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 ${
                selectedDate && selectedTime && patientName && patientPhone
                  ? 'bg-gradient-to-r from-[#91C8E4] to-[#4682A9] hover:shadow-xl hover:scale-105 active:scale-95'
                  : 'bg-gray-300 cursor-not-allowed opacity-60'
              }`}
            >
              Book Appointment
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
