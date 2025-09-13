import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { startOfWeek, endOfWeek, setWeek } from 'date-fns';


function getDateRangeOfWeek(week: number, year: number) {
  // 1️⃣ Base date in UTC
  const baseDate = setWeek(new Date(Date.UTC(year, 0, 1)), week);

  // 2️⃣ Week start/end in UTC
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }); // Sunday
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 0 });     // Saturday

  // 3️⃣ Convert to YYYY-MM-DD string without timezone shift
  const startStr = `${weekStart.getUTCFullYear()}-${String(
    weekStart.getUTCMonth() + 1
  ).padStart(2, '0')}-${String(weekStart.getUTCDate()).padStart(2, '0')}`;

  const endStr = `${weekEnd.getUTCFullYear()}-${String(
    weekEnd.getUTCMonth() + 1
  ).padStart(2, '0')}-${String(weekEnd.getUTCDate()).padStart(2, '0')}`;

  return { startStr, endStr };
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

      const { startStr, endStr } = getDateRangeOfWeek(Number(week), Number(year));

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
