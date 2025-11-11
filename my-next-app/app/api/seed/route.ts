/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = Redis.fromEnv()

interface MedicalRecord {
  id: string
  title: string
  type: 'prescription' | 'lab_report' | 'scan' | 'discharge_summary' | 'other'
  date: string
  doctorName: string
  doctorSpeciality: string
  doctorId: string
  patientName: string
  patientPhone: string
  patientEmail: string
  hospitalName?: string
  fileSize?: string
  notes?: string
  createdAt: string
}

const seedData = {
  users: [
    {
      id: '1',
      mobile: '+91-9876543210',
      email: 'admin.patient@hospital.com',
      password: 'admin123',
      otp: '1234',
      otpExpiry: '2025-11-25T19:00:00Z',
      location: 'Mumbai, Maharashtra',
      isVerified: true
    },
    {
      id: '2',
      mobile: '+91-9876543211',
      email: 'john.smith@email.com',
      password: 'patient123',
      otp: '2345',
      otpExpiry: '2025-12-25T19:00:00Z',
      location: 'Delhi, India',
      isVerified: true
    },
    {
      id: '3',
      mobile: '+91-9876543212',
      email: 'sarah.williams@email.com',
      password: 'patient123',
      otp: '3456',
      otpExpiry: '2025-12-25T19:00:00Z',
      location: 'Mumbai, Maharashtra',
      isVerified: true
    },
    {
      id: '4',
      mobile: '+91-9876543213',
      email: 'emily.brown@email.com',
      password: 'patient456',
      otp: '4567',
      otpExpiry: '2025-12-25T19:00:00Z',
      location: 'Bangalore, Karnataka',
      isVerified: true
    },
    {
      id: '5',
      mobile: '+91-9876543214',
      email: 'michael.davis@email.com',
      password: 'patient456',
      otp: '5678',
      otpExpiry: '2025-12-22T19:00:00Z',
      location: 'Chennai, Tamil Nadu',
      isVerified: true
    },
    {
      id: '6',
      mobile: '+91-9876543215',
      email: 'robert.miller@email.com',
      password: 'patient789',
      otp: '6789',
      otpExpiry: '2025-12-22T19:00:00Z',
      location: 'Pune, Maharashtra',
      isVerified: true
    },
    {
      id: '7',
      mobile: '+91-9876543216',
      email: 'jessica.wilson@email.com',
      password: 'patient789',
      otp: '7890',
      otpExpiry: '2025-10-22T19:00:00Z',
      location: 'Hyderabad, Telangana',
      isVerified: true
    },
    {
      id: '8',
      mobile: '+91-9876543217',
      email: 'lisa.taylor@email.com',
      password: 'patient101',
      otp: '8901',
      otpExpiry: '2025-10-22T19:00:00Z',
      location: 'Kolkata, West Bengal',
      isVerified: true
    },
    {
      id: '9',
      mobile: '+91-9876543218',
      email: 'daniel.anderson@email.com',
      password: 'patient101',
      otp: '9012',
      otpExpiry: '2025-12-22T19:00:00Z',
      location: 'Delhi, India',
      isVerified: true
    },
    {
      id: '10',
      mobile: '+91-9876543219',
      email: 'james.thomas@email.com',
      password: 'patient202',
      otp: '0123',
      otpExpiry: '2025-10-22T19:00:00Z',
      location: 'Ahmedabad, Gujarat',
      isVerified: true
    },
    {
      id: '11',
      mobile: '+91-9876543220',
      email: 'sophia.martinez@email.com',
      password: 'patient202',
      otp: '1357',
      otpExpiry: '2025-10-22T19:00:00Z',
      location: 'Jaipur, Rajasthan',
      isVerified: true
    },
    {
      id: '12',
      mobile: '+91-9876543221',
      email: 'maria.garcia@email.com',
      password: 'patient303',
      otp: '2468',
      otpExpiry: '2025-10-22T19:00:00Z',
      location: 'Lucknow, Uttar Pradesh',
      isVerified: true
    },
    {
      id: '13',
      mobile: '+91-9876543222',
      email: 'william.lee@email.com',
      password: 'patient303',
      otp: '3579',
      otpExpiry: '2025-12-22T19:00:00Z',
      location: 'Surat, Gujarat',
      isVerified: true
    },
    {
      id: '14',
      mobile: '+91-9876543223',
      email: 'david.clark@email.com',
      password: 'patient404',
      otp: '4680',
      otpExpiry: '2025-10-22T19:00:00Z',
      location: 'Nagpur, Maharashtra',
      isVerified: true
    },
    {
      id: '15',
      mobile: '+91-9876543224',
      email: 'olivia.robinson@email.com',
      password: 'patient404',
      otp: '5791',
      otpExpiry: '2025-10-22T19:00:00Z',
      location: 'Indore, Madhya Pradesh',
      isVerified: true
    }
  ],
  doctors: [
    {
      id: 'doc1',
      name: 'Dr. Rajesh Kumar',
      email: 'dr.rajesh@hospital.com',
      phone: '+91-9876500001',
      password: 'doctor123',
      otp: '1111',
      otpExpiry: '2025-12-31T23:59:59Z',
      qualification: 'MBBS, MD (Cardiology)',
      speciality: 'Cardiologist',
      location: 'Mumbai, Maharashtra',
      experience: 15,
      rating: 4.8,
      reviewCount: 0,
      price: 2000,
      availableDates: ['2025-11-03', '2025-11-04', '2025-11-05', '2025-11-06', '2025-11-07'],
      availableTimes: ['09:00', '11:00', '15:00', '17:00'],
      image: '/Dr.RajeshKumar.png',
      isVerified: true,
      licenseNumber: 'MH12345',
      about: 'Senior Cardiologist with 15+ years of experience in interventional cardiology.',
      slotTypes: [],
      appointmentSlots: [],
      reviews: []
    },
    {
      id: 'doc2',
      name: 'Dr. Sunita Sharma',
      email: 'dr.sunita@clinic.com',
      phone: '+91-9876500002',
      password: 'doctor456',
      otp: '2222',
      otpExpiry: '2025-12-31T23:59:59Z',
      qualification: 'MBBS, MS (Orthopedics)',
      speciality: 'Orthopedic Surgeon',
      location: 'Delhi, India',
      experience: 12,
      rating: 4.6,
      reviewCount: 0,
      price: 1800,
      availableDates: ['2025-11-03', '2025-11-04', '2025-11-05', '2025-11-06', '2025-11-07'],
      availableTimes: ['10:00', '14:00', '16:30'],
      image: '/Dr.SunitaSharma.png',
      isVerified: true,
      licenseNumber: 'DL67890',
      about: 'Specialist in joint replacement and sports medicine.',
      slotTypes: [],
      appointmentSlots: [],
      reviews: []
    },
    {
      id: 'doc3',
      name: 'Dr. Amit Patel',
      email: 'dr.amit@healthcare.com',
      phone: '+91-9876500003',
      password: 'doctor789',
      otp: '3333',
      otpExpiry: '2025-12-31T23:59:59Z',
      qualification: 'MBBS, MD (Pediatrics)',
      speciality: 'Pediatrician',
      location: 'Bangalore, Karnataka',
      experience: 8,
      rating: 4.7,
      reviewCount: 0,
      price: 1200,
      availableDates: ['2025-11-03', '2025-11-09', '2025-11-05', '2025-11-06', '2025-11-07'],
      availableTimes: ['09:30', '11:30', '15:30', '17:30'],
      image: '/Dr.AmitPatel.png',
      isVerified: true,
      licenseNumber: 'KA11111',
      about: 'Child specialist with expertise in newborn care and vaccination.',
      slotTypes: [],
      appointmentSlots: [],
      reviews: []
    },
    {
      id: 'doc4',
      name: 'Dr. Meera Joshi',
      email: 'dr.meera@women.health.com',
      phone: '+91-9876500004',
      password: 'doctor000',
      otp: '4444',
      otpExpiry: '2025-12-31T23:59:59Z',
      qualification: 'MBBS, MD (Gynecology)',
      speciality: 'Gynecologist',
      location: 'Pune, Maharashtra',
      experience: 18,
      rating: 4.9,
      reviewCount: 0,
      price: 1500,
      availableDates: ['2025-11-03', '2025-11-10', '2025-11-05', '2025-11-06', '2025-11-07'],
      availableTimes: ['10:00', '12:00', '16:00'],
      image: '/Dr.MeeraJoshi.png',
      isVerified: true,
      licenseNumber: 'MH54321',
      about: 'Women\'s health specialist with focus on high-risk pregnancies.',
      slotTypes: [],
      appointmentSlots: [],
      reviews: []
    },
    {
      id: 'doc5',
      name: 'Dr. Vikash Singh',
      email: 'dr.vikash@neuro.center.com',
      phone: '+91-9876500005',
      password: 'neuro123',
      otp: '5555',
      otpExpiry: '2025-12-31T23:59:59Z',
      qualification: 'MBBS, MCh (Neurosurgery)',
      speciality: 'Neurosurgeon',
      location: 'Chennai, Tamil Nadu',
      experience: 20,
      rating: 4.8,
      reviewCount: 0,
      price: 2500,
      availableDates: ['2025-11-03', '2025-11-04', '2025-11-05', '2025-11-06', '2025-11-07'],
      availableTimes: ['11:00', '14:00'],
      image: '/Dr.VikashSingh.png',
      isVerified: true,
      licenseNumber: 'TN98765',
      about: 'Leading neurosurgeon specializing in brain and spine surgery.',
      slotTypes: [],
      appointmentSlots: [],
      reviews: []
    },
    {
      id: 'doc6',
      name: 'Dr. Priya Malhotra',
      email: 'dr.priya@ortho.clinic.com',
      phone: '+91-9876500006',
      password: 'ortho456',
      otp: '6666',
      otpExpiry: '2025-12-31T23:59:59Z',
      qualification: 'MBBS, MS (Orthopedics)',
      speciality: 'Orthopedic',
      location: 'Delhi, India',
      experience: 16,
      rating: 4.7,
      reviewCount: 0,
      price: 1200,
      availableDates: ['2025-11-03', '2025-11-08', '2025-11-05', '2025-11-06', '2025-11-07'],
      availableTimes: ['14:30', '10:30', '16:00'],
      image: '/Dr.PriyaMalhotra.png',
      isVerified: true,
      licenseNumber: 'DL22222',
      about: 'Experienced orthopedic surgeon specializing in trauma and fracture care.',
      slotTypes: [],
      appointmentSlots: [],
      reviews: []
    },
    {
      id: 'doc7',
      name: 'Dr. Vikram Rao',
      email: 'dr.vikram@cardio.center.com',
      phone: '+91-9876500007',
      password: 'cardio789',
      otp: '7777',
      otpExpiry: '2025-12-31T23:59:59Z',
      qualification: 'MBBS, DM (Cardiology)',
      speciality: 'Cardiologist',
      location: 'Chennai, Tamil Nadu',
      experience: 12,
      rating: 4.5,
      reviewCount: 0,
      price: 1850,
      availableDates: ['2025-11-03', '2025-11-04', '2025-11-05', '2025-11-06', '2025-11-07'],
      availableTimes: ['11:00', '15:30', '09:30'],
      image: '/Dr.VikramRao.png',
      isVerified: true,
      licenseNumber: 'TN33333',
      about: 'Interventional cardiologist with expertise in complex cardiac procedures.',
      slotTypes: [],
      appointmentSlots: [],
      reviews: []
    },
    {
      id: 'doc8',
      name: 'Dr. Kavita Desai',
      email: 'dr.kavita@mental.health.com',
      phone: '+91-9876500008',
      password: 'psych101',
      otp: '8888',
      otpExpiry: '2025-12-31T23:59:59Z',
      qualification: 'MBBS, MD (Psychiatry)',
      speciality: 'Psychiatrist',
      location: 'Pune, Maharashtra',
      experience: 22,
      rating: 4.9,
      reviewCount: 0,
      price: 1300,
      availableDates: ['2025-11-03', '2025-11-04', '2025-11-05', '2025-11-06', '2025-11-07'],
      availableTimes: ['10:00', '14:30', '16:00'],
      image: '/KavitaDesai.png',
      isVerified: true,
      licenseNumber: 'MH44444',
      about: 'Senior psychiatrist specializing in mood disorders and anxiety treatment.',
      slotTypes: [],
      appointmentSlots: [],
      reviews: []
    },
    {
      id: 'doc9',
      name: 'Dr. Sameer Kapoor',
      email: 'dr.sameer@clinic.com',
      phone: '+91-9283746510',
      password: 'Doctor@5821',
      otp: '9999',
      otpExpiry: '2025-12-31T23:59:59Z',
      qualification: 'MD (Internal Medicine)',
      speciality: 'Pulmonology',
      location: 'Bangalore, Karnataka',
      experience: 8,
      rating: 4.2,
      reviewCount: 6,
      price: 750,
      availableDates: ['2025-11-03', '2025-11-04', '2025-11-05', '2025-11-06', '2025-11-07'],
      availableTimes: ['10:00', '14:00', '16:30'],
      image: '/Dr.SameerKapoor.png',
      isVerified: true,
      licenseNumber: 'KA55555',
      about: 'Pulmonologist with focus on respiratory disorders and sleep medicine.',
      slotTypes: [],
      appointmentSlots: [],
      reviews: []
    }
  ],
  bookings: [
    {
      id: '1762156367098',
      doctorId: 'doc8',
      doctorName: 'Dr. Kavita Desai',
      speciality: 'Psychiatrist',
      date: '2025-11-05',
      time: '10:00',
      patientName: 'debasmita',
      patientPhone: '9876543212',
      patientEmail: 'sarah.williams@email.com',
      notes: 'fever',
      price: 1300,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2025-11-03T07:52:47.098Z',
      patientDetails: {
        fullName: 'debasmita',
        age: 23,
        gender: 'Female',
        mobileNumber: '9876543212',
        weight: 45,
        problem: 'fever',
        relationship: 'Self',
        addedAt: '2025-11-03T07:54:09.136Z'
      },
      updatedAt: '2025-11-03T12:10:18.055Z',
      paymentDetails: {
        cardType: 'Visa',
        lastFourDigits: '   4',
        cardholderName: 'ds',
        paidAt: '2025-11-03T07:54:30.436Z',
        amount: 1300
      }
    },
    {
      id: '1762173866422',
      doctorId: 'doc8',
      doctorName: 'Dr. Kavita Desai',
      speciality: 'Psychiatrist',
      date: '2025-11-03',
      time: '19:00',
      patientName: 'ayush',
      patientPhone: '9876543212',
      patientEmail: 'sarah.williams@email.com',
      notes: 'anxiety',
      price: 1300,
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: '2025-11-03T12:44:26.422Z',
      patientDetails: {
        fullName: 'ayush',
        age: 22,
        gender: 'Male',
        mobileNumber: '9876543212',
        weight: 55,
        problem: 'anxiety',
        relationship: 'Brother',
        addedAt: '2025-11-03T12:45:24.487Z'
      },
      updatedAt: '2025-11-04T12:31:25.268Z',
      paymentDetails: {
        cardType: 'RuPay',
        lastFourDigits: '  33',
        cardholderName: 'ayush',
        paidAt: '2025-11-03T12:45:59.752Z',
        amount: 1300
      }
    },
    {
      id: '1762268605997',
      doctorId: 'doc3',
      doctorName: 'Dr. Amit Patel',
      speciality: 'Pediatrician',
      date: '2025-11-14',
      time: '15:30',
      patientName: 'ds',
      patientPhone: '9876543212',
      patientEmail: 'sarah.williams@email.com',
      notes: 'cold',
      price: 1200,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2025-11-04T15:03:25.997Z',
      patientDetails: {
        fullName: 'ds',
        age: 22,
        gender: 'Female',
        mobileNumber: '9876543212',
        weight: 43,
        problem: 'cold',
        relationship: 'Sister',
        addedAt: '2025-11-04T15:04:01.230Z'
      },
      updatedAt: '2025-11-04T15:04:22.797Z',
      paymentDetails: {
        cardType: 'Visa',
        lastFourDigits: '   1',
        cardholderName: 'deb',
        paidAt: '2025-11-04T15:04:22.779Z',
        amount: 1200
      }
    }
  ],
  prescriptions: [
    {
      id: '1762259485212',
      appointmentId: '1762173866422',
      patientName: 'ayush',
      patientPhone: '9876543212',
      patientEmail: 'sarah.williams@email.com',
      doctorId: 'doc8',
      doctorName: 'Dr. Kavita Desai',
      diagnosis: 'take rest',
      symptoms: 'Anxiety and Fear',
      medications: [
        {
          id: '1762259376274',
          name: 'Antidepressants',
          dosage: '500',
          frequency: '2',
          duration: '15',
          instructions: 'take after meals'
        }
      ],
      labTests: '',
      followUpDate: '',
      additionalNotes: '',
      prescribedAt: '2025-11-04T12:31:25.212Z'
    }
  ],
  feedbacks: [
    {
      id: 'feedback_app1_1731234567890',
      appointmentId: 'app1',
      doctorId: 'doc1',
      doctorName: 'Dr. Rajesh Kumar',
      patientEmail: 'admin.patient@hospital.com',
      patientName: 'Admin Patient',
      consultingRating: 5,
      hospitalRating: 4,
      waitingTimeRating: 4,
      wouldRecommend: true,
      additionalComments: 'Excellent consultation! Dr. Kumar was very thorough and explained everything clearly. The treatment plan was effective and I felt much better after following it.',
      appointmentDate: '2025-11-01',
      appointmentTime: '10:00',
      submittedAt: '2025-11-01T11:30:00.000Z',
      status: 'active'
    },
    {
      id: 'feedback_app2_1731234567891',
      appointmentId: 'app2',
      doctorId: 'doc1',
      doctorName: 'Dr. Rajesh Kumar',
      patientEmail: 'john.smith@email.com',
      patientName: 'John Smith',
      consultingRating: 4,
      hospitalRating: 5,
      waitingTimeRating: 3,
      wouldRecommend: true,
      additionalComments: 'Good experience overall. The doctor was knowledgeable and helpful. Only issue was the waiting time was a bit long.',
      appointmentDate: '2025-11-02',
      appointmentTime: '14:00',
      submittedAt: '2025-11-02T15:30:00.000Z',
      status: 'active'
    },
    {
      id: 'feedback_app3_1731234567892',
      appointmentId: 'app3',
      doctorId: 'doc2',
      doctorName: 'Dr. Priya Sharma',
      patientEmail: 'sarah.williams@email.com',
      patientName: 'Sarah Williams',
      consultingRating: 5,
      hospitalRating: 5,
      waitingTimeRating: 5,
      wouldRecommend: true,
      additionalComments: 'Outstanding service! Dr. Sharma was very caring and took time to address all my concerns. The staff was also very professional.',
      appointmentDate: '2025-11-03',
      appointmentTime: '09:00',
      submittedAt: '2025-11-03T10:30:00.000Z',
      status: 'active'
    },
    {
      id: 'feedback_app4_1731234567893',
      appointmentId: 'app4',
      doctorId: 'doc3',
      doctorName: 'Dr. Amit Patel',
      patientEmail: 'admin.patient@hospital.com',
      patientName: 'Admin Patient',
      consultingRating: 4,
      hospitalRating: 4,
      waitingTimeRating: 4,
      wouldRecommend: true,
      additionalComments: 'Dr. Patel is great with pediatric care. My child felt comfortable during the consultation.',
      appointmentDate: '2025-11-03',
      appointmentTime: '15:00',
      submittedAt: '2025-11-03T16:30:00.000Z',
      status: 'active'
    },
    {
      id: 'feedback_app5_1731234567894',
      appointmentId: 'app5',
      doctorId: 'doc1',
      doctorName: 'Dr. Rajesh Kumar',
      patientEmail: 'mike.johnson@email.com',
      patientName: 'Mike Johnson',
      consultingRating: 3,
      hospitalRating: 3,
      waitingTimeRating: 2,
      wouldRecommend: false,
      additionalComments: 'The consultation was okay but the waiting time was excessive. I had to wait for over an hour past my appointment time.',
      appointmentDate: '2025-11-04',
      appointmentTime: '11:00',
      submittedAt: '2025-11-04T13:30:00.000Z',
      status: 'active'
    }
  ]
}

