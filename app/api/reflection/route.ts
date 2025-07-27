import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("The value of body is ", body) ; 
    const { userId, habitProgress, reflection, day } = body;

    // Validate required fields
    if (!userId || !habitProgress || !reflection || day === null || day === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, habitProgress, reflection, day' },
        { status: 400 }
      );
    }

    // Check if there's already a reflection for this user on this day
    const existingReflection = await db.collection('reflections')
      .where('userId', '==', userId)
      .where('day', '==', day)
      .limit(1)
      .get();


    

    if (!existingReflection.empty) {
      return NextResponse.json(
        { 
          error: 'DUPLICATE_ENTRY',
          message: 'You have already submitted a reflection for this day',
          existingId: existingReflection.docs[0].id
        },
        { status: 409 } // Conflict status code
      );
    }

    // Generate a random ID using nanoid
    const reflectionId = nanoid();

    // Create reflection document with the generated ID
    const reflectionData = {
      id: reflectionId,
      userId,
      habitProgress,
      reflection,
      day,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to Firestore using the generated ID as document ID
    await db.collection('reflections').doc(reflectionId).set(reflectionData);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Reflection saved successfully',
        id: reflectionId 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error saving reflection:', error);
    return NextResponse.json(
      { error: 'Failed to save reflection' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reflectionsSnapshot = await db.collection('reflections')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const reflections = reflectionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ reflections });
  } catch (error) {
    console.error('Error fetching reflections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reflections' },
      { status: 500 }
    );
  }
}
