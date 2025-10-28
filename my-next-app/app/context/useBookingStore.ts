import { create } from 'zustand'

// Define AppointmentSlot interface if you need it
interface AppointmentSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  totalSlots: number;
  bookedSlots: string[];
  slotType: 'wave' | 'stream';
  maxPatients: number;
  availableSlots: string[];
  dayOfWeek: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isRecurring: boolean;
  recurringWeeks: number;
}


type Doctor = {
  id: string // String for consistency with your API
  name: string
  speciality: string
  location: string
  price: number
  rating: number
  experience: number
  availableDates: string[]
  availableTimes: string[]
  appointmentSlots?: AppointmentSlot[] // Fixed: Now it's a property, not a method, and optional
}

type Appointment = {
  doctor: Doctor
  date: string
  time: string
  userId: string
}

interface BookingStore {
  selectedDoctor: Doctor | null
  selectedDate: string
  selectedTime: string
  appointments: Appointment[]
  setDoctor: (doctor: Doctor) => void
  setDate: (date: string) => void
  setTime: (time: string) => void
  addAppointment: (appointment: Appointment) => void
  resetBooking: () => void
  getCurrentBookingInfo: () => { doctorId: string | null, doctorName: string | null }
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  selectedDoctor: null,
  selectedDate: '',
  selectedTime: '',
  appointments: [],
  setDoctor: (doctor) => {
    console.log('🔍 BookingStore - Setting doctor:', doctor.name, 'with ID:', doctor.id)
    set({ selectedDoctor: doctor })
  },
  setDate: (date) => set({ selectedDate: date }),
  setTime: (time) => set({ selectedTime: time }),
  addAppointment: (appointment) =>
    set((state) => ({
      appointments: [...state.appointments, appointment],
    })),
  resetBooking: () =>
    set({
      selectedDoctor: null,
      selectedDate: '',
      selectedTime: '',
    }),
  getCurrentBookingInfo: () => {
    const state = get()
    return {
      doctorId: state.selectedDoctor?.id || null,
      doctorName: state.selectedDoctor?.name || null
    }
  }
}))