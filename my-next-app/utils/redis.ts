import { Redis } from '@upstash/redis';

// Initialize Redis connection
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Types for better TypeScript support
export interface FeedbackData {
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

export default redis;
