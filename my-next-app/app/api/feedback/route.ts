import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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

const DATA_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'data.json');

async function readDataFile() {
  try {
    const fileContents = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { feedbacks: [] };
  }
}

async function writeDataFile(data: any) {
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      appointmentId, 
      doctorId, 
      doctorName, 
      patientEmail, 
      patientName,
      consultingRating, 
      hospitalRating, 
      waitingTimeRating, 
      wouldRecommend, 
      additionalComments,
      date,
      time
    } = body;

    // Validate required fields
    if (!appointmentId || !doctorId || !patientEmail || !consultingRating) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Read current data
    const data = await readDataFile();
    
    // Initialize feedbacks array if it doesn't exist
    if (!data.feedbacks) {
      data.feedbacks = [];
    }

    // Try to find patient name from bookings or appointments if not provided
    let finalPatientName = patientName || 'Unknown Patient';
    
    if (!patientName || patientName === 'Unknown Patient') {
      // First, look for patient name in users table
      if (data.users && Array.isArray(data.users)) {
        const user = data.users.find((u: any) => 
          u.email === patientEmail && u.name && u.name !== 'Unknown Patient'
        );
        if (user && user.name) {
          finalPatientName = user.name;
        }
      }
      
      // If not found in users, look in bookings
      if (finalPatientName === 'Unknown Patient' && data.bookings && Array.isArray(data.bookings)) {
        const booking = data.bookings.find((b: any) => 
          b.patientEmail === patientEmail && b.patientName && b.patientName !== 'Unknown Patient'
        );
        if (booking && booking.patientName) {
          finalPatientName = booking.patientName;
        }
      }
      
      // If still not found, look in appointments
      if (finalPatientName === 'Unknown Patient' && data.appointments && Array.isArray(data.appointments)) {
        const appointment = data.appointments.find((a: any) => 
          a.patientEmail === patientEmail && a.patientName && a.patientName !== 'Unknown Patient'
        );
        if (appointment && appointment.patientName) {
          finalPatientName = appointment.patientName;
        }
      }
    }

    // Create feedback object
    const feedback: FeedbackData = {
      id: `feedback_${appointmentId}_${Date.now()}`,
      appointmentId,
      doctorId,
      doctorName: doctorName || 'Unknown Doctor',
      patientEmail,
      patientName: finalPatientName,
      consultingRating,
      hospitalRating: hospitalRating || 0,
      waitingTimeRating: waitingTimeRating || 0,
      wouldRecommend: wouldRecommend ?? null,
      additionalComments: additionalComments || '',
      appointmentDate: date || '',
      appointmentTime: time || '',
      submittedAt: new Date().toISOString(),
      status: 'active'
    };

    // Add feedback to data
    data.feedbacks.push(feedback);

    // Save data back to file
    const saveSuccess = await writeDataFile(data);
    
    if (!saveSuccess) {
      return NextResponse.json(
        { success: false, error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: feedback.id
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const appointmentId = searchParams.get('appointmentId');

    // Read current data
    const data = await readDataFile();
    const allFeedbacks: FeedbackData[] = data.feedbacks || [];

    if (doctorId) {
      // Get all feedback for a specific doctor
      const doctorFeedbacks = allFeedbacks.filter(feedback => feedback.doctorId === doctorId);
      
      if (doctorFeedbacks.length === 0) {
        return NextResponse.json({
          success: true,
          feedbacks: [],
          averageRating: 0,
          totalReviews: 0
        });
      }

      // Sort by submission date (most recent first)
      const sortedFeedbacks = doctorFeedbacks.sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      // Calculate average rating
      const totalRating = doctorFeedbacks.reduce((sum, feedback) => sum + feedback.consultingRating, 0);
      const averageRating = doctorFeedbacks.length > 0 ? (totalRating / doctorFeedbacks.length) : 0;

      return NextResponse.json({
        success: true,
        feedbacks: sortedFeedbacks,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: doctorFeedbacks.length
      });

    } else if (appointmentId) {
      // Get feedback for a specific appointment
      const feedback = allFeedbacks.find(f => f.appointmentId === appointmentId);

      return NextResponse.json({
        success: true,
        feedback: feedback || null
      });

    } else {
      // Get all feedbacks (admin use)
      const sortedFeedbacks = allFeedbacks.sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      return NextResponse.json({
        success: true,
        feedbacks: sortedFeedbacks,
        totalReviews: allFeedbacks.length
      });
    }

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
