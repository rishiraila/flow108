import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    // Forward the request to the external API
    const externalApiUrl = 'https://api.flow108.in/api/AdminDietPlan/Dietplan/Create';

    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    // Return the response from the external API
    return NextResponse.json(responseData, { status: response.status });

  } catch (error) {
    console.error('Error proxying diet plan creation:', error);
    return NextResponse.json(
      {
        Status: false,
        Message: "Internal server error occurred while creating diet plan.",
      },
      { status: 500 }
    );
  }
}
