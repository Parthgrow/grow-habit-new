import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/firebase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName} = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists in Firestore
    const existingUserQuery = await db.collection('users').where('email', '==', email).get();
    if (!existingUserQuery.empty) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create user with Firebase Admin SDK
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0], // Use email prefix as display name if not provided
    });

    // Create user document in Firestore
    const userData = {
      id: userRecord.uid,
      name: displayName || email.split('@')[0],
      email: email,
      password: password, // Note: In production, you might want to hash this or not store it
      habitId : null, 
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    // Create custom JWT token
    const customToken = await auth.createCustomToken(userRecord.uid, {
      email: userRecord.email,
      displayName: userRecord.displayName,
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
  
      },
      token: customToken,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 