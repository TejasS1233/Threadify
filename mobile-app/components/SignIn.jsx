import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { BackIcon } from "./Icons";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uiState, setUiState] = useState("initial"); // 'initial', 'email'
  const [authMode, setAuthMode] = useState("signin"); // 'signin' or 'signup'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // NOTE: Re-captcha for phone sign-in is a web-specific feature.
  // For a native React Native app, you would need to use a different
  // method for phone authentication or a native re-captcha implementation.
  // We'll only support email and Google sign-in here for simplicity.

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (authMode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007aff" />
        </View>
      );
    }
    switch (uiState) {
      case "email":
        return (
          <View style={styles.contentContainer}>
            <TouchableOpacity
              onPress={() => setUiState("initial")}
              style={styles.backButton}
            >
              <BackIcon color="#94a3b8" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.authToggleContainer}>
              <TouchableOpacity
                onPress={() => setAuthMode("signin")}
                style={[
                  styles.authToggleButton,
                  authMode === "signin" && styles.activeAuthToggle,
                ]}
              >
                <Text style={styles.authToggleText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAuthMode("signup")}
                style={[
                  styles.authToggleButton,
                  authMode === "signup" && styles.activeAuthToggle,
                ]}
              >
                <Text style={styles.authToggleText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
              />
              <TouchableOpacity
                onPress={handleEmailSubmit}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>
                  {authMode === "signin" ? "Sign In" : "Create Account"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.contentContainer}>
            <TouchableOpacity
              onPress={() => setUiState("email")}
              style={[styles.mainButton, styles.emailButton]}
            >
              <Text style={styles.mainButtonText}>Continue with Email</Text>
            </TouchableOpacity>
            {/* Phone sign-in is not implemented due to reCAPTCHA limitations */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              style={[styles.mainButton, styles.googleButton]}
            >
              <Text style={styles.mainButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to Threadify</Text>
        {renderContent()}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // slate-900
    fontFamily: "sans-serif",
    color: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(30, 41, 59, 0.5)", // slate-800/50
    padding: 32,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#334155", // slate-700
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#007aff", // Replaced gradient with a solid color
    textAlign: "center",
  },
  contentContainer: {
    gap: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: "#94a3b8", // slate-400
  },
  authToggleContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#334155", // slate-700
    marginBottom: 24,
  },
  authToggleButton: {
    flex: 1,
    paddingVertical: 8,
  },
  activeAuthToggle: {
    borderBottomWidth: 2,
    borderBottomColor: "#38bdf8", // sky-400
  },
  authToggleText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#94a3b8",
  },
  formContainer: {
    gap: 16,
  },
  input: {
    width: "100%",
    padding: 12,
    backgroundColor: "rgba(15, 23, 42, 0.8)", // slate-900/80
    borderWidth: 1,
    borderColor: "#334155", // slate-700
    borderRadius: 8,
    color: "#fff",
  },
  mainButton: {
    width: "100%",
    fontWeight: "bold",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  mainButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emailButton: {
    backgroundColor: "#007aff", // sky-600
  },
  googleButton: {
    backgroundColor: "#e74c3c", // red-600
  },
  submitButton: {
    backgroundColor: "#007aff", // sky-600
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "#e74c3c", // red-400
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
  },
});

export default SignIn;
