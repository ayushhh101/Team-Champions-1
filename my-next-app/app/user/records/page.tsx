/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Download, Eye, FileText, Image as ImageIcon, File, Search, Filter, Calendar, User, X, Pill, AlertCircle, Clock, MapPin, Bell, Check } from 'lucide-react'
import BottomNavigation from '../../components/BottomNavigation'

interface MedicalRecord {
  id: string
  title: string
  type: 'prescription' | 'appointment' | 'lab_report' | 'scan' | 'discharge_summary' | 'other'
  date: string
  doctorName: string
  doctorSpeciality: string
  hospitalName?: string
  fileUrl?: string
  fileSize?: string
  notes?: string
  downloadUrl?: string
  appointmentTime?: string
  status?: string
}

interface Prescription {
  id: string
  medications: Array<{
    id: string
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }>
  diagnosis?: string
  symptoms?: string
  labTests?: string
  followUpDate?: string
  additionalNotes?: string
}

interface FollowUpAppointment {
  id: string
  originalAppointmentId: string
  doctorName: string
  doctorSpeciality: string
  scheduledDate: string
  status: 'scheduled' | 'completed' | 'overdue'
  reason: string
  notes?: string
  prescriptionId?: string
}

const RECORD_TYPES = [
  { value: 'all', label: 'All Records', icon: FileText },
  { value: 'appointment', label: 'Appointments', icon: Calendar },
  { value: 'prescription', label: 'Prescriptions', icon: Pill },
]

const MAIN_TABS = [
  { value: 'records', label: 'Medical Records' },
  { value: 'followups', label: 'Follow-ups' },
]

