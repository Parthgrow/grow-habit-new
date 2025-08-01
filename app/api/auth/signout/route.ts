import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // For server-side signout, we just return success
    // The client will handle clearing the token
    return NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    });

  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
} 