import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA35uu4aJxo4sdlUswUyWPqze6P8VIoJEI",
  authDomain: "dental-scope.firebaseapp.com",
  projectId: "dental-scope",
  storageBucket: "dental-scope.firebasestorage.app",
  messagingSenderId: "1044017407223",
  appId: "1:1044017407223:web:aba3681baf9197e4021ff2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestoreDb = getFirestore(app);
