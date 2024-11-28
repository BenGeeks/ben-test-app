import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Parse the incoming JSON data
    const data = await req.json();

    // Log the received data
    console.log('Received Data:', data);

    // Return a success response
    return NextResponse.json({ message: 'Data received successfully', receivedData: data });
  } catch (err) {
    // Narrow down the error type
    const error = err instanceof Error ? err : new Error('Unknown error occurred');

    console.error('Error handling request:', error.message);

    // Return an error response
    return NextResponse.json({ message: 'Failed to process the request', error: error.message }, { status: 400 });
  }
}
