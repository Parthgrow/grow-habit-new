import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, habitProgress, reflection, date, userName, habitId } = body;

    // Validate required fields
    if (!userId || !habitProgress || !reflection || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, habitProgress, reflection, date' },
        { status: 400 }
      );
    }

    // Check if there's already a reflection for this user on this specific date
    const existingReflection = await db.collection('reflections')
      .where('userId', '==', userId)
      .where('date', '==', date)
      .limit(1)
      .get();

    if (!existingReflection.empty) {
      return NextResponse.json(
        {
          error: 'DUPLICATE_ENTRY',
          message: 'You have already submitted a reflection for this date',
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
      habitId,
      habitProgress,
      reflection,
      date,
      createdAt: new Date(),
      updatedAt: new Date(),
      userName
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!userId || !month || !year) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, month, and year are required' },
        { status: 400 }
      );
    }

    // Validate month and year
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12 || isNaN(monthNum)) {
      return NextResponse.json(
        { error: 'Invalid month. Must be between 1 and 12' },
        { status: 400 }
      );
    }

    if (isNaN(yearNum) || yearNum < 2000) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      );
    }

    // Create date range for the specified month
    const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
    const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
    const nextYear = monthNum === 12 ? yearNum + 1 : yearNum;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    // Query Firestore with userId and date range filter
    const reflectionsSnapshot = await db.collection('reflections')
      .where('userId', '==', userId)
      .where('date', '>=', startDate)
      .where('date', '<', endDate)
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
