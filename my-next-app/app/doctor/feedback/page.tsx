'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Star,
  Filter,
  TrendingUp,
  MessageSquare,
  Calendar,
  User,
  Search,
  SortAsc,
  SortDesc,
  Heart,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface FeedbackData {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  patientEmail: string;
  patientName: string;
  consultingRating: number;
  hospitalRating: number;
  waitingTimeRating: number;
  wouldRecommend: boolean | null;
  additionalComments: string;
  appointmentDate: string;
  appointmentTime: string;
  submittedAt: string;
  status: string;
}

interface FeedbackStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  recommendationRate: number;
}

export default function DoctorFeedbackPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {},
    recommendationRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating-high' | 'rating-low'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showRecommended, setShowRecommended] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const doctorId = localStorage.getItem('doctorId');
      
      if (!doctorId) {
        console.error('Doctor ID not found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/feedback?doctorId=${doctorId}`);
      const data = await response.json();

      if (data.success) {
        setFeedbacks(data.feedbacks);
        
        // Calculate additional stats
        const distribution: { [key: number]: number } = {};
        let recommendedCount = 0;
        
        data.feedbacks.forEach((feedback: FeedbackData) => {
          // Rating distribution
          distribution[feedback.consultingRating] = (distribution[feedback.consultingRating] || 0) + 1;
          
          // Recommendation count
          if (feedback.wouldRecommend === true) {
            recommendedCount++;
          }
        });

        const recommendationRate = data.feedbacks.length > 0 ? (recommendedCount / data.feedbacks.length) * 100 : 0;

        setStats({
          averageRating: data.averageRating,
          totalReviews: data.totalReviews,
          ratingDistribution: distribution,
          recommendationRate,
        });
      } else {
        console.error('Failed to fetch feedback:', data.error);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedFeedbacks = feedbacks
    .filter(feedback => {
      const matchesRating = filterRating === null || feedback.consultingRating === filterRating;
      const matchesRecommendation = showRecommended === null || feedback.wouldRecommend === showRecommended;
      const matchesSearch = searchTerm === '' || 
        feedback.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.additionalComments.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesRating && matchesRecommendation && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case 'oldest':
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        case 'rating-high':
          return b.consultingRating - a.consultingRating;
        case 'rating-low':
          return a.consultingRating - b.consultingRating;
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const maxCount = Math.max(...Object.values(stats.ratingDistribution));
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-3">
              <span className="text-sm font-medium w-8">{rating}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#91C8E4] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#4682A9] font-semibold text-lg">Loading feedback...</p>
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
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold">Patient Feedback</h1>
              <p className="text-sm opacity-90">Reviews and ratings from your patients</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Average Rating */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C5F7C]">
                  {stats.averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
            {renderStars(Math.round(stats.averageRating), 'md')}
          </div>

          {/* Total Reviews */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-400/20 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C5F7C]">{stats.totalReviews}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
            </div>
          </div>

          {/* Recommendation Rate */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-400/20 rounded-2xl flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C5F7C]">
                  {stats.recommendationRate.toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600">Recommend Rate</p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-[#2C5F7C] mb-4">Rating Distribution</h3>
            {renderRatingDistribution()}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by patient name or comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] focus:border-transparent"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterRating(null)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  filterRating === null
                    ? 'bg-[#4FC3F7] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                  className={`px-3 py-2 rounded-xl font-medium transition-colors flex items-center space-x-1 ${
                    filterRating === rating
                      ? 'bg-[#4FC3F7] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{rating}</span>
                  <Star className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Recommendation Filter */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowRecommended(true)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                  showRecommended === true
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Recommended</span>
              </button>
              <button
                onClick={() => setShowRecommended(false)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                  showRecommended === false
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Not Recommended</span>
              </button>
              {showRecommended !== null && (
                <button
                  onClick={() => setShowRecommended(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] focus:border-transparent font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredAndSortedFeedbacks.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-[#2C5F7C] mb-2">No feedback found</h3>
              <p className="text-gray-600">
                {feedbacks.length === 0 
                  ? "You haven't received any patient feedback yet."
                  : "No feedback matches your current filters."}
              </p>
            </div>
          ) : (
            filteredAndSortedFeedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6 space-y-4 lg:space-y-0">
                  {/* Patient Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-linear-to-br from-[#91C8E4] to-[#4682A9] rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2C5F7C]">{feedback.patientName}</p>
                      <p className="text-sm text-gray-600">{formatDate(feedback.submittedAt)}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    {/* Ratings */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-3 sm:space-y-0 mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-600">Overall:</span>
                        {renderStars(feedback.consultingRating, 'md')}
                        <span className="text-lg font-bold text-[#2C5F7C]">{feedback.consultingRating}</span>
                      </div>
                      
                      {feedback.hospitalRating > 0 && (
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-600">Facility:</span>
                          {renderStars(feedback.hospitalRating)}
                          <span className="text-sm font-medium text-gray-600">{feedback.hospitalRating}</span>
                        </div>
                      )}
                      
                      {feedback.waitingTimeRating > 0 && (
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-600">Wait Time:</span>
                          {renderStars(feedback.waitingTimeRating)}
                          <span className="text-sm font-medium text-gray-600">{feedback.waitingTimeRating}</span>
                        </div>
                      )}
                    </div>

                    {/* Recommendation */}
                    {feedback.wouldRecommend !== null && (
                      <div className="flex items-center space-x-2 mb-4">
                        {feedback.wouldRecommend ? (
                          <>
                            <ThumbsUp className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-green-600">Would recommend</span>
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="w-5 h-5 text-red-500" />
                            <span className="text-sm font-medium text-red-600">Would not recommend</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Comments */}
                    {feedback.additionalComments && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-700 leading-relaxed">{feedback.additionalComments}</p>
                      </div>
                    )}

                    {/* Appointment Info */}
                    <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Appointment: {formatDate(feedback.appointmentDate)} at {feedback.appointmentTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Show results count */}
        {filteredAndSortedFeedbacks.length > 0 && (
          <div className="text-center mt-6 text-gray-600">
            Showing {filteredAndSortedFeedbacks.length} of {feedbacks.length} reviews
          </div>
        )}
      </div>
    </div>
  );
}