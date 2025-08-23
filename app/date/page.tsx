"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { startOfWeek, endOfWeek } from "date-fns";
import Link from "next/link";

export default function DatePage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDataReal, setFormDataReal] = useState({
    date: "",
    value: "",
  });
  const [formDataIdeal, setFormDataIdeal] = useState({
    date: "",
    value: "",
  });
  const itemsPerPage = 10;
  const [dateReflection, setDateReflection] = useState<any>([]);
  const [weeklyValues, setWeeklyValues] = useState<any>({
    idealAvg: "",
    realAvg: "",
  });

  // Sample data from backend (replace with actual API call)

  // Calculate pagination

  const handleSubmitReal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("formdata value is ", {
      ...formDataReal,
      userId: user?.uid,
      habitId: user?.habitId,
    });

    try {
      // Submit real value
      if (formDataReal.value) {
        const realResponse = await fetch("/api/date-reflection", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: formDataReal.date,
            type: "real",
            value: parseInt(formDataReal.value),
            userId: user?.uid,
            habitId: user?.habitId,
          }),
        });

        if (!realResponse.ok) {
          throw new Error("Failed to submit real value");
        }
      }

      toast.success("Date reflection added successfully!");
      setFormDataReal({ date: "", value: "" });
      setShowAddForm(false);
    } catch (error) {
      toast.error("Failed to add date reflection");
      console.error("Error submitting date reflection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitIdeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("formdata value is ", {
      ...formDataIdeal,
      userId: user?.uid,
      habitId: user?.habitId,
    });

    try {
      // Submit real value
      if (formDataIdeal.value) {
        const realResponse = await fetch("/api/date-reflection", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: formDataIdeal.date,
            type: "ideal",
            value: parseInt(formDataIdeal.value),
            userId: user?.uid,
            habitId: user?.habitId,
          }),
        });

        if (!realResponse.ok) {
          throw new Error("Failed to submit real value");
        }
      }

      toast.success("Date reflection added successfully!");
      setFormDataIdeal({ date: "", value: "" });
      setShowAddForm(false);
    } catch (error) {
      toast.error("Failed to add date reflection");
      console.error("Error submitting date reflection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormDataReal({ date: "", value: "" });
    setFormDataIdeal({ date: "", value: "" });
    setShowAddForm(false);
  };

  const transformReflectionData = (data: any[]) => {
    // Safety check
    if (!Array.isArray(data)) {
      console.error("Data is not an array:", data);
      return [];
    }
    // Group data by date
    const groupedByDate = data.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = { date, real: 0, ideal: 0 };
      }

      // Set the value based on type
      if (item.type === "real") {
        acc[date].real = item.value || 0;
      } else if (item.type === "ideal") {
        acc[date].ideal = item.value || 0;
      }

      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.values(groupedByDate).sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const normalizeDate = (dateStr: string) => {
    // force into YYYY-MM-DD so comparisons work
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const calculateAverages = (dateReflection: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
    const end = endOfWeek(today, { weekStartsOn: 0 }); // Saturday

    let idealSum = 0,
      idealCount = 0;
    let realSum = 0,
      realCount = 0;

    for (const entry of dateReflection) {
      // const entryDate = new Date(entry.date);
      const entryDate = normalizeDate(entry.date);

      // ✅ Within this week? → include in ideal average
      if (entryDate >= start && entryDate <= end) {
        if (entry.ideal > 0) {
          idealSum += entry.ideal;
          idealCount++;
        }
      }

      // ✅ From start of week up to TODAY? → include in real average
      if (entryDate >= start && entryDate <= today) {
        if (entry.real > 0) {
          realSum += entry.real;
          realCount++;
        }
      }
    }

    const idealAvg = idealCount > 0 ? idealSum / idealCount : 0;
    const realAvg = realCount > 0 ? realSum / realCount : 0;

    console.log("the value of idealAvg and realAvg is ", idealAvg, realAvg);

    setWeeklyValues({ idealAvg: idealAvg, realAvg: realAvg });
  };

  useEffect(() => {
    const handleFetchData = async (userId: string) => {
      console.log("the value of user is ", user);
      const response = await fetch(`/api/date-reflection?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const repData = await response.json();
      const transformedData = transformReflectionData(repData.entries);

      // ✅ Get current week's start & end
      const { start, end } = handleDate();

      // ✅ Filter only entries within this week
      const filtered = transformedData.filter((row: any) => {
        const d = new Date(row.date);
        d.setHours(0, 0, 0, 0);
        return d >= start && d <= end;
      });

      setDateReflection(filtered);
    };

    if (user?.uid) {
      handleFetchData(user.uid);
    }
  }, [user]);

  useEffect(() => {
    calculateAverages(dateReflection);
  }, [dateReflection]);

  const handleDate = () => {
    const today = new Date();

    const start = startOfWeek(today, { weekStartsOn: 0 }); // 0 = Sunday
    const end = endOfWeek(today, { weekStartsOn: 0 }); // Saturday

    return { start, end };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Date Tracking
          </h1>
          <p className="text-gray-600">
            Track your daily progress against your ideal goals
          </p>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Entry</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReal} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formDataReal.date}
                      onChange={(e) =>
                        setFormDataReal({
                          ...formDataReal,
                          date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="real">Real Value</Label>
                    <Input
                      id="real"
                      type="number"
                      min="0"
                      value={formDataReal.value}
                      onChange={(e) =>
                        setFormDataReal({
                          ...formDataReal,
                          value: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Entry"}
                  </Button>
                </div>
              </form>

              <form onSubmit={handleSubmitIdeal} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formDataIdeal.date}
                      onChange={(e) =>
                        setFormDataIdeal({
                          ...formDataIdeal,
                          date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ideal">Ideal Value</Label>
                    <Input
                      id="ideal"
                      type="number"
                      min="0"
                      value={formDataIdeal.value}
                      onChange={(e) =>
                        setFormDataIdeal({
                          ...formDataIdeal,
                          value: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Entry"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4 mb-8">
          <div>
            <p className="text-sm text-gray-600">Weekly Progress</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
              <div
                className="bg-blue-500 h-3  rounded-full transition-all"
                style={{
                  width: `${
                    weeklyValues?.idealAvg
                      ? (weeklyValues.realAvg / weeklyValues.idealAvg) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daily Progress</CardTitle>

                <Button asChild>
                <Link href="/">Back to home</Link>
                </Button>


              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                      Real
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                      Ideal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dateReflection.map((row: any, index: number) => (
                    <tr
                      key={index}
                      className={cn(
                        "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                        index % 2 === 0 ? "bg-white" : "bg-gray-25"
                      )}
                    >
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {format(row.date, "MMM dd, yyyy")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            row.real >= 4
                              ? "bg-green-100 text-green-800"
                              : row.real >= 3
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {row.real}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {row.ideal}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
