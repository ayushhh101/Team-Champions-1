/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, MoreVertical } from 'lucide-react'
import BottomNavigation from '../../components/BottomNavigation'

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

  useEffect(() => {
    // TODO: Update the fetch URL to your real API endpoint
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        setAppointments(data.appointments || [])
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = appointments.filter(a => a.status === tab)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
     <header className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white sticky top-0 z-50 shadow-lg">
  <div className="px-4 sm:px-6 py-4">
    <div className="flex items-center">
      <button
        onClick={() => history.back()}
        className="p-2 hover:bg-white/20 rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <h1 className="ml-3 text-lg sm:text-xl font-bold">Appointments</h1>
    </div>
  </div>
  {/* Tabs inside gradient for a seamless look */}
  <div className="flex border-b border-[#91C8E4] bg-linear-to-r from-[#91C8E4] to-[#4682A9]">
    {TABS.map(tabOption => (
      <button
        key={tabOption.value}
        className={`flex-1 py-2 text-center text-md font-medium capitalize transition
          ${tab === tabOption.value
            ? 'text-white border-b-2 border-white'
            : 'text-white/70 border-b-2 border-transparent'
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
          // Empty state like your screen
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
              <div key={appt.id} className="rounded-2xl bg-white border border-gray-100 p-4 flex flex-col shadow md:flex-row md:justify-between md:items-center">
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#91C8E4] flex items-center justify-center mr-4">
                    {appt.doctor.image ? (
                      <Image
                        src={appt.doctor.image}
                        alt={appt.doctor.name}
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium text-2xl">
                        {appt.doctor.name.split(' ').map(w=>w[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-md font-bold text-gray-900">{appt.doctor.name}</h2>
                    <div className="text-xs text-[#4FC3F7] mb-1">{appt.doctor.speciality}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{appt.date} | <span className="font-semibold" style={{ color: "#4682A9" }}>{appt.time}</span></span>
                      <span className="ml-2">Payment: <span className={`font-semibold ${appt.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                        {appt.paymentStatus === 'paid' ? 'Paid' : 'Not paid'}
                      </span></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  {tab === 'upcoming' && (
                    <>
                      <Link href={`/appointments/${appt.id}`}>
                        <button className="px-4 py-2 bg-[#91C8E4] text-white rounded-xl font-semibold text-xs shadow hover:bg-[#749BC2]">
                          View
                        </button>
                      </Link>
                      {appt.paymentStatus === 'not_paid' && (
                        <button className="px-4 py-2 bg-[#91C8E4]/20 text-[#4682A9] rounded-xl font-semibold text-xs border border-[#91C8E4] ml-2">
                          Make Payment
                        </button>
                      )}
                    </>
                  )}
                  {tab === 'completed' && appt.summaryAvailable && (
                    <Link href={`/appointment-summary/${appt.id}`}>
                      <button className="px-4 py-2 bg-[#91C8E4] text-white rounded-xl font-semibold text-xs shadow hover:bg-[#749BC2]">
                        View Summary
                      </button>
                    </Link>
                  )}
                  {/* Add more tab specific actions here */}
                  <button className="ml-2 p-2 rounded-full hover:bg-gray-100 transition">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                {tab === 'upcoming' && (
                  <p className="text-xs text-gray-400 mt-3 ml-1">
                    Reduce your waiting time and visiting time by paying the consulting fee upfront
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNavigation activeTab="appointments" />
    </div>
  )
}
