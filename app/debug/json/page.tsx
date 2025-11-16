"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Entry {
  id: string;
  date: string;
  type: string;
  value: number;
  userId: string;
}

type FilterType = "all" | "ideal" | "real";

export default function DebugJsonPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string>("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const handleParse = () => {
    setError("");
    setEntries([]);

    if (!jsonInput.trim()) {
      setError("Please enter JSON data");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);

      if (parsed.entries && Array.isArray(parsed.entries)) {
        const extractedEntries: Entry[] = parsed.entries.map((entry: any) => ({
          id: entry.id || "",
          date: entry.date || "",
          type: entry.type || "",
          value: entry.value ?? 0,
          userId: entry.userId || "",
        }));
        setEntries(extractedEntries);
      } else {
        setError("JSON does not contain an 'entries' array");
      }
    } catch (err) {
      setError(
        `Invalid JSON: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (filterType === "all") return true;
    return entry.type === filterType;
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Debug JSON Viewer
        </h1>
        <p className="text-gray-600">
          Paste your JSON data below to view entries in tabular format
        </p>
      </div>

      <div className="mb-6">
        <div className="mb-4">
          <label
            htmlFor="json-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            JSON Input
          </label>
          <Textarea
            id="json-input"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Paste your JSON here, e.g., {"entries": [...]}'
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        <Button onClick={handleParse} className="w-full sm:w-auto">
          Parse & Display
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-medium">Error:</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Entries ({filteredEntries.length} of {entries.length})
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Filter:
                </span>
                <div className="flex gap-2">
                  <Button
                    variant={filterType === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterType === "ideal" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("ideal")}
                  >
                    Ideal
                  </Button>
                  <Button
                    variant={filterType === "real" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("real")}
                  >
                    Real
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                    Value
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                    User ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No entries match the selected filter
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry, index) => (
                    <tr
                      key={entry.id || index}
                      className={cn(
                        "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                        index % 2 === 0 ? "bg-white" : "bg-gray-25"
                      )}
                    >
                      <td className="py-3 px-4 text-gray-900 font-mono text-xs">
                        {entry.id}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {entry.date}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            entry.type === "ideal"
                              ? "bg-blue-100 text-blue-800"
                              : entry.type === "real"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          )}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-semibold">
                        {entry.value}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-mono text-xs">
                        {entry.userId}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
