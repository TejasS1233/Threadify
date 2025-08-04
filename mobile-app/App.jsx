import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";

// NOTE: You will need to create these components in React Native format
// based on your original files. This file assumes they exist.
import SignIn from "./components/SignIn";
import ThreadifyApp from "./components/ThreadifyApp";

// --- Firebase Initialization (Copied from your web App.jsx) ---
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

// NOTE: This URL is for syncing the user. You must replace 'localhost'
// with your machine's local IP address for the emulator to connect.
// Example: "http://192.168.1.5:5000"
const BACKEND_URL = "https://7ms0jg62-5000.inc1.devtunnels.ms/";

/**
 * This is the main entry point for your React Native application.
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener handles the Firebase authentication state.
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          // Sync user to your backend using axios.
          await axios.post(
            BACKEND_URL,
            {},
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (error) {
          console.error("Error syncing user to backend:", error);
        }
      }

      setLoading(false);
    });

    // Cleanup function for the effect.
    return () => unsubscribe();
  }, []);

  // Show a loading indicator while fetching the authentication state.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Conditionally render the appropriate component based on user authentication.
  return user ? <ThreadifyApp user={user} /> : <SignIn />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 20,
    marginTop: 10,
  },
});
