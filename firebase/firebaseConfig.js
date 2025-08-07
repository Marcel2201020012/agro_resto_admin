// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1aMFG-DNFW7MvMxjZXI20fiSTUDgh-1k",
  authDomain: "agro-resto.firebaseapp.com",
  projectId: "agro-resto",
  storageBucket: "agro-resto.firebasestorage.app",
  messagingSenderId: "652157667397",
  appId: "1:652157667397:web:6cdf09125fd5e21cfbfb2c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {db, auth};