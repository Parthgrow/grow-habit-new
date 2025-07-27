// Import the functions you need from the Firebase Admin SDK
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: "growhabitnew",
      clientEmail: "firebase-adminsdk-fbsvc@growhabitnew.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCgyuO7QebZaGXz\nGo9PJef9pabbpE1vzTZBg1my969y2KR4Vz4cpW7hGljvVS+ni+wtorb9Vh28Mbc3\n+kcoptJpxeioHY3D7JFehgDDbt0lZvwVyP9y1rtGQx7HC97LTbSlnucWsgqS/GZq\nqpGUh1QdWFRIT1uN7kOGRntV5K1TCAqXMk/ArcG8mIHjeLV8He7P6BUJA/VERmRN\n+bxd+ugUg9nTjAOQpFsWvvozKnnDDaX++0Lh6GCW8NEmcsDoVdsDpxR9XpSsZol/\nmemC02QHQAIKuv75rDffHHt1hxGVneLd50HyEJZuDvK6gxAPmyZKVuI84HEmk/BC\nmgcj4AdtAgMBAAECggEALkfnv5zq5NXrTkttR2NKQJRfECZdEZqYDMhRV7V6Hwzj\nXi4CVz14yjsKsSysUEXyf3ovwIB6g5ItweN8euN1efN4kXccOHINr47Thm0RIzRe\nx6h4emX7NnCYWcN9Z7ggkHFJ45rwdzlGA1rAF2fSWrXzYHLTD+muLuZ3lpQBHX4k\nqOT/CDdfivkWynEch9/yKcl3McdctqFpRFZ/SnxqP4EsBil3aJ37E7a/TzzKD05d\nyBpL0kHmIxh9mXgC+WCuonRHSyregkgZB3RnQn+yF8tw7+D2BwvK9EXxxdiHsVY/\nbp6aKKd/H8SPm0N9a2O9UfI/EjA4H+kxHDcqjbikowKBgQDSxgWaTXAeo8+7eq5P\nOttp/9MlJrRb5sRcojGVSUKy6Uzgs/QOeQZw/xnr/v9RKdSwPVayXCc7WNHAxwXl\ns1CL/Om2MVWQE3PfqJAvqJccK7exzt7mqcPXYek1sXUboMrlHVzv+FPTryEfsRKt\ngvEGmgo1wPMmMdwWFrBttcerWwKBgQDDS14Rc/7JEjGU6jFz3DdGSYdO9d3B4BaR\nZRDMJb+kOsuom5tv/CZ4yK7mq8+QCWqdoeKc7r60P8MAThYmmLZn2ls5mDANlhi0\nvmTFquLfXA0VfJNHsiGwIXJnsJ5Y61GBQjgi2lhYAT+1MjuQPQ3H6h5eYEPRgy8k\nhAbEVj261wKBgD9r5nOvqXUOxYscNycQBsW2fMpJAyxEHAHjrBfHm5JKMR/MBjv0\nnsORfzNL33eEpsMBMf0pTYTGDRd8y4F6m1oEGC8CWUSpFczO49PzXsTTQsr1/Ixb\nuNouVAYcB6jwkRyv4S80AcVIhScMGRqss+nQoBHcpU1w41CiMyRP9mzRAoGAKCkG\nhiZJXcXtBkeGteGySDT0q0sqOCVB3tJeuuyEVVx15w1g0I2Ux7/VH8BzJZaaIyJY\nPJdoBh8alaR5L6S11fN0UQq3zwNvvzNr+64hi3cdha6hhtvdy5+FLEeIuJZjo2Yf\nryMhia9wD23uC8JSZCsD5bp8F8iXWDYCQjvN4+8CgYEAnjXWf4Ad4vOFXfsrHpTs\nLVDJ++KBjLv7PZEBZNlIzzMAJobW6fTO523uy1ufBMqblwQJ1HxXJ9k6BBdXOF4w\na8KnCrqMq4i+KPX0e4AajTVHKf9eZnltDbo0m3y6mk/T8Lce0kOvTCDDoO3MNS8+\n0Po4gzchJrNcUm68/wqCTx8=\n-----END PRIVATE KEY-----\n",
    }),
  });
}

// Get Firestore and Auth instances
const db = getFirestore();
const auth = getAuth();

export { db, auth };
