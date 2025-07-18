// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbMXS2OFUT1H01gzhvZ4rSElw9JSYEBf8",
  authDomain: "growhabitnew.firebaseapp.com",
  projectId: "growhabitnew",
  storageBucket: "growhabitnew.firebasestorage.app",
  messagingSenderId: "494014045683",
  appId: "1:494014045683:web:638010eaa08822145c0686",
  measurementId: "G-VCXYX2X7YG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);