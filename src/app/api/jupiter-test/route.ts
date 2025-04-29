import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Directly fetch from Jupiter API
    const response = await fetch('https://token.jup.ag/all', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!response.ok) {
      throw new Error(`Jupiter API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return only the first 20 tokens to keep the response manageable
    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data.slice(0, 20) : data,
      count: Array.isArray(data) ? data.length : Object.keys(data).length,
      originalType: typeof data,
      isArray: Array.isArray(data)
    });
  } catch (error) {
    console.error('Error fetching from Jupiter API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}