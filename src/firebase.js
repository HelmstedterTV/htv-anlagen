import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBaW1rofCZbLc7zkHWBPey9tXIxR5FpWH8",
  authDomain: "htv-anlagen.firebaseapp.com",
  projectId: "htv-anlagen",
  storageBucket: "htv-anlagen.firebasestorage.app",
  messagingSenderId: "84920525690",
  appId: "1:84920525690:web:921f04e9be2740a4a26cc3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
