"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp } from "lucide-react";

interface Reflection {
  id: string;
  userId: string;
  habitProgress: string;
  reflection: string;
  day: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProgressPage() {
  const [selectedUser, setSelectedUser] = useState("");
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(false);

  const users = [
    { id: "parth", name: "Parth" },
    { id: "john", name: "John" },
    { id: "jane", name: "Jane" },
  ];

  const fetchReflections = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/reflection?userId=${selectedUser}`);
      if (response.ok) {
        const data = await response.json();
        console.log("the value of data", data) ; 
        setReflections(data.reflections);
      }
    } catch (error) {
      console.error("Error fetching reflections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReflections();
  }, [selectedUser]);

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case "gateway":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "plus":
        return "bg-green-100 text-green-800 border-green-200";
      case "elite":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateReflectionRate = () => {
    if (reflections.length === 0) return 0;

    // Get unique days with reflections
    const uniqueDays = new Set(reflections.map((r) => r.day));
    return uniqueDays.size;
  };

  const createDayGrid = () => {
    const days = [];
    for (let day = 1; day <= 25; day++) {
      const hasReflection = reflections.some((r) => r.day === day);
      days.push({ day, hasReflection });
    }
    return days;
  };

  const dayGrid = createDayGrid();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Progress Tracker
          </h1>
          <p className="text-gray-600">
            Track your habit progress and reflections
          </p>
        </div>

        {/* User Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User
            </label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progress Display */}
        {selectedUser && (
          <div className="space-y-6">
            {/* Reflection Rate Stat */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Reflection Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {calculateReflectionRate()} days
                    </p>
                    <p className="text-sm text-gray-500">
                      Total reflections: {reflections.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Day Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Daily Progress (Days 1-25)</span>
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
          </div>
        )}

        {!selectedUser && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a User
              </h3>
              <p className="text-gray-600">
                Choose a user to view their progress and reflections
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
