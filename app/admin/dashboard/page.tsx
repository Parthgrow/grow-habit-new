"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { TrendingUp, Search, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProgressGrid from "@/components/ProgressGrid";

interface User {
  id: string;
  name: string;
  email: string;
  habitId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Reflection {
  id: string;
  userId: string;
  habitProgress: string;
  reflection: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // Set default selected user to logged in user
  useEffect(() => {
    if (user?.uid && users.length > 0 && !selectedUserId) {
      setSelectedUserId(user.uid);
    }
  }, [user?.uid, users, selectedUserId]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchReflections = async (userId: string) => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/reflection?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setReflections(data.reflections);
      }
    } catch (error) {
      console.error("Error fetching reflections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchReflections(selectedUserId);
    }
  }, [selectedUserId]);

  const calculateReflectionRate = () => {
    if (reflections.length === 0) return 0;

    // Get unique dates with reflections
    const uniqueDates = new Set(reflections.map((r) => r.date));
    return uniqueDates.size;
  };

  const getSelectedUser = () => {
    return users.find((user) => user.id === selectedUserId);
  };

  const selectedUser = getSelectedUser();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor user progress and reflections
            </p>
          </div>

          {/* User Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>

              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* User Dropdown */}
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {usersLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading users...
                    </SelectItem>
                  ) : filteredUsers.length === 0 ? (
                    <SelectItem value="no-users" disabled>
                      No users found
                    </SelectItem>
                  ) : (
                    filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{user.name}</span>
                          <span className="text-gray-500">({user.email})</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected User Info */}
          {selectedUser && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                User Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-gray-900">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Habit ID</p>
                  <p className="text-gray-900">
                    {selectedUser.habitId || "No habit created"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Member Since
                  </p>
                  <p className="text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Display */}
          {selectedUserId && (
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
                title={`${selectedUser?.name || "User"}'s Progress (Days 1-25)`}
              />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
