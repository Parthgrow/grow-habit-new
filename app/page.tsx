"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAuthActions } from "@/hooks/useAuthActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchReflections, type Reflection } from "@/lib/repository";
import ProgressGrid from "@/components/ProgressGrid";

export default function Page() {
  const { user, loading, updateUserData } = useAuth();
  const { signOut } = useAuthActions();
  const [habitLoading, setHabitLoading] = useState(false);
  const [habitData, setHabitData] = useState({
    habitName: "",
    habitStatements: "",
  });
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [reflectionsLoading, setReflectionsLoading] = useState(false);

  useEffect(() => {
    const loadReflections = async () => {
      if (!user?.uid || !user?.habitId) return;

      setReflectionsLoading(true);
      try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        const data = await fetchReflections({
          userId: user.uid,
          month: currentMonth,
          year: currentYear,
        });
        setReflections(data);
      } catch (error) {
        console.error("Error fetching reflections:", error);
      } finally {
        setReflectionsLoading(false);
      }
    };

    loadReflections();
  }, [user?.uid, user?.habitId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Welcome to GrowHabit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Please sign in to access your habit tracking dashboard.
            </p>
            <div className="flex space-x-4">
              <Button asChild className="flex-1">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show habit creation form if user has no habit
  if (!user.habitId) {
    const handleCreateHabit = async (e: React.FormEvent) => {
      e.preventDefault();
      setHabitLoading(true);

      if (!user) {
        toast.error("User not authenticated");
        setHabitLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/habits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.uid,
            habitName: habitData.habitName,
            habitStatements: habitData.habitStatements,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Update the user's habitId in AuthContext
          updateUserData({ habitId: data.id });
          toast.success("Habit created successfully!");
        } else {
          if (data.error === "DUPLICATE_ENTRY") {
            toast.error("You already have a habit created!");
          } else {
            toast.error(data.error || "Failed to create habit");
          }
        }
      } catch (error) {
        console.error("Error creating habit:", error);
        toast.error("Failed to create habit");
      } finally {
        setHabitLoading(false);
      }
    };

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setHabitData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Create Your First Habit
              </CardTitle>
              <p className="text-center text-gray-600">
                Let's start your habit tracking journey by defining your first
                habit
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateHabit} className="space-y-6">
                <div>
                  <label
                    htmlFor="habitName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Habit Name *
                  </label>
                  <Input
                    id="habitName"
                    name="habitName"
                    type="text"
                    placeholder="e.g., Morning Exercise, Reading, Meditation"
                    value={habitData.habitName}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="habitStatements"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Habit Statements *
                  </label>
                  <Textarea
                    id="habitStatements"
                    name="habitStatements"
                    placeholder="Describe your habit in detail. What exactly will you do? When? How often? Be specific about your commitment."
                    value={habitData.habitStatements}
                    onChange={handleInputChange}
                    required
                    className="w-full min-h-[120px]"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Be specific about what you want to achieve and how you'll
                    measure success.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={
                    habitLoading ||
                    !habitData.habitName ||
                    !habitData.habitStatements
                  }
                  className="w-full"
                >
                  {habitLoading ? "Creating..." : "Create Habit"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show dashboard if user has a habit
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user.displayName || user.email}!
              </h1>
              <p className="text-gray-600">
                Track your habits and reflect on your progress
              </p>
            </div>
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📝</span>
                <span>Daily Reflection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Record your daily habit progress and reflections to track your
                growth journey.
              </p>
              <Button asChild className="w-full">
                <Link href="/reflection">Start Reflection</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📊</span>
                <span>Progress Tracker</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View your progress over time and see how your habits are
                developing.
              </p>

              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href="/progress">View Progress</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/date">Weekly Progress</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/year">Yearly Progress</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Grid */}
        <div className="mt-8">
          <ProgressGrid
            reflections={reflections}
            loading={reflectionsLoading}
            title="Daily Progress (Current Month)"
          />
        </div>

        {/* Habit Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🎯</span>
              <span>Your Current Habit</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Habit ID: {user.habitId}
                </h3>
                <p className="text-gray-600">
                  You have successfully created a habit! Your habit ID is stored
                  and ready for tracking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Display Name:</strong> {user.displayName || "Not set"}
              </p>
              <p>
                <strong>User ID:</strong> {user.uid}
              </p>
              <p>
                <strong>Habit ID:</strong> {user.habitId}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
