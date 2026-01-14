import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: "growhabitnew",
            clientEmail:
                "firebase-adminsdk-fbsvc@growhabitnew.iam.gserviceaccount.com",
            privateKey:
                "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCgyuO7QebZaGXz\nGo9PJef9pabbpE1vzTZBg1my969y2KR4Vz4cpW7hGljvVS+ni+wtorb9Vh28Mbc3\n+kcoptJpxeioHY3D7JFehgDDbt0lZvwVyP9y1rtGQx7HC97LTbSlnucWsgqS/GZq\nqpGUh1QdWFRIT1uN7kOGRntV5K1TCAqXMk/ArcG8mIHjeLV8He7P6BUJA/VERmRN\n+bxd+ugUg9nTjAOQpFsWvvozKnnDDaX++0Lh6GCW8NEmcsDoVdsDpxR9XpSsZol/\nmemC02QHQAIKuv75rDffHHt1hxGVneLd50HyEJZuDvK6gxAPmyZKVuI84HEmk/BC\nmgcj4AdtAgMBAAECggEALkfnv5zq5NXrTkttR2NKQJRfECZdEZqYDMhRV7V6Hwzj\nXi4CVz14yjsKsSysUEXyf3ovwIB6g5ItweN8euN1efN4kXccOHINr47Thm0RIzRe\nx6h4emX7NnCYWcN9Z7ggkHFJ45rwdzlGA1rAF2fSWrXzYHLTD+muLuZ3lpQBHX4k\nqOT/CDdfivkWynEch9/yKcl3McdctqFpRFZ/SnxqP4EsBil3aJ37E7a/TzzKD05d\nyBpL0kHmIxh9mXgC+WCuonRHSyregkgZB3RnQn+yF8tw7+D2BwvK9EXxxdiHsVY/\nbp6aKKd/H8SPm0N9a2O9UfI/EjA4H+kxHDcqjbikowKBgQDSxgWaTXAeo8+7eq5P\nOttp/9MlJrRb5sRcojGVSUKy6Uzgs/QOeQZw/xnr/v9RKdSwPVayXCc7WNHAxwXl\ns1CL/Om2MVWQE3PfqJAvqJccK7exzt7mqcPXYek1sXUboMrlHVzv+FPTryEfsRKt\ngvEGmgo1wPMmMdwWFrBttcerWwKBgQDDS14Rc/7JEjGU6jFz3DdGSYdO9d3B4BaR\nZRDMJb+kOsuom5tv/CZ4yK7mq8+QCWqdoeKc7r60P8MAThYmmLZn2ls5mDANlhi0\nvmTFquLfXA0VfJNHsiGwIXJnsJ5Y61GBQjgi2lhYAT+1MjuQPQ3H6h5eYEPRgy8k\nhAbEVj261wKBgD9r5nOvqXUOxYscNycQBsW2fMpJAyxEHAHjrBfHm5JKMR/MBjv0\nnsORfzNL33eEpsMBMf0pTYTGDRd8y4F6m1oEGC8CWUSpFczO49PzXsTTQsr1/Ixb\nuNouVAYcB6jwkRyv4S80AcVIhScMGRqss+nQoBHcpU1w41CiMyRP9mzRAoGAKCkG\nhiZJXcXtBkeGteGySDT0q0sqOCVB3tJeuuyEVVx15w1g0I2Ux7/VH8BzJZaaIyJY\nPJdoBh8alaR5L6S11fN0UQq3zwNvvzNr+64hi3cdha6hhtvdy5+FLEeIuJZjo2Yf\nryMhia9wD23uC8JSZCsD5bp8F8iXWDYCQjvN4+8CgYEAnjXWf4Ad4vOFXfsrHpTs\nLVDJ++KBjLv7PZEBZNlIzzMAJobW6fTO523uy1ufBMqblwQJ1HxXJ9k6BBdXOF4w\na8KnCrqMq4i+KPX0e4AajTVHKf9eZnltDbo0m3y6mk/T8Lce0kOvTCDDoO3MNS8+\n0Po4gzchJrNcUm68/wqCTx8=\n-----END PRIVATE KEY-----\n",
        }),
    });
}

// Get Firestore instance
const db = getFirestore();

export async function updateUserDefaults() {
    try {
        console.log(
            "Starting migration: Adding subscription fields to existing users..."
        );

        // Fetch all users
        const usersSnapshot = await db.collection("users").get();

        if (usersSnapshot.empty) {
            console.log("No users found");
            return {
                success: true,
                message: "No users found",
                stats: {
                    total: 0,
                    updated: 0,
                    skipped: 0,
                },
            };
        }

        const defaultFields = {
            isPro: false,
            proPlan: null,
            proSince: null,
            proExpiresAt: null,
            subscriptionStatus: "free",
        };

        let updatedCount = 0;
        let skippedCount = 0;

        // Process each user
        let batch = db.batch();
        let batchCount = 0;
        const BATCH_SIZE = 500; // Firestore batch limit

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const userId = userDoc.id;

            // Check if user already has all required fields
            const hasAllFields =
                userData.hasOwnProperty("isPro") &&
                userData.hasOwnProperty("proPlan") &&
                userData.hasOwnProperty("proSince") &&
                userData.hasOwnProperty("proExpiresAt") &&
                userData.hasOwnProperty("subscriptionStatus");

            if (hasAllFields) {
                skippedCount++;
                continue;
            }

            // Prepare update object - only add missing fields
            const updateData = {};

            if (!userData.hasOwnProperty("isPro")) {
                updateData.isPro = defaultFields.isPro;
            }
            if (!userData.hasOwnProperty("proPlan")) {
                updateData.proPlan = defaultFields.proPlan;
            }
            if (!userData.hasOwnProperty("proSince")) {
                updateData.proSince = defaultFields.proSince;
            }
            if (!userData.hasOwnProperty("proExpiresAt")) {
                updateData.proExpiresAt = defaultFields.proExpiresAt;
            }
            if (!userData.hasOwnProperty("subscriptionStatus")) {
                updateData.subscriptionStatus =
                    defaultFields.subscriptionStatus;
            }

            // Add updatedAt timestamp
            updateData.updatedAt = Timestamp.now();

            // Add to batch
            const userRef = db.collection("users").doc(userId);
            batch.update(userRef, updateData);
            batchCount++;
            updatedCount++;

            // Commit batch if it reaches the limit
            if (batchCount >= BATCH_SIZE) {
                await batch.commit();
                console.log(`Committed batch of ${batchCount} users`);
                batch = db.batch(); // Create new batch
                batchCount = 0;
            }
        }

        // Commit remaining updates
        if (batchCount > 0) {
            await batch.commit();
            console.log(`Committed final batch of ${batchCount} users`);
        }

        console.log("Migration completed successfully!");
        console.log(`Total users: ${usersSnapshot.size}`);
        console.log(`Updated: ${updatedCount}`);
        console.log(`Skipped: ${skippedCount}`);

        return {
            success: true,
            message: "Migration completed successfully",
            stats: {
                total: usersSnapshot.size,
                updated: updatedCount,
                skipped: skippedCount,
            },
        };
    } catch (error) {
        console.error("Migration failed:", error);
        throw new Error(
            `Migration failed: ${error.message || "Unknown error"}`
        );
    }
}

// Run the function if this file is executed directly
updateUserDefaults()
    .then((result) => {
        console.log("Result:", result);
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
