/* eslint-disable prefer-const */
// context/doctorStore.ts
import { create } from 'zustand'

// Enhanced appointment slot interface
export interface AppointmentSlot {
  id: string // Unique identifier for each slot
  date: string
  startTime: string
  endTime: string
  slotDuration: number // in minutes
  totalSlots: number
  bookedSlots: string[] // array of booked time slots like ["09:00", "09:30"]
  slotType: 'wave' | 'stream'
  maxPatients?: number // for wave scheduling
  availableSlots?: string[] // calculated available slots
  dayOfWeek?: string // e.g., "Monday"
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  isRecurring?: boolean // Whether this slot repeats weekly
  recurringWeeks?: number // How many weeks to repeat
}

export interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  qualification: string
  speciality?: string
  location?: string
  price?: number
  experience: number
  image?: string
  
  // Legacy format for backward compatibility
  availableDates?: string[]
  availableTimes?: string[]
  availableEndTimes?: string[]
  slotDurations?: number[]
  bookedSlots?: string[][]
  slotTypes?: {
    expected: number
    type: 'wave' | 'stream'
    max?: number
    booked?: number | boolean
  }[]
  
  // New comprehensive appointment slots
  appointmentSlots?: AppointmentSlot[]
  
  // Doctor preferences for defaults
  defaultSlotDuration?: number
  defaultStartTime?: string
  defaultEndTime?: string
  defaultSlotType?: 'wave' | 'stream'
  defaultMaxPatients?: number
}

interface DoctorStore {
  doctor: Doctor | null
  isHydrated: boolean
  isLoading: boolean
  error: string | null
  
  // Core doctor management
  setDoctor: (doctor: Doctor | null) => void
  updateDoctor: (updates: Partial<Doctor>) => void
  logoutDoctor: () => void // Added for Navbar compatibility
  clearDoctor: () => void
  
  // Appointment slot management
  addAppointmentSlot: (slot: AppointmentSlot) => void
  updateAppointmentSlot: (slotId: string, updates: Partial<AppointmentSlot>) => void
  removeAppointmentSlot: (slotId: string) => void
  getAvailableSlots: (date: string) => string[]
  bookSlot: (date: string, timeSlot: string) => void
  cancelSlot: (date: string, timeSlot: string) => void
  
  // Utility methods
  hydrateDoctor: () => void
  persistDoctor: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Helper methods
  isAuthenticated: () => boolean
  getDoctorById: (id: string) => Doctor | null
  generateAvailableSlots: (slot: AppointmentSlot) => string[]
}

