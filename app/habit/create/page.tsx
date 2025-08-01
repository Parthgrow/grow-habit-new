"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CreateHabitPage() {
  const { user, updateUserData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    habitName: "",
    habitStatements: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast.error("User not authenticated");
      setLoading(false);
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
          habitName: formData.habitName,
          habitStatements: formData.habitStatements,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the user's habitId in AuthContext
        updateUserData({ habitId: data.id });
        toast.success("Habit created successfully!");
        router.push("/");
      } else {
        if (data.error === "DUPLICATE_ENTRY") {
          toast.error("You already have a habit created!");
          router.push("/");
        } else {
          toast.error(data.error || "Failed to create habit");
        }
      }
    } catch (error) {
      console.error("Error creating habit:", error);
      toast.error("Failed to create habit");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData.habitName}
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
                  value={formData.habitStatements}
                  onChange={handleInputChange}
                  required
                  className="w-full min-h-[120px]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Be specific about what you want to achieve and how you'll
                  measure success.
                </p>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    loading || !formData.habitName || !formData.habitStatements
                  }
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Create Habit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
