'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Stethoscope,
  Calendar,
  Star,
  Shield,
  Edit3,
  X,
  Check
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  speciality: string;
  location: string;
  experience: number | string;
  rating: number;
  price: number | string;
  availableDates: string[];
  availableTimes: string[];
  image?: string;
  isVerified: boolean;
  licenseNumber?: string;
  about?: string;
  reviewCount?: number;
}

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    speciality: '',
    location: '',
    experience: '',
    price: '',
    about: '',
    licenseNumber: ''
  });
  const router = useRouter();

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId');

        if (!doctorId) {
          router.push('/user/login');
          return;
        }

        // Fetch doctor data
        const response = await fetch('/api/doctors');
        if (!response.ok) {
          throw new Error('Failed to fetch doctor data');
        }

        const data = await response.json();
        const loggedInDoctor = data.doctors?.find((d: Doctor) => d.id === doctorId);

        if (!loggedInDoctor) {
          router.push('/user/login');
          return;
        }

        setDoctor(loggedInDoctor);

        // Initialize edit form with current data
        setEditForm({
          name: loggedInDoctor.name || '',
          email: loggedInDoctor.email || '',
          phone: loggedInDoctor.phone || '',
          qualification: loggedInDoctor.qualification || '',
          speciality: loggedInDoctor.speciality || '',
          location: loggedInDoctor.location || '',
          experience: loggedInDoctor.experience?.toString() || '',
          price: loggedInDoctor.price?.toString() || '',
          about: loggedInDoctor.about || '',
          licenseNumber: loggedInDoctor.licenseNumber || ''
        });

      } catch (error) {
        console.error('Error fetching doctor data:', error);
        router.push('/user/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorData();
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Simulate API call to save profile
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update local doctor state
      if (doctor) {
        const updatedDoctor = {
          ...doctor,
          ...editForm,
          experience: Number(editForm.experience) || doctor.experience,
          price: Number(editForm.price) || doctor.price
        };
        setDoctor(updatedDoctor);
      }

      setIsEditing(false);

      // Show success message
      alert('Profile updated successfully!');

    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (doctor) {
      setEditForm({
        name: doctor.name || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        qualification: doctor.qualification || '',
        speciality: doctor.speciality || '',
        location: doctor.location || '',
        experience: doctor.experience?.toString() || '',
        price: doctor.price?.toString() || '',
        about: doctor.about || '',
        licenseNumber: doctor.licenseNumber || ''
      });
    }
    setIsEditing(false);
  };

  const getDoctorInitials = () => {
    if (!doctor?.name) return 'DR';
    const names = doctor.name.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#91C8E4] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#4682A9] font-medium text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl border border-gray-100 max-w-md w-full">
          <p className="text-gray-800 text-lg font-semibold mb-4">Failed to load profile</p>
          <Link href="/doctor/dashboard" className="inline-block px-6 py-3 bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 pb-20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center space-x-4">
              <Link href="/doctor/dashboard">
                <button className="p-3 hover:bg-[#91C8E4]/10 rounded-full transition-all duration-200 hover:shadow-md">
                  <ArrowLeft className="w-5 h-5 text-[#4682A9]" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#2C5F7C]">Profile Settings</h1>
                <p className="text-sm text-[#4682A9]">Manage your professional information</p>
              </div>
            </div>

            {/* Right: Edit/Save buttons */}
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#91C8E4] to-[#4682A9] hover:from-[#749BC2] hover:to-[#4682A9] text-white rounded-full transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#2C5F7C] rounded-full transition-all font-medium text-sm shadow-md hover:shadow-lg"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 relative">
            {/* Blue Gradient Header */}
            <div className="h-40 bg-linear-to-r from-[#91C8E4] via-[#749BC2] to-[#4682A9] relative">
              {/* Profile Image */}
              <div className="absolute left-1/2 sm:left-16 -bottom-16 transform -translate-x-1/2 sm:translate-x-0">
                {doctor.image ? (
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    width={150}
                    height={150}
                    className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-2xl object-cover bg-white"
                  />
                ) : (
                  <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-2xl bg-linear-to-br from-[#91C8E4] to-[#4682A9] flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">{getDoctorInitials()}</span>
                  </div>
                )}

                {/* Camera button (edit mode) */}
                {isEditing && (
                  <button className="absolute bottom-2 right-2 p-3 bg-white hover:bg-gray-50 rounded-full shadow-xl border-2 border-[#91C8E4] transition-all hover:scale-105">
                    <Camera className="w-5 h-5 text-[#4682A9]" />
                  </button>
                )}
              </div>
            </div>

            {/* Doctor Info Section */}
            <div className="sm:ml-56 pt-20 sm:pt-10 px-6 sm:px-8 pb-8 text-center sm:text-left">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C5F7C] bg-transparent border-b-2 border-[#91C8E4] focus:outline-none focus:border-[#4682A9] transition-all w-full max-w-md mx-auto sm:mx-0 px-2 py-1 text-center sm:text-left"
                  placeholder="Doctor Name"
                />
              ) : (
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C5F7C] wrap-break-word whitespace-normal">
                  {doctor.name}
                </h2>
              )}

              {/* Specialization + Verified Badge */}
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-3">
                <span className="text-[#4682A9] font-semibold text-lg">{doctor.speciality}</span>
                {doctor.isVerified && (
                  <div className="flex items-center space-x-1 bg-green-50 px-3 py-1 rounded-full">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 text-sm font-medium">Verified</span>
                  </div>
                )}
              </div>

              {/* Ratings + Experience */}
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-3 text-sm text-[#4682A9]">
                <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">
                    {doctor.rating} ({doctor.reviewCount || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4 text-[#4682A9]" />
                  <span className="font-medium">{doctor.experience}+ years exp.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-linear-to-r from-[#91C8E4] to-[#4682A9] rounded-xl flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C5F7C]">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-[#2C5F7C] mb-3">
                  <div className="w-8 h-8 bg-[#91C8E4]/20 rounded-lg flex items-center justify-center mr-3">
                    <Mail className="w-4 h-4 text-[#4682A9]" />
                  </div>
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-5 py-4 border-2 text-gray-600 border-[#91C8E4]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-all shadow-sm hover:shadow-md"
                    placeholder="doctor@example.com"
                  />
                ) : (
                  <p className="px-5 py-4 bg-white rounded-xl text-[#2C5F7C] font-medium shadow-sm">{doctor.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-[#2C5F7C] mb-3">
                  <div className="w-8 h-8 bg-[#749BC2]/20 rounded-lg flex items-center justify-center mr-3">
                    <Phone className="w-4 h-4 text-[#4682A9]" />
                  </div>
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-5 py-4 border-2 text-gray-600 border-[#91C8E4]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-all shadow-sm hover:shadow-md"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <p className="px-5 py-4 bg-white rounded-xl text-[#2C5F7C] font-medium shadow-sm">{doctor.phone}</p>
                )}
              </div>

              {/* Location */}
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-[#2C5F7C] mb-3">
                  <div className="w-8 h-8 bg-[#91C8E4]/20 rounded-lg flex items-center justify-center mr-3">
                    <MapPin className="w-4 h-4 text-[#4682A9]" />
                  </div>
                  Practice Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-5 py-4 border-2 text-gray-600 border-[#91C8E4]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-all shadow-sm hover:shadow-md"
                    placeholder="City, State"
                  />
                ) : (
                  <p className="px-5 py-4 bg-white rounded-xl text-[#2C5F7C] font-medium shadow-sm">{doctor.location}</p>
                )}
              </div>

              {/* License Number */}
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-[#2C5F7C] mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  License Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    className="w-full px-5 py-4 border-2 text-gray-600 border-[#91C8E4]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-all shadow-sm hover:shadow-md"
                    placeholder="Medical License Number"
                  />
                ) : (
                  <p className="px-5 py-4 bg-white rounded-xl text-[#2C5F7C] font-medium shadow-sm">{doctor.licenseNumber || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-linear-to-r from-[#749BC2] to-[#4682A9] rounded-xl flex items-center justify-center mr-4">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C5F7C]">Professional Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Speciality */}
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-[#2C5F7C] mb-3">
                  <div className="w-8 h-8 bg-[#91C8E4]/20 rounded-lg flex items-center justify-center mr-3">
                    <Stethoscope className="w-4 h-4 text-[#4682A9]" />
                  </div>
                  Speciality
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.speciality}
                    onChange={(e) => handleInputChange('speciality', e.target.value)}
                    className="w-full px-5 py-4 border-2 text-gray-600 border-[#91C8E4]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-all shadow-sm hover:shadow-md"
                    placeholder="e.g., Cardiology"
                  />
                ) : (
                  <p className="px-5 py-4 bg-white rounded-xl text-[#2C5F7C] font-medium shadow-sm">{doctor.speciality}</p>
                )}
              </div>

              {/* Qualification */}
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-[#2C5F7C] mb-3">
                  <div className="w-8 h-8 bg-[#749BC2]/20 rounded-lg flex items-center justify-center mr-3">
                    <GraduationCap className="w-4 h-4 text-[#4682A9]" />
                  </div>
                  Qualification
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.qualification}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
                    className="w-full px-5 py-4 border-2 text-gray-600 border-[#91C8E4]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-all shadow-sm hover:shadow-md"
                    placeholder="e.g., MBBS, MD"
                  />
                ) : (
                  <p className="px-5 py-4 bg-white rounded-xl text-[#2C5F7C] font-medium shadow-sm">{doctor.qualification}</p>
                )}
              </div>

              {/* Experience */}
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-[#2C5F7C] mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  Years of Experience
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full px-5 py-4 border-2 text-gray-600 border-[#91C8E4]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-all shadow-sm hover:shadow-md"
                    placeholder="Years"
                    min="0"
                  />
                ) : (
                  <p className="px-5 py-4 bg-white rounded-xl text-[#2C5F7C] font-medium shadow-sm">{doctor.experience} years</p>
                )}
              </div>

              {/* Consultation Fee */}
              <div className="group">
                <label className="flex items-center text-sm font-semibold text-[#2C5F7C] mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold text-sm">$</span>
                  </div>
                  Consultation Fee
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-5 py-4 border-2 text-gray-600 border-[#91C8E4]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-[#4682A9] transition-all shadow-sm hover:shadow-md"
                    placeholder="Fee amount"
                    min="0"
                  />
                ) : (
                  <p className="px-5 py-4 bg-white rounded-xl text-[#2C5F7C] font-medium shadow-sm">${doctor.price}</p>
                )}
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-linear-to-r from-[#91C8E4] to-[#749BC2] rounded-xl flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C5F7C]">About</h3>
            </div>

            {isEditing ? (
              <div className="relative">
                <textarea
                  value={editForm.about}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                  rows={6}
                  className="w-full px-5 py-4 border-2 border-[#91C8E4]/30 rounded-xl focus:outline-none focus:ring-2  focus:ring-[#91C8E4] focus:border-[#4682A9] transition-all resize-none shadow-sm hover:shadow-md"
                  placeholder="Tell patients about yourself, your approach to medicine, and your experience..."
                />
                <div className="absolute bottom-3 right-3 text-xs text-[#4682A9]">
                  {editForm.about.length}/500
                </div>
              </div>
            ) : (
              <div className="px-5 py-4 bg-white rounded-xl shadow-sm">
                <p className="text-[#2C5F7C] leading-relaxed font-medium">
                  {doctor.about || 'No information provided yet. Click "Edit Profile" to add your professional background and approach to patient care.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}