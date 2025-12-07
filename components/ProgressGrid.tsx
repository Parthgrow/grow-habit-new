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
  const createDayGrid = () => {
    const days = [];
    for (let day = 1; day <= 31; day++) {
      // Extract day from date string (YYYY-MM-DD format)
      const hasReflection = reflections.some((r) => {
        const dateDay = parseInt(r.date.split("-")[2]);
        return dateDay === day;
      });
      days.push({ day, hasReflection });
    }
    return days;
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
              {dayGrid.map(({ day, hasReflection }) => (
                <div
                  key={day}
                  className={`aspect-square w-8 h-8 border-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    hasReflection
                      ? "bg-green-500 text-white border-green-600"
                      : "bg-gray-100 text-gray-500 border-gray-300"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-600"></div>
                <span>Has reflection</span>
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
