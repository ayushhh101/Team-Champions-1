/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = Redis.fromEnv();

interface Booking {
  id: string;
  patientEmail?: string;
  patientPhone?: string;
  status: string;
  paymentStatus: string;
  date: string;
  time: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

// GET: Return all bookings with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientEmail = searchParams.get('patientEmail');
    const patientPhone = searchParams.get('patientPhone');
    const status = searchParams.get('status');
    const doctorId = searchParams.get('doctorId');

    let bookings = (await redis.get('bookings')) as Booking[] || [];

    // Apply filters if provided
    if (patientEmail) {
      bookings = bookings.filter((b: any) => b.patientEmail === patientEmail);
    }

    if (patientPhone) {
      bookings = bookings.filter((b: any) => b.patientPhone === patientPhone);
    }

    if (status) {
      bookings = bookings.filter((b: any) => b.status === status);
    }

    if (doctorId) {
      bookings = bookings.filter((b: any) => b.doctorId === doctorId);
    }

    // Sort by date and time (most recent first)
    bookings.sort((a: any, b: any) => {
      const dateA = new Date(`${a.date} ${a.time}`).getTime();
      const dateB = new Date(`${b.date} ${b.time}`).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Error reading bookings:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to read bookings',
      bookings: []
    }, { status: 500 });
  }
}

// POST: Add a new booking
export async function POST(req: Request) {
  try {
    const newBooking = await req.json();

    const bookings = (await redis.get('bookings')) as Booking[] || [];

    const booking: Booking = {
      id: newBooking.id || Date.now().toString(),
      ...newBooking,
      status: newBooking.status || 'confirmed',
      paymentStatus: newBooking.paymentStatus || 'not_paid',
      createdAt: newBooking.createdAt || new Date().toISOString()
    };

    bookings.push(booking);
    await redis.set('bookings', bookings);

    return NextResponse.json({
      success: true,
      message: 'Booking saved',
      booking
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving booking:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to save booking'
    }, { status: 500 });
  }
}

// PATCH: Update booking
export async function PATCH(req: Request) {
  try {
    const updates = await req.json();
    const { id, appointmentId, patientDetails, status, paymentStatus, ...otherUpdates } = updates;

    const bookingId = id || appointmentId;

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        message: 'Booking ID is required'
      }, { status: 400 });
    }

    let bookings = (await redis.get('bookings')) as Booking[] || [];

    let bookingFound = false;
    let updatedBooking = null;

    bookings = bookings.map((booking: any) => {
      if (booking.id === bookingId) {
        bookingFound = true;

        const updated = {
          ...booking,
          ...otherUpdates
        };

        if (patientDetails) {
          updated.patientDetails = patientDetails;
        }
        if (status) {
          updated.status = status;
        }
        if (paymentStatus) {
          updated.paymentStatus = paymentStatus;
        }

        updated.updatedAt = new Date().toISOString();
        updatedBooking = updated;
        return updated;
      }
      return booking;
    });

    if (!bookingFound) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }

    await redis.set('bookings', bookings);

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update booking'
    }, { status: 500 });
  }
}

// DELETE: Delete a booking
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Booking ID is required'
      }, { status: 400 });
    }

    let bookings = (await redis.get('bookings')) as Booking[] || [];

    const initialLength = bookings.length;
    bookings = bookings.filter((booking: any) => booking.id !== id);

    if (bookings.length === initialLength) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }

    await redis.set('bookings', bookings);

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete booking'
    }, { status: 500 });
  }
}
