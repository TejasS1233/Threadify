import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your project's Firebase configuration.
// This is the only code that should be in this file.
const firebaseConfig = {
  apiKey: "AIzaSyDQRi6bDQL172sUjsAkyrLzgByxb7X5plU",
  authDomain: "login-b0c74.firebaseapp.com",
  projectId: "login-b0c74",
  storageBucket: "login-b0c74.appspot.com",
  messagingSenderId: "87227982466",
  appId: "1:87227982466:web:c7258741943f708ad38a9b",
  measurementId: "G-FML0EFSK55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase Authentication so it can be used in other files
export const auth = getAuth(app);
