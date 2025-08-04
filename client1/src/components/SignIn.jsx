import React, { useState, useEffect } from "react";
import {
  RecaptchaVerifier,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase";
import { BackIcon } from "./Icons";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [uiState, setUiState] = useState("initial"); // 'initial', 'email', 'phone', 'otp'
  const [authMode, setAuthMode] = useState("signin"); // 'signin' or 'signup'
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {},
        }
      );
    }
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (authMode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePhoneSignIn = async (e) => {
    e.preventDefault();
    setError("");
    const appVerifier = window.recaptchaVerifier;
    try {
      await appVerifier.render();
      const fullPhoneNumber = `+91${phone}`;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      setUiState("otp");
    } catch (err) {
      setError(`SMS not sent: ${err.message}`);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await window.confirmationResult.confirm(otp);
      setUiState("initial");
    } catch (err) {
      setError(`Could not sign in: ${err.message}`);
    }
  };

  const renderContent = () => {
    switch (uiState) {
      case "email":
        return (
          <div className="animate-fade-in">
            <button
              onClick={() => setUiState("initial")}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4"
            >
              <BackIcon /> Back
            </button>
            <div className="flex border-b border-slate-700 mb-6">
              <button
                onClick={() => setAuthMode("signin")}
                className={`flex-1 py-2 font-semibold transition-colors ${
                  authMode === "signin"
                    ? "text-sky-400 border-b-2 border-sky-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-2 font-semibold transition-colors ${
                  authMode === "signup"
                    ? "text-sky-400 border-b-2 border-sky-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="w-full bg-sky-600 text-white font-semibold py-3 rounded-lg hover:bg-sky-700 transition-all"
              >
                {authMode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>
        );
      case "phone":
        return (
          <div className="animate-fade-in">
            <button
              onClick={() => setUiState("initial")}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4"
            >
              <BackIcon /> Back
            </button>
            <form onSubmit={handlePhoneSignIn} className="space-y-4">
              <div className="flex gap-2">
                <span className="p-3 bg-slate-700 rounded-l-lg">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-all"
              >
                Get OTP
              </button>
            </form>
          </div>
        );
      case "otp":
        return (
          <div className="animate-fade-in">
            <button
              onClick={() => setUiState("phone")}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4"
            >
              <BackIcon /> Back
            </button>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-slate-400 text-sm">
                Enter the 6-digit code sent to +91 {phone}
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Verification Code"
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="w-full bg-sky-600 text-white font-semibold py-3 rounded-lg hover:bg-sky-700 transition-all"
              >
                Verify & Sign In
              </button>
            </form>
          </div>
        );
      default:
        return (
          <div className="space-y-4 animate-fade-in">
            <button
              onClick={() => setUiState("email")}
              className="w-full bg-sky-600 text-white font-semibold py-3 rounded-lg hover:bg-sky-700 transition-all"
            >
              Continue with Email
            </button>
            <button
              onClick={() => setUiState("phone")}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-all"
            >
              Continue with Phone
            </button>
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-all"
            >
              Continue with Google
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700 text-center">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">
            Welcome to Threadify
          </h1>
          {renderContent()}
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
        </div>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default SignIn;
