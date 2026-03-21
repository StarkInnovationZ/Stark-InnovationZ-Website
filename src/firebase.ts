// c:\venkat\project\src\firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrrhEuFanX7wAgQw5haV-c0kvzFqvLbe4",
  authDomain: "stark-innovationz-8faab.firebaseapp.com",
  projectId: "stark-innovationz-8faab",
  storageBucket: "stark-innovationz-8faab.firebasestorage.app",
  messagingSenderId: "25333928708",
  appId: "1:25333928708:web:59900308ab203e9f03f651",
  measurementId: "G-CVZ8DD23YN"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
