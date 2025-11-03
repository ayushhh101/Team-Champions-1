/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const dataFilePath = path.join(process.cwd(), 'app', 'data', 'data.json');

interface Prescription {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  symptoms?: string;
  medications: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  labTests?: string;
  followUpDate?: string;
  additionalNotes?: string;
  prescribedAt: string;
  updatedAt?: string;
}

// GET: Fetch all prescriptions or filter by query params
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get('doctorId');
    const patientEmail = searchParams.get('patientEmail');
    const appointmentId = searchParams.get('appointmentId');
    const id = searchParams.get('id');

    const dataBuffer = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(dataBuffer);

    let prescriptions = data.prescriptions || [];

    // Apply filters
    if (id) {
      prescriptions = prescriptions.filter((p: Prescription) => p.id === id);
    }
    if (doctorId) {
      prescriptions = prescriptions.filter((p: Prescription) => p.doctorId === doctorId);
    }
    if (patientEmail) {
      prescriptions = prescriptions.filter((p: Prescription) => p.patientEmail === patientEmail);
    }
    if (appointmentId) {
      prescriptions = prescriptions.filter((p: Prescription) => p.appointmentId === appointmentId);
    }

    // Sort by creation date (most recent first)
    prescriptions.sort((a: any, b: any) => {
      return new Date(b.prescribedAt).getTime() - new Date(a.prescribedAt).getTime();
    });

    return NextResponse.json({
      success: true,
      prescriptions,
      count: prescriptions.length
    });
  } catch (error) {
    console.error('Error reading prescriptions:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to read prescriptions',
      prescriptions: []
    }, { status: 500 });
  }
}

// POST: Create a new prescription
export async function POST(req: Request) {
  try {
    const prescriptionData = await req.json();

    // Read existing data
    const dataBuffer = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(dataBuffer);

    if (!data.prescriptions) {
      data.prescriptions = [];
    }

    // Create new prescription with ID
    const prescription: Prescription = {
      id: prescriptionData.id || Date.now().toString(),
      ...prescriptionData,
      prescribedAt: prescriptionData.prescribedAt || new Date().toISOString()
    };

    data.prescriptions.push(prescription);

    // Write updated data back to file
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Prescription created successfully',
      prescription
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create prescription'
    }, { status: 500 });
  }
}

// PATCH: Update an existing prescription
export async function PATCH(req: Request) {
  try {
    const updates = await req.json();
    const { id } = updates;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Prescription ID is required'
      }, { status: 400 });
    }

    // Read existing data
    const dataBuffer = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(dataBuffer);

    let prescriptionFound = false;
    let updatedPrescription = null;

    data.prescriptions = data.prescriptions.map((prescription: any) => {
      if (prescription.id === id) {
        prescriptionFound = true;
        const updated = {
          ...prescription,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        updatedPrescription = updated;
        return updated;
      }
      return prescription;
    });

    if (!prescriptionFound) {
      return NextResponse.json({
        success: false,
        message: 'Prescription not found'
      }, { status: 404 });
    }

    // Write back updated data
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Prescription updated successfully',
      prescription: updatedPrescription
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating prescription:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update prescription'
    }, { status: 500 });
  }
}

// DELETE: Delete a prescription
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Prescription ID is required'
      }, { status: 400 });
    }

    const dataBuffer = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(dataBuffer);

    const initialLength = data.prescriptions?.length || 0;
    data.prescriptions = data.prescriptions?.filter((prescription: any) => prescription.id !== id) || [];

    if (data.prescriptions.length === initialLength) {
      return NextResponse.json({
        success: false,
        message: 'Prescription not found'
      }, { status: 404 });
    }

    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Prescription deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete prescription'
    }, { status: 500 });
  }
}
