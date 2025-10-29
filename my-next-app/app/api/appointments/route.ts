import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

 

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');

    // Read the data.json file
    const filePath = path.join(process.cwd(), 'app', 'data', 'data.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    let appointments = data.appointments || [];

    // Filter by doctorId if provided
    if (doctorId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      appointments = appointments.filter((apt: any) => apt.doctorId === doctorId);
    }

    // Filter by patientId if provided
    if (patientId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Read existing data
    const filePath = path.join(process.cwd(), 'data.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    // Add new appointment
    const newAppointment = {
      id: `apt${Date.now()}`,
      ...body,
      status: body.status || 'upcoming'
    };

    data.appointments = data.appointments || [];
    data.appointments.push(newAppointment);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json(
      { 
        success: true, 
        appointment: newAppointment 
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
