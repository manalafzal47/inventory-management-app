// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDaO925JhaT_Qgg5dHdOY8kXT5IQtMkBF0",
  authDomain: "inventory-management-4d851.firebaseapp.com",
  projectId: "inventory-management-4d851",
  storageBucket: "inventory-management-4d851.appspot.com",
  messagingSenderId: "604467252647",
  appId: "1:604467252647:web:3d62851cdc53b158d17a82",
  measurementId: "G-14LNSFZBKF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };


