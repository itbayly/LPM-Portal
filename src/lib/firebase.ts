import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// PASTE YOUR KEYS HERE FROM THE FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyBVKbTJnOMQx3uAhhl9Nuq30DDO4nWUyjk",
  authDomain: "lpm-portal.firebaseapp.com",
  projectId: "lpm-portal",
  storageBucket: "lpm-portal.firebasestorage.app",
  messagingSenderId: "7054699646",
  appId: "1:7054699646:web:8493f083abaf470a403c2f",
  measurementId: "G-QHQ1X251H8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);