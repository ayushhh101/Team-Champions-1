/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Edit3,
  Trash2,
  FileText,
  Calendar,
  Eye,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Prescription {
  id: string;
  appointmentId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  diagnosis: string;
  medications: any[];
  prescribedAt: string;
  updatedAt?: string;
}

export default function PrescriptionsListPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [searchTerm, filterDate, prescriptions]);

  const fetchPrescriptions = async () => {
    try {
      const doctorId = localStorage.getItem('doctorId');
      
      if (!doctorId) {
        router.push('/doctor/login');
        return;
      }

      const response = await fetch(`/api/prescriptions?doctorId=${doctorId}`);
      const data = await response.json();

      if (data.success) {
        setPrescriptions(data.prescriptions);
        setFilteredPrescriptions(data.prescriptions);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const filterPrescriptions = () => {
    let filtered = [...prescriptions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.appointmentId.includes(searchTerm)
      );
    }

    // Date filter
    if (filterDate) {
      filtered = filtered.filter(
        (p) => new Date(p.prescribedAt).toISOString().split('T')[0] === filterDate
      );
    }

    setFilteredPrescriptions(filtered);
  };

  const handleEdit = (prescription: Prescription) => {
    router.push(`/doctor/prescription?appointmentId=${prescription.appointmentId}&prescriptionId=${prescription.id}`);
  };

  const handleDelete = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPrescription) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/prescriptions?id=${selectedPrescription.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Prescription deleted successfully!');
        fetchPrescriptions();
        setShowDeleteModal(false);
        setSelectedPrescription(null);
      } else {
        throw new Error('Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast.error('Failed to delete prescription');
    } finally {
      setDeleting(false);
    }
  };

  const handleView = (prescription: Prescription) => {
    router.push(`/doctor/prescriptions/view?id=${prescription.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#91C8E4] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#4682A9] font-semibold text-lg">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white sticky top-0 z-50 shadow-lg">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/doctor/appointments')}
                className="p-2 hover:bg-white/20 rounded-full transition-colors mr-3"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Prescriptions</h1>
                <p className="text-sm text-white/80">Manage all patient prescriptions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 px-4 py-2 rounded-lg font-semibold">
                {filteredPrescriptions.length} Total
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient name, diagnosis, or appointment ID..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors text-gray-900"
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-colors text-gray-900"
              />
            </div>
          </div>

          {(searchTerm || filterDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterDate('');
              }}
              className="mt-3 text-sm text-[#4682A9] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Prescriptions List */}
        {filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterDate
                ? 'Try adjusting your filters'
                : 'Start by creating a prescription for a patient'}
            </p>
            {!searchTerm && !filterDate && (
              <button
                onClick={() => router.push('/doctor/appointments')}
                className="px-6 py-3 bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white rounded-lg hover:from-[#4682A9] hover:to-[#749BC2] transition-all shadow-md"
              >
                Go to Appointments
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-linear-to-br from-[#91C8E4] to-[#4682A9] rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {prescription.patientName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {prescription.patientName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Appointment ID: {prescription.appointmentId}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500">Diagnosis</p>
                        <p className="text-gray-900 font-semibold line-clamp-1">
                          {prescription.diagnosis}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Medications</p>
                        <p className="text-gray-900 font-semibold">
                          {prescription.medications.length} medication(s)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Prescribed On</p>
                        <p className="text-gray-900 font-semibold">
                          {new Date(prescription.prescribedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      {prescription.updatedAt && (
                        <div>
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p className="text-gray-900 font-semibold">
                            {new Date(prescription.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleView(prescription)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEdit(prescription)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-[#91C8E4]/20 text-[#4682A9] rounded-lg hover:bg-[#91C8E4]/30 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(prescription)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Prescription</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the prescription for{' '}
              <span className="font-semibold">{selectedPrescription.patientName}</span>? This action
              cannot be undone.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPrescription(null);
                }}
                disabled={deleting}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {deleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
