"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ReflectionPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    userId: "",
    habitProgress: "",
    reflection: "",
    day: null as number | null,
  });
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set the authenticated user's ID when component mounts
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({ ...prev, userId: user.uid }));
    }
  }, [user]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const day = selectedDate.getDate(); // Extract day as number (1-31)
      setFormData({ ...formData, day });
    } else {
      setFormData({ ...formData, day: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reflection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...formData, userName : user?.displayName, habitId : user?.habitId}),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Reflection submitted successfully!");
        // Reset form but keep the user ID
        setFormData({
          userId: user?.uid || "",
          habitProgress: "",
          reflection: "",
          day: null,
        });
        setDate(undefined);
      } else if (response.status === 409 && data.error === "DUPLICATE_ENTRY") {
        toast.error(
          data.message || "You have already submitted a reflection for this day"
        );
      } else {
        toast.error(data.error || "Failed to submit reflection");
        console.error("Failed to submit reflection");
      }
    } catch (error) {
      toast.error("Network error occurred");
      console.error("Error submitting reflection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Daily Reflection
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Info Display */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                User
              </label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <p className="text-sm text-gray-900">
                  {user?.displayName || user?.email || "Unknown User"}
                </p>
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formData.day && (
                <p className="text-sm text-gray-500">
                  Selected day: {formData.day}
                </p>
              )}
            </div>

            {/* Habit Progress Select */}
            <div className="space-y-2">
              <label
                htmlFor="habitProgress"
                className="block text-sm font-medium text-gray-700"
              >
                Habit Progress
              </label>
              <Select
                value={formData.habitProgress}
                onValueChange={(value) =>
                  setFormData({ ...formData, habitProgress: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your progress" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gateway">Gateway</SelectItem>
                  <SelectItem value="plus">Plus</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reflection Textarea */}
            <div className="space-y-2">
              <label
                htmlFor="reflection"
                className="block text-sm font-medium text-gray-700"
              >
                Reflection
              </label>
              <Textarea
                id="reflection"
                value={formData.reflection}
                onChange={(e) =>
                  setFormData({ ...formData, reflection: e.target.value })
                }
                placeholder="Write your thoughts about today's habit progress..."
                className="min-h-[120px]"
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Reflection"}
            </Button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
