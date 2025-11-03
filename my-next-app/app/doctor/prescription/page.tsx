/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  MapPin,
  Plus,
  Trash2,
  Save,
  Printer,
  FileText
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  date: string;
  time: string;
  notes?: string;
}

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  location: string;
  qualification?: string;
  registrationNumber?: string;
}

export default function PrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const prescriptionId = searchParams.get('prescriptionId'); // For editing

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Prescription fields
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [labTests, setLabTests] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const isEditMode = !!prescriptionId;

  useEffect(() => {
    if (!appointmentId) {
      toast.error('Appointment ID is missing');
      router.push('/doctor/appointments');
      return;
    }

    fetchData();
  }, [appointmentId, prescriptionId]);

  const fetchData = async () => {
    try {
      const doctorId = localStorage.getItem('doctorId');
      
      if (!doctorId) {
        router.push('/doctor/login');
        return;
      }

      // Fetch doctor data
      const doctorResponse = await fetch('/api/doctors');
      const doctorData = await doctorResponse.json();
      const loggedInDoctor = doctorData.doctors?.find((d: any) => d.id === doctorId);
      
      if (loggedInDoctor) {
        setDoctor(loggedInDoctor);
      }

      // Fetch appointment
      const bookingsResponse = await fetch('/api/bookings');
      const bookingsData = await bookingsResponse.json();

      if (bookingsData.bookings) {
        const foundAppointment = bookingsData.bookings.find(
          (booking: any) => booking.id === appointmentId
        );
        
        if (foundAppointment) {
          setAppointment(foundAppointment);
        } else {
          toast.error('Appointment not found');
          router.push('/doctor/appointments');
          return;
        }
      }

      // If editing, fetch existing prescription
      if (prescriptionId) {
        const prescriptionResponse = await fetch(`/api/prescriptions?id=${prescriptionId}`);
        const prescriptionData = await prescriptionResponse.json();
        
        if (prescriptionData.success && prescriptionData.prescriptions.length > 0) {
          const presc = prescriptionData.prescriptions[0];
          setDiagnosis(presc.diagnosis || '');
          setSymptoms(presc.symptoms || '');
          setMedications(presc.medications || []);
          setLabTests(presc.labTests || '');
          setFollowUpDate(presc.followUpDate || '');
          setAdditionalNotes(presc.additionalNotes || '');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    const newMed: Medication = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    };
    setMedications([...medications, newMed]);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleSavePrescription = async () => {
    if (!diagnosis.trim()) {
      toast.error('Please enter a diagnosis');
      return;
    }

    if (medications.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    // Validate medications
    for (const med of medications) {
      if (!med.name.trim() || !med.dosage.trim() || !med.frequency.trim()) {
        toast.error('Please fill in all required medication fields');
        return;
      }
    }

    setSaving(true);

    try {
      const prescriptionData = {
        id: prescriptionId || Date.now().toString(),
        appointmentId,
        patientName: appointment?.patientName,
        patientPhone: appointment?.patientPhone,
        patientEmail: appointment?.patientEmail,
        doctorId: doctor?.id,
        doctorName: doctor?.name,
        diagnosis,
        symptoms,
        medications,
        labTests,
        followUpDate,
        additionalNotes,
        prescribedAt: isEditMode ? undefined : new Date().toISOString()
      };

      const method = isEditMode ? 'PATCH' : 'POST';
      const endpoint = '/api/prescriptions';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      });

      const result = await response.json();

      if (result.success) {
        // Also update appointment status to completed
        await fetch('/api/bookings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: appointmentId,
            status: 'completed'
          }),
        });

        toast.success(`Prescription ${isEditMode ? 'updated' : 'created'} successfully!`, {
          duration: 2000,
          style: {
            background: '#10B981',
            color: '#ffffff',
            fontWeight: 'bold',
          },
        });

        setTimeout(() => {
          router.push('/doctor/prescriptions/list');
        }, 2000);
      } else {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} prescription`);
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error('Failed to save prescription. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#91C8E4] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#4682A9] font-semibold text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!appointment || !doctor) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Appointment or Doctor not found</p>
          <button
            onClick={() => router.push('/doctor/appointments')}
            className="px-6 py-2 bg-[#4682A9] text-white rounded-lg hover:bg-[#749BC2] transition-all"
          >
            Go to Appointments
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
                <h1 className="text-lg sm:text-xl font-bold">
                  {isEditMode ? 'Edit Prescription' : 'Write Prescription'}
                </h1>
                <p className="text-sm text-white/80">
                  {isEditMode ? 'Update prescription details' : 'Create medical prescription for patient'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
        {/* Doctor & Patient Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doctor Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Doctor Information</h3>
              <div className="space-y-2">
                <p className="text-lg font-bold text-[#2C5F7C]">{doctor.name}</p>
                <p className="text-sm text-[#4FC3F7] font-semibold">{doctor.speciality}</p>
                {doctor.qualification && (
                  <p className="text-sm text-gray-600">{doctor.qualification}</p>
                )}
                {doctor.registrationNumber && (
                  <p className="text-xs text-gray-500">Reg. No: {doctor.registrationNumber}</p>
                )}
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.location}</span>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Patient Information</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="text-lg font-bold text-gray-900">{appointment.patientName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{appointment.patientPhone}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{appointment.time}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Form */}
        <div className="space-y-6">
          {/* Symptoms */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-[#2C5F7C] mb-4">Symptoms</h3>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Enter patient symptoms..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] resize-none transition-colors text-gray-900"
            />
          </div>

          {/* Diagnosis */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-[#2C5F7C] mb-4">
              Diagnosis <span className="text-red-500">*</span>
            </h3>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] resize-none transition-colors text-gray-900"
              required
            />
          </div>

          {/* Medications */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#2C5F7C]">
                Medications <span className="text-red-500">*</span>
              </h3>
              <button
                onClick={addMedication}
                className="flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white rounded-lg hover:from-[#4682A9] hover:to-[#749BC2] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medication</span>
              </button>
            </div>

            {medications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No medications added yet</p>
                <p className="text-sm">Click &quot;Add Medication&quot; to start</p>
              </div>
            ) : (
              <div className="space-y-4">
                {medications.map((med, index) => (
                  <div key={med.id} className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-700">Medication {index + 1}</h4>
                      <button
                        onClick={() => removeMedication(med.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Medicine Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                          placeholder="e.g., Paracetamol"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Dosage <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedication(med.id, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Frequency <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => updateMedication(med.id, 'frequency', e.target.value)}
                          placeholder="e.g., 3 times a day"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedication(med.id, 'duration', e.target.value)}
                          placeholder="e.g., 5 days"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors text-gray-900"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Instructions
                        </label>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                          placeholder="e.g., Take after meals"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lab Tests */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-[#2C5F7C] mb-4">Lab Tests (if any)</h3>
            <textarea
              value={labTests}
              onChange={(e) => setLabTests(e.target.value)}
              placeholder="Enter recommended lab tests..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] resize-none transition-colors text-gray-900"
            />
          </div>

          {/* Follow-up Date */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-[#2C5F7C] mb-4">Follow-up Date</h3>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors text-gray-900"
            />
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-[#2C5F7C] mb-4">Additional Notes</h3>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional instructions or precautions..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] resize-none transition-colors text-gray-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 print:hidden">
            <button
              onClick={() => router.back()}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePrescription}
              disabled={saving}
              className="flex-1 py-4 bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white rounded-xl font-semibold hover:from-[#4682A9] hover:to-[#749BC2] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isEditMode ? 'Update' : 'Save'} Prescription</span>
                </>
              )}
            </button>
          </div>
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
