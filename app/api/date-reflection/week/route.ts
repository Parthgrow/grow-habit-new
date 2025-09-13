import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { startOfWeek, endOfWeek, setWeek, endOfISOWeek, startOfYear, startOfISOWeek, addWeeks, subDays } from 'date-fns';





function getDateRangeOfWeek(week: number, year: number) {
  // 1️⃣ Get the first day of the year
  const firstDayOfYear = startOfYear(new Date(year, 0, 1));

  // 2️⃣ Calculate start of the ISO week
  let weekStart = startOfISOWeek(addWeeks(firstDayOfYear, week - 1));
  let weekEnd = endOfISOWeek(weekStart);

  weekStart = subDays(weekStart, 1);
  weekEnd = subDays(weekEnd, 1);

  // 3️⃣ Format as YYYY-MM-DD
  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;

  return { startStr: formatDate(weekStart), endStr: formatDate(weekEnd) };
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
