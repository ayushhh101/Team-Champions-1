import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export async function GET() {
  try {
    // Get all data collections from Redis
    const prescriptions = await redis.get('prescriptions');
    const bookings = await redis.get('bookings');
    const appointments = await redis.get('appointments');
    const users = await redis.get('users');
    const doctors = await redis.get('doctors');

    const data = {
      prescriptions: prescriptions || [],
      bookings: bookings || [],
      appointments: appointments || [],
      users: users || [],
      doctors: doctors || []
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return NextResponse.json({ 
      error: 'Failed to load data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
