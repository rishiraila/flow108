import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDgB2jVej3oHLMrylCKZkiQCKkSYg0Pcbw",
  authDomain: "flow108-cf45f.firebaseapp.com",
  projectId: "flow108-cf45f",
  storageBucket: "flow108-cf45f.firebasestorage.app",
  messagingSenderId: "386125057272",
  appId: "1:386125057272:web:4ba96f88c0cf91ddd6bf0d",
  measurementId: "G-ZKREG9LQXH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