// Generate medical records from bookings and prescriptions
function generateMedicalRecords(data: any): MedicalRecord[] {
  const records: MedicalRecord[] = []
  const doctorsMap: Map<string, any> = new Map(data.doctors.map((doc: any) => [doc.id, doc]))

  // Generate from bookings
  data.bookings.forEach((booking: any) => {
    const doctor: any = doctorsMap.get(booking.doctorId)
    if (!doctor) return

    records.push({
      id: `rec_${booking.id}`,
      title: `${doctor.speciality} Consultation - ${booking.patientDetails?.problem || 'Checkup'}`,
      type: 'discharge_summary',
      date: booking.date,
      doctorName: booking.doctorName,
      doctorSpeciality: doctor.speciality,
      doctorId: booking.doctorId,
      patientName: booking.patientName,
      patientPhone: booking.patientPhone,
      patientEmail: booking.patientEmail,
      hospitalName: 'City Hospital',
      notes: `Chief Complaint: ${booking.patientDetails?.problem || 'General Checkup'}\nAge: ${booking.patientDetails?.age}, Weight: ${booking.patientDetails?.weight}kg\nRecommendations: ${booking.notes || 'Follow-up as needed'}`,
      createdAt: booking.createdAt
    })
  })

  // Generate from prescriptions
  data.prescriptions.forEach((prescription: any) => {
    const doctor: any = doctorsMap.get(prescription.doctorId)
    if (!doctor) return

    const medicationsList = prescription.medications
      .map((med: any) => `• ${med.name} - ${med.dosage}mg, ${med.frequency}x daily for ${med.duration} days`)
      .join('\n')

    records.push({
      id: `rec_${prescription.id}`,
      title: `Prescription - ${prescription.diagnosis}`,
      type: 'prescription',
      date: prescription.prescribedAt,
      doctorName: prescription.doctorName,
      doctorSpeciality: doctor.speciality,
      doctorId: prescription.doctorId,
      patientName: prescription.patientName,
      patientPhone: prescription.patientPhone,
      patientEmail: prescription.patientEmail,
      hospitalName: 'City Hospital',
      notes: `Diagnosis: ${prescription.diagnosis}\nSymptoms: ${prescription.symptoms}\n\nMedications:\n${medicationsList}`,
      createdAt: prescription.prescribedAt
    })
  })

  // Remove duplicates
  const uniqueRecords = Array.from(new Map(records.map(r => [r.id, r])).values())
  
  // Sort by date (newest first)
  uniqueRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return uniqueRecords
}

