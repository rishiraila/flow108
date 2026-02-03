import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();

    // Forward the request to the external API
    const externalApiUrl = 'https://flow108.coinagesoft.com/api/admin/workout_plan';

    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        // Include Authorization if present in request headers
        ...(request.headers.get('authorization') && { 'Authorization': request.headers.get('authorization') }),
      },
      body: formData,
    });

    const responseData = await response.json();

    // Return the response from the external API
    return NextResponse.json(responseData, { status: response.status });

  } catch (error) {
    console.error('Error proxying workout plan creation:', error);
    return NextResponse.json(
      {
        status: false,
        message: "Internal server error occurred while creating workout plan.",
      },
      { status: 500 }
    );
  }
}
