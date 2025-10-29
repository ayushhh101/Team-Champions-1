'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  Calendar,
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  qualification: string;
  image: string;
  location: string;
}

interface AppointmentDetails {
  id: string;
  doctor: Doctor;
  date: string;
  time: string;
  consultationType: string;
  status: 'completed';
}

interface FeedbackData {
  consultingRating: number;
  hospitalRating: number;
  waitingTimeRating: number;
  wouldRecommend: boolean | null;
  additionalComments: string;
}

export default function ConsultingFeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const appointmentId = params.appointmentId as string;
  const doctorId = searchParams.get('doctorId');
  const doctorName = searchParams.get('doctorName');
  const speciality = searchParams.get('speciality');
  const appointmentDate = searchParams.get('date');
  const appointmentTime = searchParams.get('time');
 
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData>({
    consultingRating: 0,
    hospitalRating: 0,
    waitingTimeRating: 0,
    wouldRecommend: null,
    additionalComments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load appointment data from URL parameters and fetch doctor details
  useEffect(() => {
    const loadAppointmentData = async () => {
      try {
        if (doctorId && doctorName && speciality && appointmentDate && appointmentTime) {
          // For frontend-only, we'll use the data from URL parameters and create a mock doctor response
          const mockDoctor = {
            id: doctorId,
            name: doctorName,
            speciality: speciality,
            qualification: "MBBS, MD",
            image: "/Dr.AmitPatel.png", // Default for Dr. Amit Patel
            location: "Bangalore, Karnataka"
          };

          // If it's Dr. Amit Patel (doc3), use specific details
          if (doctorId === 'doc3') {
            mockDoctor.qualification = "MBBS, MD (Pediatrics)";
            mockDoctor.image = "/Dr.AmitPatel.png";
            mockDoctor.location = "Bangalore, Karnataka";
          }
          
          const appointmentDetails: AppointmentDetails = {
            id: appointmentId,
            doctor: mockDoctor,
            date: appointmentDate,
            time: appointmentTime,
            consultationType: "In-person consultation",
            status: "completed"
          };
          
          setAppointment(appointmentDetails);
          console.log('Loaded appointment data:', appointmentDetails);
        } else {
          console.log('Missing URL parameters:', { doctorId, doctorName, speciality, appointmentDate, appointmentTime });
        }
      } catch (error) {
        console.error('Error loading appointment data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointmentData();
  }, [appointmentId, doctorId, doctorName, speciality, appointmentDate, appointmentTime]);

  const handleStarRating = (category: 'consulting' | 'hospital' | 'waiting', rating: number) => {
  setFeedback(prev => {
    let newFeedback;
    
    if (category === 'consulting') {
      newFeedback = { ...prev, consultingRating: rating };
    } else if (category === 'hospital') {
      newFeedback = { ...prev, hospitalRating: rating };
    } else if (category === 'waiting') {
      newFeedback = { ...prev, waitingTimeRating: rating };
    } else {
      newFeedback = prev;
    }
    
    console.log(`${category} rating set to:`, rating, 'New feedback state:', newFeedback);
    return newFeedback;
  });
};


  const handleRecommendation = (recommend: boolean) => {
    setFeedback(prev => ({
      ...prev,
      wouldRecommend: recommend
    }));
  };

  const handleSubmit = async () => {
    if (feedback.consultingRating === 0) {
      alert('Please provide a consulting rating');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - Frontend only, no backend storage
      await new Promise(resolve => setTimeout(resolve, 2000));
     
      console.log('Feedback submitted (frontend only):', {
        appointmentId,
        doctorId,
        doctorName,
        ...feedback,
        submittedAt: new Date().toISOString()
      });

      alert('Thank you for your feedback!');
      router.push('/user/appointment-history');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (
    currentRating: number,
    onRate: (rating: number) => void
  ) => {
    console.log('Rendering stars with current rating:', currentRating);
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={(e) => {
              e.preventDefault();
              console.log('Star clicked:', star, 'Current rating:', currentRating);
              onRate(star);
            }}
            className="transition-all hover:scale-125 transform duration-200 cursor-pointer"
            type="button"
          >
            <Star
              className={`w-10 h-10 ${
                star <= currentRating
                  ? 'text-yellow-400 fill-current drop-shadow-sm'
                  : 'text-gray-300 hover:text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#91C8E4] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#4682A9] font-semibold text-lg">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-[#2C5F7C] mb-3">Appointment not found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the appointment you're looking for.</p>
          <Link
            href="/user/appointment-history"
            className="inline-block bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#749BC2] hover:to-[#4682A9] transition-all"
          >
            Go back to appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20">
      {/* Header */}
      <header className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white sticky top-0 z-50 shadow-lg">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-full transition-colors mr-3"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold">Consulting Feedback</h1>
          </div>
        </div>
      </header>

      <div className="px-3 py-5 max-w-3xl mx-auto">
        {/* Doctor Card */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
              <Image
                src={appointment.doctor.image}
                alt={appointment.doctor.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-doctor.png';
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#2C5F7C] mb-1">
                {appointment.doctor.name}
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-[#4FC3F7] font-semibold bg-[#4FC3F7]/10 px-2 py-1 rounded-lg">
                  {appointment.doctor.speciality}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-sm text-gray-600 font-medium">
                  {appointment.doctor.location}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {appointment.doctor.qualification}
              </p>
            </div>
          </div>
        </div>

        {/* Consultation Time */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#4FC3F7]/10 rounded-2xl flex items-center justify-center shadow-sm">
                <Calendar className="w-6 h-6 text-[#4FC3F7]" />
              </div>
              <div>
                <p className="text-md font-bold text-[#2C5F7C]">Consulting Time</p>
                <p className="text-sm text-gray-500 font-medium">{appointment.consultationType}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-md font-bold text-[#4FC3F7]">
                {appointment.date} | {appointment.time}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Sections */}
        <div className="space-y-5">
          {/* Consulting Feedback */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-[#2C5F7C] mb-6 text-center">Consulting Feedback</h3>
            <div className="flex justify-center">
              {renderStarRating(
                feedback.consultingRating,
                (rating) => handleStarRating('consulting', rating)
              )}
            </div>
          </div>

          {/* Hospital/Clinic Feedback */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-[#2C5F7C] mb-6 text-center">Hospital/Clinic Feedback</h3>
            <div className="flex justify-center">
              {renderStarRating(
                feedback.hospitalRating,
                (rating) => handleStarRating('hospital', rating)
              )}
            </div>
          </div>

          {/* Waiting Time */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-[#2C5F7C] mb-6 text-center">Waiting Time</h3>
            <div className="flex justify-center">
              {renderStarRating(
                feedback.waitingTimeRating,
                (rating) => {
                  console.log('Waiting time star clicked:', rating);
                  handleStarRating('waiting', rating);
                }
              )}
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-[#2C5F7C] mb-6 text-center leading-relaxed">
              Would you recommend Dr. {appointment.doctor.name.split(' ').pop()} to your friends?
            </h3>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => handleRecommendation(true)}
                className={`flex items-center space-x-3 px-8 py-4 rounded-2xl border-2 transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                  feedback.wouldRecommend === true
                    ? 'bg-[#4FC3F7] border-[#4FC3F7] text-white shadow-lg'
                    : 'border-[#4FC3F7] text-[#4FC3F7] hover:bg-[#4FC3F7]/10'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  feedback.wouldRecommend === true ? 'bg-white/20' : 'bg-[#4FC3F7]/10'
                }`}>
                  <span className="text-lg">✓</span>
                </div>
                <span className="font-bold text-lg">Yes</span>
              </button>
              <button
                onClick={() => handleRecommendation(false)}
                className={`flex items-center space-x-3 px-8 py-4 rounded-2xl border-2 transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                  feedback.wouldRecommend === false
                    ? 'bg-gray-500 border-gray-500 text-white shadow-lg'
                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  feedback.wouldRecommend === false ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <span className="text-lg">✗</span>
                </div>
                <span className="font-bold text-lg">No</span>
              </button>
            </div>
          </div>

          {/* Additional Comments */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-[#2C5F7C] mb-6">Additional Comments</h3>
            <textarea
              value={feedback.additionalComments}
              onChange={(e) => setFeedback(prev => ({ ...prev, additionalComments: e.target.value }))}
              placeholder="Share your experience and help us improve our services..."
              className="w-full h-32 p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] focus:border-transparent resize-none text-md font-medium placeholder-gray-400 shadow-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || feedback.consultingRating === 0}
            className="w-full bg-linear-to-r from-[#91C8E4] to-[#4682A9] hover:from-[#749BC2] hover:to-[#4682A9] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Submitting Feedback...</span>
              </div>
            ) : (
              'Submit Feedback'
            )}
          </button>

          {/* Skip Option */}
          <div className="text-center pt-2">
            <Link
              href="/user/appointment-history"
              className="text-gray-500 hover:text-[#4682A9] text-md underline transition-colors font-medium"
            >
              Skip for now
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-20"></div>
    </div>
  );
}