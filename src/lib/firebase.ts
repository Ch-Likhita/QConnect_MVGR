import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAuth } from "firebase/auth";

// USAGE: Always use getFunctionsInstance() and getAuthInstance()
// Never import { auth, functions } directly

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// ✅ Lazy initialization - only create when accessed
let _functions: ReturnType<typeof getFunctions> | null = null;
let _auth: ReturnType<typeof getAuth> | null = null;

const getFunctionsInstance = () => {
  if (typeof window === "undefined") return null;
  if (!_functions) _functions = getFunctions(app);
  return _functions;
};

const getAuthInstance = () => {
  if (typeof window === "undefined") return null;
  if (!_auth) _auth = getAuth(app);
  return _auth;
};

export { app, db, getFunctionsInstance, getAuthInstance };