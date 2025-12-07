import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Reflection } from "@/lib/repository"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface FetchReflectionsParams {
  userId: string;
  month?: number;
  year?: number;
}

export async function fetchReflections({
  userId,
  month,
  year,
}: FetchReflectionsParams): Promise<Reflection[]> {
  if (!userId) {
    throw new Error("UserId is required");
  }

  try {
    let url = `/api/reflection?userId=${userId}`;
    
    // Add month and year if provided
    if (month !== undefined && year !== undefined) {
      url += `&month=${month}&year=${year}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reflections: ${response.statusText}`);
    }

    const data = await response.json();
    return data.reflections || [];
  } catch (error) {
    console.error("Error fetching reflections:", error);
    throw error;
  }
}
