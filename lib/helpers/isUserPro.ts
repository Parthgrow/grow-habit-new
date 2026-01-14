import { User } from "@/contexts/AuthContext";

export function isUserPro(user: User): boolean {
    // Must have isPro flag set to true
    if (!user.isPro) {
        return false;
    }

    // If there's an expiry date, check if it's still valid
    if (user.proExpiresAt) {
        const now = new Date();
        const expiresAt = new Date(user.proExpiresAt);
        return expiresAt > now;
    }

    // If no expiry date but isPro is true, assume they're pro
    // (might be a lifetime plan or edge case)
    return true;
}
