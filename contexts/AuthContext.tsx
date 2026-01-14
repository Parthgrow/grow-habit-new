"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    habitId: string | null;
    isPro: boolean;
    proPlan: string | null;
    proSince: string | null;
    proExpiresAt: string | null;
    subscriptionStatus: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (
        email: string,
        password: string,
        displayName?: string
    ) => Promise<boolean>;
    signIn: (email: string, password: string) => Promise<boolean>;
    signOut: () => Promise<void>;
    updateUserData: (newData: Partial<User>) => void;
    refetchUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            // You could verify the token here if needed
            // For now, we'll just check if it exists
            const userData = localStorage.getItem("userData");
            if (userData) {
                setUser(JSON.parse(userData));
            }
        }
        setLoading(false);
    }, []);

    const signUp = async (
        email: string,
        password: string,
        displayName?: string
    ): Promise<boolean> => {
        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, displayName }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("userData", JSON.stringify(data.user));
                setUser(data.user);
                return true;
            } else {
                console.error("Signup failed:", data.error);
                return false;
            }
        } catch (error) {
            console.error("Signup error:", error);
            return false;
        }
    };

    const signIn = async (
        email: string,
        password: string
    ): Promise<boolean> => {
        try {
            const response = await fetch("/api/auth/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("userData", JSON.stringify(data.user));
                setUser(data.user);
                return true;
            } else {
                console.error("Signin failed:", data.error);
                return false;
            }
        } catch (error) {
            console.error("Signin error:", error);
            return false;
        }
    };

    const signOut = async (): Promise<void> => {
        try {
            await fetch("/api/auth/signout", {
                method: "POST",
            });
        } catch (error) {
            console.error("Signout error:", error);
        } finally {
            // Clear local storage and state
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            setUser(null);
        }
    };

    const updateUserData = (newData: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return null;
            const updatedUser = { ...prev, ...newData };

            console.log("the value of updated user is ", updatedUser);
            localStorage.setItem("userData", JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    const refetchUserData = async () => {
        if (!user?.uid) return;

        try {
            const response = await fetch(`/api/users/${user.uid}`); // API CALL
            const data = await response.json();

            if (response.ok && data.user) {
                const updatedUser = {
                    uid: data.user.id,
                    email: data.user.email,
                    displayName: data.user.name,
                    habitId: data.user.habitId,
                    isPro: data.user.isPro,
                    proPlan: data.user.proPlan,
                    proSince: data.user.proSince,
                    proExpiresAt: data.user.proExpiresAt,
                    subscriptionStatus: data.user.subscriptionStatus,
                };
                setUser(updatedUser);
                localStorage.setItem("userData", JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error("Error refetching user data:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signUp,
                signIn,
                signOut,
                updateUserData,
                refetchUserData,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
