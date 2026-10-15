import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCfCm2e-4Ir2BLe269A1Dvde8paAp45x7A",
    authDomain: "somi-20e9e.firebaseapp.com",
    projectId: "somi-20e9e",
    storageBucket: "somi-20e9e.firebasestorage.app",
    messagingSenderId: "664281837414",
    appId: "1:664281837414:web:4546efe416a61c539aa2a7"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ส่งออก Auth และ DB ไปให้ไฟล์อื่นใช้งาน
export const auth = getAuth(app);
export const db = getFirestore(app);