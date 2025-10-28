import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const dataFilePath = path.join(process.cwd(), 'app', 'data', 'data.json');

// GET: Return all bookings
export async function GET() {
  try {
    const dataBuffer = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(dataBuffer);

    return NextResponse.json({ bookings: data.bookings || [] });
  } catch (error) {
    console.error('Error reading bookings:', error);
    return NextResponse.json({ message: 'Failed to read bookings' }, { status: 500 });
  }
}

// POST: Add a new booking
export async function POST(req: Request) {
  try {
    const newBooking = await req.json();

    // Read existing data
    const dataBuffer = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(dataBuffer);

    // Add new booking
    if (!data.bookings) {
      data.bookings = [];
    }
    data.bookings.push(newBooking);

    // Write updated data back to file
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ message: 'Booking saved', data: newBooking }, { status: 200 });
  } catch (error) {
    console.error('Error saving booking:', error);
    return NextResponse.json({ message: 'Failed to save booking' }, { status: 500 });
  }
}

// PATCH: Update patient details for existing booking
export async function PATCH(req: Request) {
  try {
    const { appointmentId, patientDetails } = await req.json();

    // Read existing data
    const dataBuffer = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(dataBuffer);

    let bookingFound = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.bookings = data.bookings.map((booking: any) => {
      if (booking.id === appointmentId) {
        booking.patientDetails = patientDetails;
        bookingFound = true;
      }
      return booking;
    });

    if (!bookingFound) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    // Write back updated data
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ message: 'Booking updated successfully', patientDetails }, { status: 200 });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ message: 'Failed to update booking' }, { status: 500 });
  }
}
