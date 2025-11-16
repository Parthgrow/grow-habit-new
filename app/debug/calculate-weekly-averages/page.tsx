"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { calculateWeeklyAverages } from "@/modules/api/date";

interface Entry {
  id: string;
  date: string;
  type: string;
  value: number;
  userId: string;
}

interface WeeklyAverage {
  weekNumber: string;
  realAvg: number;
  idealAvg: number;
}

export default function DebugCalculateWeeklyAveragesPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [weeklyAverages, setWeeklyAverages] = useState<WeeklyAverage[]>([]);
  const [error, setError] = useState<string>("");

  const handleParse = () => {
    setError("");
    setWeeklyAverages([]);

    if (!jsonInput.trim()) {
      setError("Please enter JSON data");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);

      // Handle both array directly and array wrapped in object
      let entriesArray: any[] = [];

      if (Array.isArray(parsed)) {
        entriesArray = parsed;
      } else if (parsed.entries && Array.isArray(parsed.entries)) {
        entriesArray = parsed.entries;
      } else {
        setError("JSON must be an array or an object with an 'entries' array");
        return;
      }

      // Validate entries have required fields
      const validEntries = entriesArray.filter(
        (entry: any) =>
          entry.date &&
          (entry.type === "real" || entry.type === "ideal") &&
          typeof entry.value === "number"
      );

      if (validEntries.length === 0) {
        setError(
          "No valid entries found. Entries must have date, type (real/ideal), and value fields."
        );
        return;
      }

      // Calculate weekly averages
      const averages = calculateWeeklyAverages(validEntries);

      // Convert to array and sort by week number
      const averagesArray: WeeklyAverage[] = Object.keys(averages)
        .map((weekNumber) => ({
          weekNumber,
          realAvg: averages[weekNumber].realAvg,
          idealAvg: averages[weekNumber].idealAvg,
        }))
        .sort((a, b) => parseInt(a.weekNumber) - parseInt(b.weekNumber));

      setWeeklyAverages(averagesArray);
    } catch (err) {
      setError(
        `Invalid JSON: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Calculate Weekly Averages
        </h1>
        <p className="text-gray-600">
          Paste your entries array below to calculate and view weekly averages
        </p>
      </div>

      <div className="mb-6">
        <div className="mb-4">
          <label
            htmlFor="json-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            JSON Input (Array of Entries)
          </label>
          <Textarea
            id="json-input"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Paste your array here, e.g., [{id: "...", date: "...", type: "ideal", ...}, ...]'
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        <Button onClick={handleParse} className="w-full sm:w-auto">
          Calculate Weekly Averages
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-medium">Error:</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {weeklyAverages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Weekly Averages ({weeklyAverages.length} weeks)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                    Week Number
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                    Real Average
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                    Ideal Average
                  </th>
                </tr>
              </thead>
              <tbody>
                {weeklyAverages.map((week, index) => (
                  <tr
                    key={week.weekNumber}
                    className={cn(
                      "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                      index % 2 === 0 ? "bg-white" : "bg-gray-25"
                    )}
                  >
                    <td className="py-3 px-4 text-gray-900 font-semibold">
                      Week {week.weekNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {week.realAvg.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {week.idealAvg.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
