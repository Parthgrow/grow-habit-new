import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';

function getDateRangeOfISOWeek(week: number, year: number) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  const ISOweekEnd = new Date(ISOweekStart);
  ISOweekEnd.setDate(ISOweekStart.getDate() + 6);

  // Convert to YYYY-MM-DD string format
  const startStr = ISOweekStart.toISOString().split('T')[0];
  const endStr = ISOweekEnd.toISOString().split('T')[0];


  return {startStr, endStr};
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const week = searchParams.get('week');
    const year = searchParams.get('year');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    let query = db.collection('date-reflection').where('userId', '==', userId);

    if (week && year) {
      const { startStr, endStr } = getDateRangeOfISOWeek(Number(week), Number(year));

      console.log("the value of start is ", startStr) ; 
      console.log("the value of end is ", endStr) ; 

      // Assuming your `date` field in Firestore is stored as a Firestore Timestamp
      query = query
        .where('date', '>=', startStr)
        .where('date', '<=', endStr);
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