export async function GET() {
  try {
    console.log('Seeding Redis with all data...')

    // Seed all raw data
    await redis.set('users', JSON.stringify(seedData.users))
    await redis.set('doctors', JSON.stringify(seedData.doctors))
    await redis.set('bookings', JSON.stringify(seedData.bookings))
    await redis.set('prescriptions', JSON.stringify(seedData.prescriptions))

    // Generate and seed medical records
    const medicalRecords = generateMedicalRecords(seedData)
    await redis.set('medical_records', JSON.stringify(medicalRecords))

    // Seed feedback data
    console.log('Seeding feedback data...')
    
    // Store individual feedback in hash
    for (const feedback of seedData.feedbacks) {
      await redis.hset('feedbacks', { [feedback.id]: JSON.stringify(feedback) })
      
      // Also add to doctor-specific feedback set
      const doctorFeedbackKey = `doctor_feedbacks:${feedback.doctorId}`
      await redis.sadd(doctorFeedbackKey, feedback.id)
    }

    // Statistics
    const recordsByType = medicalRecords.reduce((acc: any, rec) => {
      acc[rec.type] = (acc[rec.type] || 0) + 1
      return acc
    }, {})

    const recordsByPatient = medicalRecords.reduce((acc: any, rec) => {
      acc[rec.patientEmail] = (acc[rec.patientEmail] || 0) + 1
      return acc
    }, {})

    const feedbacksByDoctor = seedData.feedbacks.reduce((acc: any, feedback) => {
      acc[feedback.doctorName] = (acc[feedback.doctorName] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      message: 'Redis seeded successfully!',
      data: {
        users: seedData.users.length,
        doctors: seedData.doctors.length,
        bookings: seedData.bookings.length,
        prescriptions: seedData.prescriptions.length,
        medicalRecords: medicalRecords.length,
        feedbacks: seedData.feedbacks.length,
        recordsByType,
        recordsByPatient,
        feedbacksByDoctor
      }
    })
  } catch (error) {
    console.error('Error seeding Redis:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to seed Redis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}

export async function DELETE() {
  try {
    await redis.del('users')
    await redis.del('doctors')
    await redis.del('bookings')
    await redis.del('prescriptions')
    await redis.del('medical_records')
    await redis.del('feedbacks')

    // Clear doctor-specific feedback sets
    const doctorIds = ['doc1', 'doc2', 'doc3'] // Based on seed data
    for (const doctorId of doctorIds) {
      await redis.del(`doctor_feedbacks:${doctorId}`)
    }

    return NextResponse.json({
      success: true,
      message: '🗑️ All data cleared from Redis'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to clear Redis'
    }, { status: 500 })
  }
}
