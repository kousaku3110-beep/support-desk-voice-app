import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const callHistory = typeof window !== 'undefined' 
      ? localStorage.getItem('callHistory') 
      : null;
    
    const calls = callHistory ? JSON.parse(callHistory) : [];

    return NextResponse.json({ success: true, calls });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch calls' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const callRecord = {
      id: Date.now(),
      caller: body.caller,
      receiver: body.receiver,
      startTime: new Date().toISOString(),
      duration: body.duration,
    };

    return NextResponse.json({ success: true, call: callRecord });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save call' }, { status: 500 });
  }
}
