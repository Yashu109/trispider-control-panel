// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZf7SzdWmYJffTV19DII34gARIU2a-pkE",
  authDomain: "trispider-control-panel-fad3b.firebaseapp.com",
  databaseURL: "https://trispider-control-panel-fad3b-default-rtdb.firebaseio.com",
  projectId: "trispider-control-panel-fad3b",
  storageBucket: "trispider-control-panel-fad3b.firebasestorage.app",
  messagingSenderId: "1016700832719",
  appId: "1:1016700832719:web:badb4ab4280e4f54b720ba",
  measurementId: "G-LQ61WT8LJ0"
};
const secondaryConfig = {
  apiKey: "AIzaSyCKuCBfQ5--4tIeXW6TO06tQmpiE2SwGyw",

  authDomain: "login-326c5.firebaseapp.com",

  projectId: "login-326c5",

  storageBucket: "login-326c5.appspot.com",

  messagingSenderId: "432271413649",

  appId: "1:432271413649:web:12217df500ec3915538a30",

  measurementId: "G-QKE7F5QYCG",
};
const app = initializeApp(firebaseConfig);
const secondaryApp = initializeApp(secondaryConfig, 'secondary');
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(secondaryApp);
export { auth };

export default app;

//firebase login
//firebase init
// firebase deploy