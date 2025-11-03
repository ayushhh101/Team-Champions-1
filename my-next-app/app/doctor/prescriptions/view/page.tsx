/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Printer,
  Edit3
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Prescription {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorName: string;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#91C8E4] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#4682A9] font-semibold text-lg">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Prescription not found</p>
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
    <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white sticky top-0 z-50 shadow-lg print:hidden">
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
                <p className="text-sm text-white/80">Prescription ID: {prescription.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
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
        {/* Doctor & Patient Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doctor Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Prescribed By</h3>
              <div className="space-y-2">
                <p className="text-lg font-bold text-[#2C5F7C]">{prescription.doctorName}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(prescription.prescribedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {prescription.updatedAt && (
                  <p className="text-xs text-gray-500">
                    Last Updated: {new Date(prescription.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Patient Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Patient Information</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="text-lg font-bold text-gray-900">{prescription.patientName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{prescription.patientPhone}</p>
                </div>
                <p className="text-xs text-gray-500">Appointment ID: {prescription.appointmentId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Details */}
        <div className="space-y-6">
          {/* Symptoms */}
          {prescription.symptoms && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#2C5F7C] mb-3">Symptoms</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{prescription.symptoms}</p>
            </div>
          )}

          {/* Diagnosis */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-[#2C5F7C] mb-3">Diagnosis</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{prescription.diagnosis}</p>
          </div>

          {/* Medications */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-[#2C5F7C] mb-4">Medications</h3>
            <div className="space-y-4">
              {prescription.medications.map((med, index) => (
                <div key={med.id} className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {index + 1}. {med.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Dosage:</span>
                      <span className="ml-2 text-gray-900 font-medium">{med.dosage}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Frequency:</span>
                      <span className="ml-2 text-gray-900 font-medium">{med.frequency}</span>
                    </div>
                    {med.duration && (
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 text-gray-900 font-medium">{med.duration}</span>
                      </div>
                    )}
                    {med.instructions && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Instructions:</span>
                        <span className="ml-2 text-gray-900 font-medium">{med.instructions}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lab Tests */}
          {prescription.labTests && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#2C5F7C] mb-3">Lab Tests</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{prescription.labTests}</p>
            </div>
          )}

          {/* Follow-up Date */}
          {prescription.followUpDate && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#2C5F7C] mb-3">Follow-up Date</h3>
              <div className="flex items-center space-x-2 text-gray-700">
                <Calendar className="w-5 h-5 text-[#4682A9]" />
                <p>
                  {new Date(prescription.followUpDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {prescription.additionalNotes && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-[#2C5F7C] mb-3">Additional Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{prescription.additionalNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .bg-gradient-to-br {
            background: white !important;
          }
          .shadow-lg {
            box-shadow: none !important;
          }
          .border {
            border-color: #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  );
}
