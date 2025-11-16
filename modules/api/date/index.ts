import { getWeek } from 'date-fns';

/**
 * Get week number using date-fns with Sunday-based weeks
 * Wrapper around getWeek with consistent options (weekStartsOn: 0) used throughout the app
 * 
 * @param date - Date object or date string to get week number for
 * @returns Week number (Sunday-based)
 */
export function getWeekFNS(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return getWeek(dateObj, { weekStartsOn: 0 });
}

/**
 * Calculate weekly averages from entries
 * Groups entries by week number and calculates averages for real and ideal values
 * Uses Sunday-based weeks (weekStartsOn: 0) to match the week query logic
 * 
 * @param entries - Array of entries with date, type ('real' or 'ideal'), and value
 * @returns Object mapping week numbers to their real and ideal averages
 */
export function calculateWeeklyAverages(entries: any[]) {
  const weeklyData: { [weekNumber: string]: { real: number[]; ideal: number[] } } = {};

  entries.forEach((entry) => {
    const entryDate = new Date(entry.date);
    const weekNumber = getWeekFNS(entryDate);

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
  const weeklyAverages: { [weekNumber: string]: { realAvg: number; idealAvg: number } } = {};

  Object.keys(weeklyData).forEach((weekNumber) => {
    const weekData = weeklyData[weekNumber];
    const realAvg =
      weekData.real.length > 0
        ? weekData.real.reduce((sum, val) => sum + val, 0) / 7
        : 0;
    const idealAvg =
      weekData.ideal.length > 0
        ? weekData.ideal.reduce((sum, val) => sum + val, 0) / weekData.ideal.length
        : 0;

    weeklyAverages[weekNumber] = { realAvg, idealAvg };
  });

  return weeklyAverages;
}

