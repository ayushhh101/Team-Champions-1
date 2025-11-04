/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const dataFilePath = path.join(process.cwd(), 'app', 'data', 'data.json');

// PATCH: Update appointment date/time for drag-and-drop rescheduling
export async function PATCH(req: NextRequest) {
  try {
    const { appointmentId, newDate, newTime, action } = await req.json();

    if (!appointmentId) {
      return NextResponse.json({ 
        success: false,
        message: 'Appointment ID is required' 
      }, { status: 400 });
    }

    // Read existing data
    const dataBuffer = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(dataBuffer);

    let appointmentFound = false;
    let updatedAppointment = null;

    // Handle different actions
    if (action === 'reschedule') {
      if (!newDate || !newTime) {
        return NextResponse.json({ 
          success: false,
          message: 'New date and time are required for rescheduling' 
        }, { status: 400 });
      }

      data.bookings = data.bookings.map((booking: any) => {
        if (booking.id === appointmentId) {
          appointmentFound = true;
          const updated = {
            ...booking,
            date: newDate,
            time: newTime,
            updatedAt: new Date().toISOString()
          };
          updatedAppointment = updated;
          return updated;
        }
        return booking;
      });

    } else if (action === 'cancel') {
      data.bookings = data.bookings.map((booking: any) => {
        if (booking.id === appointmentId) {
          appointmentFound = true;
          const updated = {
            ...booking,
            status: 'cancelled',
            updatedAt: new Date().toISOString()
          };
          updatedAppointment = updated;
          return updated;
        }
        return booking;
      });
    }

    if (!appointmentFound) {
      return NextResponse.json({ 
        success: false,
        message: 'Appointment not found' 
      }, { status: 404 });
    }

    // Write back updated data
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true,
      message: action === 'reschedule' 
        ? 'Appointment rescheduled successfully' 
        : 'Appointment cancelled successfully',
      appointment: updatedAppointment
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to update appointment' 
    }, { status: 500 });
  }
}

// POST: Batch update multiple appointments (useful for complex rescheduling scenarios)
export async function POST(req: NextRequest) {
  try {
    const { updates } = await req.json();

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ 
        success: false,
        message: 'Updates array is required' 
      }, { status: 400 });
    }

    // Read existing data
    const dataBuffer = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(dataBuffer);

    const updatedAppointments: any[] = [];
    const notFoundIds: string[] = [];

    // Process each update
    updates.forEach((update: any) => {
      const { appointmentId, newDate, newTime, action } = update;
      let found = false;

      data.bookings = data.bookings.map((booking: any) => {
        if (booking.id === appointmentId) {
          found = true;
          const updated = { ...booking };

          if (action === 'reschedule' && newDate && newTime) {
            updated.date = newDate;
            updated.time = newTime;
          } else if (action === 'cancel') {
            updated.status = 'cancelled';
          }

          updated.updatedAt = new Date().toISOString();
          updatedAppointments.push(updated);
          return updated;
        }
        return booking;
      });

      if (!found) {
        notFoundIds.push(appointmentId);
      }
    });

    // Write back updated data
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true,
      message: 'Batch update completed',
      updatedAppointments,
      notFoundIds: notFoundIds.length > 0 ? notFoundIds : undefined
    }, { status: 200 });

  } catch (error) {
    console.error('Error batch updating appointments:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to batch update appointments' 
    }, { status: 500 });
  }
}