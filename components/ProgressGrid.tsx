"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { type Reflection } from "@/lib/repository";

interface ProgressGridProps {
  reflections: Reflection[];
  loading: boolean;
  title?: string;
}

export default function ProgressGrid({
  reflections,
  loading,
  title = "Daily Progress (Days 1-25)",
}: ProgressGridProps) {
  const getDateFromDay = (
    day: number,
    month: number,
    year: number
  ): string | null => {
    try {
      // month is 1-12, but Date constructor expects 0-11
      const date = new Date(year, month - 1, day);

      // Check if date is valid (e.g., Feb 30 would be invalid)
      if (
        date.getDate() !== day ||
        date.getMonth() !== month - 1 ||
        date.getFullYear() !== year
      ) {
        return null;
      }

      // Format as YYYY-MM-DD
      const yearStr = year.toString();
      const monthStr = month.toString().padStart(2, "0");
      const dayStr = day.toString().padStart(2, "0");
      return `${yearStr}-${monthStr}-${dayStr}`;
    } catch {
      return null;
    }
  };

  const createDayGrid = () => {
    const days = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    for (let day = 1; day <= 31; day++) {
      // Calculate the date string for this day
      const dateString = getDateFromDay(day, currentMonth, currentYear);

      // Find reflection by matching the full date string
      const reflection = dateString
        ? reflections.find((r) => r.date === dateString)
        : null;
      const habitProgress = reflection?.habitProgress || null;

      days.push({ day, habitProgress });
    }
    return days;
  };

  const getDayColorClasses = (habitProgress: string | null) => {
    if (!habitProgress) {
      return "bg-gray-100 text-gray-500 border-gray-300";
    }
    if (habitProgress === "gateway") {
      return "bg-yellow-500 text-white border-yellow-600";
    }
    if (habitProgress === "plus" || habitProgress === "elite") {
      return "bg-green-500 text-white border-green-600";
    }
    if (habitProgress === "no") {
      return "bg-pink-100 text-pink-700 border-pink-300";
    }
    // Default to gray for any other value
    return "bg-gray-100 text-gray-500 border-gray-300";
  };

  const dayGrid = createDayGrid();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading reflections...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Grid of days */}
            <div className="grid grid-cols-5 gap-2">
              {dayGrid.map(({ day, habitProgress }) => (
                <div
                  key={day}
                  className={`aspect-square w-8 h-8 border-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${getDayColorClasses(
                    habitProgress
                  )}`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded border-2 border-yellow-600"></div>
                <span>Gateway</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-600"></div>
                <span>Plus/Elite</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-pink-100 rounded border-2 border-pink-300"></div>
                <span>No</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 rounded border-2 border-gray-300"></div>
                <span>No reflection</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
