import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjZvBZ_ZVUdj6hFPAO6w602tqiM-M3zck",
  authDomain: "realstate-marketplace-app.firebaseapp.com",
  projectId: "realstate-marketplace-app",
  storageBucket: "realstate-marketplace-app.appspot.com",
  messagingSenderId: "380161465561",
  appId: "1:380161465561:web:c6fcdf408ca362d07272c8"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();