export const useDoctorStore = create<DoctorStore>((set, get) => ({
  doctor: null,
  isHydrated: false,
  isLoading: false,
  error: null,
  
  setDoctor: (doctor) => {
    set({ doctor, error: null })
    if (typeof window !== 'undefined' && doctor) {
      localStorage.setItem('doctor-profile', JSON.stringify(doctor))
      localStorage.setItem('doctorId', doctor.id) // For Navbar compatibility
    }
  },
  
  updateDoctor: (updates) => set((state) => {
    const updatedDoctor = state.doctor ? { ...state.doctor, ...updates } : null
    if (typeof window !== 'undefined' && updatedDoctor) {
      localStorage.setItem('doctor-profile', JSON.stringify(updatedDoctor))
    }
    return { doctor: updatedDoctor }
  }),
  
  // Added for Navbar compatibility
  logoutDoctor: () => {
    set({ doctor: null, error: null })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('doctor-profile')
      localStorage.removeItem('doctorId')
    }
  },
  
  clearDoctor: () => {
    set({ doctor: null, error: null })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('doctor-profile')
      localStorage.removeItem('doctorId')
    }
  },
  
  addAppointmentSlot: (slot) => set((state) => {
    const slotWithDefaults = {
      ...slot,
      createdAt: slot.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      availableSlots: get().generateAvailableSlots(slot)
    }
    
    const updatedDoctor = state.doctor ? {
      ...state.doctor,
      appointmentSlots: [...(state.doctor.appointmentSlots || []), slotWithDefaults]
    } : null
    
    if (typeof window !== 'undefined' && updatedDoctor) {
      localStorage.setItem('doctor-profile', JSON.stringify(updatedDoctor))
    }
    return { doctor: updatedDoctor }
  }),
  
  updateAppointmentSlot: (slotId, updates) => set((state) => {
    const updatedDoctor = state.doctor ? {
      ...state.doctor,
      appointmentSlots: state.doctor.appointmentSlots?.map(slot => {
        if (slot.id === slotId) {
          const updatedSlot = { ...slot, ...updates, updatedAt: new Date().toISOString() }
          // Recalculate available slots if relevant fields changed
          if (updates.startTime || updates.endTime || updates.slotDuration || updates.bookedSlots) {
            updatedSlot.availableSlots = get().generateAvailableSlots(updatedSlot)
          }
          return updatedSlot
        }
        return slot
      })
    } : null
    
    if (typeof window !== 'undefined' && updatedDoctor) {
      localStorage.setItem('doctor-profile', JSON.stringify(updatedDoctor))
    }
    return { doctor: updatedDoctor }
  }),
  
  removeAppointmentSlot: (slotId) => set((state) => {
    const updatedDoctor = state.doctor ? {
      ...state.doctor,
      appointmentSlots: state.doctor.appointmentSlots?.filter(slot => slot.id !== slotId)
    } : null
    
    if (typeof window !== 'undefined' && updatedDoctor) {
      localStorage.setItem('doctor-profile', JSON.stringify(updatedDoctor))
    }
    return { doctor: updatedDoctor }
  }),
  
  getAvailableSlots: (date) => {
    const { doctor } = get()
    if (!doctor?.appointmentSlots) return []
    
    const slot = doctor.appointmentSlots.find(s => s.date === date)
    if (!slot) return []
    
    return slot.availableSlots || get().generateAvailableSlots(slot)
  },
  
  bookSlot: (date, timeSlot) => set((state) => {
    const updatedDoctor = state.doctor ? {
      ...state.doctor,
      appointmentSlots: state.doctor.appointmentSlots?.map(slot => {
        if (slot.date === date) {
          const updatedSlot = {
            ...slot,
            bookedSlots: [...slot.bookedSlots, timeSlot],
            updatedAt: new Date().toISOString()
          }
          updatedSlot.availableSlots = get().generateAvailableSlots(updatedSlot)
          return updatedSlot
        }
        return slot
      })
    } : null
    
    if (typeof window !== 'undefined' && updatedDoctor) {
      localStorage.setItem('doctor-profile', JSON.stringify(updatedDoctor))
    }
    return { doctor: updatedDoctor }
  }),
  
  cancelSlot: (date, timeSlot) => set((state) => {
    const updatedDoctor = state.doctor ? {
      ...state.doctor,
      appointmentSlots: state.doctor.appointmentSlots?.map(slot => {
        if (slot.date === date) {
          const updatedSlot = {
            ...slot,
            bookedSlots: slot.bookedSlots.filter(bookedSlot => bookedSlot !== timeSlot),
            updatedAt: new Date().toISOString()
          }
          updatedSlot.availableSlots = get().generateAvailableSlots(updatedSlot)
          return updatedSlot
        }
        return slot
      })
    } : null
    
    if (typeof window !== 'undefined' && updatedDoctor) {
      localStorage.setItem('doctor-profile', JSON.stringify(updatedDoctor))
    }
    return { doctor: updatedDoctor }
  }),

  // Hydrate doctor data from localStorage
  hydrateDoctor: () => {
    if (typeof window !== 'undefined') {
      try {
        set({ isLoading: true })
        const stored = localStorage.getItem('doctor-profile')
        if (stored) {
          const parsedDoctor = JSON.parse(stored) as Doctor
          set({ doctor: parsedDoctor, isHydrated: true, isLoading: false, error: null })
        } else {
          set({ isHydrated: true, isLoading: false })
        }
      } catch (error) {
        console.error('Failed to hydrate doctor from localStorage:', error)
        set({ 
          isHydrated: true, 
          isLoading: false, 
          error: 'Failed to load doctor data' 
        })
      }
    }
  },

  // Manually persist current doctor to localStorage
  persistDoctor: () => {
    const { doctor } = get()
    if (typeof window !== 'undefined' && doctor) {
      try {
        localStorage.setItem('doctor-profile', JSON.stringify(doctor))
        localStorage.setItem('doctorId', doctor.id)
      } catch (error) {
        console.error('Failed to persist doctor to localStorage:', error)
        set({ error: 'Failed to save doctor data' })
      }
    }
  },

  // Utility methods
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  isAuthenticated: () => {
    const { doctor } = get()
    return doctor !== null && doctor.id !== undefined
  },
  
  getDoctorById: (id) => {
    const { doctor } = get()
    return doctor?.id === id ? doctor : null
  },
  
  // Generate available time slots based on slot configuration
  generateAvailableSlots: (slot) => {
    const slots: string[] = []
    const startTime = new Date(`1970-01-01T${slot.startTime}:00`)
    const endTime = new Date(`1970-01-01T${slot.endTime}:00`)
    
    let currentTime = new Date(startTime)
    
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5) // HH:MM format
      
      // Only add if not booked
      if (!slot.bookedSlots.includes(timeString)) {
        slots.push(timeString)
      }
      
      // Add slot duration minutes
      currentTime.setMinutes(currentTime.getMinutes() + slot.slotDuration)
    }
    
    return slots
  }
}))