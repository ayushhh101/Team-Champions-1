'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Phone,Stethoscope, FlaskConical } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  doctorId: string;
  doctorName: string;
  speciality?: string;
  diagnosis: string;
  symptoms: string;
  medications: Medication[];
  labTests?: string;
  followUpDate?: string;
  additionalNotes?: string;
  prescribedAt: string;
}

export default function UserPrescriptionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    fetchPrescriptionDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPrescriptionDetails = async () => {
    try {
      console.log('Fetching prescription with ID:', id);
      setDebugInfo(`Searching for ID: ${id}`);

      // First try to fetch by prescription ID
      let response = await fetch(`/api/prescriptions?id=${id}`);
      let data = await response.json();
      
      console.log('Response from API:', data);

      if (data.prescriptions && data.prescriptions.length > 0) {
        console.log('Found prescription by ID:', data.prescriptions[0]);
        setPrescription(data.prescriptions[0]);
        setDebugInfo(`Found by Prescription ID: ${data.prescriptions[0].id}`);
      } else {
        // If not found by prescription ID, try by appointmentId
        console.log('Not found by prescription ID, trying appointmentId...');
        response = await fetch(`/api/prescriptions?appointmentId=${id}`);
        data = await response.json();
        
        console.log('Response from appointmentId search:', data);

        if (data.prescriptions && data.prescriptions.length > 0) {
          console.log('Found prescription by appointmentId:', data.prescriptions[0]);
          setPrescription(data.prescriptions[0]);
          setDebugInfo(`Found by Appointment ID: ${data.prescriptions[0].id}`);
        } else {
          console.warn('No prescription found for ID:', id);
          setDebugInfo(`No prescription found for: ${id}`);
        }
      }
    } catch (error) {
      console.error('Error fetching prescription details:', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

   

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#91C8E4] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#4682A9] font-semibold text-lg">Loading prescription...</p>
          <p className="text-sm text-gray-600 mt-2">{debugInfo}</p>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4682A9] mb-4">Prescription Not Found</h2>
          <p className="text-gray-600 mb-2">The requested prescription could not be found.</p>
          <p className="text-sm text-gray-500 mb-6">ID: {id}</p>
          <p className="text-xs text-gray-400 mb-6 max-w-md">{debugInfo}</p>
          
          {/* Debug Info */}
          <div className="mb-6 text-left bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
            <p className="text-xs font-mono text-gray-600">
              <strong>Debug:</strong><br/>
              Looking for: {id}<br/>
              Try: /api/prescriptions?id={id}<br/>
              Or: /api/prescriptions?appointmentId={id}
            </p>
          </div>

          <Link href="/user/appointments">
            <button className="px-6 py-3 bg-[#4682A9] text-white rounded-xl hover:bg-[#749BC2] transition-colors font-semibold shadow-lg mb-4">
              Back to Appointments
            </button>
          </Link>

          {/* Alternative Debug Link */}
          <div className="text-sm">
            <p className="text-gray-600 mb-2">Try searching by:</p>
            <Link href="/user/appointments">
              <button className="text-[#4682A9] hover:underline">
                Check Appointments List
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20">
      {/* Header - Hide on print */}
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
                <h1 className="text-lg sm:text-xl font-bold">Medical Prescription</h1>
                <p className="text-sm text-white/80">Your treatment prescription</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Prescription Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-[#91C8E4]/30 overflow-hidden print:shadow-none print:border print:rounded-none">
          
          {/* Doctor Letterhead Header */}
          <div className="border-b-4 border-[#4682A9] bg-linear-to-r from-[#FFFBDE] to-[#91C8E4]/10 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#4682A9] rounded-full flex items-center justify-center shrink-0">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#4682A9]">Dr. {prescription.doctorName}</h1>
                  <p className="text-[#749BC2] font-semibold text-lg">{prescription.speciality || 'General Physician'}</p>
                  <p className="text-gray-600 text-sm mt-1">Reg. No: MED-{prescription.doctorId.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p className="font-semibold text-[#4682A9]">📞 +91 98765 43210</p>
                <p>📧 clinic@hospital.com</p>
                <p className="mt-1">🏥 Healthcare Clinic</p>
                <p>City Hospital, Medical District</p>
              </div>
            </div>
          </div>

          {/* Date & Prescription ID */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">Date:</span> {formatFullDate(prescription.prescribedAt)} | {formatTime(prescription.prescribedAt)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">Rx ID:</span> {prescription.id}
              </p>
            </div>
          </div>

          {/* Patient Information */}
          <div className="px-6 py-4 border-b-2 border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Patient Name</p>
                <p className="font-bold text-gray-900 text-lg">{prescription.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Contact Number</p>
                <p className="font-semibold text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-1 text-[#4682A9]" />
                  {prescription.patientPhone}
                </p>
              </div>
              {prescription.patientEmail && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-900 text-sm">{prescription.patientEmail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Chief Complaints / Symptoms */}
          <div className="px-6 py-4 border-b border-gray-200 bg-orange-50/30">
            <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Chief Complaints</h3>
            <p className="text-gray-800 leading-relaxed">{prescription.symptoms}</p>
          </div>

          {/* Diagnosis */}
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50/30">
            <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Diagnosis / Assessment</h3>
            <p className="text-gray-900 font-semibold leading-relaxed">{prescription.diagnosis}</p>
          </div>

          {/* Medications - Main Section */}
          {prescription.medications && prescription.medications.length > 0 && (
            <div className="px-6 py-6 border-b-2 border-gray-300">
              <div className="flex items-center mb-4">
                <div className="text-6xl font-serif text-[#4682A9] mr-4" style={{ fontFamily: 'Times New Roman, serif' }}>℞</div>
                <h3 className="font-bold text-gray-800 text-lg uppercase tracking-wide">Medications</h3>
              </div>
              
              <div className="space-y-3">
                {prescription.medications.map((medication, index) => (
                  <div key={medication.id} className="bg-[#FFFBDE]/50 rounded-lg p-4 border-l-4 border-[#4682A9]">
                    <div className="flex items-start space-x-3">
                      <span className="font-bold text-[#4682A9] text-lg min-w-[30px] mt-1">{index + 1}.</span>
                      <div className="flex-1">
                        {/* Medicine Name */}
                        <p className="font-bold text-gray-900 text-base mb-2">{medication.name}</p>
                        
                        {/* Medicine Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="bg-white rounded p-2 border border-gray-200">
                            <p className="text-gray-600 font-semibold">Dosage</p>
                            <p className="text-gray-900 font-bold">{medication.dosage} mg</p>
                          </div>
                          <div className="bg-white rounded p-2 border border-gray-200">
                            <p className="text-gray-600 font-semibold">Frequency</p>
                            <p className="text-gray-900 font-bold">{medication.frequency}x Daily</p>
                          </div>
                          <div className="bg-white rounded p-2 border border-gray-200">
                            <p className="text-gray-600 font-semibold">Duration</p>
                            <p className="text-gray-900 font-bold">{medication.duration} Days</p>
                          </div>
                          <div className="bg-white rounded p-2 border border-gray-200">
                            <p className="text-gray-600 font-semibold">Total Qty</p>
                            <p className="text-gray-900 font-bold">{parseInt(medication.frequency) * parseInt(medication.duration)} Tabs</p>
                          </div>
                        </div>
                        
                        {/* Instructions */}
                        <p className="text-gray-700 font-medium mt-3 flex items-start">
                          <span className="text-[#4682A9] mr-2">✓</span>
                          <span>{medication.instructions}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Medicine Instructions Footer */}
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">Important:</span> Take medications as prescribed. Do not stop or change dosage without consulting the doctor. Keep all medicines out of reach of children.
                </p>
              </div>
            </div>
          )}

          {/* Lab Tests (if available) */}
          {prescription.labTests && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide flex items-center">
                <FlaskConical className="w-4 h-4 mr-2" />
                Laboratory Tests
              </h3>
              <p className="text-gray-700 leading-relaxed">{prescription.labTests}</p>
            </div>
          )}

          {/* Additional Notes */}
          {prescription.additionalNotes && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Additional Notes & Advice</h3>
              <p className="text-gray-700 leading-relaxed">{prescription.additionalNotes}</p>
            </div>
          )}

          {/* Follow-up Date */}
          {prescription.followUpDate && (
            <div className="px-6 py-4 bg-blue-50/30 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Follow-up Appointment</h3>
              <p className="font-semibold text-gray-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-[#4682A9]" />
                Next Visit: {formatFullDate(prescription.followUpDate)}
              </p>
            </div>
          )}

          {/* Doctor Signature Section */}
          <div className="px-6 py-6 bg-linear-to-r from-gray-50 to-[#FFFBDE]/20">
            <div className="flex justify-between items-end">
              <div className="text-sm text-gray-600">
                <p className="mb-1">📋 <span className="font-semibold">Prescription Date:</span> {formatDate(prescription.prescribedAt)}</p>
                <p>🏥 <span className="font-semibold">Healthcare Clinic, City Hospital</span></p>
              </div>
              <div className="text-right">
                <div className="border-t-2 border-gray-800 pt-2 mt-8 min-w-[200px]">
                  <p className="font-bold text-[#4682A9] text-lg">Dr. {prescription.doctorName}</p>
                  <p className="text-sm text-gray-600">{prescription.speciality || 'General Physician'}</p>
                  <p className="text-xs text-gray-500 mt-1">Reg. No: MED-{prescription.doctorId.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-100 border-t-2 border-gray-300">
            <p className="text-xs text-center text-gray-600">
              ⚕️ This is a digitally generated prescription. For queries, contact the clinic. Keep this prescription for your medical records.
            </p>
          </div>
        </div>

        {/* Action Buttons - Hide on print */}
        <div className="mt-6 flex justify-center space-x-4 print:hidden">
          <Link href="/user/appointment-history">
            <button className="px-8 py-3 bg-[#4682A9] text-white rounded-xl hover:bg-[#749BC2] transition-colors font-semibold shadow-lg">
              Back to Appointments
            </button>
          </Link>
          <button
            onClick={handlePrint}
            className="px-8 py-3 bg-white text-[#4682A9] border-2 border-[#4682A9] rounded-xl hover:bg-[#4682A9] hover:text-white transition-colors font-semibold shadow-lg"
          >
            Print Prescription
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border {
            border: 1px solid #000 !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
