/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { NotificationService } from '@/app/utils/notificationService';

const redis = Redis.fromEnv();

// GET: Check for upcoming appointments and send reminders
export async function GET(request: NextRequest) {
  try {
    // Get all reminder settings
    const keys = await redis.keys('reminders:*');
    let totalReminders = 0;
    let sentReminders = 0;

    for (const key of keys) {
      const reminders = await redis.get(key) as any[] || [];
      
      for (const reminder of reminders) {
        if (!reminder.reminderEnabled) continue;

        totalReminders++;

        // Get the appointment details
        const bookings = await redis.get('bookings') as any[] || [];
        const appointment = bookings.find(b => b.id === reminder.appointmentId);

        if (!appointment) continue;

        // Check if appointment is in the future and within reminder window
        const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
        const now = new Date();
        const reminderTime = reminder.reminderTime || 30; // Default 30 minutes
        const reminderDateTime = new Date(appointmentDateTime.getTime() - (reminderTime * 60 * 1000));

        // Check if it's time to send the reminder (within 5 minutes of reminder time)
        const timeDiff = now.getTime() - reminderDateTime.getTime();
        const shouldSendReminder = timeDiff >= 0 && timeDiff <= (5 * 60 * 1000); // 5 minute window

        if (shouldSendReminder) {
          // Check if reminder was already sent today
          const reminderSentKey = `reminder_sent:${reminder.appointmentId}:${appointment.date}`;
          const alreadySent = await redis.get(reminderSentKey);

          if (!alreadySent) {
            // Get doctor info
            const doctors = await redis.get('doctors') as any[] || [];
            const doctor = doctors.find(d => d.id === appointment.doctorId);
            const doctorName = doctor?.name || 'Your Doctor';

            // Send reminder notification
            await NotificationService.notifyUserOfAppointmentReminder(
              reminder.userId,
              appointment,
              doctorName,
              'auto_reminder'
            );

            // Mark reminder as sent for today
            await redis.set(reminderSentKey, true, { ex: 24 * 60 * 60 }); // Expire in 24 hours

            sentReminders++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${totalReminders} reminders, sent ${sentReminders} notifications`,
      totalReminders,
      sentReminders
    });
  } catch (error) {
    console.error('Error processing reminders:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process reminders',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}