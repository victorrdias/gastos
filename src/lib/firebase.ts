import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDueGR_Aar6tUuOO_pMUzVZ8t8qsI7uZY0",
  authDomain: "minhas-contas-7dead.firebaseapp.com",
  projectId: "minhas-contas-7dead",
  storageBucket: "minhas-contas-7dead.appspot.com",
  messagingSenderId: "632682608760",
  appId: "1:632682608760:web:067c03c4c3d8823e0c558d",
};

// Prevent re-initialization on hot reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
