// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_oBr_xQZZyFKBeMS9Vqa_IgiUUCofrQY",
  authDomain: "studio-66a62.firebaseapp.com",
  projectId: "studio-66a62",
  storageBucket: "studio-66a62.appspot.com",  // Changed from .firebasestorage.app to .appspot.com
  messagingSenderId: "472272986177",
  appId: "1:472272986177:web:96823be1a135b00bb466c0",
  measurementId: "G-8GRV8KT9V6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Make these available globally
window.firebase = { app, analytics, storage, db };
window.storage = storage;
window.db = db;
