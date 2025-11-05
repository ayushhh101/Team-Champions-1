/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/app/utils/notificationService';

const redis = Redis.fromEnv();

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

    let prescriptions = (await redis.get('prescriptions')) as Prescription[] || [];

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

    const prescriptions = (await redis.get('prescriptions')) as Prescription[] || [];

    // Create new prescription with ID
    const prescription: Prescription = {
      id: prescriptionData.id || Date.now().toString(),
      ...prescriptionData,
      prescribedAt: prescriptionData.prescribedAt || new Date().toISOString()
    };

    prescriptions.push(prescription);
    await redis.set('prescriptions', prescriptions);

    // Find the user ID based on patient email and send notification
    if (prescription.patientEmail && prescription.doctorName) {
      try {
        // Get users to find the patient's userId
        const usersData = await redis.get('users') as any[] || [];
        const patient = usersData.find((user: any) => user.email === prescription.patientEmail);
        
        if (patient && patient.id) {
          await NotificationService.notifyUserOfPrescription(
            patient.id,
            prescription,
            prescription.doctorName
          );
        }
      } catch (notificationError) {
        console.error('Error sending notification to patient:', notificationError);
        // Don't fail the prescription creation if notification fails
      }
    }

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

    const prescriptions = (await redis.get('prescriptions')) as Prescription[] || [];

    let prescriptionFound = false;
    let updatedPrescription = null;

    const updatedPrescriptions = prescriptions.map((prescription: any) => {
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

    await redis.set('prescriptions', updatedPrescriptions);

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

    let prescriptions = (await redis.get('prescriptions')) as Prescription[] || [];

    const initialLength = prescriptions.length;
    prescriptions = prescriptions.filter((prescription: any) => prescription.id !== id);

    if (prescriptions.length === initialLength) {
      return NextResponse.json({
        success: false,
        message: 'Prescription not found'
      }, { status: 404 });
    }

    await redis.set('prescriptions', prescriptions);

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
