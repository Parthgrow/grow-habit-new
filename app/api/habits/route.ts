import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, habitName, habitStatements } = body;

    // Validate required fields
    if (!userId || !habitName || !habitStatements) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, habitName, habitStatements' },
        { status: 400 }
      );
    }

    // Check if user already has a habit
    const existingHabit = await db.collection('habits')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!existingHabit.empty) {
      return NextResponse.json(
        { 
          error: 'DUPLICATE_ENTRY',
          message: 'You already have a habit created',
          existingId: existingHabit.docs[0].id
        },
        { status: 409 }
      );
    }

    // Generate a random ID using nanoid
    const habitId = nanoid();

    // Create habit document with the generated ID
    const habitData = {
      id: habitId,
      userId,
      habitName,
      habitStatements,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to Firestore using the generated ID as document ID
    await db.collection('habits').doc(habitId).set(habitData);

    // Update the user's habitId field in the users collection
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      // Only update if habitId is null
      if (userData?.habitId === null) {
        await userRef.update({
          habitId: habitId,
          updatedAt: new Date()
        });
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Habit created successfully',
        id: habitId 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Query Firestore for user's habit
    const habitsSnapshot = await db.collection('habits')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (habitsSnapshot.empty) {
      return NextResponse.json({ habit: null });
    }

    const habit = {
      id: habitsSnapshot.docs[0].id,
      ...habitsSnapshot.docs[0].data()
    };

    return NextResponse.json({ habit });
  } catch (error) {
    console.error('Error fetching habit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habit' },
      { status: 500 }
    );
  }
} 