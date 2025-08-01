"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAuthActions = () => {
  const { signUp, signIn, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const success = await signUp(email, password, displayName);
      if (success) {
        toast.success('Account created successfully!');
      } else {
        toast.error('Failed to create account');
      }
      return success;
    } catch (error) {
      toast.error('An error occurred during signup');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const success = await signIn(email, password);
      if (success) {
        toast.success('Signed in successfully!');
      } else {
        toast.error('Invalid email or password');
      }
      return success;
    } catch (error) {
      toast.error('An error occurred during signin');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success('Signed out successfully!');
    } catch (error) {
      toast.error('An error occurred during signout');
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    loading
  };
}; 