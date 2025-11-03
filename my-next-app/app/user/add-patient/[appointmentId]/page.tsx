'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, User, Phone, Weight, FileText, Users } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import ProtectedRoute from '@/app/components/ProtectedRoute'

interface Appointment {
  id: string
  doctorId: string
  doctorName: string
  speciality: string
  date: string
  time: string
  patientName: string
  patientPhone: string
  patientEmail: string
  notes: string
  price: number | string
  status: string
  paymentStatus?: string
  createdAt: string
}

export default function AddPatientDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.appointmentId as string

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('Male')
  const [mobileNumber, setMobileNumber] = useState('')
  const [weight, setWeight] = useState('')
  const [problem, setProblem] = useState('')
  const [relationship, setRelationship] = useState('')
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false)
  const [loading, setLoading] = useState(true)

  const relationshipOptions = ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Friend', 'Other']

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) {
        toast.error('Appointment ID is missing')
        router.push('/user/appointments')
        return
      }

      try {
        // Fetch appointment from backend
        const response = await fetch('/api/bookings')
        const data = await response.json()

        if (data.success && data.bookings) {
          const foundAppointment = data.bookings.find((apt: Appointment) => apt.id === appointmentId)

          if (foundAppointment) {
            setAppointment(foundAppointment)
            // Pre-fill form with existing data
            setFullName(foundAppointment.patientName || '')
            setMobileNumber(foundAppointment.patientPhone || '')
          } else {
            toast.error('Appointment not found')
            router.push('/user/appointments')
          }
        }
      } catch (error) {
        console.error('Error fetching appointment:', error)
        toast.error('Failed to load appointment details')
        router.push('/user/appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [appointmentId, router])

  const handleSave = async () => {
    // Validation
    if (!fullName.trim()) {
      toast.error('Please enter full name')
      return
    }
    if (!age || parseInt(age) < 1 || parseInt(age) > 150) {
      toast.error('Please enter valid age (1-150)')
      return
    }
    if (!mobileNumber.trim() || mobileNumber.length !== 10) {
      toast.error('Please enter valid 10-digit mobile number')
      return
    }
    if (!weight || parseInt(weight) < 1) {
      toast.error('Please enter valid weight')
      return
    }
    if (!problem.trim()) {
      toast.error('Please describe your problem')
      return
    }
    if (!relationship) {
      toast.error('Please select relationship with patient')
      return
    }

    const patientDetails = {
      fullName,
      age: parseInt(age),
      gender,
      mobileNumber,
      weight: parseInt(weight),
      problem,
      relationship,
      addedAt: new Date().toISOString()
    }

    try {
      // Update booking with patient details
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: appointmentId,
          patientDetails,
          patientName: fullName,
          patientPhone: mobileNumber,
          notes: problem
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Patient details saved successfully!', {
          duration: 2000,
          style: {
            background: '#10B981',
            color: '#ffffff',
            fontWeight: 'bold',
          },
        })

        // Redirect to payment page with appointment details
        setTimeout(() => {
          router.push(`/user/payment?appointmentId=${appointmentId}&amount=${appointment?.price}&doctorName=${encodeURIComponent(appointment?.doctorName || '')}`)
        }, 2000)
      } else {
        throw new Error('Failed to update patient details')
      }
    } catch (error) {
      toast.error('Failed to save patient details. Please try again.')
      console.error('Save error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4682A9] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Appointment not found</p>
          <button
            onClick={() => router.push('/user/appointments')}
            className="px-6 py-2 bg-[#4682A9] text-white rounded-lg hover:bg-[#749BC2] transition-all"
          >
            Go to Appointments
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />

        {/* Header */}
        <header className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white sticky top-0 z-50 shadow-lg">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="ml-3 text-lg sm:text-xl font-bold">Add Patient Details</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-8">
          {/* Appointment Info Card */}
          <div className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#91C8E4] to-[#4682A9] flex items-center justify-center text-white font-bold text-lg">
                {appointment.doctorName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{appointment.doctorName}</p>
                <p className="text-sm text-[#4682A9]">{appointment.speciality}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-gray-600 text-xs">Date</p>
                <p className="text-gray-900 font-semibold">{new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-gray-600 text-xs">Time</p>
                <p className="text-gray-900 font-semibold">{appointment.time}</p>
              </div>
            </div>
          </div>

          {/* Patient Details Form */}
          <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Patient Details</h3>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-10 pr-4 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors"
                  />
                </div>
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="22"
                    min="1"
                    max="150"
                    className="w-full px-4 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors appearance-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9999999900"
                    maxLength={10}
                    className="w-full pl-10 pr-4 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors"
                  />
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="50"
                    min="1"
                    max="500"
                    className="w-full pl-10 pr-16 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    Kg
                  </span>
                </div>
              </div>

              {/* Problem */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Problem / Symptoms <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Describe your symptoms or health concerns..."
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] resize-none transition-colors"
                  />
                </div>
              </div>

              {/* Relationship with Patient */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Relationship with Patient <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <button
                    type="button"
                    onClick={() => setShowRelationshipDropdown(!showRelationshipDropdown)}
                    className="w-full pl-10 pr-10 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors text-left bg-white"
                  >
                    {relationship || 'Select relationship'}
                  </button>
                  <svg 
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  
                  {showRelationshipDropdown && (
                    <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {relationshipOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setRelationship(option)
                            setShowRelationshipDropdown(false)
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-[#91C8E4]/10 transition-colors text-gray-900 border-b border-gray-100 last:border-b-0"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full py-4 mt-6 bg-linear-to-r from-[#91C8E4] to-[#4682A9] hover:from-[#7DB3D6] hover:to-[#3C7197] text-white font-semibold text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.98]"
            > 
              Save & Proceed to Payment
            </button>

            {/* Optional: Skip to Chat */}
            <button
              onClick={() => router.push(`/user/chat/${appointmentId}`)}
              className="w-full mt-4 text-sky-500 font-semibold text-lg border-2 border-sky-300 rounded-xl px-8 py-3 bg-white hover:bg-sky-50 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center"
            >
              Skip & Ask Quick Query
            </button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