export default function MedicalRecordsPage() {
  const [activeTab, setActiveTab] = useState<'records' | 'followups'>('records')
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [followUps, setFollowUps] = useState<FollowUpAppointment[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([])
  const [filteredFollowUps, setFilteredFollowUps] = useState<FollowUpAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDoctor, setSelectedDoctor] = useState('all')
  const [availableDoctors, setAvailableDoctors] = useState<Array<{name: string, speciality: string}>>([])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [dateFilter, setDateFilter] = useState<'all' | '30days' | '6months' | '1year'>('all')
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [prescription, setPrescription] = useState<Prescription | null>(null)

  useEffect(() => {
    fetchMedicalRecords()
    fetchFollowUps()
  }, [])

  useEffect(() => {
    if (activeTab === 'records') {
      filterRecords()
    } else {
      filterFollowUps()
    }
  }, [searchQuery, selectedType, selectedDoctor, dateFilter, records, followUps, activeTab])

  const fetchMedicalRecords = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail')

      if (!userEmail) {
        console.error('User email not found')
        setLoading(false)
        return
      }

      // Fetch medical records (prescriptions)
      const recordsResponse = await fetch(`/api/medical-records?patientEmail=${encodeURIComponent(userEmail)}`)
      
      // Fetch all appointments and filter client-side since API doesn't support patientEmail filtering
      const appointmentsResponse = await fetch(`/api/appointments`)
      
      // Fetch bookings with patientEmail filter (this API supports it)
      const bookingsResponse = await fetch(`/api/bookings?patientEmail=${encodeURIComponent(userEmail)}`)

      const [recordsData, appointmentsData, bookingsData] = await Promise.all([
        recordsResponse.ok ? recordsResponse.json() : { success: false },
        appointmentsResponse.ok ? appointmentsResponse.json() : { success: false },
        bookingsResponse.ok ? bookingsResponse.json() : { success: false }
      ])

      let allRecords: MedicalRecord[] = []
      const doctorSet = new Set<string>()

      // Add medical records (prescriptions)
      if (recordsData.success && Array.isArray(recordsData.records)) {
        allRecords = [...allRecords, ...recordsData.records]
        recordsData.records.forEach((record: MedicalRecord) => {
          if (record.doctorName) {
            doctorSet.add(JSON.stringify({ name: record.doctorName, speciality: record.doctorSpeciality || '' }))
          }
        })
      }

      // Filter appointments by patientEmail client-side and add as records
      if (appointmentsData.success && Array.isArray(appointmentsData.appointments)) {
        const userAppointments = appointmentsData.appointments.filter((apt: any) => 
          apt.patientEmail === userEmail || apt.patientId === userEmail
        )
        
        const appointmentRecords = userAppointments.map((apt: any) => ({
          id: apt.id,
          title: `Appointment with ${apt.doctorName || 'Doctor'}`,
          type: 'appointment' as const,
          date: apt.date,
          doctorName: apt.doctorName || 'Unknown Doctor',
          doctorSpeciality: apt.doctorSpeciality || apt.type || 'General Medicine',
          appointmentTime: apt.time,
          status: apt.status,
          notes: `Appointment Type: ${apt.type || 'Consultation'}`
        }))
        
        allRecords = [...allRecords, ...appointmentRecords]
        appointmentRecords.forEach((record: MedicalRecord) => {
          if (record.doctorName) {
            doctorSet.add(JSON.stringify({ name: record.doctorName, speciality: record.doctorSpeciality || '' }))
          }
        })
      }

      // Add bookings as appointments (these are already filtered by patientEmail)
      if (bookingsData.success && Array.isArray(bookingsData.bookings)) {
        const bookingRecords = bookingsData.bookings
          .filter((booking: any) => !allRecords.some(record => 
            record.date === booking.date && record.appointmentTime === booking.time
          ))
          .map((booking: any) => ({
            id: booking.id,
            title: `Appointment with ${booking.doctorName || 'Doctor'}`,
            type: 'appointment' as const,
            date: booking.date,
            doctorName: booking.doctorName || 'Unknown Doctor',
            doctorSpeciality: booking.doctorSpeciality || booking.type || 'General Medicine',
            appointmentTime: booking.time,
            status: booking.status || 'confirmed',
            notes: `Booking Type: ${booking.type || 'Consultation'}`
          }))
        
        allRecords = [...allRecords, ...bookingRecords]
        bookingRecords.forEach((record: MedicalRecord) => {
          if (record.doctorName) {
            doctorSet.add(JSON.stringify({ name: record.doctorName, speciality: record.doctorSpeciality || '' }))
          }
        })
      }

      // Sort records by date (most recent first)
      allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Set available doctors
      const doctors = Array.from(doctorSet).map(doctorStr => JSON.parse(doctorStr))
      setAvailableDoctors(doctors)

      setRecords(allRecords)
      setFilteredRecords(allRecords)
    } catch (error) {
      console.error('Error fetching medical records:', error)
      setRecords([])
      setFilteredRecords([])
      setAvailableDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const fetchFollowUps = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail')
      
      if (!userEmail) {
        setFollowUps([])
        return
      }

      // Fetch prescriptions to get follow-up dates
      const response = await fetch(`/api/prescriptions?patientEmail=${encodeURIComponent(userEmail)}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && Array.isArray(data.prescriptions)) {
        // Convert prescriptions with follow-up dates to follow-up appointments
        const followUpList: FollowUpAppointment[] = data.prescriptions
          .filter((prescription: any) => prescription.followUpDate)
          .map((prescription: any) => {
            const followUpDate = new Date(prescription.followUpDate)
            const today = new Date()
            
            let status: 'scheduled' | 'completed' | 'overdue' = 'scheduled'
            if (followUpDate < today) {
              // Check if there's a corresponding completed appointment
              status = 'overdue' // This could be enhanced to check actual appointment status
            }

            return {
              id: `followup_${prescription.id}`,
              originalAppointmentId: prescription.appointmentId || '',
              doctorName: prescription.doctorName,
              doctorSpeciality: prescription.diagnosis || 'General Medicine',
              scheduledDate: prescription.followUpDate,
              status,
              reason: prescription.diagnosis || 'Follow-up consultation',
              notes: prescription.additionalNotes,
              prescriptionId: prescription.id
            }
          })
        
        setFollowUps(followUpList)
      } else {
        setFollowUps([])
      }
    } catch (error) {
      console.error('Error fetching follow-ups:', error)
      setFollowUps([])
    }
  }

  const filterRecords = () => {
    let filtered = [...records]

    if (selectedType !== 'all') {
      filtered = filtered.filter(record => record.type === selectedType)
    }

    if (selectedDoctor !== 'all') {
      filtered = filtered.filter(record => record.doctorName === selectedDoctor)
    }

    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.doctorSpeciality.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()

      if (dateFilter === '30days') {
        filterDate.setDate(now.getDate() - 30)
      } else if (dateFilter === '6months') {
        filterDate.setMonth(now.getMonth() - 6)
      } else if (dateFilter === '1year') {
        filterDate.setFullYear(now.getFullYear() - 1)
      }

      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= filterDate
      })
    }

    setFilteredRecords(filtered)
  }

  const filterFollowUps = () => {
    let filtered = [...followUps]

    if (searchQuery) {
      filtered = filtered.filter(followUp =>
        followUp.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        followUp.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        followUp.doctorSpeciality.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()

      if (dateFilter === '30days') {
        filterDate.setDate(now.getDate() - 30)
      } else if (dateFilter === '6months') {
        filterDate.setMonth(now.getMonth() - 6)
      } else if (dateFilter === '1year') {
        filterDate.setFullYear(now.getFullYear() - 1)
      }

      filtered = filtered.filter(followUp => {
        const followUpDate = new Date(followUp.scheduledDate)
        return followUpDate >= filterDate
      })
    }

    setFilteredFollowUps(filtered)
  }

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-6 h-6" />
      case 'prescription':
        return <Pill className="w-6 h-6" />
      case 'lab_report':
        return <FileText className="w-6 h-6" />
      case 'scan':
        return <ImageIcon className="w-6 h-6" />
      case 'discharge_summary':
        return <FileText className="w-6 h-6" />
      default:
        return <File className="w-6 h-6" />
    }
  }

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-indigo-50 text-indigo-600 border-indigo-200'
      case 'prescription':
        return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'lab_report':
        return 'bg-green-50 text-green-600 border-green-200'
      case 'scan':
        return 'bg-purple-50 text-purple-600 border-purple-200'
      case 'discharge_summary':
        return 'bg-orange-50 text-orange-600 border-orange-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getFollowUpStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'completed':
        return 'bg-green-50 text-green-600 border-green-200'
      case 'overdue':
        return 'bg-red-50 text-red-600 border-red-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const handleBookFollowUp = (followUp: FollowUpAppointment) => {
    // Navigate to booking page for this doctor
    const searchParams = new URLSearchParams({
      reason: followUp.reason,
      notes: followUp.notes || '',
      followUpFor: followUp.prescriptionId || ''
    })
    
    // This would need the doctor ID, which we might need to fetch
    window.location.href = `/user/dashboard?${searchParams.toString()}`
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
      return date.toLocaleDateString('en-US', options)
    } catch {
      return dateString
    }
  }

  const handleViewDetails = async (record: MedicalRecord) => {
    setSelectedRecord(record)
    
    // Fetch prescription data if available
    if (record.type === 'prescription') {
      try {
        const response = await fetch(`/api/prescriptions?id=${record.id}`)
        const data = await response.json()
        if (data.success && data.prescription) {
          setPrescription(data.prescription)
        }
      } catch (error) {
        console.error('Error fetching prescription:', error)
      }
    }
  }

  const handleDownload = async (record: MedicalRecord) => {
    if (record.downloadUrl) {
      window.open(record.downloadUrl, '_blank')
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
    setSelectedDoctor('all')
    setDateFilter('all')
  }

  const closeModal = () => {
    setSelectedRecord(null)
    setPrescription(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/user/dashboard">
                <button className="p-2 hover:bg-white/10 rounded-full transition-all duration-200">
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
              </Link>
              <h1 className="ml-3 text-lg sm:text-xl font-bold text-white">Medical Records</h1>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterModal(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
              >
                <Filter className="w-5 h-5 text-white" />
                {(selectedType !== 'all' || selectedDoctor !== 'all' || dateFilter !== 'all') && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">!</span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4682A9]" />
            <input
              type="text"
              placeholder="Search records, doctors, or speciality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-2 border-white/20 focus:border-white focus:outline-none text-[#4682A9] placeholder-[#4682A9]/50 shadow-sm"
            />
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex border-b border-white/20 mt-4">
          {MAIN_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as 'records' | 'followups')}
              className={`flex-1 py-3 text-center text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.value
                  ? 'text-white border-b-3 border-white bg-white/10'
                  : 'text-white/70 border-b-2 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Type Filter Tabs - Only show for records */}
        {activeTab === 'records' && (
          <div className="px-4 pb-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {RECORD_TYPES.map(type => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
                      selectedType === type.value
                        ? 'bg-white text-[#4682A9] shadow-md'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {type.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* Records/Follow-ups Summary */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Total {activeTab === 'records' ? 'Records' : 'Follow-ups'}
            </p>
            <p className="text-2xl font-bold text-[#4682A9]">
              {activeTab === 'records' ? filteredRecords.length : filteredFollowUps.length}
            </p>
          </div>
          <div className="flex gap-4">
            {activeTab === 'records' ? (
              <>
                <div className="text-center">
                  <p className="text-xs text-gray-500">This Month</p>
                  <p className="text-lg font-bold text-[#749BC2]">
                    {filteredRecords.filter(r => {
                      const recordDate = new Date(r.date)
                      const now = new Date()
                      return recordDate.getMonth() === now.getMonth() &&
                        recordDate.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">This Year</p>
                  <p className="text-lg font-bold text-[#91C8E4]">
                    {filteredRecords.filter(r => {
                      const recordDate = new Date(r.date)
                      const now = new Date()
                      return recordDate.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Overdue</p>
                  <p className="text-lg font-bold text-red-500">
                    {filteredFollowUps.filter(f => f.status === 'overdue').length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Scheduled</p>
                  <p className="text-lg font-bold text-blue-500">
                    {filteredFollowUps.filter(f => f.status === 'scheduled').length}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Records/Follow-ups List */}
      <div className="flex-1 px-4 py-5 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-[#91C8E4] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Records Tab */}
            {activeTab === 'records' && (
              <>
                {filteredRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[60vh]">
                    <div className="w-24 h-24 bg-[#91C8E4]/10 rounded-full flex items-center justify-center mb-6">
                      <FileText className="w-12 h-12 text-[#91C8E4]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-700 mb-2">No Records Found</h2>
                    <p className="text-gray-500 text-center mb-8 max-w-sm">
                      {searchQuery || selectedType !== 'all' || selectedDoctor !== 'all' || dateFilter !== 'all'
                        ? 'Try adjusting your filters or search query'
                        : 'Your medical records will appear here after your appointments'}
                    </p>
                    {(searchQuery || selectedType !== 'all' || selectedDoctor !== 'all' || dateFilter !== 'all') && (
                      <button
                        onClick={handleClearFilters}
                        className="px-6 py-3 bg-[#91C8E4] hover:bg-[#749BC2] text-white font-semibold rounded-xl transition-all"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRecords.map(record => (
                      <div
                        key={record.id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-[#91C8E4]/50"
                      >
                        <div className="p-5">
                          {/* Record Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start flex-1">
                              {/* Icon */}
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shrink-0 border ${getRecordColor(record.type)}`}>
                                {getRecordIcon(record.type)}
                              </div>

                              {/* Record Details */}
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-[#2C5F7C] mb-1">{record.title}</h3>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {record.doctorName}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span>{record.doctorSpeciality}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-[#4682A9]" />
                                  <span className="text-[#4682A9] font-medium">{formatDate(record.date)}</span>
                                  {record.type === 'appointment' && record.appointmentTime && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <Clock className="w-4 h-4 text-[#4682A9]" />
                                      <span className="text-[#4682A9] font-medium">{record.appointmentTime}</span>
                                    </>
                                  )}
                                  {record.fileSize && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-gray-500">{record.fileSize}</span>
                                    </>
                                  )}
                                  {record.type === 'appointment' && record.status && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        record.status === 'completed' ? 'bg-green-50 text-green-600' :
                                        record.status === 'upcoming' ? 'bg-blue-50 text-blue-600' :
                                        record.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                        'bg-gray-50 text-gray-600'
                                      }`}>
                                        {record.status}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Record Type Badge */}
                            <div className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap border ${getRecordColor(record.type)}`}>
                              {record.type.replace(/_/g, ' ').toUpperCase()}
                            </div>
                          </div>

                          {/* Notes */}
                          {record.notes && (
                            <div className="bg-[#FFFBDE] rounded-lg p-3 mb-4 border border-[#91C8E4]/20">
                              <p className="text-sm text-[#4682A9] line-clamp-2">{record.notes}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleViewDetails(record)}
                              className="flex-1 px-4 py-3 bg-linear-to-r from-[#91C8E4] to-[#4682A9] hover:from-[#749BC2] hover:to-[#4682A9] text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            {record.downloadUrl && (
                              <button
                                onClick={() => handleDownload(record)}
                                className="px-4 py-3 bg-[#91C8E4]/10 hover:bg-[#91C8E4]/20 text-[#4682A9] rounded-xl font-semibold text-sm border-2 border-[#91C8E4]/30 hover:border-[#91C8E4]/50 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Follow-ups Tab */}
            {activeTab === 'followups' && (
              <>
                {filteredFollowUps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[60vh]">
                    <div className="w-24 h-24 bg-[#91C8E4]/10 rounded-full flex items-center justify-center mb-6">
                      <Clock className="w-12 h-12 text-[#91C8E4]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-700 mb-2">No Follow-ups Found</h2>
                    <p className="text-gray-500 text-center mb-8 max-w-sm">
                      {searchQuery || dateFilter !== 'all'
                        ? 'Try adjusting your filters or search query'
                        : 'Follow-up appointments from your prescriptions will appear here'}
                    </p>
                    {(searchQuery || dateFilter !== 'all') && (
                      <button
                        onClick={handleClearFilters}
                        className="px-6 py-3 bg-[#91C8E4] hover:bg-[#749BC2] text-white font-semibold rounded-xl transition-all"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFollowUps.map(followUp => (
                      <div
                        key={followUp.id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <div className="p-5">
                          {/* Doctor and Status */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 mb-1">
                                {followUp.doctorName}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {followUp.doctorSpeciality}
                              </p>
                              <p className="text-sm font-medium text-gray-700">
                                {followUp.reason}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Follow-up: {formatDate(followUp.scheduledDate)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getFollowUpStatusColor(followUp.status)}`}>
                                {followUp.status === 'overdue' ? 'Overdue' : 
                                 followUp.status === 'scheduled' ? 'Upcoming' : 'Completed'}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 mt-4">
                            {followUp.status !== 'completed' && (
                              <>
                                <button
                                  onClick={() => {
                                    // Mark as complete logic
                                    console.log('Mark complete:', followUp.id)
                                  }}
                                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                  <Check className="w-4 h-4" />
                                  Mark Complete
                                </button>
                                <button
                                  onClick={() => {
                                    // Text reminder logic
                                    console.log('Send reminder for:', followUp.id)
                                  }}
                                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-gray-300"
                                >
                                  <Bell className="w-4 h-4" />
                                  Text Reminder
                                </button>
                              </>
                            )}
                            {followUp.status === 'completed' && (
                              <div className="flex-1 px-4 py-2 bg-green-50 text-green-600 text-sm font-semibold rounded-lg flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" />
                                Completed
                              </div>
                            )}
                          </div>

                          {/* Notes if available */}
                          {followUp.notes && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-sm text-gray-600">{followUp.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Test Reminder Notification Button */}
                    {filteredFollowUps.length > 0 && (
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            // Test notification logic
                            console.log('Test reminder notification')
                            alert('Test reminder notification sent!')
                          }}
                          className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-gray-300"
                        >
                          <Bell className="w-5 h-5" />
                          Test Reminder Notification
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-[#91C8E4] to-[#4682A9] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{selectedRecord.title}</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                {/* <X className="w-6 h-6 text-white" /> */}
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Doctor Information */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Doctor Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#4682A9]" />
                    <span className="text-sm text-gray-700">{selectedRecord.doctorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#4682A9]" />
                    <span className="text-sm text-gray-700">{selectedRecord.doctorSpeciality}</span>
                  </div>
                  {selectedRecord.hospitalName && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#4682A9]" />
                      <span className="text-sm text-gray-700">{selectedRecord.hospitalName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#4682A9]" />
                    <span className="text-sm text-gray-700">{formatDate(selectedRecord.date)}</span>
                  </div>
                </div>
              </div>

              {/* Record Type Badge */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Record Type</p>
                <div className={`inline-block px-4 py-2 rounded-lg font-semibold border ${getRecordColor(selectedRecord.type)}`}>
                  {selectedRecord.type.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>

              {/* Notes / Details */}
              {selectedRecord.notes && (
                <div className="bg-[#FFFBDE] rounded-xl p-4 border border-[#91C8E4]/30">
                  <h3 className="text-sm font-semibold text-[#4682A9] mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Details
                  </h3>
                  <p className="text-sm text-[#4682A9] whitespace-pre-line">{selectedRecord.notes}</p>
                </div>
              )}

              {/* Prescription Section */}
              {selectedRecord.type === 'prescription' && prescription && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Prescription Details
                  </h3>

                  {/* Diagnosis */}
                  {prescription.diagnosis && (
                    <div className="mb-4 pb-4 border-b border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-1">Diagnosis</p>
                      <p className="text-sm text-blue-900">{prescription.diagnosis}</p>
                    </div>
                  )}

                  {/* Symptoms */}
                  {prescription.symptoms && (
                    <div className="mb-4 pb-4 border-b border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-1">Symptoms</p>
                      <p className="text-sm text-blue-900">{prescription.symptoms}</p>
                    </div>
                  )}

                  {/* Medications */}
                  {prescription.medications && prescription.medications.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-3">Medications</p>
                      <div className="space-y-3">
                        {prescription.medications.map((med, idx) => (
                          <div key={med.id} className="bg-white rounded-lg p-3 border border-blue-100">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-sm text-gray-800">{med.name}</p>
                                <p className="text-xs text-gray-600">{med.dosage}mg</p>
                              </div>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {med.frequency}x/day
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                              <Clock className="w-3 h-3" />
                              Duration: {med.duration} days
                            </div>
                            {med.instructions && (
                              <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                                📝 {med.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Date */}
                  {prescription.followUpDate && (
                    <div className="mb-4">
                      <p className="text-xs text-blue-700 font-semibold mb-1">Follow-up Date</p>
                      <p className="text-sm text-blue-900">{formatDate(prescription.followUpDate)}</p>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {prescription.additionalNotes && (
                    <div>
                      <p className="text-xs text-blue-700 font-semibold mb-1">Additional Notes</p>
                      <p className="text-sm text-blue-900">{prescription.additionalNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedRecord.downloadUrl && (
                  <button
                    onClick={() => {
                      handleDownload(selectedRecord)
                    }}
                    className="flex-1 px-4 py-3 bg-[#91C8E4]/10 hover:bg-[#91C8E4]/20 text-[#4682A9] rounded-xl font-semibold text-sm border-2 border-[#91C8E4]/30 hover:border-[#91C8E4]/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-in slide-in-from-bottom sm:slide-in-from-bottom-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#2C5F7C]">Filter Records</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Doctor Filter */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#4682A9] mb-3">Filter by Doctor</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <button
                  onClick={() => setSelectedDoctor('all')}
                  className={`w-full px-4 py-3 rounded-xl font-semibold text-sm text-left transition-all duration-300 ${
                    selectedDoctor === 'all'
                      ? 'bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Doctors
                </button>
                {availableDoctors.map((doctor) => (
                  <button
                    key={doctor.name}
                    onClick={() => setSelectedDoctor(doctor.name)}
                    className={`w-full px-4 py-3 rounded-xl font-semibold text-sm text-left transition-all duration-300 ${
                      selectedDoctor === doctor.name
                        ? 'bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{doctor.name}</span>
                      {doctor.speciality && (
                        <span className="text-xs opacity-70">{doctor.speciality}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#4682A9] mb-3">Time Period</p>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Time' },
                  { value: '30days', label: 'Last 30 Days' },
                  { value: '6months', label: 'Last 6 Months' },
                  { value: '1year', label: 'Last Year' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setDateFilter(option.value as any)}
                    className={`w-full px-4 py-3 rounded-xl font-semibold text-sm text-left transition-all duration-300 ${
                      dateFilter === option.value
                        ? 'bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleClearFilters()
                  setShowFilterModal(false)
                }}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-300"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-3 bg-linear-to-r from-[#91C8E4] to-[#4682A9] hover:from-[#749BC2] hover:to-[#4682A9] text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation activeTab="records" />
    </div>
  )
}
