import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/firebase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);

    // Get user data from Firestore to include habitId
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    let habitId = null;
    let displayName = userRecord.displayName;
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      habitId = userData?.habitId || null;
      displayName = userData?.name || userRecord.displayName;
    }

    // Create custom JWT token
    const customToken = await auth.createCustomToken(userRecord.uid, {
      email: userRecord.email,
      displayName: displayName,
    });

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: displayName,
        habitId: habitId,
      },
      token: customToken,
    });

  } catch (error: any) {
    console.error('Signin error:', error);
    
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    );
  }
} 