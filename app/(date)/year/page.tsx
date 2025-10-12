"use client";

import { getWeek, startOfWeek, endOfWeek, format } from "date-fns";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function YearPage() {
  const { user } = useAuth();
  const [weeklyAverages, setWeeklyAverages] = useState<{
    [weekNumber: string]: { realAvg: number; idealAvg: number };
  }>({});
  const [loading, setLoading] = useState(true);
  const getWeeksInYear = (year: number) => {
    const weeks = [];

    // Start from January 1st of the year
    const startOfYear = new Date(year, 0, 1);

    // Get the first Monday of the year (ISO week starts on Monday)
    const firstMonday = startOfWeek(startOfYear, { weekStartsOn: 1 });

    // If January 1st is not a Monday, find the first Monday
    let currentWeekStart = firstMonday;
    if (currentWeekStart.getFullYear() < year) {
      currentWeekStart = new Date(
        currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000
      );
    }

    // Generate all weeks in the year
    for (let i = 0; i < 53; i++) {
      const isoWeekStart = new Date(
        currentWeekStart.getTime() + i * 7 * 24 * 60 * 60 * 1000
      );

      // Stop if we've moved to the next year
      if (isoWeekStart.getFullYear() > year) break;

      // Get ISO week number (Monday-based)
      const weekNumber = getWeek(isoWeekStart, { weekStartsOn: 1 });

      // Calculate Sunday-based date range for display
      const displayWeekStart = startOfWeek(isoWeekStart, { weekStartsOn: 0 }); // Sunday
      const displayWeekEnd = endOfWeek(isoWeekStart, { weekStartsOn: 0 }); // Saturday

      weeks.push({
        weekNumber,
        isoStartDate: isoWeekStart, // Monday (ISO standard)
        isoEndDate: endOfWeek(isoWeekStart, { weekStartsOn: 1 }), // Sunday (ISO standard)
        displayStartDate: displayWeekStart, // Sunday (for display)
        displayEndDate: displayWeekEnd, // Saturday (for display)
        startDateFormatted: format(displayWeekStart, "MMM dd"),
        endDateFormatted: format(displayWeekEnd, "MMM dd, yyyy"),
        fullRange: `${format(displayWeekStart, "MMM dd")} - ${format(
          displayWeekEnd,
          "MMM dd, yyyy"
        )}`,
      });
    }

    return weeks;
  };

  const currentYear = new Date().getFullYear();
  const weeksInYear = getWeeksInYear(currentYear);

  // Fetch yearly data
  useEffect(() => {
    const fetchYearlyData = async () => {
      if (!user?.uid || !user?.habitId) {
        setLoading(false);
        return;
      }

      console.log("I was here");

      try {
        const response = await fetch(
          `/api/date-reflection/year?userId=${user.uid}&habitId=${user.habitId}&year=${currentYear}`
        );

        if (!response.ok) {
          console.log("Failed to fetch yearly data");
          throw new Error("Failed to fetch yearly data");
        }

        const data = await response.json();
        console.log("the value of data is ", data);
        setWeeklyAverages(data.weeklyAverages || {});
      } catch (error) {
        console.error("Error fetching yearly data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchYearlyData();
  }, [user, currentYear]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          All Weeks in {currentYear} (ISO Standard)
        </h1>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Week
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Dates (Sun-Sat)
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Real
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Ideal
                  </th>
                </tr>
              </thead>
              <tbody>
                {weeksInYear.map((week, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-25"
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-blue-600">
                          Week {week.weekNumber}
                        </span>
                        <span className="text-xs text-gray-500">
                          ISO: {format(week.isoStartDate, "MMM dd")} -{" "}
                          {format(week.isoEndDate, "MMM dd")}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          {format(week.displayStartDate, "MMM dd")} -{" "}
                          {format(week.displayEndDate, "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(week.displayStartDate, "EEEE")} to{" "}
                          {format(week.displayEndDate, "EEEE")}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        {loading ? (
                          <div className="text-gray-400">Loading...</div>
                        ) : weeklyAverages[week.weekNumber]?.realAvg ? (
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                weeklyAverages[week.weekNumber].realAvg >= 4
                                  ? "bg-green-100 text-green-800"
                                  : weeklyAverages[week.weekNumber].realAvg >= 3
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {weeklyAverages[week.weekNumber].realAvg.toFixed(
                                1
                              )}
                            </span>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">- - -</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        {loading ? (
                          <div className="text-gray-400">Loading...</div>
                        ) : weeklyAverages[week.weekNumber]?.idealAvg ? (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {weeklyAverages[week.weekNumber].idealAvg.toFixed(
                                1
                              )}
                            </span>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">- - -</div>
                        )}
                      </div>
                    </td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
