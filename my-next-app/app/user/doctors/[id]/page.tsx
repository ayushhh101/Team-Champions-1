'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { 
  ChevronLeft, 
  MapPin, 
  Star, 
  Calendar, 
  Phone, 
  Mail,
  Briefcase,
  CheckCircle,
  MessageSquare
} from 'lucide-react'
import BottomNavigation from '@/app/components/BottomNavigation'

interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  qualification: string
  speciality: string
  location: string
  experience: number | string
  rating: number
  price: number | string
  availableDates: string[]
  availableTimes: string[]
  image?: string
  isVerified: boolean
  licenseNumber?: string
  about?: string
  reviewCount?: number
}

export default function DoctorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const doctorId = params.id as string
  const fromCancelled = searchParams.get('from') === 'cancelled'

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await fetch('/api/doctors')
        const data = await response.json()
        
        if (data.doctors) {
          const foundDoctor = data.doctors.find((d: Doctor) => d.id === doctorId)
          if (foundDoctor) {
            setDoctor(foundDoctor)
          } else {
            router.push('/user/dashboard')
          }
        }
      } catch (error) {
        console.error('Error fetching doctor details:', error)
        router.push('/user/dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (doctorId) {
      fetchDoctorDetails()
    }
  }, [doctorId, router])

  const getDoctorInitials = () => {
    if (!doctor?.name) return 'DR'
    const names = doctor.name.split(' ')
    if (names.length >= 2) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0)
    }
    return names[0].substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#91C8E4] border-t-transparent"></div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Doctor not found</p>
          <button 
            onClick={() => router.push('/user/dashboard')}
            className="px-6 py-2 bg-[#91C8E4] text-white rounded-lg hover:bg-[#749BC2] transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 pb-20">
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
            <h1 className="ml-3 text-lg sm:text-xl font-bold">Doctor Profile</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Doctor Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 bg-linear-to-br from-[#91C8E4]/10 to-[#4682A9]/5">
            <div className="flex items-start gap-4">
              {/* Doctor Image */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-linear-to-br from-[#91C8E4] to-[#4682A9] shadow-md">
                  {doctor.image ? (
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl flex items-center justify-center h-full">
                      {getDoctorInitials()}
                    </span>
                  )}
                </div>
                {doctor.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Doctor Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-0.5">{doctor.name}</h2>
                    <p className="text-sm text-[#4682A9] font-medium">{doctor.speciality}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-sm text-gray-900">{doctor.rating}</span>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{doctor.experience}+ years</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{doctor.location}</span>
                  </div>
                </div>

                {/* Book Appointment Button - Only visible when coming from cancelled */}
                {fromCancelled && (
                  <button
                    onClick={() => router.push(`/user/book-appointment/${doctor.id}`)}
                    className="mt-4 w-full py-2.5 bg-linear-to-r from-[#91C8E4] to-[#4682A9] hover:from-[#749BC2] hover:to-[#4682A9] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fee Section */}
          <div className="px-6 py-4 bg-linear-to-r from-[#FFFBDE] to-[#FFF9E6] border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Consultation Fee</span>
              <span className="text-2xl font-bold text-[#2C5F7C]">₹{doctor.price}</span>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-3">
              <a
                href={`tel:${doctor.phone}`}
                className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Phone className="w-5 h-5 text-[#4682A9]" />
                <span className="text-xs font-medium text-gray-700">Call</span>
              </a>
              <a
                href={`mailto:${doctor.email}`}
                className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Mail className="w-5 h-5 text-[#4682A9]" />
                <span className="text-xs font-medium text-gray-700">Email</span>
              </a>
              <button className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <MessageSquare className="w-5 h-5 text-[#4682A9]" />
                <span className="text-xs font-medium text-gray-700">Message</span>
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        {doctor.about && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{doctor.about}</p>
          </div>
        )}

        {/* Qualifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Qualifications</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-700 font-medium">{doctor.qualification}</p>
            {doctor.licenseNumber && (
              <p className="text-xs text-gray-500">
                License: <span className="font-medium text-gray-700">{doctor.licenseNumber}</span>
              </p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{doctor.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{doctor.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900">{doctor.location}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation activeTab="home" />  
    </div>
  )
}
