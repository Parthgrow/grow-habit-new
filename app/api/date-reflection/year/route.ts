import { NextRequest, NextResponse } from 'next/server';
import { getWeek, startOfWeek, endOfWeek } from 'date-fns';

// Helper function to get all weeks in a year
function getAllWeeksInYear(year: number) {
  const weeks = [];
  const startOfYear = new Date(year, 0, 1);
  
  // Get the first Monday of the year (ISO week starts on Monday)
  const firstMonday = startOfWeek(startOfYear, { weekStartsOn: 1 });
  
  // If January 1st is not a Monday, find the first Monday
  let currentWeekStart = firstMonday;
  if (currentWeekStart.getFullYear() < year) {
    currentWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  
  // Generate all weeks in the year
  for (let i = 0; i < 53; i++) {
    const weekStart = new Date(currentWeekStart.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    
    // Stop if we've moved to the next year
    if (weekStart.getFullYear() > year) break;
    
    const weekNumber = getWeek(weekStart, { weekStartsOn: 1 });
    weeks.push(weekNumber);
  }
  
  return weeks;
}

// Helper function to calculate weekly averages from entries
function calculateWeeklyAverages(entries: any[]) {
  const weeklyData: { [weekNumber: string]: { real: number[], ideal: number[] } } = {};

  entries.forEach(entry => {
    const entryDate = new Date(entry.date);
    const weekNumber = getWeek(entryDate, { weekStartsOn: 1 });
    
    if (!weeklyData[weekNumber]) {
      weeklyData[weekNumber] = { real: [], ideal: [] };
    }

    if (entry.type === 'real') {
      weeklyData[weekNumber].real.push(entry.value);
    } else if (entry.type === 'ideal') {
      weeklyData[weekNumber].ideal.push(entry.value);
    }
  });

  // Calculate weekly averages
  const weeklyAverages: { [weekNumber: string]: { realAvg: number, idealAvg: number } } = {};

  Object.keys(weeklyData).forEach(weekNumber => {
    const weekData = weeklyData[weekNumber];
    const realAvg = weekData.real.length > 0 
      ? weekData.real.reduce((sum, val) => sum + val, 0) / 7
      : 0;
    const idealAvg = weekData.ideal.length > 0 
      ? weekData.ideal.reduce((sum, val) => sum + val, 0) / weekData.ideal.length 
      : 0;

    weeklyAverages[weekNumber] = { realAvg, idealAvg };
  });

  return weeklyAverages;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const habitId = searchParams.get('habitId');
    const year = searchParams.get('year');

    if (!userId || !habitId) {
      return NextResponse.json(
        { error: 'userId and habitId parameters are required' },
        { status: 400 }
      );
    }

    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Get all weeks in the year
    const weeksInYear = getAllWeeksInYear(targetYear);
    
    // Fetch data for each week using the existing week API logic
    const allEntries: any[] = [];
    
    for (const weekNumber of weeksInYear) {
      try {
        // Create a mock request for the week API
        const weekRequest = new Request(
          `${request.url.split('?')[0].replace('/year', '/week')}?userId=${userId}&week=${weekNumber}&year=${targetYear}`
        );
        
        // Import and call the week API logic
        const { GET: getWeekData } = await import('../week/route');
        const weekResponse = await getWeekData(weekRequest as NextRequest);
        
        if (weekResponse.ok) {
          const weekData = await weekResponse.json();
          allEntries.push(...weekData.entries);
        }
      } catch (error) {
        console.error(`Error fetching week ${weekNumber}:`, error);
        // Continue with other weeks even if one fails
      }
    }

    // Calculate weekly averages from all entries
    const weeklyAverages = calculateWeeklyAverages(allEntries);

    return NextResponse.json({ 
      entries: allEntries,
      weeklyAverages,
      year: targetYear
    });

  } catch (error) {
    console.error('Error fetching yearly date reflections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch yearly date reflections' },
      { status: 500 }
    );
  }
}

