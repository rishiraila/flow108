import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');

    // Forward the request to the external API
    const externalApiUrl = 'https://api.flow108.in/api/AdminDietPlan/with-users';

    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': authHeader,
      },
    });

    const responseData = await response.json();

    // Return the response from the external API
    return NextResponse.json(responseData, { status: response.status });

  } catch (error) {
    console.error('Error proxying diet plan with users:', error);
    return NextResponse.json(
      {
        Status: false,
        Message: "Internal server error occurred while fetching diet plans with users.",
      },
      { status: 500 }
    );
  }
}
