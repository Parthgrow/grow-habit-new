export interface Reflection {
  id: string;
  userId: string;
  habitProgress: string;
  reflection: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface AddReflectionParams {
  userId: string;
  habitProgress: string;
  reflection: string;
  date: string; // YYYY-MM-DD format
  userName?: string;
  habitId?: string;
}

export async function addReflection({
  userId,
  habitProgress,
  reflection,
  date,
  userName,
  habitId,
}: AddReflectionParams): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("I was here 2", userId, habitProgress, reflection, date, userName, habitId);
    const response = await fetch("/api/reflection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        habitProgress,
        reflection,
        date,
        userName,
        habitId,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.error || "Failed to add reflection" };
    }
  } catch (error) {
    console.error("Error adding reflection:", error);
    return { success: false, error: "Network error occurred" };
  }
}
