// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACXjAM4cVrZ2LbWhSZa4Ae0TsXxFAuKcI",
  authDomain: "viniopedia.firebaseapp.com",
  projectId: "viniopedia",
  storageBucket: "viniopedia.firebasestorage.app",
  messagingSenderId: "976929969305",
  appId: "1:976929969305:web:03795dd7369139f0881408",
  measurementId: "G-2QVWRFXJQN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);