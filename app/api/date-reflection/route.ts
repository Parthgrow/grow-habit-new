import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, type, value, userId, habitId } = body;

    // Validate required fields
    if (!date || !type || value === undefined || !userId || !habitId) {
      return NextResponse.json(
        { error: 'Missing required fields: date, type, value, userId, habitId' },
        { status: 400 }
      );
    }

    // Validate type
    if (type !== 'real' && type !== 'ideal') {
      return NextResponse.json(
        { error: 'Type must be either "real" or "ideal"' },
        { status: 400 }
      );
    }

    // Validate value range
    if (value < 0) {
      return NextResponse.json(
        { error: 'Value must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if there's already an entry for this user, date, and type
    const existingEntry = await db.collection('date-reflection')
      .where('userId', '==', userId)
      .where('date', '==', date)
      .where('type', '==', type)
      .limit(1)
      .get();

      if (!existingEntry.empty) {
        // ✅ Update existing entry instead of throwing error
        const docRef = existingEntry.docs[0].ref;
  
        await docRef.update({
          value,
          habitId, // also update habitId in case it changes
          updatedAt: new Date(),
        });
  
        return NextResponse.json(
          {
            success: true,
            message: `${type} value updated successfully`,
            id: docRef.id,
          },
          { status: 200 }
        );
      }

    // Generate a random ID using nanoid
    const entryId = nanoid();

    // Create date-reflection document with the generated ID
    const entryData = {
      id: entryId,
      date,
      type,
      value,
      userId,
      habitId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to Firestore using the generated ID as document ID
    await db.collection('date-reflection').doc(entryId).set(entryData);

    return NextResponse.json(
      { 
        success: true, 
        message: `${type} value saved successfully`,
        id: entryId 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error saving date reflection:', error);
    return NextResponse.json(
      { error: 'Failed to save date reflection' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    let query = db.collection('date-reflection').where('userId', '==', userId);

    // If date is provided, filter by date as well
    if (date) {
      query = query.where('date', '==', date);
    }

    const entriesSnapshot = await query.get();

    const entries = entriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching date reflections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch date reflections' },
      { status: 500 }
    );
  }
}
