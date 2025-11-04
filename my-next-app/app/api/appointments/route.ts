/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = Redis.fromEnv();

interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

// GET: Fetch appointments (filter by doctorId or patientId)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');

    let appointments = (await redis.get('appointments')) as Appointment[] || [];

    // Filter by doctorId if provided
    if (doctorId) {
      appointments = appointments.filter((apt: any) => apt.doctorId === doctorId);
    }

    // Filter by patientId if provided
    if (patientId) {
      appointments = appointments.filter((apt: any) => apt.patientId === patientId);
    }

    return NextResponse.json(
      {
        success: true,
        appointments,
        count: appointments.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch appointments',
        appointments: []
      },
      { status: 500 }
    );
  }
}

// POST: Create new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const appointments = (await redis.get('appointments')) as Appointment[] || [];

    const newAppointment: Appointment = {
      id: `apt${Date.now()}`,
      ...body,
      patientId: body.patientId || body.id,
      status: body.status || 'upcoming',
      createdAt: new Date().toISOString()
    };

    appointments.push(newAppointment);
    await redis.set('appointments', appointments);

    return NextResponse.json(
      {
        success: true,
        appointment: newAppointment,
        message: 'Appointment created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create appointment'
      },
      { status: 500 }
    );
  }
}

// PATCH: Update appointment
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const appointments = (await redis.get('appointments')) as Appointment[] || [];

    const appointmentIndex = appointments.findIndex((apt: any) => apt.id === id);

    if (appointmentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Update appointment with all provided fields
    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    await redis.set('appointments', appointments);

    return NextResponse.json(
      {
        success: true,
        appointment: appointments[appointmentIndex],
        message: 'Appointment updated successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE: Remove appointment
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const appointments = (await redis.get('appointments')) as Appointment[] || [];

    const appointmentIndex = appointments.findIndex((apt: any) => apt.id === id);

    if (appointmentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const deletedAppointment = appointments[appointmentIndex];
    appointments.splice(appointmentIndex, 1);

    await redis.set('appointments', appointments);

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment deleted successfully',
        appointment: deletedAppointment
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
