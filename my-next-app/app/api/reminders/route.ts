/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { NotificationService } from '@/app/utils/notificationService';

const redis = Redis.fromEnv();

interface ReminderSettings {
  userId: string;
  appointmentId: string;
  reminderEnabled: boolean;
  reminderTime?: number; // minutes before appointment
  updatedAt: string;
}

// GET: Get reminder settings for a user's appointment
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const appointmentId = searchParams.get('appointmentId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'userId is required'
      }, { status: 400 });
    }

    const key = `reminders:${userId}`;
    let reminders = await redis.get(key) as ReminderSettings[] || [];

    if (appointmentId) {
      reminders = reminders.filter(r => r.appointmentId === appointmentId);
    }

    return NextResponse.json({
      success: true,
      reminders,
      count: reminders.length
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch reminders',
      reminders: []
    }, { status: 500 });
  }
}

// POST: Set reminder for an appointment
export async function POST(req: Request) {
  try {
    const { userId, appointmentId, reminderEnabled, reminderTime = 30 } = await req.json();

    if (!userId || !appointmentId || typeof reminderEnabled !== 'boolean') {
      return NextResponse.json({
        success: false,
        message: 'userId, appointmentId, and reminderEnabled are required'
      }, { status: 400 });
    }

    const key = `reminders:${userId}`;
    let reminders = await redis.get(key) as ReminderSettings[] || [];

    // Remove existing reminder for this appointment
    reminders = reminders.filter(r => r.appointmentId !== appointmentId);

    // Add new reminder if enabled
    if (reminderEnabled) {
      const newReminder: ReminderSettings = {
        userId,
        appointmentId,
        reminderEnabled: true,
        reminderTime,
        updatedAt: new Date().toISOString()
      };
      reminders.push(newReminder);
    }

    await redis.set(key, reminders);

    return NextResponse.json({
      success: true,
      message: reminderEnabled ? 'Reminder set successfully' : 'Reminder disabled successfully',
      reminderEnabled
    });
  } catch (error) {
    console.error('Error setting reminder:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to set reminder'
    }, { status: 500 });
  }
}

// POST to /api/reminders/send - Send reminder from doctor to patient
export async function PATCH(req: Request) {
  try {
    const { doctorId, appointmentId, patientEmail } = await req.json();

    if (!doctorId || !appointmentId || !patientEmail) {
      return NextResponse.json({
        success: false,
        message: 'doctorId, appointmentId, and patientEmail are required'
      }, { status: 400 });
    }

    // Fetch the appointment details
    const bookings = await redis.get('bookings') as any[] || [];
    const appointment = bookings.find(b => b.id === appointmentId);

    if (!appointment) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found'
      }, { status: 404 });
    }

    // Verify the doctor owns this appointment
    if (appointment.doctorId !== doctorId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: You can only send reminders for your own appointments'
      }, { status: 403 });
    }

    // Get user data to find the patient's userId
    const users = await redis.get('users') as any[] || [];
    const patient = users.find(u => u.email === patientEmail);

    if (!patient) {
      return NextResponse.json({
        success: false,
        message: 'Patient not found'
      }, { status: 404 });
    }

    // Get doctor data to get doctor's name
    const doctors = await redis.get('doctors') as any[] || [];
    const doctor = doctors.find(d => d.id === doctorId);
    const doctorName = doctor?.name || 'Your Doctor';

    // Send reminder notification to patient
    await NotificationService.notifyUserOfAppointmentReminder(
      patient.id,
      appointment,
      doctorName,
      'doctor_reminder'
    );

    return NextResponse.json({
      success: true,
      message: 'Reminder sent to patient successfully'
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send reminder'
    }, { status: 500 });
  }
}