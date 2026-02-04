// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, OAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "timetablemslogin.firebaseapp.com",
  projectId: "timetablemslogin",
  storageBucket: "timetablemslogin.firebasestorage.app",
  messagingSenderId: "279326293247",
  appId: "1:279326293247:web:7d37e96b95d02bd83860ca"
};

// Initialize Firebase and export the app instance
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new OAuthProvider('microsoft.com');