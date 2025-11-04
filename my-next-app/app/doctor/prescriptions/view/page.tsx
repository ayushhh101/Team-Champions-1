/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  Printer,
  Edit3,
  Stethoscope,
  Pill,
  FlaskConical,
  FileText,
  Download,
  Heart
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Prescription {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  speciality?: string;
  diagnosis: string;
  symptoms?: string;
  medications: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  labTests?: string;
  followUpDate?: string;
  additionalNotes?: string;
  prescribedAt: string;
  updatedAt?: string;
}

export default function ViewPrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prescriptionId = searchParams.get('id');

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!prescriptionId) {
      toast.error('Prescription ID is missing');
      router.push('/doctor/prescriptions/list');
      return;
    }

    fetchPrescription();
  }, [prescriptionId]);

  const fetchPrescription = async () => {
    try {
      const response = await fetch(`/api/prescriptions?id=${prescriptionId}`);
      const data = await response.json();

      if (data.success && data.prescriptions.length > 0) {
        setPrescription(data.prescriptions[0]);
      } else {
        toast.error('Prescription not found');
        router.push('/doctor/prescriptions/list');
      }
    } catch (error) {
      console.error('Error fetching prescription:', error);
      toast.error('Failed to load prescription');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    if (prescription) {
      router.push(
        `/doctor/prescription?appointmentId=${prescription.appointmentId}&prescriptionId=${prescription.id}`
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#91C8E4] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#4682A9] font-semibold text-lg">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-semibold">Prescription not found</p>
          <button
            onClick={() => router.push('/doctor/prescriptions/list')}
            className="px-6 py-2 bg-[#4682A9] text-white rounded-lg hover:bg-[#749BC2] transition-all"
          >
            Go to Prescriptions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 pb-8">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-gradient-to-r from-[#91C8E4] to-[#4682A9] text-white sticky top-0 z-50 shadow-lg print:hidden">
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
                <h1 className="text-lg sm:text-xl font-bold">View Prescription</h1>
                <p className="text-sm text-white/80">Patient: {prescription.patientName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 rounded-lg transition-colors font-semibold"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-5xl mx-auto">
        {/* Main Prescription Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 print:shadow-none print:rounded-none">
          
          {/* Professional Header - Doctor Letterhead */}
          <div className="bg-gradient-to-r from-[#FFFBDE] to-[#91C8E4]/10 border-b-4 border-[#4682A9] p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-[#4682A9] rounded-full flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#4682A9]">{prescription.doctorName}</h1>
                  <p className="text-[#749BC2] font-semibold text-lg mt-1">
                    {prescription.speciality || 'Medical Professional'}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Reg. No: MED-{prescription.doctorId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-700 space-y-2">
                <p className="font-semibold text-[#4682A9]">📞 +91 98765 43210</p>
                <p className="text-gray-600">📧 doctor@clinic.com</p>
                <p className="font-semibold mt-3">🏥 Healthcare Clinic</p>
                <p className="text-gray-600 text-xs">City Hospital, Medical District</p>
              </div>
            </div>
          </div>

          {/* Prescription Info */}
          <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Prescription Date:</span> {formatFullDate(prescription.prescribedAt)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Time:</span> {formatTime(prescription.prescribedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-semibold">Rx ID:</span> {prescription.id}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Appointment ID:</span> {prescription.appointmentId}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Information Card */}
          <div className="px-8 py-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-[#2C5F7C] mb-4 flex items-center">
              <User className="w-6 h-6 mr-3 text-[#4682A9]" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FFFBDE]/50 rounded-xl p-4">
                <p className="text-xs text-gray-600 font-semibold mb-1">Name</p>
                <p className="font-bold text-gray-900 text-lg">{prescription.patientName}</p>
              </div>
              <div className="bg-[#FFFBDE]/50 rounded-xl p-4">
                <p className="text-xs text-gray-600 font-semibold mb-1 flex items-center">
                  <Phone className="w-3 h-3 mr-1" /> Phone
                </p>
                <p className="font-semibold text-gray-900">{prescription.patientPhone}</p>
              </div>
              <div className="bg-[#FFFBDE]/50 rounded-xl p-4">
                <p className="text-xs text-gray-600 font-semibold mb-1 flex items-center">
                  <Mail className="w-3 h-3 mr-1" /> Email
                </p>
                <p className="font-semibold text-gray-900 text-sm">{prescription.patientEmail}</p>
              </div>
              <div className="bg-[#91C8E4]/10 rounded-xl p-4">
                <p className="text-xs text-gray-600 font-semibold mb-1">Date of Issue</p>
                <p className="font-semibold text-gray-900">{formatDate(prescription.prescribedAt)}</p>
              </div>
            </div>
          </div>

          {/* Chief Complaints */}
          {prescription.symptoms && (
            <div className="px-8 py-6 border-b border-gray-200 bg-orange-50/30">
              <h2 className="text-lg font-bold text-[#2C5F7C] mb-3 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-[#4682A9]" />
                Chief Complaints
              </h2>
              <div className="bg-white rounded-lg p-4 border-l-4 border-orange-400">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{prescription.symptoms}</p>
              </div>
            </div>
          )}

          {/* Diagnosis */}
          <div className="px-8 py-6 border-b border-gray-200 bg-green-50/20">
            <h2 className="text-lg font-bold text-[#2C5F7C] mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#4682A9]" />
              Diagnosis & Assessment
            </h2>
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-gray-800 font-semibold leading-relaxed whitespace-pre-wrap">{prescription.diagnosis}</p>
            </div>
          </div>

          {/* Medications - Professional Rx Layout */}
          <div className="px-8 py-8 border-b-2 border-gray-300">
            <div className="flex items-center mb-6">
              <div className="text-7xl font-serif text-[#4682A9] mr-4" style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic' }}>℞</div>
              <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Medications</h2>
            </div>

            <div className="space-y-4">
              {prescription.medications.map((med, index) => (
                <div key={med.id} className="bg-[#FFFBDE]/60 border-2 border-[#4682A9]/30 rounded-xl p-5">
                  <div className="flex items-start space-x-4">
                    <span className="font-bold text-[#4682A9] text-2xl min-w-[40px]">{index + 1}.</span>
                    <div className="flex-1">
                      {/* Medicine Name */}
                      <h3 className="font-bold text-gray-900 text-lg mb-3">{med.name}</h3>
                      
                      {/* Medicine Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-600 font-semibold">Dosage</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{med.dosage} mg</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-600 font-semibold">Frequency</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{med.frequency}x Daily</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-600 font-semibold">Duration</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{med.duration} Days</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-600 font-semibold">Total Qty</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            {parseInt(med.frequency || '1') * parseInt(med.duration || '1')} Tablets
                          </p>
                        </div>
                      </div>

                      {/* Instructions */}
                      {med.instructions && (
                        <div className="bg-white rounded-lg p-3 border-l-4 border-[#4682A9]">
                          <p className="text-sm text-gray-700 flex items-start">
                            <span className="text-[#4682A9] mr-2 font-bold">📋</span>
                            <span className="font-medium">{med.instructions}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Medicine Warning */}
            <div className="mt-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-semibold">
                ⚠️ <span className="font-bold">Important:</span> Take medications as prescribed. Do not stop or change dosage without consulting the doctor. Keep all medicines out of reach of children and stored in a cool, dry place.
              </p>
            </div>
          </div>

          {/* Lab Tests */}
          {prescription.labTests && (
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#2C5F7C] mb-3 flex items-center">
                <FlaskConical className="w-5 h-5 mr-2 text-[#4682A9]" />
                Laboratory Tests
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#4682A9]">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{prescription.labTests}</p>
              </div>
            </div>
          )}

          {/* Follow-up Appointment */}
          {prescription.followUpDate && (
            <div className="px-8 py-6 border-b border-gray-200 bg-blue-50/30">
              <h2 className="text-lg font-bold text-[#2C5F7C] mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-[#4682A9]" />
                Follow-up Appointment
              </h2>
              <div className="bg-white rounded-lg p-4 border-2 border-[#91C8E4]/50">
                <p className="text-lg font-semibold text-gray-900">
                  📅 {formatFullDate(prescription.followUpDate)}
                </p>
                <p className="text-sm text-gray-600 mt-2">Please schedule your follow-up appointment on this date or contact the clinic to confirm.</p>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {prescription.additionalNotes && (
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#2C5F7C] mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#4682A9]" />
                Additional Notes & Advice
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{prescription.additionalNotes}</p>
              </div>
            </div>
          )}

          {/* Doctor Signature Section */}
          <div className="px-8 py-8 bg-gradient-to-r from-gray-50 to-[#FFFBDE]/20">
            <div className="flex items-end justify-between">
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <span className="font-semibold text-gray-800">Issued Date:</span> {formatDate(prescription.prescribedAt)}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Medical Facility:</span> Healthcare Clinic, City Hospital
                </p>
              </div>

              {/* Signature Area */}
              <div className="text-right">
                <div className="border-t-2 border-gray-800 pt-2 mt-8 min-w-[250px]">
                  <p className="font-bold text-[#4682A9] text-xl">Dr. {prescription.doctorName}</p>
                  <p className="text-sm text-gray-600">{prescription.speciality || 'Medical Professional'}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Registration No: MED-{prescription.doctorId.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-4 italic">Digitally Issued Prescription</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-900 text-white border-t-2 border-gray-800">
            <div className="flex items-center justify-between flex-wrap gap-4 text-xs">
              <p>⚕️ Professional Medical Prescription - Confidential Document</p>
              <p>Prescription ID: <span className="font-mono">{prescription.id}</span></p>
              <p>© {new Date().getFullYear()} Healthcare Clinic - All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background: white !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
          
          .bg-gradient-to-br {
            background: white !important;
          }
          
          .shadow-2xl,
          .shadow-lg {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
