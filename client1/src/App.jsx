import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SignIn from "./components/SignIn";
import ThreadifyApp from "./components/ThreadifyApp";
import "./App.css";

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyDQRi6bDQL172sUjsAkyrLzgByxb7X5plU",
  authDomain: "login-b0c74.firebaseapp.com",
  projectId: "login-b0c74",
  storageBucket: "login-b0c74.appspot.com",
  messagingSenderId: "87227982466",
  appId: "1:87227982466:web:c7258741943f708ad38a9b",
  measurementId: "G-FML0EFSK55",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * This is the main entry point for your application.
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          await fetch("https://7ms0jg62-5000.inc1.devtunnels.ms/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error("Error syncing user to backend:", error);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  return user ? <ThreadifyApp user={user} /> : <SignIn />;
}
