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
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProgressGrid from "@/components/ProgressGrid";
import { fetchReflections } from "@/lib/utils";
import { type Reflection } from "@/lib/repository";

export default function ProgressPage() {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadReflections = async () => {
      if (!user?.uid) return;

      setLoading(true);
      try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
        const currentYear = currentDate.getFullYear();

        const data = await fetchReflections({
          userId: user.uid,
          month: currentMonth,
          year: currentYear,
        });
        console.log("the value of data", data);
        setReflections(data);
      } catch (error) {
        console.error("Error fetching reflections:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReflections();
  }, [user?.uid]);

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

    // Get unique dates with reflections
    const uniqueDates = new Set(reflections.map((r) => r.date));
    return uniqueDates.size;
  };

  return (
    <ProtectedRoute>
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

          {/* User Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User
              </label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <p className="text-sm text-gray-900">
                  {user?.displayName || user?.email || "Unknown User"}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Display */}
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

            {/* Progress Grid */}
            <ProgressGrid
              reflections={reflections}
              loading={loading}
              title="Daily Progress (Current Month)"
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
